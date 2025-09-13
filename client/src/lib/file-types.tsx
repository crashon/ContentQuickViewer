import { 
  FileText, 
  Code, 
  Image, 
  Video, 
  Music, 
  File, 
  Folder,
  FileJson,
  FileCode2
} from "lucide-react";
import type { FileEntry } from "@shared/schema";

export function getFileIcon(file: FileEntry) {
  if (file.type === "directory") {
    return <Folder className="w-4 h-4 mr-2 text-accent" />;
  }

  if (!file.mimeType) {
    return <File className="w-4 h-4 mr-2 text-muted-foreground" />;
  }

  if (file.mimeType.startsWith('image/')) {
    return <Image className="w-4 h-4 mr-2 text-green-400" />;
  }

  if (file.mimeType.startsWith('video/')) {
    return <Video className="w-4 h-4 mr-2 text-red-400" />;
  }

  if (file.mimeType.startsWith('audio/')) {
    return <Music className="w-4 h-4 mr-2 text-purple-400" />;
  }

  if (file.mimeType === 'application/javascript' || file.name.endsWith('.js') || file.name.endsWith('.ts')) {
    return <FileCode2 className="w-4 h-4 mr-2 text-blue-400" />;
  }

  if (file.mimeType === 'application/json' || file.name.endsWith('.json')) {
    return <FileJson className="w-4 h-4 mr-2 text-emerald-400" />;
  }

  if (file.mimeType.startsWith('text/') || file.name.endsWith('.md')) {
    return <FileText className="w-4 h-4 mr-2 text-yellow-400" />;
  }

  return <File className="w-4 h-4 mr-2 text-muted-foreground" />;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else {
    return d.toLocaleDateString();
  }
}
