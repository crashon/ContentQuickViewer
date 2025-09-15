import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileSystemStorage } from './filesystem-storage';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('FileSystemStorage', () => {
  let storage: FileSystemStorage;
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cqv-test-'));
    storage = new FileSystemStorage(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('lists files in a directory', async () => {
    // Create test files
    await fs.writeFile(path.join(testDir, 'test.txt'), 'test content');
    await fs.mkdir(path.join(testDir, 'testdir'));

    const files = await storage.getFilesByPath('/');
    expect(files).toHaveLength(2);
    expect(files.find(f => f.name === 'test.txt')).toBeDefined();
    expect(files.find(f => f.name === 'testdir')).toBeDefined();
  });

  it('gets file details', async () => {
    // Create a test file
    const testFile = path.join(testDir, 'test.txt');
    await fs.writeFile(testFile, 'test content');

    const file = await storage.getFileByPath('/test.txt');
    expect(file).toBeDefined();
    expect(file?.name).toBe('test.txt');
    expect(file?.type).toBe('file');
    expect(file?.mimeType).toBe('text/plain');
  });

  it('adds new files', async () => {
    const newFile = {
      path: '/newfile.txt',
      name: 'newfile.txt',
      type: 'file',
      lastModified: new Date(),
      parentPath: '/',
      size: 0,
      mimeType: 'text/plain',
      isHidden: false,
    };

    const created = await storage.addFile(newFile);
    expect(created.name).toBe('newfile.txt');
    
    // Verify file exists on disk
    const stats = await fs.stat(path.join(testDir, 'newfile.txt'));
    expect(stats.isFile()).toBe(true);
  });

  it('updates file names', async () => {
    // Create initial file
    const testFile = path.join(testDir, 'test.txt');
    await fs.writeFile(testFile, 'test content');

    const file = await storage.getFileByPath('/test.txt');
    if (!file) throw new Error('File not found');

    // Rename the file
    const updated = await storage.updateFile(file.id, {
      ...file,
      name: 'renamed.txt',
      path: '/renamed.txt',
    });

    expect(updated.name).toBe('renamed.txt');
    
    // Verify old file doesn't exist
    await expect(fs.access(testFile)).rejects.toThrow();
    
    // Verify new file exists
    const stats = await fs.stat(path.join(testDir, 'renamed.txt'));
    expect(stats.isFile()).toBe(true);
  });

  it('manages recent folders', async () => {
    const folder = {
      path: '/testfolder',
      name: 'Test Folder',
    };

    // Add folder to recent list
    const added = await storage.addRecentFolder(folder);
    expect(added.path).toBe('/testfolder');

    // Get recent folders
    const recent = await storage.getRecentFolders();
    expect(recent).toHaveLength(1);
    expect(recent[0].path).toBe('/testfolder');

    // Update access time
    await storage.updateRecentFolderAccess('/testfolder');
    const updated = await storage.getRecentFolders();
    expect(updated[0].lastAccessed).toBeInstanceOf(Date);
  });
});