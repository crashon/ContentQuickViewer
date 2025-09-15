import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fileEntries = pgTable("file_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  path: text("path").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'file' | 'directory'
  size: integer("size").default(null), // in bytes, null for directories
  mimeType: text("mime_type").default(null),
  lastModified: timestamp("last_modified").notNull(),
  parentPath: text("parent_path").default(null),
  isHidden: boolean("is_hidden").default(false).notNull(),
});

export const recentFolders = pgTable("recent_folders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  path: text("path").notNull().unique(),
  name: text("name").notNull(),
  lastAccessed: timestamp("last_accessed").notNull().default(sql`now()`),
});

export const insertFileEntrySchema = createInsertSchema(fileEntries).omit({
  id: true,
});

export const insertRecentFolderSchema = createInsertSchema(recentFolders).omit({
  id: true,
});

// Standard API response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    totalItems?: number;
    totalPages?: number;
  };
}

// Helper functions for creating standard responses
export function successResponse<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
  return {
    status: 'success',
    data,
    meta,
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: any
): ApiResponse<never> {
  return {
    status: 'error',
    error: {
      code,
      message,
      details,
    },
  };
}

// Helper function for handling pagination meta
export function paginationMeta(
  page: number,
  pageSize: number,
  totalItems: number
): ApiResponse<any>['meta'] {
  return {
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
}
  lastAccessed: true,
});

export type FileEntry = typeof fileEntries.$inferSelect;
export type InsertFileEntry = z.infer<typeof insertFileEntrySchema>;
export type RecentFolder = typeof recentFolders.$inferSelect;
export type InsertRecentFolder = z.infer<typeof insertRecentFolderSchema>;
