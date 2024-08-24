"use client";

import { useAlertStore } from "@/zustand/website/alertStore";
import { useOptionsStore } from "@/zustand/website/optionsStore";
import { useState, useTransition } from "react";
import { AddToCartAction } from "@/actions/add-to-cart";
import SpinnerGray from "@/ui/Spinners/Gray";
import Link from "next/link";
import clsx from "clsx";
import { AlertMessageType } from "@/lib/sharedTypes";

export function CartAndUpgradeButtons({
  productId,
  hasColor,
  hasSize,
}: {
  productId: string;
  hasColor: boolean;
  hasSize: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [itemAdded, setItemAdded] = useState(false); // New state for tracking cart addition

  const { selectedColor, selectedSize } = useOptionsStore();
  const { showAlert } = useAlertStore();

  const handleAddToCart = async () => {
    if (hasColor && !selectedColor) {
      return showAlert({ message: "Select a color" });
    }
    if (hasSize && !selectedSize) {
      return showAlert({ message: "Select a size" });
    }

    startTransition(async () => {
      const result = await AddToCartAction({
        id: productId,
        color: selectedColor,
        size: selectedSize,
      });

      showAlert({ message: result.message, type: result.type });

      if (result.type === AlertMessageType.SUCCESS) {
        setItemAdded(true);
      }
    });
  };

  if (itemAdded) {
    return (
      <Link href="/cart" className="w-full">
        <button className="text-sm min-[896px]:text-base inline-block text-center align-middle h-[44px] min-[896px]:h-12 w-full border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-100 transition bg-amber hover:bg-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]">
          Added (1) - View Cart
        </button>
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={isPending}
        className={clsx(
          "text-sm min-[896px]:text-base font-semibold w-full h-[44px] min-[896px]:h-12 flex items-center justify-center rounded-full ease-in-out duration-150 transition border border-[rgb(150,150,150)] hover:border-[rgb(80,80,80)] active:border-[rgb(150,150,150)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.16)]",
          {
            "cursor-context-menu opacity-50": isPending,
          }
        )}
      >
        {isPending ? <SpinnerGray size={28} /> : <>Add to Cart</>}
      </button>
      <button className="text-sm min-[896px]:text-base inline-block text-center align-middle h-[44px] min-[896px]:h-12 w-full border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-100 transition bg-amber hover:bg-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]">
        Yes, Let's Upgrade
      </button>
    </>
  );
}
