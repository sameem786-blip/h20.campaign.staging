"use client";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, Target } from "lucide-react";

interface NavigationProps {
  currentView: "research" | "campaigns" | "conversations";
  onNavigate: (view: "research" | "campaigns" | "conversations") => void;
  title?: string;
}

export default function Navigation({
  currentView,
  onNavigate,
  title,
}: NavigationProps) {
  const navItems = [
    {
      id: "research" as const,
      label: "Research",
      icon: Search,
    },
    {
      id: "campaigns" as const,
      label: "Campaigns",
      icon: Target,
    },
    {
      id: "conversations" as const,
      label: "Conversations",
      icon: MessageSquare,
    },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">
              {title ? title : "Campaign Name"}
            </h1>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onNavigate(item.id)}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
