"use client";

import { useState, useEffect, useRef } from "react";
import { Container } from "@/components/Container";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ProfileLinks } from "@/components/profile-link2"; // Import ProfileLinks component

type NavItem = {
  title: string;
  href: string;
  showInDesktop?: boolean;
  showInMobile?: boolean;
};

export const Navbar = () => {
  // Define all navigation items with their visibility settings
  const allNavItems: NavItem[] = [
    { title: "About", href: "/about", showInDesktop: true, showInMobile: true },
    { title: "Projects", href: "/projects", showInDesktop: false, showInMobile: true },
    { title: "Contact", href: "/contact", showInDesktop: true, showInMobile: true },
    { title: "Blog", href: "/blog", showInDesktop: false, showInMobile: true },
    { title: "Resume", href: "/resume", showInDesktop: true, showInMobile: true },
  ];

  // Filter navigation items based on view
  const desktopNavItems = allNavItems.filter(item => item.showInDesktop !== false);
  const mobileNavItems = allNavItems.filter(item => item.showInMobile !== false);

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const { scrollY } = useScroll();
  const menuRef = useRef<HTMLDivElement>(null);

  const y = useTransform(scrollY, [0, 100], [0, 10]);
  const width = useTransform(scrollY, [0, 100], ["85%", "30%"]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 840);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  useEffect(() => {
    // Prevent body scrolling when mobile menu is open
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (isMobile === null) {
    return null;
  }

  return (
    <Container>
      <motion.nav
        ref={menuRef}
        style={{
          boxShadow: scrolled ? "var(--shadow-acceternity)" : "none",
          width: isMobile ? "90%" : width,
          y: !isMobile ? y : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className={`hover:shadow-primary/20  fixed inset-x-0 top-4 z-50 mx-auto flex max-w-[725px] items-center justify-between rounded-full p-1 pr-[10px] backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:backdrop-blur-md ${
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
              className="h-10 w-10 rounded-full md:h-10 md:w-10"
              src="/aman-avatar.webp"
              alt="Avatar"
              width={100}
              height={100}
              priority
            />
          </motion.div>
        </Link>

        <div className="flex items-center gap-1">
          {/* Desktop Navigation */}
          <div className={`${isMobile ? "hidden" : "flex"} items-center gap-0`}>
            {desktopNavItems.map((item, idx) => (
              <Link
                className="relative px-2 py-1 text-[13px] text-primary hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors duration-200 "
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

          {/* Theme Toggle - Always show on desktop, show on mobile when menu is closed */}
          {(!isMobile || !isOpen) && (
            <div className={isMobile ? "mr-2" : "block"}>
              <ThemeToggle />
            </div>
          )}

          {/* Mobile Menu Button - Only show when menu is closed */}
          {!isOpen && isMobile && (
            <motion.button
              className="z-50 rounded-full p-2 focus:outline-none"
              onClick={toggleMenu}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </motion.button>
          )}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && isMobile && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-background/80 fixed inset-0 z-30 "
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={menuVariants}
                className="shadow-acceternity fixed inset-x-0 -top-4 -left-28 z[60] mx-12 min-h-[100vh] bg-white p-4 backdrop-blur-lg border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex flex-col mt-20">
                  {mobileNavItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      className="w-full "
                    >
                      <Link
                        href={item.href}
                        className="text-foreground block w-full rounded-xl bg-transparent px-14 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                        }}
                      >
                        {item.title}
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Profile Links with border and shadow */}
                  <motion.div 
                    variants={itemVariants} 
                    className="w-full mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800"
                  >
                    <div className="px-14">
                      <ProfileLinks />
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
