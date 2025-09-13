import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FolderPlus, Clock, Search, Grid3X3, List, Keyboard } from "lucide-react";

interface TopMenuProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function TopMenu({ searchQuery, onSearchChange }: TopMenuProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 text-primary">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
            </svg>
          </div>
          <h1 className="font-semibold text-foreground">Content Quick Viewer</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            title="Open Folder (Ctrl+O)"
            data-testid="button-open-folder"
          >
            <FolderPlus className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            title="Recent Folders"
            data-testid="button-recent-folders"
          >
            <Clock className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64 pl-8 pr-12"
            data-testid="input-search"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
            Ctrl+F
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            title="Grid View"
            data-testid="button-view-grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            title="List View"
            data-testid="button-view-list"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowShortcuts(!showShortcuts)}
          title="Show Shortcuts (?)"
          data-testid="button-show-shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
