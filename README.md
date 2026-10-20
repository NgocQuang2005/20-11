# Một đóa hồng dành cho bạn · 20/10

Mở trực tiếp `index.html` trên điện thoại hoặc máy tính. Website ưu tiên màn hình dọc của điện thoại và chỉ dùng HTML5, CSS3, JavaScript thuần. Không cần Node.js, npm, server, API hay bước build. Có thể đưa nguyên thư mục lên GitHub Pages.

## Trải nghiệm

- Khi mở: ba ảnh hoa hồng thật xếp lớp, chuyển động kín màn hình rồi khép lại sau khoảng 3 giây để hiện lời chúc. Có nút **Bỏ qua**.
- Ở lời chúc: chạm vào chữ để mở bức thư đầy đủ, chạm từng đoạn thư để thấy hiệu ứng tim; kéo cụm ảnh hoa để tạo cánh hoa, vuốt trái hoặc bấm nút bên dưới để mở ảnh.
- Bấm **Sửa lời chúc** để đổi tên người nhận/người gửi, lời chúc ngắn, dòng dưới hoa và toàn bộ bức thư. Để một dòng trống giữa các đoạn, rồi bấm **Lưu lời chúc**. Có nút **Khôi phục bản gốc** trong popup.
- Ở ảnh: 10 khung ảnh xoay quanh quả cầu. Kéo ngang để xoay quanh, kéo lên/xuống để đổi góc nhìn; bấm một ảnh để xem lớn và vuốt trong chế độ xem lớn để đổi ảnh. Vuốt phải một quãng dài hoặc vuốt phải trên nền để trở lại lời chúc; cũng có nút mũi tên quay lại.
- Dưới quả cầu ảnh, bấm **Chọn ảnh từ điện thoại** để thêm/thay từng vị trí hoặc chọn nhiều ảnh cùng lúc (tối đa 10). Bấm **Xóa ảnh** để mở popup và xóa từng ảnh. Vị trí đã xóa hiện hoa chờ ảnh mới.
- Chạm **Bật nhạc** để phát đoạn nhạc 47 giây từ `assets/audio/`. Không dùng trình phát hoặc đường link bên ngoài.

## Thay 10 ảnh

Hiện có 9 ảnh bạn thêm tại `assets/images/photo-01.jpg` đến `photo-09.jpg`; `photo-10.jpg` là ảnh hoa hồng để đủ 10 vị trí. Có thể thay ảnh thứ 10 bằng ảnh của bạn. Ảnh dọc tỉ lệ khoảng 4:5 đẹp nhất. Nếu dùng tên hoặc định dạng khác, sửa đường dẫn `src` tương ứng trong mảng `photos` ở `config.js`. Ảnh thiếu sẽ hiện placeholder hoa và không làm hỏng trang.

Ảnh chọn trên điện thoại được nén và lưu trong `localStorage` của đúng trình duyệt/thiết bị đó; mở lại trang trên cùng trình duyệt sẽ thấy ảnh đã chọn. Ảnh không tự đồng bộ sang điện thoại khác. Xóa dữ liệu website trong trình duyệt cũng xóa những ảnh đã chọn; ảnh gốc trong `assets/images/` vẫn còn.

## Sửa lời chúc

Mở `config.js` và sửa `recipient` (người nhận), `sender` (người gửi), `greeting` (đoạn xem trước), `closing` (dòng nhắn bên dưới), bốn đoạn trong `letter` (bức thư đầy đủ) và `caption` của từng ảnh. Giữ dấu nháy quanh nội dung.

Bạn cũng có thể sửa trực tiếp trên điện thoại bằng nút **Sửa lời chúc**. Bản sửa được lưu trong `localStorage` của cùng trình duyệt/thiết bị và sẽ hiện lại sau khi mở trang; nó ưu tiên hơn nội dung mặc định trong `config.js`. Xóa dữ liệu website sẽ đưa trang về nội dung mặc định.

## Nhạc nền

Trang phát bản MP3 “Somebody's Pleasure” dài 47 giây bạn đã thêm. File được sao chép từ `assets/images/` sang `assets/audio/somebodys-pleasure-chorus.mp3`; nút nhạc phát và lặp đoạn này trực tiếp khi chạm. Nếu muốn thay bằng đoạn khác, chép file vào `assets/audio/` và sửa đường dẫn `music` trong `config.js`.

## Ảnh hoa hồng dùng trong giao diện

Ba ảnh đã tải về `assets/images/rose-reference-01.jpg` đến `rose-reference-03.jpg` từ các URL bạn gửi:

- https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/hinh-nen-hoa-hong-1.jpg
- https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/hinh-nen-hoa-hong-23.jpg
- https://chiemtaimobile.vn/images/companies/1/%E1%BA%A2nh%20Blog/hinh-nen-hoa-hong/hinh-nen-hoa-hong-trang-5.jpg?1740730643719

Các ảnh này chỉ dùng để trang chạy local/offline theo bản bạn yêu cầu. Nếu đưa website lên công khai, hãy kiểm tra quyền sử dụng ảnh với nguồn ảnh hoặc thay bằng ảnh bạn sở hữu.
