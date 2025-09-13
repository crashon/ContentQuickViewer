import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { FileEntry } from "@shared/schema";

interface TextViewerProps {
  file: FileEntry;
}

export default function TextViewer({ file }: TextViewerProps) {
  const { data: fileContent, isLoading } = useQuery({
    queryKey: ["/api/files/content", { path: file.path }],
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!fileContent || fileContent.type !== 'text') {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Unable to load file content
      </div>
    );
  }

  const content = fileContent.content;
  const lines = content.split('\n');

  return (
    <ScrollArea className="h-full">
      <div className="font-mono text-sm leading-relaxed p-4 bg-card" data-testid="text-content">
        {lines.map((line, index) => (
          <div key={index} className="flex">
            <div className="text-muted-foreground text-right pr-3 select-none w-8 flex-shrink-0">
              {index + 1}
            </div>
            <div className="flex-1">
              {line || '\u00A0'} {/* Non-breaking space for empty lines */}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
