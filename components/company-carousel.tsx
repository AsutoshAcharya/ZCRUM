"use client";

import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import companies from "@/data/companies.json";
import Image from "next/image";
export function CompanyCarousel() {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
      className="w-full py-10"
    >
      <CarouselContent className="flex gap-5 sm:gap-20 items-center">
        {companies.map(({ name, path, id }) => (
          <CarouselItem className="basis-1/3 lg:basis-1/6">
            <Image
              key={id}
              src={path}
              alt={name}
              width={200}
              height={56}
              className="h9 sm:h-14 w-auto object-contain"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
