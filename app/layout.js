export const metadata = {
  title: "Practice Area Page Audit",
  description: "15-point gold standard audit for law firm practice area pages",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#fafaf7", color: "#1a1a1a" }}>
        {children}
      </body>
    </html>
  );
}
