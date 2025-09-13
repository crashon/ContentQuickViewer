import type { FileEntry } from "@shared/schema";

interface StatusBarProps {
  selectedFile: FileEntry | null;
}

export default function StatusBar({ selectedFile }: StatusBarProps) {
  return (
    <div className="bg-card border-t border-border px-4 py-1 flex items-center justify-between text-xs shrink-0">
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground" data-testid="text-status">Ready</span>
        {selectedFile && (
          <>
            <span data-testid="text-current-file">{selectedFile.name}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground" data-testid="text-file-info">
              {selectedFile.type === "file" ? "File" : "Directory"}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        {selectedFile?.mimeType && (
          <span className="text-muted-foreground" data-testid="text-mime-type">
            {selectedFile.mimeType}
          </span>
        )}
        <span className="text-muted-foreground">UTF-8</span>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Zoom:</span>
          <span data-testid="text-zoom">100%</span>
        </div>
      </div>
    </div>
  );
}
