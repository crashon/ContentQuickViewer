import { Button } from "@/components/ui/button";
import { Edit2, ExternalLink, Maximize, Download } from "lucide-react";
import TextViewer from "./viewers/text-viewer";
import ImageViewer from "./viewers/image-viewer";
import VideoViewer from "./viewers/video-viewer";
import AudioViewer from "./viewers/audio-viewer";
import { getFileIcon, formatFileSize } from "@/lib/file-types";
import type { FileEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ContentViewerProps {
  selectedFile: FileEntry | null;
}

export default function ContentViewer({ selectedFile }: ContentViewerProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!selectedFile) return;

    try {
      const response = await fetch(`/api/files/download?path=${encodeURIComponent(selectedFile.path)}`);
      if (!response.ok) throw new Error('Download failed');

      // Get filename from content-disposition header or use file name
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/["']/g, '')
        : selectedFile.name;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Download successful',
        description: `${filename} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  if (!selectedFile) {
    return (
      <div className="w-full bg-card border-l border-border flex flex-col h-full">
        <div className="p-4 text-center text-muted-foreground">
          Select a file to preview
        </div>
      </div>
    );
  }

  if (selectedFile.type === "directory") {
    return (
      <div className="w-full bg-card border-l border-border flex flex-col h-full">
        <div className="p-4 text-center text-muted-foreground">
          Folder selected. Cannot preview folders.
        </div>
      </div>
    );
  }

  const getViewerComponent = () => {
    if (!selectedFile.mimeType) return null;

    if (selectedFile.mimeType.startsWith('text/') || 
        selectedFile.mimeType === 'application/javascript' ||
        selectedFile.mimeType === 'application/json' ||
        selectedFile.mimeType === 'text/markdown') {
      return <TextViewer file={selectedFile} />;
    }

    if (selectedFile.mimeType.startsWith('image/')) {
      return <ImageViewer file={selectedFile} />;
    }

    if (selectedFile.mimeType.startsWith('video/')) {
      return <VideoViewer file={selectedFile} />;
    }

    if (selectedFile.mimeType.startsWith('audio/')) {
      return <AudioViewer file={selectedFile} />;
    }

    return (
      <div className="p-4 text-center text-muted-foreground">
        File type not supported for preview
      </div>
    );
  };

  return (
    <div className="w-full bg-card border-l border-border flex flex-col h-full">
      {/* Preview Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getFileIcon(selectedFile)}
            <div>
              <div className="font-medium text-sm" data-testid="text-filename">
                {selectedFile.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedFile.mimeType} • {selectedFile.size ? formatFileSize(selectedFile.size) : "Unknown size"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              title="Edit filename (F2)"
              data-testid="button-rename"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              title="Open with external app"
              data-testid="button-external"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              title="Full screen (F)"
              data-testid="button-fullscreen"
            >
              <Maximize className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content Area */}
      <div className="flex-1 overflow-hidden">
        {getViewerComponent()}
      </div>
    </div>
  );
}
