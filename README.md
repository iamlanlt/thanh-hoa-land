# Thanh Hóa Land

Website bất động sản Thanh Hóa gồm trang công khai, danh sách/chi tiết tin đăng và khu vực quản trị tin, khách hàng cùng cấu hình website.

Tài liệu kiến trúc và quy ước kỹ thuật: [docs/PROJECT.md](docs/PROJECT.md).

## Công nghệ

- Next.js App Router, React và TypeScript
- Prisma và PostgreSQL
- React Hook Form và Zod
- Radix/shadcn, Lucide và Tailwind CSS
- Vercel

## Chạy local

Yêu cầu Node.js 24 và npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Trang công khai dùng dữ liệu demo nếu chưa cấu hình database. Các thao tác ghi trong khu vực quản trị vẫn cần PostgreSQL.

Để chạy đầy đủ với database:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

## Biến môi trường

Bắt buộc cho production:

- `DATABASE_URL`, `DIRECT_URL`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `SESSION_SECRET` (tối thiểu 32 ký tự)
- `NEXT_PUBLIC_SITE_URL`

Cloudinary, Google Analytics, SEO, bản đồ và thông tin liên hệ là tùy chọn. Sao chép danh sách đầy đủ từ `.env.example`; không commit `.env.local` hoặc secret.

## Lệnh chính

| Lệnh | Mục đích |
| --- | --- |
| `npm run dev` | Chạy môi trường phát triển |
| `npm run check` | Type-check và production build |
| `npm run db:generate` | Sinh Prisma Client |
| `npm run db:migrate` | Áp dụng migration chưa chạy |
| `npm run db:seed` | Tạo/cập nhật dữ liệu mẫu và admin |
| `npm start` | Chạy production build |

## Route chính

- Công khai: `/`, `/properties`, `/properties/[slug]`, `/privacy`
- Quản trị: `/admin`, `/admin/properties`, `/admin/leads`, `/admin/settings`
- Public API: `GET /api/properties`, `POST /api/leads`
- Admin API: `/api/admin/session`, `/api/admin/properties`, `/api/admin/settings`, `/api/admin/uploads/signature`

Các API quản trị và API cập nhật lead yêu cầu session admin. Endpoint cũ `/api/admin/login` và `/api/upload` không còn được hỗ trợ.

## Database và migration

Migration `20260713000000_init` là baseline duy nhất, tạo toàn bộ schema từ database rỗng.

Nếu database cũ đã được tạo bằng `prisma db push`, hãy sao lưu và xác nhận schema khớp `prisma/schema.prisma` trước khi đánh dấu baseline:

```bash
npx prisma migrate resolve --applied 20260713000000_init
npm run db:migrate
```

Không chạy `migrate resolve` trên database rỗng hoặc schema chưa khớp. Seed là idempotent theo `slug`, không reset lead, settings hoặc admin ngoài dữ liệu được cập nhật chủ động.

## Kiểm tra và deploy

```bash
npm run check
git diff --check
npx vercel
```

Luôn áp dụng migration trước phiên bản ứng dụng cần schema mới. Chỉ promote production sau khi kiểm tra route công khai, đăng nhập admin và các luồng tạo/sửa/xóa trên Preview.
