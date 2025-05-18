import {
  users,
  type User,
  type UpsertUser,
  posts,
  type Post,
  type PostWithUser,
  comments,
  type Comment,
  type CommentWithUser,
  likes,
  type Like
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

// interface for count results
interface CountResult {
  postId: number;
  count: number;
}

// interface for storage operations
export interface IStorage {
  // user operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // post operations
  getAllPosts(): Promise<PostWithUser[]>;
  getPostsByUserId(userId: string): Promise<PostWithUser[]>;
  getPostById(id: number): Promise<Post | undefined>;
  createPost(post: Omit<Post, "id" | "createdAt" | "updatedAt">): Promise<Post>;
  updatePost(id: number, post: Partial<Post>): Promise<Post>;
  deletePost(id: number): Promise<void>;
  
  // comment operations
  getCommentsByPostId(postId: number): Promise<CommentWithUser[]>;
  createComment(comment: Omit<Comment, "id" | "createdAt" | "updatedAt">): Promise<Comment>;
  
  // like operations
  likePost(userId: string, postId: number): Promise<void>;
  unlikePost(userId: string, postId: number): Promise<void>;
  checkIfUserLikedPost(userId: string, postId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // user operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // post operations
  async getAllPosts(): Promise<PostWithUser[]> {
    const postsWithUsers = await db.query.posts.findMany({
      with: {
        user: true,
      },
      orderBy: [desc(posts.createdAt)],
    });

    // get comment counts for each post
    const postIds = postsWithUsers.map(post => post.id);
    
   
    let commentCounts: CountResult[] = [];
    let likeCounts: CountResult[] = [];
    
    if (postIds.length > 0) {
      commentCounts = await db
        .select({
          postId: comments.postId,
          count: count()
        })
        .from(comments)
        .where(sql`${comments.postId} IN (${postIds.join(',')})`)
        .groupBy(comments.postId);
        
      likeCounts = await db
        .select({
          postId: likes.postId,
          count: count()
        })
        .from(likes)
        .where(sql`${likes.postId} IN (${postIds.join(',')})`)
        .groupBy(likes.postId);
    }
    
    // map counts to posts
    const commentCountMap = new Map(commentCounts.map(c => [c.postId, c.count]));
    const likeCountMap = new Map(likeCounts.map(l => [l.postId, l.count]));
    
    return postsWithUsers.map(post => ({
      ...post,
      _count: {
        comments: commentCountMap.get(post.id) || 0,
        likes: likeCountMap.get(post.id) || 0
      }
    }));
  }

  async getPostsByUserId(userId: string): Promise<PostWithUser[]> {
    const postsWithUsers = await db.query.posts.findMany({
      with: {
        user: true,
      },
      where: eq(posts.userId, userId),
      orderBy: [desc(posts.createdAt)],
    });

    // get comment counts for each post
    const postIds = postsWithUsers.map(post => post.id);
    
    let commentCounts: CountResult[] = [];
    let likeCounts: CountResult[] = [];
    
    if (postIds.length > 0) {
      commentCounts = await db
        .select({
          postId: comments.postId,
          count: count()
        })
        .from(comments)
        .where(sql`${comments.postId} IN (${postIds.join(',')})`)
        .groupBy(comments.postId);
        
      likeCounts = await db
        .select({
          postId: likes.postId,
          count: count()
        })
        .from(likes)
        .where(sql`${likes.postId} IN (${postIds.join(',')})`)
        .groupBy(likes.postId);
    }
    
    // map counts to posts
    const commentCountMap = new Map(commentCounts.map(c => [c.postId, c.count]));
    const likeCountMap = new Map(likeCounts.map(l => [l.postId, l.count]));
    
    return postsWithUsers.map(post => ({
      ...post,
      _count: {
        comments: commentCountMap.get(post.id) || 0,
        likes: likeCountMap.get(post.id) || 0
      }
    }));
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createPost(post: Omit<Post, "id" | "createdAt" | "updatedAt">): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePost(id: number, postData: Partial<Post>): Promise<Post> {
    const [updatedPost] = await db
      .update(posts)
      .set({
        ...postData,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();
    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    // delete all comments associated with the post
    await db.delete(comments).where(eq(comments.postId, id));
    
    // delete all likes associated with the post
    await db.delete(likes).where(eq(likes.postId, id));
    
    // delete the post
    await db.delete(posts).where(eq(posts.id, id));
  }

  // comment operations
  async getCommentsByPostId(postId: number): Promise<CommentWithUser[]> {
    return db.query.comments.findMany({
      with: {
        user: true,
      },
      where: eq(comments.postId, postId),
      orderBy: [comments.createdAt],
    });
  }

  async createComment(comment: Omit<Comment, "id" | "createdAt" | "updatedAt">): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  // like operations
  async likePost(userId: string, postId: number): Promise<void> {
    // check if already liked
    const alreadyLiked = await this.checkIfUserLikedPost(userId, postId);
    if (!alreadyLiked) {
      await db.insert(likes).values({ userId, postId });
    }
  }

  async unlikePost(userId: string, postId: number): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  }

  async checkIfUserLikedPost(userId: string, postId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    return !!like;
  }
}

export const storage = new DatabaseStorage();