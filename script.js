(function () {
  'use strict';

  var config = window.GARDEN_CONFIG || {};
  var photos = Array.isArray(config.photos) ? config.photos.slice(0, 10).map(function (photo) {
    return { src: photo && photo.src || '', caption: photo && photo.caption || '' };
  }) : [];
  while (photos.length < 10) photos.push({ src: '', caption: 'Một chiếc kỷ niệm dễ thương' });
  var defaultCaptions = photos.map(function (photo) { return photo.caption; });
  var $ = function (id) { return document.getElementById(id); };
  var photoStorageKey = 'garden-20-10-photos-v1';
  var savedPhotoSlots = {};
  var photoStorageReady = false;
  try {
    var storedPhotos = window.localStorage.getItem(photoStorageKey);
    if (storedPhotos) {
      var parsedPhotos = JSON.parse(storedPhotos);
      if (parsedPhotos && typeof parsedPhotos === 'object' && !Array.isArray(parsedPhotos)) savedPhotoSlots = parsedPhotos;
    }
    photoStorageReady = true;
  } catch (error) { photoStorageReady = false; }
  photos.forEach(function (photo, index) {
    if (!Object.prototype.hasOwnProperty.call(savedPhotoSlots, index)) return;
    var saved = savedPhotoSlots[index];
    photo.src = typeof saved === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(saved) ? saved : '';
    if (!photo.src) photo.caption = 'Chưa thêm ảnh ' + String(index + 1).padStart(2, '0');
  });
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var galleryOpen = false;
  var viewerOpen = false;
  var letterOpen = false;
  var currentViewerIndex = 0;
  var angle = 0;
  var tilt = 0;
  var globeDrag = null;
  var roseDrag = null;
  var wishSwipe = null;
  var gallerySwipe = null;
  var suppressPhotoClick = false;
  var imageLoaded = [];
  var cards = [];
  var lastPetalAt = 0;
  var lastFocused = null;
  var animationFrame = 0;
  var lastFrameTime = 0;
  var activeIndex = -1;
  var viewerSwipe = null;
  var suppressBackdropClick = false;
  var suppressLetterClick = false;
  var letterFocus = null;
  var managerOpen = false;
  var managerMode = 'add';
  var managerFocus = null;
  var managerBusy = false;
  var pickSlotIndex = 0;
  var editorOpen = false;
  var editorFocus = null;

  function text(value, fallback) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }
  var wishStorageKey = 'garden-20-10-wish-v1';
  var defaultLetter = Array.isArray(config.letter) ? config.letter.filter(function (p) {
    return typeof p === 'string' && p.trim();
  }).map(function (p) { return p.trim(); }) : [];
  var defaultWish = {
    recipient: text(config.recipient, 'em'),
    sender: text(config.sender, 'anh'),
    greeting: text(config.greeting, 'Anh có một lời chúc dành riêng cho em. Chạm để đọc nha ♡'),
    closing: text(config.closing, 'Anh có một chiếc thư dài xíu dành cho em. Chạm vào lời chúc để đọc hết nha ♡'),
    letter: defaultLetter.length ? defaultLetter : [text(config.greeting, 'Chúc em 20/10 thật vui nha ♡')]
  };
  var wishState = {
    recipient: defaultWish.recipient, sender: defaultWish.sender,
    greeting: defaultWish.greeting, closing: defaultWish.closing,
    letter: defaultWish.letter.slice()
  };
  var wishStorageReady = false;
  try {
    var storedWish = window.localStorage.getItem(wishStorageKey);
    if (storedWish) {
      var parsedWish = JSON.parse(storedWish);
      if (parsedWish && typeof parsedWish === 'object') {
        ['recipient', 'sender', 'greeting', 'closing'].forEach(function (key) {
          if (typeof parsedWish[key] === 'string' && parsedWish[key].trim()) wishState[key] = parsedWish[key].trim();
        });
        if (Array.isArray(parsedWish.letter)) {
          var savedLetter = parsedWish.letter.filter(function (p) { return typeof p === 'string' && p.trim(); });
          if (savedLetter.length) wishState.letter = savedLetter;
        }
      }
    }
    wishStorageReady = true;
  } catch (error) { wishStorageReady = false; }
  function applyWishText() {
    $('recipientName').textContent = wishState.recipient;
    $('openingRecipient').textContent = wishState.recipient;
    $('openingSubtitle').textContent = 'một vườn hồng nhỏ, dành riêng cho ' + wishState.recipient + ' ♡';
    $('letterRecipient').textContent = wishState.recipient;
    $('senderName').textContent = wishState.sender;
    $('letterSender').textContent = wishState.sender;
    $('greetingText').textContent = wishState.greeting;
    $('closingText').textContent = wishState.closing;
    document.title = 'Một vườn hồng dành cho ' + wishState.recipient + ' · 20/10';
    var content = $('letterContent');
    content.replaceChildren();
    wishState.letter.forEach(function (paragraph) {
      var p = document.createElement('p');
      p.className = 'letter-paragraph';
      p.textContent = paragraph;
      content.appendChild(p);
    });
  }
  applyWishText();
  var letterViewer = $('letterViewer');
  function letterSpark(clientX, clientY) {
    for (var i = 0; i < 7; i++) {
      var heart = document.createElement('span');
      heart.className = 'letter-heart';
      heart.textContent = i % 2 ? '✦' : '♡';
      heart.style.left = clientX + 'px';
      heart.style.top = clientY + 'px';
      heart.style.setProperty('--hx', ((Math.random() - .5) * 125) + 'px');
      heart.style.setProperty('--hy', ((Math.random() - .5) * 130 - 30) + 'px');
      heart.style.setProperty('--hr', ((Math.random() - .5) * 75) + 'deg');
      letterViewer.appendChild(heart);
      heart.addEventListener('animationend', function () { this.remove(); });
      if (reducedMotion) window.setTimeout(function (el) { el.remove(); }, 50, heart);
    }
  }
  function openLetter(event) {
    if (letterOpen || editorOpen || galleryOpen || suppressLetterClick) return;
    letterFocus = document.activeElement;
    letterOpen = true;
    letterViewer.classList.add('open');
    letterViewer.setAttribute('aria-hidden', 'false');
    $('appShell').inert = true;
    letterViewer.querySelector('.letter-scroll').scrollTop = 0;
    $('letterClose').focus();
    var rect = $('wishCopy').getBoundingClientRect();
    letterSpark(event && typeof event.clientX === 'number' && event.clientX ? event.clientX : rect.left + rect.width / 2,
      event && typeof event.clientY === 'number' && event.clientY ? event.clientY : rect.top + rect.height / 2);
  }
  function closeLetter() {
    letterOpen = false;
    letterViewer.classList.remove('open');
    letterViewer.setAttribute('aria-hidden', 'true');
    $('appShell').inert = false;
    if (letterFocus && letterFocus.focus) letterFocus.focus({ preventScroll: true });
  }
  $('wishCopy').addEventListener('click', openLetter);
  $('wishCopy').addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLetter(); }
  });
  $('letterClose').addEventListener('click', closeLetter);
  $('letterContent').addEventListener('click', function (event) {
    var paragraph = event.target.closest('.letter-paragraph');
    if (!paragraph) return;
    paragraph.classList.remove('touched');
    void paragraph.offsetWidth;
    paragraph.classList.add('touched');
    letterSpark(event.clientX, event.clientY);
  });

  var wishEditor = $('wishEditor');
  function fillWishEditor() {
    $('editRecipient').value = wishState.recipient;
    $('editSender').value = wishState.sender;
    $('editGreeting').value = wishState.greeting;
    $('editClosing').value = wishState.closing;
    $('editLetter').value = wishState.letter.join('\n\n');
  }
  function openWishEditor() {
    if (galleryOpen || letterOpen || managerOpen) return;
    editorFocus = document.activeElement;
    editorOpen = true;
    fillWishEditor();
    $('wishEditorStatus').textContent = wishStorageReady ? '' : 'Trình duyệt này không cho lưu nội dung vào localStorage.';
    wishEditor.classList.add('open');
    wishEditor.setAttribute('aria-hidden', 'false');
    $('appShell').inert = true;
    $('editRecipient').focus();
  }
  function closeWishEditor() {
    editorOpen = false;
    wishEditor.classList.remove('open');
    wishEditor.setAttribute('aria-hidden', 'true');
    $('appShell').inert = false;
    if (editorFocus && editorFocus.focus) editorFocus.focus({ preventScroll: true });
  }
  $('openWishEditor').addEventListener('click', openWishEditor);
  $('closeWishEditor').addEventListener('click', closeWishEditor);
  $('cancelWishEditor').addEventListener('click', closeWishEditor);
  wishEditor.addEventListener('click', function (event) { if (event.target === wishEditor) closeWishEditor(); });
  $('wishEditorForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var letter = $('editLetter').value.trim().replace(/\r\n?/g, '\n').split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean);
    var next = {
      recipient: $('editRecipient').value.trim(),
      sender: $('editSender').value.trim(),
      greeting: $('editGreeting').value.trim(),
      closing: $('editClosing').value.trim(),
      letter: letter
    };
    if (!next.recipient || !next.sender || !next.greeting || !next.closing || !letter.length) {
      $('wishEditorStatus').textContent = 'Bạn điền đủ các phần lời chúc trước khi lưu nha.';
      return;
    }
    if (!wishStorageReady) {
      $('wishEditorStatus').textContent = 'Trình duyệt này không cho lưu nội dung vào localStorage.';
      return;
    }
    try { window.localStorage.setItem(wishStorageKey, JSON.stringify(next)); }
    catch (error) { $('wishEditorStatus').textContent = 'Không lưu được. Hãy kiểm tra bộ nhớ trình duyệt rồi thử lại.'; return; }
    wishState = next;
    applyWishText();
    closeWishEditor();
  });
  $('resetWishText').addEventListener('click', function () {
    if (!window.confirm('Khôi phục lời chúc ban đầu? Bản bạn đã sửa trên điện thoại này sẽ bị xóa.')) return;
    try { window.localStorage.removeItem(wishStorageKey); }
    catch (error) { $('wishEditorStatus').textContent = 'Không khôi phục được vì trình duyệt chặn localStorage.'; return; }
    wishState = {
      recipient: defaultWish.recipient, sender: defaultWish.sender,
      greeting: defaultWish.greeting, closing: defaultWish.closing,
      letter: defaultWish.letter.slice()
    };
    applyWishText();
    fillWishEditor();
    $('wishEditorStatus').textContent = 'Đã khôi phục bản gốc.';
  });

  function closeOpening() {
    var opening = $('opening');
    if (!opening || opening.classList.contains('is-closing')) return;
    opening.classList.add('is-closing');
    window.setTimeout(function () { $('appShell').classList.add('is-ready'); }, reducedMotion ? 0 : 650);
    window.setTimeout(function () { if (opening.parentNode) opening.remove(); }, reducedMotion ? 0 : 1200);
  }
  $('skipOpening').addEventListener('click', closeOpening);
  if (reducedMotion) closeOpening();
  else window.setTimeout(closeOpening, 2800);

  var dots = document.querySelectorAll('.scene-dots .dot');
  function showGallery() {
    if (viewerOpen || letterOpen || editorOpen) return;
    galleryOpen = true;
    $('appShell').classList.add('gallery-active');
    $('sceneTrack').classList.add('show-gallery');
    $('wishScene').inert = true;
    $('galleryScene').inert = false;
    dots[0].classList.remove('active');
    dots[1].classList.add('active');
    $('backToWish').focus({ preventScroll: true });
  }
  function showWish() {
    if (viewerOpen || letterOpen) return;
    galleryOpen = false;
    $('appShell').classList.remove('gallery-active');
    $('sceneTrack').classList.remove('show-gallery');
    $('wishScene').inert = false;
    $('galleryScene').inert = true;
    dots[0].classList.add('active');
    dots[1].classList.remove('active');
    $('roseDrag').focus({ preventScroll: true });
  }
  $('galleryScene').inert = true;
  $('toGallery').addEventListener('click', showGallery);
  $('backToWish').addEventListener('click', showWish);

  // Vuốt trái trên lời chúc, kể cả khoảng trống quanh bông hồng.
  $('wishScene').addEventListener('pointerdown', function (event) {
    if (event.target.closest('#roseDrag')) return;
    wishSwipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  $('wishScene').addEventListener('pointerup', function (event) {
    if (!wishSwipe || event.pointerId !== wishSwipe.id) return;
    var dx = event.clientX - wishSwipe.x;
    var dy = event.clientY - wishSwipe.y;
    wishSwipe = null;
    if (dx < -65 && Math.abs(dy) < 90) {
      suppressLetterClick = true;
      window.setTimeout(function () { suppressLetterClick = false; }, 120);
      showGallery();
    }
  });
  $('wishScene').addEventListener('pointercancel', function () { wishSwipe = null; });
  $('wishScene').addEventListener('pointermove', function (event) {
    var rect = $('wishScene').getBoundingClientRect();
    $('roseStage').style.setProperty('--parallax-x', (((event.clientX - rect.left) / rect.width - .5) * 16).toFixed(1) + 'px');
    $('roseStage').style.setProperty('--parallax-y', (((event.clientY - rect.top) / rect.height - .5) * 12).toFixed(1) + 'px');
  });
  $('wishScene').addEventListener('pointerleave', function () {
    $('roseStage').style.setProperty('--parallax-x', '0px');
    $('roseStage').style.setProperty('--parallax-y', '0px');
  });

  // Ở màn ảnh, vuốt phải trên nền để trở về; kéo ngay trên quả cầu để xoay ảnh.
  $('galleryScene').addEventListener('pointerdown', function (event) {
    if (event.target.closest('#globeStage')) return;
    gallerySwipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  $('galleryScene').addEventListener('pointerup', function (event) {
    if (!gallerySwipe || event.pointerId !== gallerySwipe.id) return;
    var dx = event.clientX - gallerySwipe.x;
    var dy = event.clientY - gallerySwipe.y;
    gallerySwipe = null;
    if (dx > 65 && Math.abs(dy) < 90) showWish();
  });
  $('galleryScene').addEventListener('pointercancel', function () { gallerySwipe = null; });

  function burstPetal(clientX, clientY, count) {
    var rect = $('appShell').getBoundingClientRect();
    for (var i = 0; i < count; i++) {
      var petal = document.createElement('span');
      petal.className = 'burst-petal';
      petal.style.left = (clientX - rect.left + (Math.random() - .5) * 24) + 'px';
      petal.style.top = (clientY - rect.top + (Math.random() - .5) * 24) + 'px';
      petal.style.setProperty('--dx', ((Math.random() - .5) * 160) + 'px');
      petal.style.setProperty('--dy', (50 + Math.random() * 140) + 'px');
      petal.style.setProperty('--spin', ((Math.random() - .5) * 700) + 'deg');
      petal.style.filter = 'hue-rotate(' + (Math.random() * 170 - 50).toFixed(0) + 'deg)';
      $('ambientPetals').appendChild(petal);
      petal.addEventListener('animationend', function () { this.remove(); });
      if (reducedMotion) window.setTimeout(function (el) { el.remove(); }, 50, petal);
    }
  }
  var rose = $('roseDrag');
  rose.addEventListener('pointerdown', function (event) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    roseDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    rose.setPointerCapture(event.pointerId);
    rose.classList.add('dragging');
    event.stopPropagation();
  });
  rose.addEventListener('pointermove', function (event) {
    if (!roseDrag || event.pointerId !== roseDrag.id) return;
    var dx = event.clientX - roseDrag.x;
    var dy = event.clientY - roseDrag.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) roseDrag.moved = true;
    rose.style.setProperty('--drag-x', Math.max(-110, Math.min(110, dx)) + 'px');
    rose.style.setProperty('--drag-y', Math.max(-65, Math.min(80, dy)) + 'px');
    rose.style.setProperty('--drag-r', Math.max(-24, Math.min(24, dx * .16)) + 'deg');
    if (roseDrag.moved && performance.now() - lastPetalAt > 48) {
      burstPetal(event.clientX, event.clientY, 2);
      lastPetalAt = performance.now();
    }
  });
  function endRoseDrag(event) {
    if (!roseDrag || event.pointerId !== roseDrag.id) return;
    var dx = event.clientX - roseDrag.x;
    var moved = roseDrag.moved;
    roseDrag = null;
    rose.classList.remove('dragging');
    rose.style.setProperty('--drag-x', '0px');
    rose.style.setProperty('--drag-y', '0px');
    rose.style.setProperty('--drag-r', '0deg');
    if (dx < -85) showGallery();
    else if (!moved) {
      rose.classList.remove('pulse');
      void rose.offsetWidth;
      rose.classList.add('pulse');
      burstPetal(event.clientX, event.clientY, 9);
    } else burstPetal(event.clientX, event.clientY, 5);
  }
  rose.addEventListener('pointerup', endRoseDrag);
  rose.addEventListener('pointercancel', endRoseDrag);
  rose.addEventListener('click', function (event) {
    if (event.detail === 0) {
      var rect = rose.getBoundingClientRect();
      burstPetal(rect.left + rect.width / 2, rect.top + rect.height / 3, 9);
    }
  });

  if (!reducedMotion) {
    var ambient = $('ambientPetals');
    for (var p = 0; p < 13; p++) {
      var falling = document.createElement('span');
      falling.className = 'ambient-petal';
      falling.style.setProperty('--left', ((p * 37 + 9) % 100) + '%');
      falling.style.setProperty('--size', (8 + p % 5 * 2) + 'px');
      falling.style.setProperty('--duration', (12 + p % 6 * 2) + 's');
      falling.style.setProperty('--delay', '-' + (p * 1.8) + 's');
      falling.style.setProperty('--drift', ((p % 2 ? 1 : -1) * (25 + p * 3)) + 'px');
      falling.style.setProperty('--blur', p % 4 === 0 ? '1px' : '0px');
      ambient.appendChild(falling);
    }
  }

  var shades = [['#ffd7e0', '#e78eb8'], ['#ffe2b0', '#ffa79d'], ['#e7d1ff', '#b7a0e7'], ['#d1f1e1', '#9cd2cf']];
  function placeholder(index, large) {
    var box = document.createElement('div');
    box.className = large ? 'viewer-placeholder' : 'orbit-placeholder';
    if (large) {
      var bloom = document.createElement('span');
      bloom.setAttribute('aria-hidden', 'true');
      bloom.textContent = '✿';
      box.appendChild(bloom);
      box.appendChild(document.createTextNode('Chưa thêm ảnh ' + String(index + 1).padStart(2, '0')));
    } else {
      box.style.setProperty('--shade-a', shades[index % shades.length][0]);
      box.style.setProperty('--shade-b', shades[index % shades.length][1]);
      box.textContent = '✿';
    }
    return box;
  }
  function updatePhotoCard(index, refresh) {
    var card = cards[index];
    var src = typeof photos[index].src === 'string' ? photos[index].src.trim() : '';
    imageLoaded[index] = false;
    card.setAttribute('aria-label', 'Xem ảnh ' + (index + 1) + ': ' + text(photos[index].caption, 'Kỷ niệm'));
    card.replaceChild(placeholder(index, false), card.firstChild);
    if (src) {
      var img = new Image();
      img.alt = text(photos[index].caption, 'Ảnh kỷ niệm ' + (index + 1));
      img.onload = function () {
        if (photos[index].src !== src) return;
        imageLoaded[index] = true;
        card.replaceChild(img, card.firstChild);
        if (viewerOpen && currentViewerIndex === index) showViewerImage(index);
      };
      img.onerror = function () { if (photos[index].src === src) imageLoaded[index] = false; };
      img.src = src;
    }
    if (refresh) {
      activeIndex = -1;
      renderGlobe();
      if (viewerOpen && currentViewerIndex === index) showViewerImage(index);
    }
  }
  photos.forEach(function (photo, index) {
    var card = document.createElement('button');
    card.className = 'orbit-card';
    card.type = 'button';
    card.setAttribute('aria-label', 'Xem ảnh ' + (index + 1) + ': ' + text(photo.caption, 'Kỷ niệm'));
    card.appendChild(placeholder(index, false));
    var count = document.createElement('span');
    count.className = 'card-count';
    count.textContent = String(index + 1).padStart(2, '0');
    card.appendChild(count);
    card.addEventListener('click', function () {
      if (!suppressPhotoClick) openViewer(index);
    });
    $('photoSphere').appendChild(card);
    cards.push(card);
    updatePhotoCard(index, false);
  });

  function savePhotoSlot(index, value) {
    if (!photoStorageReady) throw new Error('Trình duyệt này không cho lưu ảnh vào localStorage.');
    var next = Object.assign({}, savedPhotoSlots);
    next[index] = value;
    try { window.localStorage.setItem(photoStorageKey, JSON.stringify(next)); }
    catch (error) { throw new Error('Bộ nhớ trình duyệt đã đầy. Hãy xóa một ảnh rồi thử lại.'); }
    savedPhotoSlots = next;
    photos[index].src = value || '';
    photos[index].caption = value ? defaultCaptions[index] : 'Chưa thêm ảnh ' + String(index + 1).padStart(2, '0');
    updatePhotoCard(index, true);
  }

  function compressPhoto(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !file.type.startsWith('image/')) { reject(new Error('Vui lòng chọn file ảnh.')); return; }
      if (file.size > 25000000) { reject(new Error('Ảnh quá lớn, hãy chọn ảnh dưới 25 MB.')); return; }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        try {
          var canvas = document.createElement('canvas');
          var maxSide = 1100;
          var quality = .78;
          var data = '';
          for (var attempt = 0; attempt < 9; attempt++) {
            var scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
            canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
            var context = canvas.getContext('2d');
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            data = canvas.toDataURL('image/jpeg', quality);
            if (data.length <= 180000) break;
            maxSide = Math.round(maxSide * .82);
            quality = Math.max(.48, quality - .06);
          }
          canvas.width = canvas.height = 0;
          if (data.length > 180000) throw new Error('Không thể nén ảnh đủ nhỏ để lưu.');
          resolve(data);
        } catch (error) { reject(error); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Điện thoại không đọc được ảnh này.')); };
      img.src = url;
    });
  }

  var photoManager = $('photoManager');
  function managerStatus(message) { $('photoManagerStatus').textContent = message; }
  function renderPhotoSlots() {
    var grid = $('photoSlotGrid');
    grid.replaceChildren();
    photos.forEach(function (photo, index) {
      var slot = document.createElement('div');
      slot.className = 'photo-slot';
      var preview = document.createElement('div');
      preview.className = 'photo-slot-preview';
      if (photo.src) {
        var img = new Image();
        img.alt = 'Ảnh số ' + (index + 1);
        img.onerror = function () { preview.replaceChildren(document.createTextNode('✿')); };
        img.src = photo.src;
        preview.appendChild(img);
      } else preview.textContent = '✿';
      var footer = document.createElement('div');
      footer.className = 'photo-slot-footer';
      var label = document.createElement('span');
      label.textContent = 'Ảnh ' + String(index + 1).padStart(2, '0');
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = managerMode === 'delete' ? 'Xóa' : (photo.src ? 'Thay ảnh' : 'Chọn ảnh');
      button.disabled = managerBusy || !photoStorageReady || (managerMode === 'delete' && !photo.src);
      button.addEventListener('click', function () {
        if (managerMode === 'delete') {
          if (!window.confirm('Xóa ảnh số ' + String(index + 1).padStart(2, '0') + '?')) return;
          try { savePhotoSlot(index, null); managerStatus('Đã xóa ảnh số ' + String(index + 1).padStart(2, '0') + '.'); }
          catch (error) { managerStatus(error.message); }
          renderPhotoSlots();
        } else {
          pickSlotIndex = index;
          $('singlePhotoInput').click();
        }
      });
      footer.appendChild(label);
      footer.appendChild(button);
      slot.appendChild(preview);
      slot.appendChild(footer);
      grid.appendChild(slot);
    });
  }
  function openPhotoManager(mode) {
    managerMode = mode;
    managerFocus = document.activeElement;
    managerOpen = true;
    photoManager.classList.add('open');
    photoManager.classList.toggle('delete-mode', mode === 'delete');
    photoManager.setAttribute('aria-hidden', 'false');
    $('photoManagerTitle').textContent = mode === 'delete' ? 'Xóa ảnh' : 'Chọn ảnh từ điện thoại';
    $('photoManagerIntro').textContent = mode === 'delete' ? 'Chạm Xóa ở từng ảnh. Ô bị xóa sẽ hiện hoa cho tới khi bạn chọn ảnh mới.' : 'Chạm từng ô để thay ảnh, hoặc chọn nhiều ảnh cùng lúc. Ảnh được lưu trên điện thoại này.';
    managerStatus(photoStorageReady ? '' : 'Trình duyệt hiện không cho dùng localStorage, ảnh chưa thể lưu lâu dài.');
    $('pickManyPhotos').disabled = !photoStorageReady;
    $('appShell').inert = true;
    renderPhotoSlots();
    $('closePhotoManager').focus();
  }
  function closePhotoManager() {
    if (managerBusy) return;
    managerOpen = false;
    photoManager.classList.remove('open');
    photoManager.setAttribute('aria-hidden', 'true');
    $('appShell').inert = false;
    if (managerFocus && managerFocus.focus) managerFocus.focus({ preventScroll: true });
  }
  async function addSelectedPhotos(files, startIndex) {
    var selected = Array.prototype.slice.call(files, 0, 10 - startIndex);
    var extra = files.length > selected.length;
    if (!selected.length || managerBusy) return;
    managerBusy = true;
    renderPhotoSlots();
    var saved = 0;
    var failure = '';
    for (var i = 0; i < selected.length; i++) {
      managerStatus('Đang lưu ảnh ' + (i + 1) + '/' + selected.length + '...');
      try {
        var data = await compressPhoto(selected[i]);
        savePhotoSlot(startIndex + i, data);
        saved++;
      } catch (error) { failure = error.message; break; }
    }
    managerBusy = false;
    renderPhotoSlots();
    managerStatus((saved ? 'Đã lưu ' + saved + ' ảnh trên điện thoại này. ' : '') + (extra ? 'Chỉ dùng 10 ảnh đầu. ' : '') + failure);
  }
  $('openPhotoPicker').addEventListener('click', function () { openPhotoManager('add'); });
  $('openPhotoDelete').addEventListener('click', function () { openPhotoManager('delete'); });
  $('closePhotoManager').addEventListener('click', closePhotoManager);
  photoManager.addEventListener('click', function (event) { if (event.target === photoManager) closePhotoManager(); });
  $('pickManyPhotos').addEventListener('click', function () { if (!managerBusy) $('manyPhotoInput').click(); });
  $('singlePhotoInput').addEventListener('change', function () {
    var files = this.files;
    addSelectedPhotos(files, pickSlotIndex);
    this.value = '';
  });
  $('manyPhotoInput').addEventListener('change', function () {
    var files = this.files;
    addSelectedPhotos(files, 0);
    this.value = '';
  });

  function renderGlobe() {
    var stage = $('globeStage');
    var width = stage.clientWidth;
    var height = stage.clientHeight;
    var radiusX = Math.min(width * .39, 180);
    var radiusZ = Math.min(width * .28, 130);
    var rowHeight = Math.min(height * .15, 58);
    var tiltRad = tilt * Math.PI / 180;
    stage.querySelector('.globe-light').style.transform = 'translate(calc(-50% + ' + (Math.sin(angle * Math.PI / 180) * 11).toFixed(1) + 'px),-50%)';
    var bestZ = -Infinity;
    var bestIndex = 0;
    cards.forEach(function (card, index) {
      var theta = (index * 36 + angle) * Math.PI / 180;
      var x = Math.sin(theta) * radiusX;
      var baseY = (index % 2 ? 1 : -1) * rowHeight + Math.sin(theta * 2) * 10;
      var baseZ = Math.cos(theta) * radiusZ;
      var y = baseY * Math.cos(tiltRad) - baseZ * Math.sin(tiltRad);
      var z = baseY * Math.sin(tiltRad) + baseZ * Math.cos(tiltRad);
      card.style.transform = 'translate(-50%,-50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + (Math.sin(theta) * -22).toFixed(1) + 'deg) rotateZ(' + (Math.sin(theta) * 5).toFixed(1) + 'deg)';
      card.style.opacity = z < -radiusZ * .3 ? '0' : '1';
      card.style.pointerEvents = z < -radiusZ * .3 ? 'none' : 'auto';
      card.style.zIndex = String(Math.round(z + 200));
      if (z > bestZ) { bestZ = z; bestIndex = index; }
    });
    if (bestIndex !== activeIndex) {
      activeIndex = bestIndex;
      $('activePhotoNumber').textContent = String(bestIndex + 1).padStart(2, '0');
      $('activePhotoCaption').textContent = text(photos[bestIndex].caption, 'Một khoảnh khắc đáng nhớ');
    }
  }
  function animateGlobe(time) {
    if (lastFrameTime && galleryOpen && !globeDrag && !viewerOpen && !reducedMotion && !document.hidden) {
      angle += Math.min(time - lastFrameTime, 50) * .006;
      renderGlobe();
    }
    lastFrameTime = time;
    animationFrame = requestAnimationFrame(animateGlobe);
  }
  $('globeStage').addEventListener('pointerdown', function (event) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    globeDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, startAngle: angle, startTilt: tilt, moved: false };
  });
  $('globeStage').addEventListener('pointermove', function (event) {
    if (!globeDrag || event.pointerId !== globeDrag.id) return;
    var dx = event.clientX - globeDrag.x;
    var dy = event.clientY - globeDrag.y;
    if (Math.abs(dx) + Math.abs(dy) > 5 && !globeDrag.moved) {
      globeDrag.moved = true;
      $('globeStage').setPointerCapture(event.pointerId);
      $('globeStage').classList.add('dragging');
    }
    if (globeDrag.moved) {
      angle = globeDrag.startAngle + dx * .63;
      tilt = Math.max(-65, Math.min(65, globeDrag.startTilt + dy * .45));
      renderGlobe();
    }
  });
  function endGlobeDrag(event) {
    if (!globeDrag || event.pointerId !== globeDrag.id) return;
    var dx = event.clientX - globeDrag.x;
    if (globeDrag.moved) {
      suppressPhotoClick = true;
      window.setTimeout(function () { suppressPhotoClick = false; }, 100);
    }
    globeDrag = null;
    $('globeStage').classList.remove('dragging');
    if (dx > 110) showWish();
  }
  $('globeStage').addEventListener('pointerup', endGlobeDrag);
  $('globeStage').addEventListener('pointercancel', endGlobeDrag);
  $('globeStage').addEventListener('wheel', function (event) {
    if (!galleryOpen) return;
    event.preventDefault();
    angle += Math.sign(event.deltaY || event.deltaX) * 12;
    renderGlobe();
  }, { passive: false });

  var viewer = $('photoViewer');
  function showViewerImage(index) {
    currentViewerIndex = (index + photos.length) % photos.length;
    var wrap = $('viewerImage');
    wrap.replaceChildren();
    var src = typeof photos[currentViewerIndex].src === 'string' ? photos[currentViewerIndex].src.trim() : '';
    if (src && imageLoaded[currentViewerIndex]) {
      var img = new Image();
      img.alt = text(photos[currentViewerIndex].caption, 'Ảnh kỷ niệm ' + (currentViewerIndex + 1));
      img.onerror = function () { wrap.replaceChildren(placeholder(currentViewerIndex, true)); };
      img.src = src;
      wrap.appendChild(img);
    } else wrap.appendChild(placeholder(currentViewerIndex, true));
    $('viewerCount').textContent = String(currentViewerIndex + 1).padStart(2, '0') + ' / 10';
    $('viewerCaption').textContent = text(photos[currentViewerIndex].caption, 'Một khoảnh khắc đáng nhớ');
  }
  function openViewer(index) {
    lastFocused = document.activeElement;
    viewerOpen = true;
    showViewerImage(index);
    viewer.classList.add('open');
    viewer.setAttribute('aria-hidden', 'false');
    $('appShell').inert = true;
    $('viewerClose').focus();
  }
  function closeViewer() {
    viewerOpen = false;
    viewer.classList.remove('open');
    viewer.setAttribute('aria-hidden', 'true');
    $('appShell').inert = false;
    if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
  }
  $('viewerClose').addEventListener('click', closeViewer);
  $('viewerPrev').addEventListener('click', function () { showViewerImage(currentViewerIndex - 1); });
  $('viewerNext').addEventListener('click', function () { showViewerImage(currentViewerIndex + 1); });
  viewer.addEventListener('click', function (event) { if (event.target === viewer && !suppressBackdropClick) closeViewer(); });
  viewer.addEventListener('pointerdown', function (event) {
    if (event.target.closest('button')) return;
    viewerSwipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  viewer.addEventListener('pointerup', function (event) {
    if (!viewerSwipe || event.pointerId !== viewerSwipe.id) return;
    var dx = event.clientX - viewerSwipe.x;
    var dy = event.clientY - viewerSwipe.y;
    viewerSwipe = null;
    if (Math.abs(dx) > 50 && Math.abs(dy) < 90) {
      suppressBackdropClick = true;
      window.setTimeout(function () { suppressBackdropClick = false; }, 100);
      showViewerImage(currentViewerIndex + (dx < 0 ? 1 : -1));
    }
  });
  viewer.addEventListener('pointercancel', function () { viewerSwipe = null; });
  document.addEventListener('keydown', function (event) {
    if (editorOpen) {
      if (event.key === 'Escape') closeWishEditor();
      return;
    }
    if (managerOpen) {
      if (event.key === 'Escape') closePhotoManager();
      return;
    }
    if (letterOpen) {
      if (event.key === 'Escape') closeLetter();
      if (event.key === 'Tab') { event.preventDefault(); $('letterClose').focus(); }
      return;
    }
    if (viewerOpen) {
      if (event.key === 'Escape') closeViewer();
      else if (event.key === 'ArrowLeft') showViewerImage(currentViewerIndex - 1);
      else if (event.key === 'ArrowRight') showViewerImage(currentViewerIndex + 1);
      else if (event.key === 'Tab') {
        var controls = [$('viewerClose'), $('viewerPrev'), $('viewerNext')];
        var pos = controls.indexOf(document.activeElement);
        if (event.shiftKey && pos === 0) { event.preventDefault(); controls[2].focus(); }
        if (!event.shiftKey && pos === 2) { event.preventDefault(); controls[0].focus(); }
      }
      return;
    }
    if (event.key === 'ArrowLeft' && galleryOpen) { event.preventDefault(); angle -= 36; renderGlobe(); }
    if (event.key === 'ArrowRight' && galleryOpen) { event.preventDefault(); angle += 36; renderGlobe(); }
    if (event.key === 'Escape' && galleryOpen) showWish();
  });

  var audio = $('backgroundAudio');
  var music = typeof config.music === 'string' ? config.music.trim() : '';
  if (music) audio.src = music;
  function soundState(playing, label) {
    var button = $('musicButton');
    button.classList.toggle('playing', playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', label);
    $('musicLabel').textContent = label;
  }
  $('musicButton').addEventListener('click', function () {
    if (!music) { soundState(false, 'Chưa thêm nhạc'); return; }
    if (!audio.paused) { audio.pause(); soundState(false, 'Bật nhạc'); return; }
    var result = audio.play();
    if (result && result.then) result.then(function () { soundState(true, 'Tắt nhạc'); })
      .catch(function () { soundState(false, 'Chưa có file nhạc'); });
  });
  audio.addEventListener('error', function () { soundState(false, 'Chưa có file nhạc'); });

  window.addEventListener('resize', renderGlobe);
  renderGlobe();
  animationFrame = requestAnimationFrame(animateGlobe);
}());
