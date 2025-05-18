import React from "react";
import { useLocation, Link } from "wouter";
import { Home, Mic, PenLine, User } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 h-16 flex justify-around items-center px-4 max-w-lg mx-auto">
      <Link href="/">
        <a
          className={`flex flex-col items-center justify-center ${
            isActive("/") ? "text-primary" : "text-neutral-500 hover:text-primary"
          }`}
        >
          <Home size={22} />
          <span className="text-xs mt-1">Home</span>
        </a>
      </Link>
      
      <Link href="/record">
        <a
          className={`flex flex-col items-center justify-center ${
            isActive("/record") ? "text-primary" : "text-neutral-500 hover:text-primary"
          }`}
        >
          <Mic size={22} />
          <span className="text-xs mt-1">Record</span>
        </a>
      </Link>
      
      <Link href="/write">
        <a
          className={`flex flex-col items-center justify-center ${
            isActive("/write") ? "text-primary" : "text-neutral-500 hover:text-primary"
          }`}
        >
          <PenLine size={22} />
          <span className="text-xs mt-1">Write</span>
        </a>
      </Link>
      
      <Link href="/my-page">
        <a
          className={`flex flex-col items-center justify-center ${
            isActive("/my-page") ? "text-primary" : "text-neutral-500 hover:text-primary"
          }`}
        >
          <User size={22} />
          <span className="text-xs mt-1">My Page</span>
        </a>
      </Link>
    </nav>
  );
}
