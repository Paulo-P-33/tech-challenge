import type { Metadata } from "next";
import "./globals.css";
import "@uigovpe/styles";

export const metadata: Metadata = {
  title: "Tech Challenge",
  description: "Gerenciamento de produtos e categorias",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
