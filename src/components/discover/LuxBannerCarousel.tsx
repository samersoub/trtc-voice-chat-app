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
    <div className="relative rounded-2xl overflow-hidden w-full shadow-2xl hover:shadow-purple-500/20 transition-shadow duration-500 group">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {slides.map((s, slideIndex) => (
            <CarouselItem key={s.id} className="basis-full">
              <a
                href={s.linkUrl || "#"}
                className="block h-36 sm:h-48 md:h-56 lg:h-64 w-full bg-cover bg-center relative overflow-hidden group/slide"
                style={{ backgroundImage: `linear-gradient(135deg, #3b2f2f 0%, #1f1b14 60%), url('${s.imageUrl}')`, backgroundBlendMode: "multiply" }}
              >
                {/* Animated Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-red-500/20 animate-gradient" style={{ backgroundSize: '200% 200%' }} />
                
                {/* Shimmer Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover/slide:translate-x-[200%] transition-transform duration-1000" />
                
                {/* Content with Enhanced Animation */}
                <div className="absolute bottom-4 right-4 text-right text-white drop-shadow-2xl transform group-hover/slide:scale-105 transition-transform duration-300">
                  <div className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-white animate-gradient" style={{ backgroundSize: '200% 200%' }}>
                    {s.title}
                  </div>
                  {s.sub && (
                    <div className="text-xs sm:text-sm text-white/90 mt-1 backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full inline-block">
                      {s.sub}
                    </div>
                  )}
                </div>
                
                {/* Vignette Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Enhanced Navigation Buttons */}
        <CarouselPrevious className="-left-3 sm:-left-4 bg-black/50 backdrop-blur-md text-white border-none hover:bg-purple-500/80 hover:scale-110 transition-all duration-300 shadow-xl" />
        <CarouselNext className="-right-3 sm:-right-4 bg-black/50 backdrop-blur-md text-white border-none hover:bg-purple-500/80 hover:scale-110 transition-all duration-300 shadow-xl" />
      </Carousel>

      {/* Enhanced Dots with Glow Effect */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === i 
                ? "bg-gradient-to-r from-yellow-400 via-purple-400 to-yellow-400 w-8 shadow-lg shadow-yellow-400/50 animate-pulse" 
                : "bg-white/50 w-2 hover:bg-white/80 hover:w-3"
            )}
            aria-label={`go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default LuxBannerCarousel;