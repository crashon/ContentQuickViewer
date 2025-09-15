import { promises as fs } from 'fs';
import path from 'path';
import mime from 'mime-types';
import { type FileEntry, type InsertFileEntry, type RecentFolder, type InsertRecentFolder } from "@shared/schema";
import { randomUUID } from "crypto";

export class FileSystemStorage implements IStorage {
  private recentFolders: Map<string, RecentFolder>;
  private rootPath: string;

  constructor(rootPath: string) {
    this.recentFolders = new Map();
    this.rootPath = rootPath;
  }

  private async toFileEntry(filePath: string, relativePath: string): Promise<FileEntry> {
    const stats = await fs.stat(filePath);
    const name = path.basename(filePath);
    const parentPath = path.dirname(relativePath);
    const type = stats.isDirectory() ? 'directory' : 'file';
    const mimeType = type === 'file' ? mime.lookup(filePath) || null : null;
    
    return {
      id: randomUUID(),
      path: relativePath,
      name,
      type,
      lastModified: stats.mtime,
      parentPath: parentPath === '.' ? '/' : parentPath,
      size: stats.size,
      mimeType,
      isHidden: name.startsWith('.')
    };
  }

  async getFilesByPath(dirPath: string): Promise<FileEntry[]> {
    try {
      const absolutePath = path.join(this.rootPath, dirPath);
      const entries = await fs.readdir(absolutePath, { withFileTypes: true });
      
      return Promise.all(
        entries.map(entry => {
          const filePath = path.join(absolutePath, entry.name);
          const relativePath = path.join(dirPath, entry.name);
          return this.toFileEntry(filePath, relativePath);
        })
      );
    } catch (error) {
      console.error('Error reading directory:', error);
      return [];
    }
  }

  async getFileByPath(filePath: string): Promise<FileEntry | undefined> {
    try {
      const absolutePath = path.join(this.rootPath, filePath);
      return await this.toFileEntry(absolutePath, filePath);
    } catch (error) {
      console.error('Error getting file:', error);
      return undefined;
    }
  }

  async addFile(file: InsertFileEntry): Promise<FileEntry> {
    try {
      const absolutePath = path.join(this.rootPath, file.path);
      if (file.type === 'directory') {
        await fs.mkdir(absolutePath, { recursive: true });
      } else {
        await fs.writeFile(absolutePath, '');
      }
      return await this.toFileEntry(absolutePath, file.path);
    } catch (error) {
      console.error('Error adding file:', error);
      throw error;
    }
  }

  async updateFile(id: string, updates: Partial<FileEntry>): Promise<FileEntry> {
    if (!updates.path) {
      throw new Error('Path is required for update');
    }
    
    const oldFile = await this.getFileByPath(updates.path);
    if (!oldFile) {
      throw new Error('File not found');
    }

    if (updates.name && updates.name !== oldFile.name) {
      const oldAbsolutePath = path.join(this.rootPath, oldFile.path);
      const newPath = path.join(path.dirname(oldFile.path), updates.name);
      const newAbsolutePath = path.join(this.rootPath, newPath);
      
      await fs.rename(oldAbsolutePath, newAbsolutePath);
      return await this.toFileEntry(newAbsolutePath, newPath);
    }

    return oldFile;
  }

  async deleteFile(id: string): Promise<void> {
    throw new Error('Delete operation not supported');
  }

  async getRecentFolders(): Promise<RecentFolder[]> {
    return Array.from(this.recentFolders.values());
  }

  async addRecentFolder(folder: InsertRecentFolder): Promise<RecentFolder> {
    const newFolder: RecentFolder = {
      id: randomUUID(),
      ...folder,
      lastAccessed: new Date()
    };
    this.recentFolders.set(folder.path, newFolder);
    return newFolder;
  }

  async updateRecentFolderAccess(path: string): Promise<void> {
    const folder = this.recentFolders.get(path);
    if (folder) {
      folder.lastAccessed = new Date();
      this.recentFolders.set(path, folder);
    }
  }
}

export interface IStorage {
  getFilesByPath(path: string): Promise<FileEntry[]>;
  getFileByPath(filePath: string): Promise<FileEntry | undefined>;
  addFile(file: InsertFileEntry): Promise<FileEntry>;
  updateFile(id: string, updates: Partial<FileEntry>): Promise<FileEntry>;
  deleteFile(id: string): Promise<void>;
  getRecentFolders(): Promise<RecentFolder[]>;
  addRecentFolder(folder: InsertRecentFolder): Promise<RecentFolder>;
  updateRecentFolderAccess(path: string): Promise<void>;
}