import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RotateCcw, RotateCw, ChevronLeft, ChevronRight, Play, ZoomIn, ZoomOut } from "lucide-react";
import type { FileEntry } from "@shared/schema";

interface ImageViewerProps {
  file: FileEntry;
}

export default function ImageViewer({ file }: ImageViewerProps) {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const { data: fileContent, isLoading } = useQuery({
    queryKey: ["/api/files/content", { path: file.path }],
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse bg-muted rounded h-64 w-full"></div>
        <div className="mt-4 text-muted-foreground">Loading image...</div>
      </div>
    );
  }

  if (!fileContent || fileContent.type !== 'binary') {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Unable to load image
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div 
        className="flex-1 overflow-hidden bg-black/5 relative cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        data-testid="image-container"
      >
        <img
          ref={imgRef}
          src={fileContent.url}
          alt={file.name}
          className="max-w-none transition-transform duration-200"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
          draggable={false}
          onDoubleClick={resetView}
          data-testid="image-preview"
        />
      </div>
      
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRotation(prev => prev - 90)}
              data-testid="button-rotate-left"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRotation(prev => prev + 90)}
              data-testid="button-rotate-right"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setScale(prev => Math.max(0.1, prev * 0.8))}
                data-testid="button-zoom-out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setScale(prev => Math.min(5, prev * 1.2))}
                data-testid="button-zoom-in"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={resetView}
              data-testid="button-reset-view"
            >
              Reset
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              title="Previous (←)"
              data-testid="button-previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              title="Slideshow (Space)"
              data-testid="button-slideshow"
            >
              <Play className="w-4 h-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              title="Next (→)"
              data-testid="button-next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
