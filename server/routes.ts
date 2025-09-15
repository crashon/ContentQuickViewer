import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFileEntrySchema, insertRecentFolderSchema } from "@shared/schema";
import { validate, preventPathTraversal, validateFileType, validateFileSize } from "./middleware/validation";
import { rateLimiters } from "./middleware/rate-limit";
import { corsMiddleware } from "./middleware/cors";
import { successResponse, errorResponse } from "./utils";
import path from "path";
import fs from "fs/promises";
import mime from "mime-types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get files in a directory
  app.get("/api/files", async (req, res) => {
    try {
      const { 
        path: dirPath = "/",
        page = "1",
        pageSize = "50",
        sortBy = "name",
        sortOrder = "asc"
      } = req.query;

      console.log(`[DEBUG] Getting files for path: "${dirPath}"`);
      
      // Try to get from cache first
      let files = await CacheService.getFileList(dirPath as string);
      
      if (!files) {
        files = await storage.getFilesByPath(dirPath as string);
        // Cache the results
        await CacheService.setFileList(dirPath as string, files);
      }
      
      const { items, total, page: currentPage, totalPages } = paginateAndSortFiles(files, {
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        sortBy: sortBy as 'name' | 'size' | 'lastModified',
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      res.json(successResponse(items, {
        page: currentPage,
        pageSize: parseInt(pageSize as string),
        totalItems: total,
        totalPages
      }));
    } catch (error) {
      console.error("Error getting files:", error);
      res.status(500).json(errorResponse(
        'FETCH_FILES_ERROR',
        'Failed to get files',
        process.env.NODE_ENV === 'development' ? error : undefined
      ));
    }
  });

  // Get file content
  // Upload files
  app.post("/api/files/upload", validatePath, upload.array('files'), async (req, res) => {
    try {
      const uploadedFiles = await Promise.all(
        (req.files as Express.Multer.File[]).map(async (file) => {
          const fileStats = await fs.stat(file.path);
          const filePath = path.join(req.query.path as string || '/', file.filename);
          
          const fileEntry = {
            path: filePath,
            name: file.filename,
            type: 'file',
            lastModified: fileStats.mtime,
            parentPath: req.query.path as string || '/',
            size: fileStats.size,
            mimeType: file.mimetype,
            isHidden: file.filename.startsWith('.')
          };
          
          return await storage.addFile(fileEntry);
        })
      );
      
      res.json(successResponse(uploadedFiles, {
        count: uploadedFiles.length
      }));
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json(errorResponse(
        'UPLOAD_FILES_ERROR',
        'Failed to upload files',
        process.env.NODE_ENV === 'development' ? error : undefined
      ));
    }
  });

  // Download file
  app.get("/api/files/download", validatePath, async (req, res) => {
    try {
      const { path: filePath } = req.query;
      if (!filePath) {
        return res.status(400).json(errorResponse(
          'INVALID_REQUEST',
          'File path is required'
        ));
      }

      const file = await storage.getFileByPath(filePath as string);
      if (!file) {
        return res.status(404).json(errorResponse(
          'FILE_NOT_FOUND',
          'File not found'
        ));
      }

      const absolutePath = path.join(process.env.CQV_ROOT_PATH || os.homedir(), filePath as string);
      res.download(absolutePath, file.name);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json(errorResponse(
        'DOWNLOAD_FILE_ERROR',
        'Failed to download file',
        process.env.NODE_ENV === 'development' ? error : undefined
      ));
    }
  });

  app.get("/api/files/content", async (req, res) => {
    try {
      const { path: filePath } = req.query;
      if (!filePath) {
        return res.status(400).json(errorResponse(
          'INVALID_REQUEST',
          'File path is required'
        ));
      }

      const file = await storage.getFileByPath(filePath as string);
      if (!file) {
        return res.status(404).json(errorResponse(
          'FILE_NOT_FOUND',
          'File not found'
        ));
      }

      // For text files, return content as text
      if (file.mimeType?.startsWith('text/') || 
          file.mimeType === 'application/javascript' ||
          file.mimeType === 'application/json' ||
          file.name.endsWith('.md') ||
          file.name.endsWith('.csv')) {
        
        // For demo purposes, return sample content based on file type
        let content = "";
        if (file.name.endsWith('.js')) {
          content = `import React from 'react';
import ReactDOM from 'react-dom';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default App;`;
        } else if (file.name.endsWith('.md')) {
          content = `# ${file.name}

This is a sample markdown file demonstrating the Content Quick Viewer.

## Features

- **Syntax highlighting** for code
- *Italic* and **bold** text
- [Links](https://example.com)
- Lists and more

\`\`\`javascript
console.log("Hello, world!");
\`\`\`
`;
        } else {
          content = `Sample content for ${file.name}\n\nThis is demonstration content for the Content Quick Viewer application.`;
        }
        
        res.json(successResponse({
          content,
          type: 'text'
        }));
      } else {
        // For binary files, return file info only
        res.json(successResponse({
          ...file,
          type: 'binary',
          url: `/api/files/binary?path=${encodeURIComponent(file.path)}`
        }));
      }
    } catch (error) {
      console.error("Error getting file content:", error);
      res.status(500).json(errorResponse(
        'FETCH_CONTENT_ERROR',
        'Failed to get file content',
        process.env.NODE_ENV === 'development' ? error : undefined
      ));
    }
  });

  // Serve binary files (images, videos, audio) with streaming support
  app.get("/api/files/binary", async (req, res) => {
    try {
      const { path: filePath } = req.query;
      if (!filePath) {
        return res.status(400).json(errorResponse(
          'INVALID_REQUEST',
          'File path is required'
        ));
      }

      const file = await storage.getFileByPath(filePath as string);
      if (!file) {
        return res.status(404).json(errorResponse(
          'FILE_NOT_FOUND',
          'File not found'
        ));
      }

      const absolutePath = path.join(process.env.CQV_ROOT_PATH || os.homedir(), filePath as string);
      
      // Set content type based on file mime type
      res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
      
      // Stream the file
      await streamFile(absolutePath, req, res);
    } catch (error) {
      console.error("Error serving binary file:", error);
      res.status(500).json({ error: "Failed to serve binary file" });
    }
  });

  // Update file (rename)
  app.patch("/api/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedFile = await storage.updateFile(id, updates);
      res.json(updatedFile);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ error: "Failed to update file" });
    }
  });

  // Get recent folders
  app.get("/api/recent-folders", async (req, res) => {
    try {
      const folders = await storage.getRecentFolders();
      res.json(folders);
    } catch (error) {
      console.error("Error getting recent folders:", error);
      res.status(500).json({ error: "Failed to get recent folders" });
    }
  });

  // Add recent folder
  app.post("/api/recent-folders", async (req, res) => {
    try {
      const folderData = insertRecentFolderSchema.parse(req.body);
      const folder = await storage.addRecentFolder(folderData);
      res.json(folder);
    } catch (error) {
      console.error("Error adding recent folder:", error);
      res.status(500).json({ error: "Failed to add recent folder" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
