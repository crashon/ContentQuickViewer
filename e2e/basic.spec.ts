import { test, expect } from '@playwright/test';

test.describe('Content Quick Viewer', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="top-menu"]')).toBeVisible();
    await expect(page.locator('text=Content Quick Viewer')).toBeVisible();
  });

  test('should navigate through folders', async ({ page }) => {
    await page.goto('/');
    
    // Wait for folder tree to load
    await page.waitForSelector('[data-testid="folder-tree"]');
    
    // Click on a folder (this will need to be updated based on actual folder structure)
    const folderItem = page.locator('[data-testid="folder-item"]').first();
    await folderItem.click();
    
    // Verify file list updates
    await expect(page.locator('[data-testid="file-list"]')).toBeVisible();
  });

  test('should preview text files', async ({ page }) => {
    await page.goto('/');
    
    // Wait for file list to load
    await page.waitForSelector('[data-testid="file-list"]');
    
    // Click on a text file (this will need to be updated based on actual file structure)
    const textFile = page.locator('[data-testid="file-item"]').first();
    await textFile.click();
    
    // Verify content viewer shows the file content
    await expect(page.locator('[data-testid="content-viewer"]')).toBeVisible();
  });
});