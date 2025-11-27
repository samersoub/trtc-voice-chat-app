"use client";

import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { BannerService, type Banner } from "@/services/BannerService";

const LuxBannerCarousel: React.FC = () => {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [index, setIndex] = React.useState(0);
  const [slides, setSlides] = React.useState<Banner[]>([]);

  React.useEffect(() => {
    setSlides(BannerService.list());
  }, []);

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className="relative rounded-xl overflow-hidden w-full">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {slides.map((s) => (
            <CarouselItem key={s.id} className="basis-full">
              <a
                href={s.linkUrl || "#"}
                className="block h-36 sm:h-48 md:h-56 lg:h-64 w-full bg-cover bg-center relative"
                style={{ backgroundImage: `linear-gradient(135deg, #3b2f2f 0%, #1f1b14 60%), url('${s.imageUrl}')`, backgroundBlendMode: "multiply" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-red-500/10" />
                <div className="absolute bottom-4 right-4 text-right text-white drop-shadow">
                  <div className="text-lg sm:text-xl font-bold">{s.title}</div>
                  {s.sub && <div className="text-xs sm:text-sm text-white/80 mt-1">{s.sub}</div>}
                </div>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-3 sm:-left-4 bg-black/30 text-white border-none" />
        <CarouselNext className="-right-3 sm:-right-4 bg-black/30 text-white border-none" />
      </Carousel>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === i ? "bg-yellow-400 w-3" : "bg-white/50"
            )}
            aria-label={`go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default LuxBannerCarousel;