import React from "react";
import { useQuery } from "@tanstack/react-query";
import Post from "./Post";
import { Skeleton } from "@/components/ui/skeleton";

interface FeedViewProps {
  userId?: string;
}

export default function FeedView({ userId }: FeedViewProps) {
  const endpoint = userId ? `/api/posts/user/${userId}` : "/api/posts";
  const { data: posts, isLoading, error } = useQuery({
    queryKey: [endpoint],
  });

  if (isLoading) {
    return (
      <div className="feed-container">
        {[1, 2, 3].map((i) => (
          <div key={i} className="post-card border-b border-neutral-200 p-4">
            <div className="flex items-start mb-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 ml-3">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-48 w-full rounded-lg mb-3" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Failed to load posts. Please try again.</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg text-muted-foreground mb-2">No posts yet</h3>
        <p className="text-sm text-muted-foreground">
          {userId 
            ? "You haven't created any posts yet. Record or write something to get started!" 
            : "There are no posts in your feed yet. Connect with family members to see their updates!"}
        </p>
      </div>
    );
  }

  return (
    <div className="feed-container">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
