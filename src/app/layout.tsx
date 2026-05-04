import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarberFlow",
  description: "Agenda automatizada para barberias con reservas, dashboard y Google Calendar."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
