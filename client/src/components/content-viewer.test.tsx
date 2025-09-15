import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import ContentViewer from './content-viewer';
import { useToast } from '@/hooks/use-toast';

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

describe('ContentViewer', () => {
  it('shows empty state when no file is selected', () => {
    render(<ContentViewer selectedFile={null} />);
    expect(screen.getByText('Select a file to preview')).toBeInTheDocument();
  });

  it('shows directory message for folders', () => {
    const folder = {
      id: '1',
      path: '/test',
      name: 'test',
      type: 'directory',
      lastModified: new Date(),
      parentPath: '/',
      size: null,
      mimeType: null,
      isHidden: false,
    };

    render(<ContentViewer selectedFile={folder} />);
    expect(screen.getByText('Folder selected. Cannot preview folders.')).toBeInTheDocument();
  });

  it('renders text viewer for text files', () => {
    const textFile = {
      id: '2',
      path: '/test.txt',
      name: 'test.txt',
      type: 'file',
      lastModified: new Date(),
      parentPath: '/',
      size: 100,
      mimeType: 'text/plain',
      isHidden: false,
    };

    render(<ContentViewer selectedFile={textFile} />);
    expect(screen.getByTestId('text-viewer')).toBeInTheDocument();
  });

  it('handles file download', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () => new Blob(['test content'], { type: 'text/plain' }),
        headers: new Headers({
          'content-disposition': 'attachment; filename="test.txt"',
        }),
      })
    );
    vi.stubGlobal('fetch', mockFetch);

    const file = {
      id: '3',
      path: '/test.txt',
      name: 'test.txt',
      type: 'file',
      lastModified: new Date(),
      parentPath: '/',
      size: 100,
      mimeType: 'text/plain',
      isHidden: false,
    };

    render(<ContentViewer selectedFile={file} />);
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    await fireEvent.click(downloadButton);

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/files/download?path=%2Ftest.txt'
    );

    const { toast } = useToast();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Download successful',
      })
    );

    vi.restoreAllMocks();
  });

  it('handles download errors', async () => {
    const mockFetch = vi.fn(() => Promise.reject(new Error('Network error')));
    vi.stubGlobal('fetch', mockFetch);

    const file = {
      id: '4',
      path: '/test.txt',
      name: 'test.txt',
      type: 'file',
      lastModified: new Date(),
      parentPath: '/',
      size: 100,
      mimeType: 'text/plain',
      isHidden: false,
    };

    render(<ContentViewer selectedFile={file} />);
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    await fireEvent.click(downloadButton);

    const { toast } = useToast();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Download failed',
        variant: 'destructive',
      })
    );

    vi.restoreAllMocks();
  });
});