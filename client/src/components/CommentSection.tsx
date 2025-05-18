import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { formatDate, getUserFullName } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CommentWithUser } from "@shared/schema";

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  
  const { data: comments = [], isLoading } = useQuery<CommentWithUser[]>({
    queryKey: [`/api/posts/${postId}/comments`],
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/posts/${postId}/comments`, { content: comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setComment("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addCommentMutation.mutate();
    }
  };

  return (
    <div className="comments-section mt-3 pt-3 border-t border-neutral-200">
      {isLoading ? (
        <div className="flex justify-center my-3">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary border-r-2 border-b-2 border-transparent"></div>
        </div>
      ) : (
        <>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="comment mb-3">
                <div className="flex items-start">
                  <Avatar className="w-7 h-7 mr-2">
                    <AvatarImage src={comment.user.profileImageUrl || undefined} alt={getUserFullName(comment.user.firstName, comment.user.lastName)} />
                    <AvatarFallback>
                      {getUserFullName(comment.user.firstName, comment.user.lastName).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-neutral-100 rounded-lg p-2">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-neutral-800 text-sm">
                        {getUserFullName(comment.user.firstName, comment.user.lastName)}
                      </h4>
                      <span className="text-xs text-neutral-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-500 text-center my-2">No comments yet. Be the first to comment!</p>
          )}
        </>
      )}
      
      <form onSubmit={handleSubmit} className="add-comment flex items-center mt-3">
        <Avatar className="w-7 h-7 mr-2">
          <AvatarImage src={user?.profileImageUrl || undefined} alt={getUserFullName(user?.firstName, user?.lastName)} />
          <AvatarFallback>
            {(user?.firstName?.charAt(0) || "") + (user?.lastName?.charAt(0) || "")}
          </AvatarFallback>
        </Avatar>
        <Input
          type="text"
          className="flex-1 bg-neutral-100 rounded-full px-4 py-1 text-sm h-9"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button 
          type="submit" 
          size="icon" 
          variant="ghost" 
          className="ml-2 text-primary h-9 w-9"
          disabled={!comment.trim() || addCommentMutation.isPending}
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
}
