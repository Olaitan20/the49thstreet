import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import TopBar from "@/components/layout/TopBar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

export const metadata = {
  title: "The49thStreet",
  description: "The 49th Street",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Force favicon to load in all browsers */}
        <link rel="icon" href="/logo.png" sizes="any" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>

      <body className={`${inter.variable} ${bebasNeue.variable}`}>
        <TopBar />
        <Header />
        {children}

        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#000",
              color: "#fff",
              fontSize: "16px",
              fontFamily: "var(--font-bebas-neue)",
            },
          }}
        />
      </body>
    </html>
  );
}
