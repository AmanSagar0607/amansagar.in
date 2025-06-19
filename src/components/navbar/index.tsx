"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/container";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    const [hovered, setHovered] = useState<number | null>(null);
    const [scrolled, setScrolled] = useState<boolean>(false);
    const { scrollY } = useScroll();

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
            title: "Blog",
            href: "/blog",
        },
        {
            title: "Resume",
            href: "/resume",
        },
    ];

    const y = useTransform(scrollY, [0, 100], [0, 10]);
    const width = useTransform(scrollY, [0, 100], ["55%", "40%"]);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 1158);
        };
        
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 20) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }
    });

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const menuVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
            },
        },
        exit: { 
            opacity: 0,
            y: -20,
            transition: {
                when: "afterChildren",
                staggerChildren: 0.05,
                staggerDirection: -1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.3
            }
        },
    };

    if (isMobile === null) {
        return null;
    }

    return (
        <Container>
            <motion.nav 
                style={{
                    boxShadow: scrolled ? "var(--shadow-acceternity)" : "none",
                    width: isMobile ? "90%" : width,
                    y: !isMobile ? y : 0,
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                }}
                className={`fixed inset-x-0 top-4 z-50 mx-auto flex items-center justify-between p-1 max-w-[725px] rounded-full transition-all duration-300 backdrop-blur-sm hover:backdrop-blur-md hover:shadow-lg hover:shadow-primary/20 ${
                    scrolled ? "shadow-acceternity bg-background/40" : "bg-background/50"
                } ${isMobile ? 'w-[90%]' : ''}`}
            >
                {/* Avatar - Always visible */}
                <Link href="/" className="z-50">
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Image 
                            className="h-10 w-10 md:h-12 md:w-12 rounded-full" 
                            src="/avatar.webp" 
                            alt="Avatar" 
                            width={100} 
                            height={100} 
                            priority
                        />
                    </motion.div>
                </Link>
               
                {/* Menu Toggle - Visible below 1158px */}
                <motion.button
                    className={`${isMobile ? 'flex' : 'hidden'} z-50 p-2 rounded-full focus:outline-none`}
                    onClick={toggleMenu}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.button>

                {/* Desktop NavItems - Hidden below 1158px */}
                <div className={`${isMobile ? 'hidden' : 'flex'} items-center gap-4`}>
                    {navItems.map((item, idx) => (
                        <Link 
                            className="text-sm relative px-2 py-1 md:text-base text-secondary"
                            key={idx}
                            href={item.href}
                            onMouseEnter={() => setHovered(idx)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {hovered === idx && (
                                <motion.span 
                                    layoutId="hovered-span" 
                                    className="h-full w-full absolute inset-0 rounded-md bg-neutral-100 dark:bg-neutral-800" 
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                            <span className="relative z-10">{item.title}</span>
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu - Only shows when isOpen is true and screen is mobile */}
                <AnimatePresence>
                    {isOpen && isMobile && (
                        <>
                            {/* Blur Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
                                onClick={() => setIsOpen(false)}
                            />
                            
                            {/* Menu Content */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={menuVariants}
                                className="fixed min-h-[60vh] inset-x-0 top-17  mx-2 rounded-2xl bg-white shadow-acceternity backdrop-blur-lg z-[60] p-4"
                            >
                                <div className="flex flex-col space-y-4">
                                    {navItems.map((item, idx) => (
                                        <motion.div 
                                            key={idx} 
                                            variants={itemVariants}
                                            className="w-full"
                                        >
                                            <Link 
                                                href={item.href}
                                                className="block w-full py-2 text-sm font-medium text-primary bg-transparent hover:bg-gray-100 rounded-xl transition-all duration-200"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsOpen(false);
                                                }}
                                            >
                                                {item.title}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.nav>
        </Container>
    );
};