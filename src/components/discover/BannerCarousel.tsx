"use client";

import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

type Slide = {
  title: string;
  subtitle: string;
  bg: string;
};

const slides: Slide[] = [
  {
    title: "Gold Festival",
    subtitle: "Double rewards all weekend",
    bg: "from-yellow-300 via-amber-400 to-yellow-600",
  },
  {
    title: "Red Hot Weekend",
    subtitle: "Top Rooms on Fire",
    bg: "from-rose-400 via-red-500 to-rose-700",
  },
  {
    title: "Premium Mic Madness",
    subtitle: "Boost your ranking now",
    bg: "from-amber-300 via-yellow-500 to-orange-600",
  },
];

const BannerCarousel: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("relative", className)}>
      <Carousel opts={{ align: "start" }}>
        <CarouselContent>
          {slides.map((s, i) => (
            <CarouselItem key={i} className="basis-full sm:basis-1/2 lg:basis-1/3">
              <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
                <div className={cn("h-full w-full bg-gradient-to-br", s.bg)}>
                  <div className="h-full w-full flex items-center justify-between p-4 sm:p-6">
                    <div className="text-white">
                      <div className="text-lg sm:text-xl font-bold drop-shadow">{s.title}</div>
                      <div className="text-xs sm:text-sm opacity-90">{s.subtitle}</div>
                    </div>
                    <img
                      src="/placeholder.svg"
                      alt="promo"
                      className="h-16 w-16 sm:h-20 sm:w-20 opacity-80"
                    />
                  </div>
                </div>
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default BannerCarousel;