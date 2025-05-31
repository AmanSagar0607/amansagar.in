

"use client";

import { useState } from "react";
import { Container } from "@/components/container";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";


import React from 'react'

export const Navbar = () => {
    const navItems = [
        {
            title: "About",
            href: "/about",
        },
        {
            title: "Projects",
            href: "/projects",
        },
        {
            title: "Contact",
            href: "/contact",
        },
        {
            title:"Blog",
            href:"/blog",
        },
        {
            title:"Resume",
            href:"/resume",
        }
    ];

    const [hovered, setHovered] = useState<number | null>(null);
    const {scrollY} = useScroll();

    const [scrolled, setScrolled] = useState<boolean>(false);

    const y = useTransform(scrollY, [0, 100], ["0", "10"]);
    const width = useTransform(scrollY, [0, 100], ["55%", "40%"]);

    useMotionValueEvent(scrollY, "change", (latest) => {
        console.log("scrollY",latest);
        if (latest > 20) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }
    });

  return (
    <Container>
        <motion.nav 
       style={{
        boxShadow: scrolled ? "var(--shadow-acceternity)" : "none",
        width: width,
        y: y,
         }}
         transition={{
            duration: 0.3,
            ease: "easeInOut",
         }}
        className={`bg-white fixed inset-x-0 top-4 z-50 mx-auto flex max-w-4xl items-center justify-between p-1 px-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:backdrop-blur-md hover:shadow-lg hover:shadow-primary/20 ${scrolled ? "shadow-acceternity bg-background/40" : "bg-background/50"}`}>
            {/* Avatar */}
           <Link href="/"> <Image className="h-12 w-12 rounded-full" src="/avatar.webp" alt="Avatar" width={100} height={100} /></Link>
           
            {/* NavItems */}
            <div className="flex  items-center gap-4">
                {navItems.map((item, idx) => (
                    <Link 
                         className="text-sm relative px-2 py-1 md:text-base text-secondary"
                         key={idx}
                         href={item.href}
                         onMouseEnter={() => setHovered(idx)}
                         onMouseLeave={() => setHovered(null)}>
                            {hovered === idx && (
                            <motion.span layoutId="hovered-span" className="h-full w-full absolute inset-0 rounded-md  bg-neutral-100 dark:bg-neutral-800" 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.3 }}
                            />
                         )}
                        <span className=" relative z-10">{item.title}</span>
                     </Link>
                ))}
            </div>
        </motion.nav>
    </Container>
  )
}