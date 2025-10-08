export const metadata = {
  title: "Chatbox Demo",
  description: "Next.js + Tailwind chat widget demo",
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
