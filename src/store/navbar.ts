import { create } from "zustand";

interface NavbarState {
  navbarText: string;
  setNavbarText: (text: string) => void;
}

export const useNavbarStore = create<NavbarState>((set) => ({
  navbarText: "Creator Agent",
  setNavbarText: (text) => set({ navbarText: text }),
}));
