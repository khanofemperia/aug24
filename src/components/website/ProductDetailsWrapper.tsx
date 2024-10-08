"use client";

import React, { useRef, useEffect, useState } from "react";
import StickyBar from "./Product/StickyBar";
import Options from "@/components/website/Product/Options";

type UpsellProductType = {
  id: string;
  name: string;
  slug: string;
  mainImage: string;
  basePrice: number;
};

type PricingType = {
  salePrice: number;
  basePrice: number;
  discountPercentage: number;
};

type UpsellType = {
  id: string;
  mainImage: string;
  pricing: PricingType;
  visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
  createdAt: string;
  updatedAt: string;
  products: UpsellProductType[];
};

type ProductInfoType = {
  id: string;
  name: string;
  pricing: PricingType;
  images: {
    main: string;
    gallery: string[];
  };
  options: {
    colors: Array<{
      name: string;
      image: string;
    }>;
    sizes: {
      inches: {
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
      centimeters: {
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
    };
  };
  upsell: UpsellType;
};

export function ProductDetailsWrapper({
  children,
  cart,
  hasColor,
  hasSize,
  productInfo,
}: {
  readonly children: React.ReactNode;
  cart: CartType | null;
  hasColor: boolean;
  hasSize: boolean;
  productInfo: ProductInfoType;
}) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (wrapperRef.current) {
        setScrollPosition(wrapperRef.current.scrollTop);
      }
    };

    const wrapperElement = wrapperRef.current;
    if (wrapperElement) {
      wrapperElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (wrapperElement) {
        wrapperElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="h-screen overflow-x-hidden overflow-y-auto custom-scrollbar"
    >
      {children}
      <StickyBar
        productInfo={productInfo}
        optionsComponent={
          <Options
            cart={cart}
            productInfo={productInfo}
            isStickyBarInCartIndicator={true}
          />
        }
        scrollPosition={scrollPosition}
        hasColor={hasColor}
        hasSize={hasSize}
        cart={cart}
      />
    </div>
  );
}
