"use client";

import { AddToCartAction } from "@/actions/shopping-cart";
import { AlertMessageType } from "@/lib/sharedTypes";
import { formatThousands } from "@/lib/utils";
import { useAlertStore } from "@/zustand/website/alertStore";
import { useOptionsStore } from "@/zustand/website/optionsStore";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { Spinner } from "@/ui/Spinners/Default";

type UpsellType = {
  id: string;
  mainImage: string;
  pricing: PricingType;
  visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
  createdAt: string;
  updatedAt: string;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    mainImage: string;
    basePrice: number;
  }>;
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

const SCROLL_THRESHOLD = 1040;

export default function StickyBar({
  productInfo,
  optionsComponent,
  scrollPosition,
  hasColor,
  hasSize,
  cart,
}: {
  productInfo: ProductInfoType;
  optionsComponent: JSX.Element;
  scrollPosition: number;
  hasColor: boolean;
  hasSize: boolean;
  cart: CartType | null;
}) {
  const [barIsHidden, setBarIsHidden] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isInCart, setIsInCart] = useState<boolean>(false);

  const { selectedColor, selectedSize } = useOptionsStore();
  const { showAlert } = useAlertStore();

  const { pricing, upsell, images, name } = productInfo;

  useEffect(() => {
    setIsInCart(
      cart?.products.some(
        ({ baseProductId, color, size }) =>
          baseProductId === productInfo.id &&
          color === selectedColor &&
          size === selectedSize
      ) ?? false
    );
  }, [cart, productInfo.id, selectedColor, selectedSize]);

  const handleAddToCart = async () => {
    if (hasColor && !selectedColor) {
      return showAlert({
        message: "Select a color",
        type: AlertMessageType.NEUTRAL,
      });
    }
    if (hasSize && !selectedSize) {
      return showAlert({
        message: "Select a size",
        type: AlertMessageType.NEUTRAL,
      });
    }

    startTransition(async () => {
      const result = await AddToCartAction({
        id: productInfo.id,
        color: selectedColor,
        size: selectedSize,
      });

      showAlert({
        message: result.message,
        type:
          result.type === AlertMessageType.ERROR
            ? AlertMessageType.ERROR
            : AlertMessageType.NEUTRAL,
      });

      if (result.type === AlertMessageType.SUCCESS) {
        setIsInCart(true);
      }
    });
  };

  useEffect(() => {
    if (scrollPosition >= SCROLL_THRESHOLD) {
      setBarIsHidden(false);
    } else {
      setBarIsHidden(true);
    }
  }, [scrollPosition]);

  return (
    <div
      className={clsx(
        "hidden md:block w-full py-4 px-5 fixed top-0 border-b -translate-y-full bg-white",
        {
          "-translate-y-full": barIsHidden,
          "translate-y-0 ease-in-out duration-150 transition": !barIsHidden,
        }
      )}
    >
      <div className="w-full max-w-[1066px] h-16 mx-auto flex gap-5 items-center justify-between">
        <div className="h-full flex gap-5">
          <div className="h-full aspect-square relative rounded-md flex items-center justify-center overflow-hidden">
            <Image
              src={images.main}
              alt={name}
              width={64}
              height={64}
              priority={true}
            />
          </div>
          <div className="h-full flex gap-5 items-center">
            <div className="w-max flex items-center justify-center">
              {Number(pricing.salePrice) ? (
                <div className="flex items-center gap-[6px]">
                  <span className="font-bold">
                    ${formatThousands(Number(pricing.salePrice))}
                  </span>
                  <span className="text-xs text-gray line-through mt-[2px]">
                    ${formatThousands(Number(pricing.basePrice))}
                  </span>
                  <span className="border border-black rounded-[3px] font-medium h-5 text-xs leading-[10px] px-[5px] flex items-center justify-center">
                    -{pricing.discountPercentage}%
                  </span>
                </div>
              ) : (
                <p className="font-bold">
                  ${formatThousands(Number(pricing.basePrice))}
                </p>
              )}
            </div>
            {optionsComponent}
          </div>
        </div>
        <div className="w-[348px] min-[840px]:w-[410px] flex gap-3">
          {!isInCart && (
            <button
              onClick={handleAddToCart}
              disabled={isPending}
              className={clsx(
                "flex items-center justify-center w-full rounded-full cursor-pointer border border-[#c5c3c0] text-sm font-semibold h-[44px] shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] min-[896px]:text-base min-[896px]:h-12",
                { "cursor-context-menu opacity-50": isPending }
              )}
            >
              {isPending ? <Spinner size={28} color="gray" /> : "Add to cart"}
            </button>
          )}
          <div className="w-full h-[44px] min-[840px]:h-12 relative rounded-full flex justify-end">
            <button className="peer flex items-center justify-center w-full max-w-[198px] rounded-full cursor-pointer border border-[#b27100] text-white text-sm font-semibold h-[44px] shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000] hover:bg-[#cc8100] hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] min-[896px]:text-base min-[896px]:h-12">
              Yes, let's upgrade
            </button>
            {!barIsHidden && (
              <div className="peer-hover:block hidden absolute top-[58px] -right-2 py-[18px] px-6 rounded-xl shadow-dropdown bg-white before:content-[''] before:w-[14px] before:h-[14px] before:bg-white before:rounded-tl-[2px] before:rotate-45 before:origin-top-left before:absolute before:-top-[10px] before:border-l before:border-t before:border-[#d9d9d9] before:right-20 min-[840px]:before:right-24">
                {upsell && upsell.products.length > 0 && (
                  <div className="w-max rounded-md pb-[10px] bg-white">
                    <div className="w-full">
                      <div>
                        <h2 className="font-black text-center text-[21px] text-red leading-6 [letter-spacing:-1px] [word-spacing:2px] [text-shadow:_1px_1px_1px_rgba(0,0,0,0.15)] w-[248px] mx-auto">
                          UPGRADE MY ORDER
                        </h2>
                        <div className="mt-1 text-center font-medium text-amber-dimmed">
                          {upsell.pricing.salePrice
                            ? `$${formatThousands(
                                Number(upsell.pricing.salePrice)
                              )} (${upsell.pricing.discountPercentage}% Off)`
                            : `$${formatThousands(
                                Number(upsell.pricing.basePrice)
                              )} today`}
                        </div>
                      </div>
                      <div className="mt-3 h-[210px] aspect-square mx-auto overflow-hidden">
                        <Image
                          src={upsell.mainImage}
                          alt="Upgrade order"
                          width={240}
                          height={240}
                          priority
                        />
                      </div>
                      <div className="w-[184px] mx-auto mt-5 text-xs leading-6 [word-spacing:1px]">
                        <ul className="*:flex *:justify-between">
                          {upsell.products.map((product) => (
                            <li key={product.id}>
                              <p className="text-gray">{product.name}</p>
                              <p>
                                <span
                                  className={`${
                                    upsell.pricing.salePrice > 0 &&
                                    upsell.pricing.salePrice <
                                      upsell.pricing.basePrice
                                      ? "line-through text-gray"
                                      : "text-gray"
                                  }`}
                                >
                                  ${formatThousands(Number(product.basePrice))}
                                </span>
                              </p>
                            </li>
                          ))}
                          {upsell.pricing.salePrice > 0 &&
                            upsell.pricing.salePrice <
                              upsell.pricing.basePrice && (
                              <li className="mt-2 flex items-center rounded font-semibold">
                                <p className="mx-auto">
                                  You Save $
                                  {formatThousands(
                                    Number(upsell.pricing.basePrice) -
                                      Number(upsell.pricing.salePrice)
                                  )}
                                </p>
                              </li>
                            )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
