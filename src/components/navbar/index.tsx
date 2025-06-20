"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/container";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const Navbar = () => {
  const navItems = [
    { title: "About", href: "/about" },
    { title: "Projects", href: "/projects" },
    { title: "Contact", href: "/contact" },
    { title: "Blog", href: "/blog" },
    { title: "Resume", href: "/resume" },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const { scrollY } = useScroll();

  const y = useTransform(scrollY, [0, 100], [0, 10]);
  const width = useTransform(scrollY, [0, 100], ["55%", "40%"]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1158);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
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
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        when: "afterChildren",
        staggerChildren: 0.02,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
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
        className={`hover:shadow-primary/20  fixed inset-x-0 top-4 z-50 mx-auto flex max-w-[725px] items-center justify-between rounded-full p-1 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:backdrop-blur-md ${
          scrolled ? "shadow-acceternity  bg-background/40" : "bg-background/50"
        } ${isMobile ? "w-[90%]" : ""}`}
      >
        <Link href="/" className="z-50">
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              className="h-10 w-10 rounded-full md:h-12 md:w-12"
              src="/avatar.webp"
              alt="Avatar"
              width={100}
              height={100}
              priority
            />
          </motion.div>
        </Link>

        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <div className={`${isMobile ? "hidden" : "flex"} items-center gap-4`}>
            {navItems.map((item, idx) => (
              <Link
                className="relative px-2 py-1 text-sm text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors duration-200"
                key={idx}
                href={item.href}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              >
                {hovered === idx && (
                  <motion.span
                    layoutId="hovered-span"
                    className="absolute inset-0 h-full w-full rounded-md bg-neutral-100 dark:bg-neutral-800/50"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="relative z-10">{item.title}</span>
              </Link>
            ))}
          </div>

          {/* Theme Toggle - Desktop */}
          <div className={`${isMobile ? "hidden" : "block"}`}>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className={`${isMobile ? "flex" : "hidden"} z-50 rounded-full p-2 focus:outline-none`}
            onClick={toggleMenu}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && isMobile && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-background/80 fixed inset-0 z-30 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={menuVariants}
                className="shadow-acceternity fixed inset-x-0 top-18 z[60] mx-2 min-h-[60vh] rounded-2xl bg-white p-4 backdrop-blur-lg dark:bg-neutral-900"
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
                        className="text-foreground block w-full rounded-xl bg-transparent px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                        }}
                      >
                        {item.title}
                      </Link>
                    </motion.div>
                  ))}
                  {/* Theme Toggle as a menu item */}
                  <motion.div variants={itemVariants} className="w-full">
                    <div className="text-foreground flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800">
                      {/* <span>Theme</span> */}
                      <ThemeToggle />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>
    </Container>
  );
};
