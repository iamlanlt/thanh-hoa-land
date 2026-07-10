import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Thanh Hóa Land | Bất động sản Thanh Hóa',
  description: 'Thông tin nhà đất minh bạch, vị trí tiềm năng và hỗ trợ tư vấn tận tâm tại Thanh Hóa.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
