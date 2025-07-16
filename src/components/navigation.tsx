"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useNavbarStore } from "@/store/navbar";

export function Navigation() {
  const pathname = usePathname();
  const { navbarText, setNavbarText } = useNavbarStore();

  // Set navbar text based on route
  React.useEffect(() => {
    if (pathname === "/research") setNavbarText("Research");
    else if (pathname === "/conversations") setNavbarText("Conversations");
  }, [pathname, setNavbarText]);

  const routes = [
    {
      href: "/playground",
      label: "playground",
      active: pathname === "/playground",
    },
    {
      href: "/research",
      label: "Research",
      active: pathname === "/research",
    },
    {
      href: "/campaigns",
      label: "Campaigns",
      active: pathname === "/campaigns",
    },
    // {
    //   href: "/campaigns-management",
    //   label: "Campaigns Management",
    //   active: pathname === "/campaigns-management"
    // },
    {
      href: "/conversations",
      label: "Conversations",
      active: pathname === "/conversations",
    },
    {
      href: "/performance",
      label: "Performance",
      active: pathname === "/performance",
    },
  ];

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="font-bold text-xl">{navbarText}</div>
          <nav className="flex items-center space-x-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  route.active
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500"
                }`}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
