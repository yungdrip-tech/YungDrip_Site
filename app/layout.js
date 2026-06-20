import "@/app/globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CartProvider } from "@/components/providers/cart-provider";

export const metadata = {
  title: "YungDrip | Premium Everyday Essentials",
  description: "Premium monochrome essentials for those who wear silence. Shop hoodies, tees, and tailored pieces at YungDrip.",
  metadataBase: new URL("https://yungdrip.in"),
  openGraph: {
    title: "YungDrip | Premium Everyday Essentials",
    description: "Premium monochrome essentials for those who wear silence. Shop hoodies, tees, and tailored pieces at YungDrip.",
    url: "https://yungdrip.in",
    siteName: "YungDrip",
    images: [
      {
        url: "/hero/site-image.jpg",
        width: 1200,
        height: 630,
        alt: "YungDrip — Minimal forms. Maximum presence."
      }
    ],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "YungDrip | Premium Everyday Essentials",
    description: "Premium monochrome essentials for those who wear silence.",
    images: ["/hero/site-image.jpg"]
  },
  themeColor: "#ffffff",
  icons: {
    icon: "/favicon.ico"
  }
};

export const viewport = {
  themeColor: "#ffffff"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-canvas text-ink">
        <AuthProvider>
          <CartProvider>
            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
              <Navbar />
              <main className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-14 md:pb-0 md:pt-20">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
