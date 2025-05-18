import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import CommentSection from "./CommentSection";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Edit, Mic } from "lucide-react";
import { formatDate, getUserFullName, formatCount } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import type { PostWithUser } from "@shared/schema";

interface PostProps {
  post: PostWithUser;
}

export default function Post({ post }: PostProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false); // This would be better from an API call
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  
  const isOwner = user?.id === post.userId;

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/posts/${post.id}/like`);
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/like`);
      }
    },
    onMutate: () => {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    },
    onError: () => {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/user/${user?.id}`] });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/posts/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/user/${user?.id}`] });
      toast({
        title: "Success",
        description: "Post deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  });

  const toggleLike = () => {
    likeMutation.mutate();
  };

  const deletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate();
    }
  };

  return (
    <div className="post-card border-b border-neutral-200 p-4">
      <div className="flex items-start mb-3">
        <Avatar className="w-10 h-10 mr-3">
          <AvatarImage src={post.user.profileImageUrl || undefined} alt={getUserFullName(post.user.firstName, post.user.lastName)} />
          <AvatarFallback>
            {getUserFullName(post.user.firstName, post.user.lastName).substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-neutral-800">
                {getUserFullName(post.user.firstName, post.user.lastName)}
              </h3>
              <p className="text-xs text-neutral-500">{formatDate(post.createdAt)}</p>
            </div>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-600">
                    <MoreHorizontal size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <Edit size={16} className="mr-2" />
                    <span>Edit Post</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive flex items-center cursor-pointer"
                    onClick={deletePost}
                  >
                    <span>Delete Post</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      
      <div className="post-content mb-3">
        {post.isVoiceTranscription && (
          <div className="flex items-center mb-2">
            <Mic className="h-4 w-4 text-accent mr-1" />
            <span className="text-xs text-neutral-500">Voice transcription</span>
          </div>
        )}
        
        <p className="text-neutral-700 mb-3">{post.content}</p>
        
        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt="Post image" 
            className="w-full h-48 object-cover rounded-lg mb-2" 
          />
        )}
        
        {post.linkUrl && (
          <div className="recommended-read bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex items-center">
            <div className="flex-1">
              <h4 className="font-medium text-neutral-800">{post.linkTitle || post.linkUrl}</h4>
              {post.linkDescription && (
                <p className="text-xs text-neutral-500">{post.linkDescription}</p>
              )}
            </div>
            <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-medium">
              View
            </a>
          </div>
        )}
      </div>
      
      <div className="post-actions flex items-center justify-between text-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`p-0 h-auto ${isLiked ? 'text-accent' : 'text-neutral-500 hover:text-accent'}`}
          onClick={toggleLike}
        >
          <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
          <span>{formatCount(likeCount)} Likes</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto text-neutral-500 hover:text-primary"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          <span>{formatCount(post._count?.comments || 0)} Comments</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="p-0 h-auto text-neutral-500 hover:text-secondary">
          <Bookmark className="h-4 w-4 mr-1" />
          <span>Save</span>
        </Button>
      </div>
      
      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
}
