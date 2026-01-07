"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  variant = "blue", // Add variant prop
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
    variant?: "blue" | "slate" | "white";
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  // Color variants
  const variants = {
    blue: {
      movingMap: {
        TOP: "radial-gradient(20.7% 50% at 50% 0%, rgba(96, 165, 250, 0.8) 0%, rgba(255, 255, 255, 0) 100%)",
        LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, rgba(96, 165, 250, 0.8) 0%, rgba(255, 255, 255, 0) 100%)",
        BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, rgba(96, 165, 250, 0.8) 0%, rgba(255, 255, 255, 0) 100%)",
        RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, rgba(96, 165, 250, 0.8) 0%, rgba(255, 255, 255, 0) 100%)",
      },
      highlight: "radial-gradient(75% 181.16% at 50% 50%, rgba(59, 130, 246, 0.9) 0%, rgba(255, 255, 255, 0) 100%)",
      border: "border-blue-300/30",
      bg: "bg-white/80 hover:bg-white/90",
      text: "text-blue-700",
      innerBg: "bg-white",
    },
    slate: {
      movingMap: {
        TOP: "radial-gradient(20.7% 50% at 50% 0%, rgba(148, 163, 184, 0.8) 0%, rgba(255, 255, 255, 0) 100%)",
        LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, rgba(148, 163, 184, 0.8) 0%, rgba(255, 255, 255, 0) 100%)",
        BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, rgba(148, 163, 184, 0.8) 0%, rgba(255, 255, 255, 0) 100%)",
        RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, rgba(148, 163, 184, 0.8) 0%, rgba(255, 255, 255, 0) 100%)",
      },
      highlight: "radial-gradient(75% 181.16% at 50% 50%, rgba(100, 116, 139, 0.9) 0%, rgba(255, 255, 255, 0) 100%)",
      border: "border-slate-300/40",
      bg: "bg-white/80 hover:bg-white/90",
      text: "text-slate-700",
      innerBg: "bg-white",
    },
    white: {
      movingMap: {
        TOP: "radial-gradient(20.7% 50% at 50% 0%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 100%)",
        LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 100%)",
        BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 100%)",
        RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 100%)",
      },
      highlight: "radial-gradient(75% 181.16% at 50% 50%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 100%)",
      border: "border-white/40",
      bg: "bg-slate-800/80 hover:bg-slate-800/90",
      text: "text-white",
      innerBg: "bg-slate-800",
    }
  };

  const currentVariant = variants[variant];

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered]);

  return (
    <Tag
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        `relative flex rounded-full ${currentVariant.border} content-center ${currentVariant.bg} transition duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit`,
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          `w-auto ${currentVariant.text} z-10 ${currentVariant.innerBg} px-4 py-2 rounded-[inherit] font-medium`,
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        )}
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: currentVariant.movingMap[direction] }}
        animate={{
          background: hovered
            ? [currentVariant.movingMap[direction], currentVariant.highlight]
            : currentVariant.movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className={`${currentVariant.innerBg} absolute z-1 flex-none inset-[2px] rounded-[100px]`} />
    </Tag>
  );
}