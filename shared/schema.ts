import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
  varchar,
  serial,
  integer,
  boolean,
  primaryKey
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// session storage table.
// (IMPORTANT) session table for authentication - required for the application
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// user storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
}));

// Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isVoiceTranscription: boolean("is_voice_transcription").default(false),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  linkTitle: text("link_title"),
  linkDescription: text("link_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const postRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
}));

// comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: integer("post_id").notNull().references(() => posts.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commentRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

// likes table
export const likes = pgTable("likes", {
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: integer("post_id").notNull().references(() => posts.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.postId] }),
}));

export const likeRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
}));

// schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export const insertLikeSchema = createInsertSchema(likes);
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likes.$inferSelect;

// extended types
export type PostWithUser = Post & {
  user: User;
  _count?: {
    comments: number;
    likes: number;
  };
};

export type CommentWithUser = Comment & {
  user: User;
};
