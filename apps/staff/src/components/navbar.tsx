"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";

import { MobileNav } from "@/components/mobile-nav";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

const NAV_ITEMS = [
  { href: "/", text: "Dashboard" },
  { href: "/payments", text: "Payments" },
  { href: "/admin", text: "Admin" },
  { href: "/change-password", text: "Change password" },
];

export function Navbar() {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex border-b px-6 py-3 backdrop-blur">
        <nav className="flex w-full items-center justify-between">
          <div className="flex items-center">
            {NAV_ITEMS.map((item) => (
              <NavbarChild
                key={item.href}
                href={item.href}
                text={item.text}
                isActive={
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)
                }
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <SignOutButton />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    );
  }
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex border-b px-4 py-3 backdrop-blur">
      <nav className="flex w-full items-center justify-between">
        <MobileNav />
        <div className="flex items-center gap-2">
          <SignOutButton />
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}

const NavbarChild = ({
  href,
  text,
  isActive,
}: {
  href: string;
  text: string;
  isActive: boolean;
}) => (
  <Link key={href} href={href}>
    <Button
      className={cn(
        "relative px-4 text-sm font-medium transition-all",
        isActive
          ? "text-primary before:bg-primary hover:text-primary/90 font-bold before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-1/2 before:-translate-x-1/2 before:transform before:content-['']"
          : "text-foreground/80 hover:text-foreground hover:bg-accent/50",
      )}
      variant="ghost"
    >
      {text}
    </Button>
  </Link>
);
