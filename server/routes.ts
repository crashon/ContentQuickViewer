import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFileEntrySchema, insertRecentFolderSchema } from "@shared/schema";
import path from "path";
import fs from "fs/promises";
import mime from "mime-types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get files in a directory
  app.get("/api/files", async (req, res) => {
    try {
      const { path: dirPath = "/" } = req.query;
      const files = await storage.getFilesByPath(dirPath as string);
      res.json(files);
    } catch (error) {
      console.error("Error getting files:", error);
      res.status(500).json({ error: "Failed to get files" });
    }
  });

  // Get file content
  app.get("/api/files/content", async (req, res) => {
    try {
      const { path: filePath } = req.query;
      if (!filePath) {
        return res.status(400).json({ error: "File path is required" });
      }

      const file = await storage.getFileByPath(filePath as string);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
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
        
        res.json({ content, type: 'text' });
      } else {
        // For binary files, return file info only
        res.json({ 
          ...file,
          type: 'binary',
          url: `/api/files/binary?path=${encodeURIComponent(file.path)}`
        });
      }
    } catch (error) {
      console.error("Error getting file content:", error);
      res.status(500).json({ error: "Failed to get file content" });
    }
  });

  // Serve binary files (images, videos, audio)
  app.get("/api/files/binary", async (req, res) => {
    try {
      const { path: filePath } = req.query;
      if (!filePath) {
        return res.status(400).json({ error: "File path is required" });
      }

      const file = await storage.getFileByPath(filePath as string);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      // For demo purposes, redirect to placeholder images/videos
      if (file.mimeType?.startsWith('image/')) {
        return res.redirect('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600');
      } else if (file.mimeType?.startsWith('video/')) {
        return res.redirect('https://sample-videos.com/zip/10/mp4/720/SampleVideo_1280x720_1mb.mp4');
      } else if (file.mimeType?.startsWith('audio/')) {
        return res.redirect('https://www.soundjay.com/misc/beep-07a.mp3');
      }

      res.status(404).json({ error: "Binary file not found" });
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
