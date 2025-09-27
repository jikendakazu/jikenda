// app/layout.tsx
export const metadata = { title: "Jikenda" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{
        fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Noto Sans JP", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif',
        lineHeight:1.6, padding:24, maxWidth:900, margin:'0 auto'
      }}>
        {children}
      </body>
    </html>
  );
}
