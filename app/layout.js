import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata = {
  title: "Convergence — Party Game",
  description: "Jeu de déduction sémantique. Trouve la règle à partir des indices !",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${nunito.variable}`}>
      <body className={`${nunito.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
