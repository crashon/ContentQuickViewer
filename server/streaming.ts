import { type Request, type Response } from 'express';
import { createReadStream, statSync } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';

interface StreamOptions {
  start?: number;
  end?: number;
}

export async function streamFile(filePath: string, req: Request, res: Response): Promise<void> {
  try {
    const stat = statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = createReadStream(filePath, { start, end } as StreamOptions);
      
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': req.headers['content-type'],
      };
      
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': req.headers['content-type'],
      };
      
      res.writeHead(200, head);
      createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming file:', error);
    res.status(500).json({ error: 'Failed to stream file' });
  }
}

export async function generateThumbnail(filePath: string): Promise<string> {
  try {
    // This is a placeholder - in a real implementation, you'd use
    // sharp or another image processing library to generate thumbnails
    const thumbnailPath = path.join(
      path.dirname(filePath),
      '.thumbnails',
      `thumb_${path.basename(filePath)}`
    );
    
    await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });
    await fs.copyFile(filePath, thumbnailPath);
    
    return thumbnailPath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
}