import "@/app/globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CartProvider } from "@/components/providers/cart-provider";

export const metadata = {
  title: "YungDrip | Premium Everyday Essentials",
  description: "A modern full-stack clothing storefront built with Next.js, Tailwind CSS, and MongoDB."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-canvas text-ink">
        <AuthProvider>
          <CartProvider>
            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
              <Navbar />
              <main className="flex-1 pb-28 pt-0 md:pb-0 md:pt-20">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
