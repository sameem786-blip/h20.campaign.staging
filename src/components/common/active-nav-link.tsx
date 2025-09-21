"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface ActiveNavLinkProps {
  href: string;
  label: string;
}

export function ActiveNavLink({ href, label }: ActiveNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-primary ${
        isActive
          ? "text-black border-b-2 border-black"
          : "text-gray-500 hover:text-black"
      }`}
    >
      {label}
    </Link>
  );
} 