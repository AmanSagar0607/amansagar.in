"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

interface TimelineProps {
  data: TimelineEntry[];
  title?: string;
  description?: string;
  className?: string;
}

export const metadata = {
  title: "About Me",
  description: "A timeline of my professional and educational milestones",
};

export const Timeline = ({
  data,
  title = "My Journey",
  description = "A timeline of my professional and educational milestones",
  className,
}: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setHeight(rect.height); // Use containerRef to capture full timeline height
    }

    const handleScroll = () => {
      if (!ref.current) return;

      const timelineItems = Array.from(
        ref.current.querySelectorAll(".timeline-item"),
      );
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      timelineItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const itemTop = window.scrollY + rect.top;
        const itemBottom = itemTop + rect.height;

        if (scrollPosition >= itemTop && scrollPosition <= itemBottom) {
          setActiveIndex(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"], // Adjusted offset to cover full container
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className={cn("bg-background w-full font-sans", className)}
      ref={containerRef}
    >
      <div className="mx-auto max-w-7xl py-10">
        <h4 className="text-primary text-2xl font-bold">{title}</h4>
        <p className="text-secondary pt-2 text-sm">{description}</p>
      </div>

      <div ref={ref} className="relative mx-auto max-w-7xl pb-20 md:pl-4 pl-0">
        {/* Timeline line */}
        <div className="bg-nfrom-muted via-muted/50 to-muted/0 absolute top-0 bottom-0 left-5 w-0.5" />

        {data.map((item, index) => (
          <div
            key={index}
            className="timeline-item group relative mb-12 pl-10 last:mb-0"
          >
            {/* Year with dot */}
            <div className="mb-4 flex items-center">
              <div
                className={cn(
                  "absolute left-0 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full",
                  "transition-colors duration-200",
                  activeIndex === index
                    ? "bg-neutral-500"
                    : "bg-muted-foreground/20 group-hover:bg-muted-foreground/30",
                )}
              >
                {activeIndex === index && (
                  <Check className="h-3 w-3 text-white " />
                )}
              </div>
              <h3 className="text-neutral-700 text-md font-bold rounded-md shadow-acceternity w-fit px-4 py-0">
                {item.title}
              </h3>
            </div>

            {/* Content */}
            <div className="pl-2">{item.content}</div>
          </div>
        ))}

        {/* Animated progress line */}
        {/* <motion.div
          style={{
            height: heightTransform,
            opacity: opacityTransform,
          }}
          className="absolute top-0 left-0 md:left-4 w-0.5 bg-gradient-to-t from-neutral-300 via-neutral-300/50 to-transparent"
        /> */}
      </div>
    </div>
  );
};