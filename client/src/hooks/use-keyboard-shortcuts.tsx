import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  onOpenFolder: () => void;
  onSearch: () => void;
  onRename: () => void;
  onFullscreen: () => void;
  onPlayPause: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Single key shortcuts
      switch (e.key) {
        case '?':
          // TODO: Show shortcuts overlay
          e.preventDefault();
          break;
        case 'F2':
          options.onRename();
          e.preventDefault();
          break;
        case ' ':
          options.onPlayPause();
          e.preventDefault();
          break;
        case 'f':
        case 'F':
          options.onFullscreen();
          e.preventDefault();
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
            e.preventDefault();
          }
          break;
      }

      // Ctrl key combinations
      if (e.ctrlKey) {
        switch (e.key) {
          case 'o':
          case 'O':
            options.onOpenFolder();
            e.preventDefault();
            break;
          case 'f':
          case 'F':
            options.onSearch();
            e.preventDefault();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [options]);
}
