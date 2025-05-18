import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Link as LinkIcon, Smile, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface PostEditorProps {
  initialContent?: string;
  isVoiceTranscription?: boolean;
  onCancel?: () => void;
}

export default function PostEditor({ 
  initialContent = "", 
  isVoiceTranscription = false,
  onCancel
}: PostEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  const [content, setContent] = useState(initialContent);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [showLinkFields, setShowLinkFields] = useState(false);
  
  const createPostMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/posts", {
        content,
        isVoiceTranscription,
        linkUrl: linkUrl || undefined,
        linkTitle: linkTitle || undefined
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your post has been published!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/user/${user?.id}`] });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createPostMutation.mutate();
    }
  };

  const toggleLinkFields = () => {
    setShowLinkFields(!showLinkFields);
  };

  return (
    <div className="flex-1 flex flex-col">
      <h2 className="font-heading font-medium text-lg mb-4">Edit your post</h2>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="mb-4">
          <label htmlFor="postContent" className="block text-sm font-medium text-neutral-600 mb-1">
            Content
          </label>
          <Textarea
            id="postContent"
            rows={5}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        {showLinkFields && (
          <div className="space-y-3 mb-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <div>
              <label htmlFor="linkUrl" className="block text-sm font-medium text-neutral-600 mb-1">
                Link URL
              </label>
              <input
                id="linkUrl"
                type="url"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="linkTitle" className="block text-sm font-medium text-neutral-600 mb-1">
                Link Title (optional)
              </label>
              <input
                id="linkTitle"
                type="text"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                placeholder="Title of the link"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
              />
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-600 mb-1">
            Add to your post
          </label>
          <div className="flex space-x-3">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="text-neutral-500 hover:text-accent"
            >
              <Image size={18} />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className={`text-neutral-500 hover:text-primary ${showLinkFields ? 'bg-neutral-100' : ''}`}
              onClick={toggleLinkFields}
            >
              <LinkIcon size={18} />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="text-neutral-500 hover:text-secondary"
            >
              <Smile size={18} />
            </Button>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-neutral-200">
          <div className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              className="text-neutral-500 font-medium"
              onClick={onCancel}
            >
              {onCancel ? "Cancel" : (
                <div className="flex items-center">
                  <Save size={18} className="mr-1" />
                  <span>Save Draft</span>
                </div>
              )}
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-medium"
              disabled={!content.trim() || createPostMutation.isPending}
            >
              {createPostMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
