// src/app/layout.js nebo src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Your App Title</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
