import { useState, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import TopMenu from "@/components/top-menu";
import FolderTree from "@/components/folder-tree";
import FileList from "@/components/file-list";
import ContentViewer from "@/components/content-viewer";
import StatusBar from "@/components/status-bar";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { FileEntry } from "@shared/schema";

export default function Viewer() {
  const [currentPath, setCurrentPath] = useState("/");
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useKeyboardShortcuts({
    onOpenFolder: () => {
      // TODO: Implement folder picker
      console.log("Open folder dialog");
    },
    onSearch: () => {
      const searchInput = document.querySelector('[data-testid="input-search"]') as HTMLInputElement;
      searchInput?.focus();
    },
    onRename: () => {
      if (selectedFile) {
        // TODO: Enable inline renaming
        console.log("Rename file:", selectedFile.name);
      }
    },
    onFullscreen: () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    },
    onPlayPause: () => {
      // TODO: Control media playback
      console.log("Toggle play/pause");
    },
  });

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <TopMenu 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        data-testid="top-menu"
      />
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <FolderTree
            currentPath={currentPath}
            onPathChange={setCurrentPath}
            data-testid="folder-tree"
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle data-testid="resize-handle-left" />
        
        <ResizablePanel defaultSize={50} minSize={30}>
          <FileList
            currentPath={currentPath}
            searchQuery={searchQuery}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            data-testid="file-list"
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle data-testid="resize-handle-right" />
        
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <ContentViewer
            selectedFile={selectedFile}
            data-testid="content-viewer"
          />
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <StatusBar
        selectedFile={selectedFile}
        data-testid="status-bar"
      />
    </div>
  );
}
