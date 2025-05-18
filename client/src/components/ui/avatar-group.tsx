import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/lib/utils";

interface AvatarGroupProps {
  users: Array<{ 
    profileImageUrl?: string | null;
    name: string;
  }>;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

export function AvatarGroup({ 
  users, 
  max = 3, 
  size = "md",
  className 
}: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remainingUsers = users.length - max;
  const sizeClass = sizeClasses[size];
  
  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayUsers.map((user, index) => (
        <Avatar 
          key={index} 
          className={cn(
            sizeClass,
            "border-2 border-background",
          )}
        >
          <AvatarImage src={user.profileImageUrl || undefined} alt={user.name} />
          <AvatarFallback>
            {user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      
      {remainingUsers > 0 && (
        <div className={cn(
          sizeClass,
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground border-2 border-background"
        )}>
          <span>+{remainingUsers}</span>
        </div>
      )}
    </div>
  );
}
