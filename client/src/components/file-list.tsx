import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp } from "lucide-react";
import { getFileIcon, formatFileSize, formatDate } from "@/lib/file-types";
import type { FileEntry } from "@shared/schema";

interface FileListProps {
  currentPath: string;
  searchQuery: string;
  selectedFile: FileEntry | null;
  onFileSelect: (file: FileEntry) => void;
}

export default function FileList({
  currentPath,
  searchQuery,
  selectedFile,
  onFileSelect,
}: FileListProps) {
  const { data: files, isLoading } = useQuery({
    queryKey: ["/api/files", { path: currentPath }],
  });

  const filteredFiles = useMemo(() => {
    if (!files) return [];
    
    let filtered = files as FileEntry[];
    
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by name by default
    return filtered.sort((a, b) => {
      if (a.type === "directory" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "directory") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [files, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        <div className="p-4 text-center text-muted-foreground">
          Loading files...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0">
      {/* File List Header */}
      <div className="bg-card border-b border-border px-4 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 text-accent">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
            </svg>
          </div>
          <span className="text-sm font-medium" data-testid="text-current-path">
            {currentPath}
          </span>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span data-testid="text-file-count">
            {filteredFiles.length} items
          </span>
          {selectedFile && (
            <>
              <span>•</span>
              <span data-testid="text-selected-count">1 selected</span>
            </>
          )}
        </div>
      </div>
      
      {/* File List Table */}
      <ScrollArea className="flex-1">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border sticky top-0">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                <Button variant="ghost" size="sm" className="p-0 h-auto font-medium" data-testid="sort-name">
                  <div className="flex items-center gap-1">
                    Name
                    <ArrowUp className="w-3 h-3" />
                  </div>
                </Button>
              </th>
              <th className="text-left p-3 font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                <Button variant="ghost" size="sm" className="p-0 h-auto font-medium" data-testid="sort-size">
                  <div className="flex items-center gap-1">
                    Size
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </Button>
              </th>
              <th className="text-left p-3 font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                <Button variant="ghost" size="sm" className="p-0 h-auto font-medium" data-testid="sort-modified">
                  <div className="flex items-center gap-1">
                    Modified
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </Button>
              </th>
              <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  {searchQuery ? "No files match your search" : "This folder is empty"}
                </td>
              </tr>
            ) : (
              filteredFiles.map((file) => (
                <tr
                  key={file.id}
                  className={`border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                    selectedFile?.id === file.id ? "bg-primary/10 ring-1 ring-primary" : ""
                  }`}
                  onClick={() => onFileSelect(file)}
                  data-testid={`file-row-${file.name}`}
                >
                  <td className="p-3">
                    <div className="flex items-center">
                      {getFileIcon(file)}
                      <span className="font-medium">{file.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {file.size ? formatFileSize(file.size) : "-"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {formatDate(file.lastModified)}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {file.type === "directory" ? "Folder" : (file.mimeType || "Unknown")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
