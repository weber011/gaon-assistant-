"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Camera, Bell, User, Mic } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "होम", icon: Home, path: "/" },
    { name: "पूछें", icon: MessageSquare, path: "/chat" },
    { name: "", icon: Mic, path: "/chat?mic=1", isCenter: true },
    { name: "फसल", icon: Camera, path: "/scanner" },
    { name: "रिमाइंडर", icon: Bell, path: "/reminders" },
    { name: "प्रोफाइल", icon: User, path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E0D5] px-2 sm:px-6 py-2 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        
        {/* Left items */}
        <div className="flex gap-1 sm:gap-4 flex-1 justify-around">
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} className="flex flex-col items-center p-2 min-w-[64px]">
                <item.icon className={`w-6 h-6 mb-1 transition-colors ${isActive ? "text-[#1E4D2B]" : "text-gray-400"}`} />
                <span className={`text-[10px] font-bold ${isActive ? "text-[#1E4D2B]" : "text-gray-400"}`}>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Center Floating Mic */}
        <div className="relative -top-6 flex-shrink-0 mx-2">
          <Link href="/chat?mic=1" aria-label="बोलकर सवाल पूछें" className="flex items-center justify-center w-16 h-16 bg-[#1E4D2B] text-white rounded-full shadow-[0_4px_15px_rgba(30,77,43,0.4)] border-4 border-[#FDFBF7] active:scale-95 transition-transform animate-pulse-slow">
            <Mic className="w-7 h-7" />
          </Link>
        </div>

        {/* Right items */}
        <div className="flex gap-1 sm:gap-4 flex-1 justify-around">
          {navItems.slice(3).map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} className="flex flex-col items-center p-2 min-w-[64px]">
                <item.icon className={`w-6 h-6 mb-1 transition-colors ${isActive ? "text-[#1E4D2B]" : "text-gray-400"}`} />
                <span className={`text-[10px] font-bold ${isActive ? "text-[#1E4D2B]" : "text-gray-400"}`}>{item.name}</span>
              </Link>
            );
          })}
        </div>
        
      </div>
    </nav>
  );
}
