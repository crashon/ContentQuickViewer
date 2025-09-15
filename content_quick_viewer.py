#!/usr/bin/env python3
"""
ContentQuickViewer - A utility for quickly viewing and previewing various file types
"""

import argparse
import json
import mimetypes
import os
import sys
from pathlib import Path
from typing import Optional, Union


class ContentQuickViewer:
    """Main class for the ContentQuickViewer application"""
    
    def __init__(self):
        self.supported_text_extensions = {
            '.txt', '.md', '.py', '.js', '.html', '.css', '.xml', '.yaml', '.yml',
            '.json', '.csv', '.log', '.conf', '.cfg', '.ini', '.sh', '.bat', '.ps1'
        }
        self.supported_image_extensions = {
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'
        }
    
    def get_file_info(self, file_path: Path) -> dict:
        """Get basic information about the file"""
        try:
            stat = file_path.stat()
            mime_type, _ = mimetypes.guess_type(str(file_path))
            
            return {
                'name': file_path.name,
                'path': str(file_path),
                'size': stat.st_size,
                'extension': file_path.suffix.lower(),
                'mime_type': mime_type,
                'is_readable': os.access(file_path, os.R_OK)
            }
        except Exception as e:
            return {'error': str(e)}
    
    def format_file_size(self, size_bytes: int) -> str:
        """Format file size in human readable format"""
        if size_bytes == 0:
            return "0 B"
        
        size_names = ["B", "KB", "MB", "GB", "TB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        
        return f"{size_bytes:.1f} {size_names[i]}"
    
    def view_text_content(self, file_path: Path, max_lines: int = 100) -> str:
        """View text content with line limit"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                lines = []
                for i, line in enumerate(f):
                    if i >= max_lines:
                        lines.append(f"\n... (truncated after {max_lines} lines)")
                        break
                    lines.append(line.rstrip())
                return '\n'.join(lines)
        except Exception as e:
            return f"Error reading file: {e}"
    
    def view_json_content(self, file_path: Path) -> str:
        """View JSON content with pretty formatting"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return json.dumps(data, indent=2, ensure_ascii=False)
        except json.JSONDecodeError as e:
            return f"Invalid JSON: {e}"
        except Exception as e:
            return f"Error reading JSON file: {e}"
    
    def view_image_info(self, file_path: Path) -> str:
        """View image file information"""
        try:
            # Try to get image dimensions if PIL is available
            try:
                from PIL import Image
                with Image.open(file_path) as img:
                    return f"Image Format: {img.format}\nDimensions: {img.width} x {img.height}\nMode: {img.mode}"
            except ImportError:
                return f"Image file (install Pillow for detailed info)\nFormat: {file_path.suffix.upper()}"
        except Exception as e:
            return f"Error reading image: {e}"
    
    def view_binary_preview(self, file_path: Path, preview_bytes: int = 256) -> str:
        """View binary file as hex preview"""
        try:
            with open(file_path, 'rb') as f:
                data = f.read(preview_bytes)
                
            hex_lines = []
            for i in range(0, len(data), 16):
                chunk = data[i:i+16]
                hex_part = ' '.join(f'{b:02x}' for b in chunk)
                ascii_part = ''.join(chr(b) if 32 <= b <= 126 else '.' for b in chunk)
                hex_lines.append(f"{i:08x}: {hex_part:<48} |{ascii_part}|")
            
            result = '\n'.join(hex_lines)
            if len(data) == preview_bytes:
                result += f"\n... (showing first {preview_bytes} bytes)"
            
            return result
        except Exception as e:
            return f"Error reading binary file: {e}"
    
    def view_file(self, file_path: Union[str, Path], max_lines: int = 100) -> str:
        """Main method to view file content based on file type"""
        file_path = Path(file_path)
        
        if not file_path.exists():
            return f"Error: File '{file_path}' does not exist"
        
        if not file_path.is_file():
            return f"Error: '{file_path}' is not a file"
        
        # Get file information
        file_info = self.get_file_info(file_path)
        if 'error' in file_info:
            return f"Error getting file info: {file_info['error']}"
        
        # Create header with file information
        header = f"""
{'='*60}
ContentQuickViewer
{'='*60}
File: {file_info['name']}
Path: {file_info['path']}
Size: {self.format_file_size(file_info['size'])}
Type: {file_info['mime_type'] or 'Unknown'}
{'='*60}
"""
        
        extension = file_info['extension']
        
        # Handle different file types
        if extension == '.json':
            content = self.view_json_content(file_path)
        elif extension in self.supported_text_extensions:
            content = self.view_text_content(file_path, max_lines)
        elif extension in self.supported_image_extensions:
            content = self.view_image_info(file_path)
        else:
            # Try to detect if it's a text file by reading first few bytes
            try:
                with open(file_path, 'rb') as f:
                    sample = f.read(1024)
                    if b'\x00' not in sample:  # Likely text if no null bytes
                        content = self.view_text_content(file_path, max_lines)
                    else:
                        content = self.view_binary_preview(file_path)
            except Exception:
                content = self.view_binary_preview(file_path)
        
        return header + content


def main():
    """Main entry point for the CLI application"""
    parser = argparse.ArgumentParser(
        description='ContentQuickViewer - Quickly view and preview various file types',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s document.txt
  %(prog)s image.jpg
  %(prog)s data.json
  %(prog)s --max-lines 50 large_file.log
        """
    )
    
    parser.add_argument('file', help='Path to the file to view')
    parser.add_argument('--max-lines', '-l', type=int, default=100,
                       help='Maximum number of lines to show for text files (default: 100)')
    parser.add_argument('--version', action='version', version='ContentQuickViewer 1.0.0')
    
    args = parser.parse_args()
    
    viewer = ContentQuickViewer()
    result = viewer.view_file(args.file, args.max_lines)
    
    print(result)


if __name__ == '__main__':
    main()