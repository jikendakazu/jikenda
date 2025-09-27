export const metadata = {
  title: "Jikenda",
  description: "司法事件管理アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          lineHeight: 1.6,
          padding: 24,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {children}
      </body>
    </html>
  );
}
