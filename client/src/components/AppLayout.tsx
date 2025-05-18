import React from "react";
import Navbar from "./Navbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen flex flex-col relative pb-16">
      {children}
      <Navbar />
    </div>
  );
}
