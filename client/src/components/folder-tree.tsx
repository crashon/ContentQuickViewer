import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Upload } from "lucide-react";
import type { FileEntry, RecentFolder } from "@shared/schema";

interface FolderTreeProps {
  currentPath: string;
  onPathChange: (path: string) => void;
}

export default function FolderTree({ currentPath, onPathChange }: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]));

  const { data: recentFolders } = useQuery({
    queryKey: ["/api/recent-folders"],
  });

  const { data: files } = useQuery({
    queryKey: ["/api/files", { path: "/" }],
    select: (data: FileEntry[]) => data.filter(file => file.type === "directory"),
  });

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderTreeItem = (folder: FileEntry, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.path);
    const isSelected = currentPath === folder.path;
    
    return (
      <div key={folder.path}>
        <div
          className={`flex items-center cursor-pointer p-1 rounded transition-colors ${
            isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onPathChange(folder.path)}
          data-testid={`tree-item-${folder.name}`}
        >
          {folder.type === "directory" && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 w-4 h-4 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.path);
              }}
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </Button>
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 mr-2 text-primary" />
          ) : (
            <Folder className="w-4 h-4 mr-2 text-accent" />
          )}
          <span className="text-sm truncate">{folder.name}</span>
        </div>
        
        {isExpanded && files && (
          <div>
            {files
              .filter(file => file.parentPath === folder.path)
              .map(childFolder => renderTreeItem(childFolder, level + 1))
            }
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-card border-r border-border flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Folders</span>
          <Button variant="ghost" size="sm" className="p-1" data-testid="button-add-folder">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {/* Drag and Drop Zone */}
      <div className="p-3">
        <div className="border-2 border-dashed border-border rounded p-3 text-center text-sm text-muted-foreground hover:border-primary transition-colors cursor-pointer"
             data-testid="folder-drop-zone">
          <Upload className="w-4 h-4 mx-auto mb-2" />
          <div>Drag folders here</div>
          <div className="text-xs">or click to browse</div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {/* Recent Folders */}
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Recent
          </div>
          
          {recentFolders && (recentFolders as RecentFolder[]).map((folder: RecentFolder) => (
            <div
              key={folder.path}
              className="flex items-center cursor-pointer p-1 rounded hover:bg-muted transition-colors"
              onClick={() => onPathChange(folder.path)}
              data-testid={`recent-folder-${folder.name}`}
            >
              <Folder className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm truncate">{folder.name}</span>
            </div>
          ))}
          
          <div className="h-4"></div>
          
          {/* Current Folder Tree */}
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Current Folder
          </div>
          
          {files && files
            .filter(folder => !folder.parentPath || folder.parentPath === "/")
            .map(folder => renderTreeItem(folder))
          }
        </div>
      </ScrollArea>
    </div>
  );
}
