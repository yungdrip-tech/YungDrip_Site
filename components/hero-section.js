import Image from "next/image";
import Button from "@/components/button";

export default function HeroSection({ image }) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      <Image
        src={image}
        alt="YungDrip campaign"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/55" />

      <div className="shell relative flex min-h-screen items-center justify-center pt-20">
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 sm:bottom-10">
          <Button href="#collections" asChild variant="light" size="sm" className="min-w-[132px]">
            Shop Now
          </Button>
        </div>
      </div>
    </section>
  );
}
