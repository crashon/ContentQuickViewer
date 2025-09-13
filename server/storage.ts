import { type FileEntry, type InsertFileEntry, type RecentFolder, type InsertRecentFolder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // File operations
  getFilesByPath(path: string): Promise<FileEntry[]>;
  getFileByPath(filePath: string): Promise<FileEntry | undefined>;
  addFile(file: InsertFileEntry): Promise<FileEntry>;
  updateFile(id: string, updates: Partial<FileEntry>): Promise<FileEntry>;
  deleteFile(id: string): Promise<void>;
  
  // Recent folders
  getRecentFolders(): Promise<RecentFolder[]>;
  addRecentFolder(folder: InsertRecentFolder): Promise<RecentFolder>;
  updateRecentFolderAccess(path: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private files: Map<string, FileEntry>;
  private recentFolders: Map<string, RecentFolder>;

  constructor() {
    this.files = new Map();
    this.recentFolders = new Map();
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Initialize with some sample files for demonstration
    const sampleFiles: InsertFileEntry[] = [
      // Root folders
      {
        path: "/Documents",
        name: "Documents",
        type: "directory",
        lastModified: new Date(Date.now() - 86400000),
        parentPath: "/",
        size: null,
        mimeType: null,
        isHidden: false,
      },
      {
        path: "/Media",
        name: "Media",
        type: "directory",
        lastModified: new Date(Date.now() - 86400000),
        parentPath: "/",
        size: null,
        mimeType: null,
        isHidden: false,
      },
      {
        path: "/Projects",
        name: "Projects",
        type: "directory",
        lastModified: new Date(Date.now() - 86400000),
        parentPath: "/",
        size: null,
        mimeType: null,
        isHidden: false,
      },
      
      // Documents files
      {
        path: "/Documents/readme.txt",
        name: "readme.txt",
        type: "file",
        lastModified: new Date(Date.now() - 3600000),
        parentPath: "/Documents",
        size: 2048,
        mimeType: "text/plain",
        isHidden: false,
      },
      {
        path: "/Documents/notes.txt",
        name: "notes.txt",
        type: "file",
        lastModified: new Date(Date.now() - 7200000),
        parentPath: "/Documents",
        size: 1524,
        mimeType: "text/plain",
        isHidden: false,
      },
      {
        path: "/Documents/config.json",
        name: "config.json",
        type: "file",
        lastModified: new Date(Date.now() - 14400000),
        parentPath: "/Documents",
        size: 832,
        mimeType: "application/json",
        isHidden: false,
      },
      
      // Media files
      {
        path: "/Media/sample.jpg",
        name: "sample.jpg",
        type: "file",
        lastModified: new Date(Date.now() - 7200000),
        parentPath: "/Media",
        size: 2457600,
        mimeType: "image/jpeg",
        isHidden: false,
      },
      {
        path: "/Media/video.mp4",
        name: "video.mp4",
        type: "file",
        lastModified: new Date(Date.now() - 172800000),
        parentPath: "/Media",
        size: 47923200,
        mimeType: "video/mp4",
        isHidden: false,
      },
      {
        path: "/Media/audio.wav",
        name: "audio.wav",
        type: "file",
        lastModified: new Date(Date.now() - 259200000),
        parentPath: "/Media",
        size: 9338880,
        mimeType: "audio/wav",
        isHidden: false,
      },
      
      // Projects folder and files
      {
        path: "/Projects/web-app",
        name: "web-app",
        type: "directory",
        lastModified: new Date(Date.now() - 86400000),
        parentPath: "/Projects",
        size: null,
        mimeType: null,
        isHidden: false,
      },
      {
        path: "/Projects/web-app/app.js",
        name: "app.js",
        type: "file",
        lastModified: new Date(Date.now() - 3600000),
        parentPath: "/Projects/web-app",
        size: 15564,
        mimeType: "application/javascript",
        isHidden: false,
      },
      {
        path: "/Projects/README.md",
        name: "README.md",
        type: "file",
        lastModified: new Date(Date.now() - 432000000),
        parentPath: "/Projects",
        size: 3174,
        mimeType: "text/markdown",
        isHidden: false,
      },
    ];

    sampleFiles.forEach((file) => {
      const id = randomUUID();
      this.files.set(id, { ...file, id });
    });
  }

  async getFilesByPath(path: string): Promise<FileEntry[]> {
    const files = Array.from(this.files.values());
    return files.filter(file => file.parentPath === path);
  }

  async getFileByPath(filePath: string): Promise<FileEntry | undefined> {
    return Array.from(this.files.values()).find(file => file.path === filePath);
  }

  async addFile(insertFile: InsertFileEntry): Promise<FileEntry> {
    const id = randomUUID();
    const file: FileEntry = { ...insertFile, id };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: string, updates: Partial<FileEntry>): Promise<FileEntry> {
    const existingFile = this.files.get(id);
    if (!existingFile) {
      throw new Error("File not found");
    }
    const updatedFile = { ...existingFile, ...updates };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: string): Promise<void> {
    this.files.delete(id);
  }

  async getRecentFolders(): Promise<RecentFolder[]> {
    return Array.from(this.recentFolders.values())
      .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
      .slice(0, 10);
  }

  async addRecentFolder(insertFolder: InsertRecentFolder): Promise<RecentFolder> {
    const id = randomUUID();
    const folder: RecentFolder = { ...insertFolder, id, lastAccessed: new Date() };
    this.recentFolders.set(folder.path, folder);
    return folder;
  }

  async updateRecentFolderAccess(path: string): Promise<void> {
    const folder = this.recentFolders.get(path);
    if (folder) {
      folder.lastAccessed = new Date();
      this.recentFolders.set(path, folder);
    }
  }
}

export const storage = new MemStorage();
