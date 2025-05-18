import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FeedView from "@/components/FeedView";
import { getUserFullName, formatDate } from "@/lib/utils";

export default function MyPageScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my-posts");
  
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading user profile...</p>
      </div>
    );
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };
  
  return (
    <div className="flex-1 flex flex-col">
      <header className="px-4 py-3 border-b border-neutral-200 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center">
          <h1 className="font-heading font-bold text-2xl text-primary">My Page</h1>
          <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-primary rounded-full">
            <Settings size={20} />
          </Button>
        </div>
      </header>
      
      <div className="profile-header bg-primary-light p-4 text-white">
        <div className="flex items-center">
          <img 
            src={user.profileImageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb"}
            alt="Your profile" 
            className="w-20 h-20 rounded-full object-cover border-4 border-white" 
          />
          <div className="ml-4">
            <h2 className="font-heading font-bold text-xl">
              {getUserFullName(user.firstName, user.lastName)}
            </h2>
            <p className="opacity-90">
              Member since {formatDate(user.createdAt).split("at")[0]}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-4">
          <Button 
            variant="outline" 
            className="text-white hover:bg-white hover:text-primary border-white"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="my-posts" className="w-full">
        <div className="px-4 py-3 border-b border-neutral-200 bg-white">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-posts" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
              My Posts
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Saved
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="my-posts" className="flex-1 overflow-y-auto">
          <FeedView userId={user.id} />
        </TabsContent>
        
        <TabsContent value="saved" className="p-8 text-center">
          <h3 className="text-lg text-muted-foreground mb-2">No saved posts yet</h3>
          <p className="text-sm text-muted-foreground">
            When you save posts, they'll appear here for easy reference.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
