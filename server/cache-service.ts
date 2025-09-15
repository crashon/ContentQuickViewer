import Redis from 'ioredis';
import { type FileEntry } from '@shared/schema';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export class CacheService {
  private static readonly FILE_LIST_KEY_PREFIX = 'file-list:';
  private static readonly FILE_CONTENT_KEY_PREFIX = 'file-content:';
  private static readonly CACHE_TTL = 60 * 5; // 5 minutes

  static async getFileList(path: string): Promise<FileEntry[] | null> {
    const cachedData = await redis.get(`${this.FILE_LIST_KEY_PREFIX}${path}`);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  static async setFileList(path: string, files: FileEntry[]): Promise<void> {
    await redis.setex(
      `${this.FILE_LIST_KEY_PREFIX}${path}`,
      this.CACHE_TTL,
      JSON.stringify(files)
    );
  }

  static async getFileContent(path: string): Promise<string | null> {
    return await redis.get(`${this.FILE_CONTENT_KEY_PREFIX}${path}`);
  }

  static async setFileContent(path: string, content: string): Promise<void> {
    await redis.setex(
      `${this.FILE_CONTENT_KEY_PREFIX}${path}`,
      this.CACHE_TTL,
      content
    );
  }

  static async invalidateFileList(path: string): Promise<void> {
    await redis.del(`${this.FILE_LIST_KEY_PREFIX}${path}`);
    
    // Also invalidate parent directory
    const parentPath = path.split('/').slice(0, -1).join('/') || '/';
    await redis.del(`${this.FILE_LIST_KEY_PREFIX}${parentPath}`);
  }

  static async invalidateFileContent(path: string): Promise<void> {
    await redis.del(`${this.FILE_CONTENT_KEY_PREFIX}${path}`);
  }

  static async invalidateAll(): Promise<void> {
    const keys = await redis.keys(`${this.FILE_LIST_KEY_PREFIX}*`);
    keys.push(...(await redis.keys(`${this.FILE_CONTENT_KEY_PREFIX}*`)));
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}