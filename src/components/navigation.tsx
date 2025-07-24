import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { UserNav } from "@/components/auth/user-nav";
import { ActiveNavLink } from "@/components/active-nav-link";
import { NavbarTitle } from "@/components/navbar-title";

export async function Navigation() {
  const user = await getCurrentUser();

  const routes = [
    {
      href: "/playground",
      label: "Playground",
    },
    {
      href: "/research",
      label: "Research",
    },
    {
      href: "/campaigns",
      label: "Campaigns",
    },
    {
      href: "/conversations",
      label: "Conversations",
    },
    {
      href: "/performance",
      label: "Performance",
    },
  ];

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <NavbarTitle />
          <nav className="flex items-center space-x-6">
            {user && routes.map((route) => (
              <ActiveNavLink
                key={route.href}
                href={route.href}
                label={route.label}
              />
            ))}
            {user ? (
              <UserNav user={user} />
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-500 hover:text-black"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
