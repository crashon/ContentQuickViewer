import multer from 'multer';
import { randomBytes } from 'crypto';
import path from 'path';
import fs from 'fs/promises';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = req.query.path as string || '/';
    const absolutePath = path.join(process.env.CQV_ROOT_PATH || os.homedir(), uploadPath);
    cb(null, absolutePath);
  },
  filename: (req, file, cb) => {
    // Generate a random suffix for the filename to prevent conflicts
    const uniqueSuffix = randomBytes(8).toString('hex');
    const originalName = path.parse(file.originalname);
    const safeFilename = `${originalName.name}-${uniqueSuffix}${originalName.ext}`;
    cb(null, safeFilename);
  }
});

const upload = multer({ storage });

// Middleware to validate paths
const validatePath = (req, res, next) => {
  const requestPath = req.query.path || req.body.path;
  if (!requestPath) {
    return res.status(400).json({ error: 'Path is required' });
  }
  
  // Prevent directory traversal attacks
  const normalizedPath = path.normalize(requestPath);
  if (normalizedPath.includes('..')) {
    return res.status(403).json({ error: 'Invalid path' });
  }
  
  next();
};

export { upload, validatePath };