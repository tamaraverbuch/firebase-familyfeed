
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupFirebaseAuth, isAuthenticated, AuthRequest } from "./firebaseAuth";
import multer from "multer";
import { transcribeAudioFromBuffer } from "./openai";


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {

  setupFirebaseAuth(app);


  app.get('/api/auth/user', isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });


  app.get("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/user/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const posts = await storage.getPostsByUserId(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  app.post("/api/posts", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      
      const post = await storage.createPost({
        ...req.body,
        userId,
      });
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.put("/api/posts/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      
      const postId = parseInt(req.params.id);
      
  
      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== userId) {
        return res.status(403).json({ message: "You can only edit your own posts" });
      }
      
      const updatedPost = await storage.updatePost(postId, req.body);
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      
      const postId = parseInt(req.params.id);
      
      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== userId) {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }
      
      await storage.deletePost(postId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // comment routes
  app.get("/api/posts/:postId/comments", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:postId/comments", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      
      const postId = parseInt(req.params.postId);
      
      const comment = await storage.createComment({
        content: req.body.content,
        userId,
        postId,
      });
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // like routes
  app.post("/api/posts/:postId/like", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      
      const postId = parseInt(req.params.postId);
      
      await storage.likePost(userId, postId);
      res.status(201).json({ message: "Post liked successfully" });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });
  
  app.delete("/api/posts/:postId/like", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      
      const postId = parseInt(req.params.postId);
      
      await storage.unlikePost(userId, postId);
      res.status(204).send();
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // audio transcription route
  app.post("/api/transcribe", isAuthenticated, upload.single("audio"), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }
      
      // get language from request body if specified
      const language = req.body.language;
      
      const transcription = await transcribeAudioFromBuffer(
        req.file.buffer,
        req.file.originalname,
        language
      );
      
      res.json({ text: transcription });
    } catch (error) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ message: "Failed to transcribe audio" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}