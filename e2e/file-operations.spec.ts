import { test, expect } from '@playwright/test';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';

test.describe('File Upload and Download', () => {
  let testDir: string;

  test.beforeAll(async () => {
    // Create a temporary test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cqv-e2e-test-'));
    process.env.CQV_ROOT_PATH = testDir;
  });

  test.afterAll(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  test('should upload and download files', async ({ page }) => {
    await page.goto('/');

    // Create a test file to upload
    const testFilePath = path.join(testDir, 'test-upload.txt');
    await fs.writeFile(testFilePath, 'Test content for upload');

    // Wait for file upload button
    const uploadButton = page.locator('text=Upload Files');
    await expect(uploadButton).toBeVisible();

    // Upload the file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);

    // Wait for upload to complete and file to appear in list
    await expect(page.locator('text=test-upload.txt')).toBeVisible();

    // Select the uploaded file
    await page.click('text=test-upload.txt');

    // Wait for download button and click it
    const downloadButton = page.locator('button:has-text("Download")');
    await expect(downloadButton).toBeVisible();

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    const download = await downloadPromise;

    // Verify downloaded file
    const downloadedPath = await download.path();
    expect(downloadedPath).toBeDefined();
    if (downloadedPath) {
      const content = await fs.readFile(downloadedPath, 'utf-8');
      expect(content).toBe('Test content for upload');
    }
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    await page.goto('/');

    // Create a very large file that exceeds limits
    const largeFilePath = path.join(testDir, 'large-file.bin');
    const buffer = Buffer.alloc(100 * 1024 * 1024); // 100MB
    await fs.writeFile(largeFilePath, buffer);

    // Upload the large file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(largeFilePath);

    // Verify error toast appears
    await expect(page.locator('text=Upload failed')).toBeVisible();
  });

  test('should handle file browsing', async ({ page }) => {
    await page.goto('/');

    // Create test directory structure
    await fs.mkdir(path.join(testDir, 'test-dir'));
    await fs.writeFile(path.join(testDir, 'test-dir', 'file1.txt'), 'Content 1');
    await fs.writeFile(path.join(testDir, 'test-dir', 'file2.txt'), 'Content 2');

    // Navigate to test directory
    await page.click('text=test-dir');

    // Verify files are listed
    await expect(page.locator('text=file1.txt')).toBeVisible();
    await expect(page.locator('text=file2.txt')).toBeVisible();

    // Select and verify file content
    await page.click('text=file1.txt');
    await expect(page.locator('text=Content 1')).toBeVisible();
  });
});