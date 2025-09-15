import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import { FileUploader } from './file-uploader';

describe('FileUploader', () => {
  it('renders the upload button', () => {
    render(<FileUploader currentPath="/test" />);
    expect(screen.getByText('Upload Files')).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    // Mock fetch
    const mockFetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: '1', name: 'test.txt' }])
    }));
    vi.stubGlobal('fetch', mockFetch);

    render(<FileUploader currentPath="/test" />);
    
    // Create a file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Upload Files/i);
    
    // Trigger file upload
    await fireEvent.change(input, { target: { files: [file] } });
    
    // Verify fetch was called with correct parameters
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/files/upload?path=%2Ftest',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );

    vi.restoreAllMocks();
  });

  it('shows error toast on upload failure', async () => {
    // Mock fetch failure
    const mockFetch = vi.fn(() => Promise.resolve({
      ok: false,
      status: 500,
    }));
    vi.stubGlobal('fetch', mockFetch);

    render(<FileUploader currentPath="/test" />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Upload Files/i);
    
    // Trigger file upload
    await fireEvent.change(input, { target: { files: [file] } });
    
    // Verify error toast is shown
    expect(screen.getByText('Upload failed')).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});