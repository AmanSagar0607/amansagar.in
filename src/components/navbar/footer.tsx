import React from "react";
import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
} from "@tabler/icons-react";
import { Container } from "@/components/container";

export const Footer = () => {
  return (
    <Container>
    <div className="flex items-center justify-between border-t px-6 py-3 border-neutral-100">
      <p className="text-xs text-neutral-500">Built with love by Aman Sagar</p>
      <div className="flex items-center justify-center gap-4">
        <Link href="https://github.com/amansagar0307">
          <IconBrandGithub className="size-5 text-neutral-500 hover:text-neutral-700" />
        </Link>
        <Link href="https://linkedin.com/in/amansagar0307">
          <IconBrandLinkedin className="size-5 text-neutral-500 hover:text-neutral-700" />
        </Link>
        <Link href="https://x.com/amansagar0307">
          <IconBrandX className="size-5 text-neutral-500 hover:text-neutral-700" />
        </Link>
      </div>
      </div>
    </Container>
  );
};
