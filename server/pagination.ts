import { type FileEntry } from "@shared/schema";

// Utility for paginating and sorting files
export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: 'name' | 'size' | 'lastModified';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function paginateAndSortFiles(
  files: FileEntry[],
  options: PaginationOptions
): PaginatedResult<FileEntry> {
  const { page, pageSize, sortBy = 'name', sortOrder = 'asc' } = options;

  // Sort files
  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = (a.size || 0) - (b.size || 0);
        break;
      case 'lastModified':
        comparison = a.lastModified.getTime() - b.lastModified.getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Always show directories first
  const dirs = sortedFiles.filter(f => f.type === 'directory');
  const files = sortedFiles.filter(f => f.type !== 'directory');
  const sortedAndGrouped = [...dirs, ...files];

  // Calculate pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedItems = sortedAndGrouped.slice(start, end);
  const total = sortedAndGrouped.length;
  const totalPages = Math.ceil(total / pageSize);

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    totalPages,
  };
}