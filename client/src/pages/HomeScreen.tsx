import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedView from "@/components/FeedView";
import { getUserFullName } from "@/lib/utils";

export default function HomeScreen() {
  const { user } = useAuth();
  
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b border-neutral-200 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center">
          <h1 className="font-heading font-bold text-2xl text-primary">Family Feed</h1>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-primary rounded-full">
              <Bell size={20} />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.profileImageUrl || undefined} alt={getUserFullName(user?.firstName, user?.lastName)} />
              <AvatarFallback>
                {(user?.firstName?.charAt(0) || "") + (user?.lastName?.charAt(0) || "")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      
      {/* Feed */}
      <div className="flex-1 overflow-y-auto pb-4">
        <FeedView />
      </div>
    </div>
  );
}
