import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import TopBar from "@/components/layout/TopBar";
import PageLoader from "@/components/PageLoader"; // 👈 import the loader

const inter = Inter({
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bebasNeue.variable}`}>
        <TopBar />
        <Header />
        
        {/* Wrap pages with loader */}
        {/* <PageLoader> */}
          {children}
        {/* </PageLoader> */}
      </body>
    </html>
  );
}


