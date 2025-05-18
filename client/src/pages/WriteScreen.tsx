import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Link as LinkIcon, Smile, X, Globe } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WriteScreen() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [showLinkFields, setShowLinkFields] = useState(false);
  const [textDirection, setTextDirection] = useState<"ltr" | "rtl">("ltr");
  
  const createPostMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/posts", {
        content,
        isVoiceTranscription: false,
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
      <header className="px-4 py-3 border-b border-neutral-200 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center">
          <h1 className="font-heading font-bold text-2xl text-primary">Write</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-500 hover:text-primary"
            onClick={() => navigate("/")}
          >
            <X size={20} />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col p-4">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="mb-4 flex items-center justify-end">
            <div className="flex items-center space-x-2">
              <Globe size={16} className="text-neutral-500" />
              <span className="text-sm text-neutral-500">Text Direction:</span>
              <Select value={textDirection} onValueChange={(value: "ltr" | "rtl") => setTextDirection(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ltr">English (LTR)</SelectItem>
                  <SelectItem value="rtl">Hebrew (RTL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="postContent" className="block text-sm font-medium text-neutral-600 mb-1">
              What's on your mind?
            </label>
            <Textarea
              id="postContent"
              rows={10}
              className={`w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-${textDirection === "rtl" ? "right" : "left"}`}
              placeholder={textDirection === "rtl" ? "...כתוב כאן" : "Write here..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ direction: textDirection }}
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
            <div className="flex justify-end">
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
    </div>
  );
}