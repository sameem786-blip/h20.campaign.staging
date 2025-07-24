"use client";

import { useNavbarStore } from "@/store/navbar";

export function NavbarTitle() {
  const { navbarText } = useNavbarStore();
  
  return (
    <div className="font-bold text-xl">
      {navbarText}
    </div>
  );
} 