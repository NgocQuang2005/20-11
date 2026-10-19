# Một đóa hồng dành cho bạn · 20/10

Mở trực tiếp `index.html` trên điện thoại hoặc máy tính. Website ưu tiên màn hình dọc của điện thoại và chỉ dùng HTML5, CSS3, JavaScript thuần. Không cần Node.js, npm, server, API hay bước build. Có thể đưa nguyên thư mục lên GitHub Pages.

## Trải nghiệm

- Khi mở: ba ảnh hoa hồng thật xếp lớp, chuyển động kín màn hình rồi khép lại sau khoảng 3 giây để hiện lời chúc. Có nút **Bỏ qua**.
- Ở lời chúc: chạm vào chữ để mở bức thư đầy đủ, chạm từng đoạn thư để thấy hiệu ứng tim; kéo cụm ảnh hoa để tạo cánh hoa, vuốt trái hoặc bấm nút bên dưới để mở ảnh.
- Ở ảnh: 10 khung ảnh xoay quanh quả cầu. Kéo ngang để xoay quanh, kéo lên/xuống để đổi góc nhìn; bấm một ảnh để xem lớn và vuốt trong chế độ xem lớn để đổi ảnh. Vuốt phải một quãng dài hoặc vuốt phải trên nền để trở lại lời chúc; cũng có nút mũi tên quay lại.
- Nhạc chỉ phát khi người xem bấm **Bật nhạc**.

## Thay 10 ảnh

Chép 10 ảnh JPG vào `assets/images/`, đặt tên `photo-01.jpg` đến `photo-10.jpg`. Ảnh dọc tỉ lệ khoảng 4:5 đẹp nhất. Nếu dùng tên hoặc định dạng khác, sửa đường dẫn `src` tương ứng trong mảng `photos` ở `config.js`. Ảnh thiếu sẽ hiện placeholder hoa và không làm hỏng trang.

## Sửa lời chúc

Mở `config.js` và sửa `recipient` (người nhận), `sender` (người gửi), `greeting` (đoạn xem trước), `closing` (dòng nhắn bên dưới), bốn đoạn trong `letter` (bức thư đầy đủ) và `caption` của từng ảnh. Giữ dấu nháy quanh nội dung.

## Nhạc nền

Nhạc nền là [“There is Romance” của Kevin MacLeod](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100044), dùng theo [giấy phép CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). File nằm tại `assets/audio/nhac-nen.mp3`; giữ thông tin ghi công trên website nếu chia sẻ trang. Nhạc phát sau khi người xem bấm **Bật nhạc** do giới hạn tự phát của trình duyệt.

Muốn thay nhạc, chép MP3 khác vào `assets/audio/nhac-nen.mp3` và cập nhật dòng ghi công. Muốn tắt chức năng này, đổi `music` trong `config.js` thành `""`. Thiếu file nhạc thì website vẫn hoạt động bình thường.

## Ảnh hoa hồng dùng trong giao diện

Ba ảnh đã tải về `assets/images/rose-reference-01.jpg` đến `rose-reference-03.jpg` từ các URL bạn gửi:

- https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/hinh-nen-hoa-hong-1.jpg
- https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/hinh-nen-hoa-hong-23.jpg
- https://chiemtaimobile.vn/images/companies/1/%E1%BA%A2nh%20Blog/hinh-nen-hoa-hong/hinh-nen-hoa-hong-trang-5.jpg?1740730643719

Các ảnh này chỉ dùng để trang chạy local/offline theo bản bạn yêu cầu. Nếu đưa website lên công khai, hãy kiểm tra quyền sử dụng ảnh với nguồn ảnh hoặc thay bằng ảnh bạn sở hữu.
