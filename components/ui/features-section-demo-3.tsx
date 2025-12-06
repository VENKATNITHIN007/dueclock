"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

import Image from "next/image";

export default function FeaturesSectionDemo() {
  const features = [
    {
      title: "See all due dates in one place",
      description:
        "View upcoming work by client and date. No more digging through Excel sheets or chats.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-3 border-b lg:border-r border-slate-100 dark:border-neutral-800",
    },
    {
      title: "Visual snapshots of your work",
      description:
        "Quick visual cards so you can understand your day at a glance.",
      skeleton: <SkeletonTwo />,
      className:
        "col-span-1 lg:col-span-3 border-b border-slate-100 dark:border-neutral-800",
    },
    {
      title: "Explain it with a quick video",
      description:
        "Use a short video to show clients or team how Dueclock works.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-6 border-slate-100 dark:border-neutral-800",
    },
  ];

  return (
    <section
      id="features"
      className="relative z-10 py-16 lg:py-20 max-w-6xl mx-auto px-4 sm:px-6"
    >
      <div className="text-center max-w-3xl mx-auto">
        <p className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1 text-[11px] font-medium text-blue-700 mb-3">
          ✨ Simple tools for busy people
        </p>
        <h2 className="text-3xl lg:text-4xl tracking-tight font-semibold text-slate-900 dark:text-white">
          Stay organized with{" "}
          <span className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
            Dueclock
          </span>
        </h2>
        <p className="text-sm lg:text-base max-w-2xl mt-3 mx-auto text-slate-600 dark:text-neutral-300">
          A clean view of your deadlines, client status, and follow-ups —
          without overcomplicating your day.
        </p>
      </div>

      <div className="mt-10 lg:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-6 rounded-2xl overflow-hidden bg-white/90 backdrop-blur dark:bg-neutral-950/90 border border-slate-100 dark:border-neutral-800 shadow-sm">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full mt-4">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "p-5 sm:p-7 relative overflow-hidden bg-white dark:bg-neutral-900",
        className
      )}
    >
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="text-left tracking-tight text-slate-900 dark:text-white text-lg md:text-xl font-semibold">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="text-sm md:text-[15px] text-slate-600 dark:text-neutral-300 text-left max-w-sm mt-2">
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="relative flex py-6 px-2 h-full max-w-[800px] mx-auto">
      <div className="w-full p-4 mx-auto bg-slate-50 dark:bg-neutral-900 border border-blue-100/70 dark:border-neutral-800 rounded-xl shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Today&apos;s deadlines</span>
            <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5">
              Mostly clear
            </span>
          </div>
         <Image
  src="/allduedates.webp"
  alt="Dueclock dashboard overview"
  width={800}
  height={800}
  className="w-full h-auto object-contain rounded-md border border-slate-200/70 dark:border-neutral-800"
/>
        </div>
      </div>
    </div>
  );
};

export const SkeletonTwo = () => {
  const images = [
    "/dashboardm.webp",
    "/dashboardm.webp",
    "/filterlabel.webp",
    "/nooverdue.webp",
    "/nooverdue.webp",
  ];

  // simple static rotations to avoid complexity
  const rotations = [-6, -2, 4, 8, -4];

  return (
    <div className="relative flex flex-col items-start p-4 sm:p-6 gap-6 h-full overflow-hidden">
      <div className="flex flex-row -ml-12">
        {images.map((image, idx) => (
          <motion.div
            key={"images-first" + idx}
            style={{ rotate: rotations[idx % rotations.length] }}
            whileHover={{
              scale: 1.06,
              rotate: 0,
              zIndex: 20,
            }}
            whileTap={{
              scale: 1.04,
              rotate: 0,
              zIndex: 20,
            }}
            className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-slate-100 shrink-0 overflow-hidden shadow-sm"
          >
            <Image
              src={image}
              alt="Dueclock UI snapshot"
              width={500}
              height={500}
              className="rounded-lg h-20 w-20 md:h-28 md:w-28 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-row">
        {images.map((image, idx) => (
          <motion.div
            key={"images-second" + idx}
            style={{ rotate: rotations[(idx + 2) % rotations.length] }}
            whileHover={{
              scale: 1.06,
              rotate: 0,
              zIndex: 20,
            }}
            whileTap={{
              scale: 1.04,
              rotate: 0,
              zIndex: 20,
            }}
            className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-slate-100 shrink-0 overflow-hidden shadow-sm"
          >
            <Image
              src={image}
              alt="Dueclock UI snapshot"
              width={500}
              height={500}
              className="rounded-lg h-20 w-20 md:h-28 md:w-28 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </div>

      <div className="pointer-events-none absolute left-0 z-[10] inset-y-0 w-16 bg-gradient-to-r from-white dark:from-black to-transparent" />
      <div className="pointer-events-none absolute right-0 z-[10] inset-y-0 w-16 bg-gradient-to-l from-white dark:from-black to-transparent" />
    </div>
  );
};

export const SkeletonThree = () => {
  return (
   <section
          id="how"
          className="py-20 max-w-4xl mx-auto text-center space-y-6"
        >
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            How Dueclock works
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base">
            Add clients once, set recurring due dates, and let Dueclock remind
            you. See what&apos;s due, what&apos;s pending, and what&apos;s done
            in one place.
          </p>

          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            {/* Replace this with your own video later */}
            <iframe
              className="w-full aspect-video"
              src="https://youtube.com/embed/Yi0qPSUk8pw?si=ugoHz2HaesXVwjMm"
              title="Dueclock demo"
              allowFullScreen
            ></iframe>
          </div>
        </section>
  );
};
