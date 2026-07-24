# Thanh Hóa Land — kiến trúc và vận hành

Tài liệu này là nguồn mô tả kỹ thuật duy nhất của project. README chỉ giữ hướng dẫn khởi động nhanh; kế hoạch và đặc tả đã hoàn thành không được lưu lặp lại.

## 1. Phạm vi sản phẩm

Thanh Hóa Land cung cấp:

- Website công khai để tìm, lọc và xem bất động sản.
- Form tiếp nhận nhu cầu tư vấn.
- Khu vực quản trị tin đăng, lead và cấu hình website.
- Chế độ dữ liệu demo cho giao diện công khai khi chưa có database.

Ngôn ngữ thiết kế ưu tiên độ tin cậy, khả năng quét thông tin, responsive và accessibility; nhận diện chính là xanh đậm, vàng ấm và surface trung tính.

## 2. Kiến trúc

| Lớp | Trách nhiệm |
| --- | --- |
| `src/app` | Route, layout, metadata và điều phối render/request |
| `src/services` | Query, mutation và nghiệp vụ dữ liệu |
| `src/components/ui` | Primitive giao diện dùng chung |
| `src/components/landing` | Thành phần website công khai |
| `src/components/admin` | Thành phần khu vực quản trị |
| `src/lib` | Auth, validation, format, config và helper dùng chung |
| `src/data` | Dữ liệu demo/seed canonical |
| `prisma` | Schema, migration và seed |

Server Components tải dữ liệu ban đầu. Client Components chỉ được dùng cho form, menu, gallery, filter hoặc tương tác cần state trình duyệt. Route handler xác thực và validate input trước khi gọi service.

## 3. Dữ liệu

### Property

Tin đăng chứa nội dung, vị trí, giá, diện tích, đặc điểm, trạng thái, độ ưu tiên, trạng thái hiển thị, ảnh/video và thời điểm xuất bản. `publishedAt` là ngày công khai; `createdAt` chỉ là ngày tạo bản ghi. Xóa tin sử dụng `deletedAt` thay vì xóa cứng.

### PropertyImage

Ảnh thuộc một tin đăng, có thứ tự hiển thị và bị xóa theo tin nhờ quan hệ cascade.

### Lead

Lead lưu thông tin liên hệ, nhu cầu, trạng thái chăm sóc, ghi chú và tin đăng liên quan. Khi tin bị xóa, liên kết lead được đặt về `null`.

### AdminUser và SiteSetting

Admin lưu mật khẩu đã hash. Settings lưu cấu hình website dạng key/value và được đọc qua service chung.

`src/data/seed-data.ts` là nguồn duy nhất cho dữ liệu demo và Prisma seed; không sao chép danh sách mẫu sang component.

## 4. Route và API

### Trang

- Công khai: `/`, `/properties`, `/properties/[slug]`, `/privacy`.
- Quản trị: `/admin`, `/admin/properties`, `/admin/properties/new`, `/admin/properties/[id]/edit`, `/admin/leads`, `/admin/settings`, `/admin/login`.

### API

| Method và route | Quyền | Chức năng |
| --- | --- | --- |
| `GET /api/properties` | Public | Lấy tin đang công khai |
| `POST /api/leads` | Public, rate-limited | Tạo yêu cầu tư vấn |
| `PATCH /api/leads/[id]` | Admin | Cập nhật trạng thái/ghi chú lead |
| `POST/DELETE /api/admin/session` | Public/Admin | Đăng nhập hoặc đăng xuất |
| `GET/POST /api/admin/properties` | Admin | Danh sách phân trang hoặc tạo tin |
| `GET/PATCH/DELETE /api/admin/properties/[id]` | Admin | Đọc, sửa hoặc xóa mềm tin |
| `GET/PATCH /api/admin/settings` | Admin | Đọc hoặc cập nhật cấu hình |
| `POST /api/admin/uploads/signature` | Admin | Tạo chữ ký upload Cloudinary |

`proxy.ts` bảo vệ route admin và API ghi dữ liệu. Mỗi route nhạy cảm vẫn phải kiểm tra session tại boundary; không dựa riêng vào UI để phân quyền.

## 5. UI/UX

- Màu, typography, spacing, radius, shadow và control height dùng semantic token chung.
- Public style thuộc `src/app/public.css`; admin style thuộc `src/app/admin/admin.css`; `globals.css` chỉ chứa token, reset và primitive toàn cục.
- Button, input, textarea, select, badge, dialog, sheet, skeleton và toast dùng primitive trong `src/components/ui`.
- Mỗi vùng chỉ có một primary action; destructive action luôn có xác nhận.
- Badge dùng `inline-flex`, căn giữa hai trục và không thay đổi kích thước theo context.
- Form desktop tối đa hai cột, mobile một cột; loading/error không làm thay đổi bố cục đột ngột.
- Record quản trị trên mobile dùng card ba vùng: nhận diện, dữ liệu chính và thao tác; tránh card lồng, giữ giá/trạng thái dễ quét và touch target tối thiểu 40px.
- Overlay và drawer luôn nằm trên sticky header; metric mobile căn giữa, còn badge phủ ảnh bám sát vùng an toàn ở góc trên trái.
- Filter danh sách quản trị (tin đăng, khách hàng) được phản ánh trên URL và phân trang phía server.
- Keyboard focus, accessible label, `aria-live`, touch target và `prefers-reduced-motion` phải được giữ khi chỉnh UI.
- Ảnh có kích thước/aspect ratio dự phòng; chỉ ảnh LCP dùng priority, ảnh ngoài viewport lazy-load.

## 6. Validation và bảo mật

- Zod validate payload tại API boundary.
- Session admin dùng JWT ký bằng `SESSION_SECRET` tối thiểu 32 ký tự, lưu trong cookie HTTP-only.
- Mật khẩu admin được hash bằng bcrypt.
- Route admin có `noindex`; response có các security header cơ bản.
- Public API không được trả password hash, ghi chú nội bộ hoặc dữ liệu quản trị.
- File `.env.local`, metadata Vercel và artifact QA phải nằm ngoài Git.
- Production phải dùng rate limit dùng chung giữa các instance; implementation in-memory hiện tại chỉ phù hợp local hoặc single-instance.
- URL lưu vào settings/media chỉ chấp nhận `http/https`; các integration đặc thù nên bổ sung allowlist domain khi cần.

## 7. Database và migration

`prisma/migrations/20260713000000_init` là migration baseline duy nhất và phải tạo được toàn bộ schema từ PostgreSQL rỗng. Mọi thay đổi schema sau baseline phải có migration mới; không sửa migration đã deploy.

Quy trình database mới:

1. Cấu hình `DATABASE_URL` và `DIRECT_URL`.
2. Chạy `npm run db:migrate`.
3. Chạy `npm run db:seed` khi cần dữ liệu khởi tạo.

Database đã tồn tại từ `prisma db push` phải được backup, đối chiếu schema và đánh dấu baseline bằng `prisma migrate resolve --applied 20260713000000_init`. Không dùng `resolve` để bỏ qua khác biệt schema.

## 8. Chất lượng và hiệu năng

- Query danh sách chỉ select trường cần thiết và phải có limit/pagination hợp lý.
- Tránh request tuần tự, N+1 và truy vấn lặp giữa metadata với page render.
- State ở phạm vi nhỏ nhất; không sao chép dữ liệu dẫn xuất vào state.
- Không memoize theo thói quen; chỉ tối ưu khi cấu trúc render hoặc profiler cho thấy có lợi.
- Không tạo abstraction chỉ vì vài dòng giống nhau; hợp nhất khi semantics và hành vi thực sự giống nhau.
- Trước khi xóa file/helper/selector phải tìm consumer bằng `rg` và chạy lại type-check/build.

Kiểm tra tối thiểu trước merge/deploy:

```bash
npm run check
npx prisma validate
git diff --check
```

Sau build cần smoke test route public, phản hồi `401` của admin API khi chưa đăng nhập, login/logout, property CRUD, cập nhật lead và settings.

## 9. Triển khai

1. Áp dụng migration trước phiên bản application cần schema mới.
2. Build production và deploy Vercel Preview.
3. Kiểm tra desktop/mobile, console, API và thao tác quản trị trên Preview.
4. Promote Production khi toàn bộ kiểm tra đạt.
5. Seed production chỉ chạy chủ động và phải sử dụng credential admin riêng qua biến môi trường.

## 10. Nợ kỹ thuật đã biết

- Thay rate limiter in-memory bằng Redis/KV hoặc dịch vụ phân tán trước khi scale nhiều instance.
- Bổ sung test tự động cho auth, API mutation và migration.
- Chuẩn hóa xử lý network error bằng `try/catch/finally` trong các form quản trị.
- Cache query chi tiết tin dùng chung giữa metadata và page render.
- Theo dõi và xử lý cảnh báo dependency từ `npm audit`.

Các mục này phải được cập nhật trực tiếp tại đây khi hoàn thành; không tạo thêm tài liệu kế hoạch trùng lặp.
