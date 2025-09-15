# ContentQuickViewer

A lightweight command-line utility for quickly viewing and previewing various file types without opening full applications.

## Features

- **Multi-format Support**: View text files, JSON, images, binary files, and more
- **Smart Detection**: Automatically detects file types and chooses appropriate viewing method
- **Formatted Output**: Pretty-printed JSON, syntax highlighting hints, and organized display
- **File Information**: Shows file size, type, and other metadata
- **Configurable Limits**: Control how much content to display (line limits, byte previews)
- **Cross-platform**: Works on Windows, macOS, and Linux

## Supported File Types

### Text Files
- Plain text (`.txt`)
- Markdown (`.md`)
- Source code (`.py`, `.js`, `.html`, `.css`, `.xml`, etc.)
- Configuration files (`.yaml`, `.yml`, `.json`, `.ini`, `.conf`)
- Scripts (`.sh`, `.bat`, `.ps1`)
- Logs (`.log`)

### Structured Data
- JSON files with pretty formatting
- CSV files
- XML files

### Images
- Basic info for common formats (`.jpg`, `.png`, `.gif`, `.bmp`, `.svg`, `.webp`)
- Detailed information when Pillow is installed (dimensions, format, mode)

### Binary Files
- Hex dump preview for unknown binary files

## Installation

### Quick Start (Direct Usage)
```bash
# Clone the repository
git clone https://github.com/crashon/ContentQuickViewer.git
cd ContentQuickViewer

# Run directly
python content_quick_viewer.py /path/to/file
```

### Install as Package
```bash
# Install the package
pip install -e .

# Now you can use the commands globally
cqv /path/to/file
# or
content-quick-viewer /path/to/file
```

### With Enhanced Image Support
```bash
# Install with optional dependencies
pip install -e .[full]
```

## Usage

### Basic Usage
```bash
# View a text file
python content_quick_viewer.py document.txt

# View a JSON file (with pretty formatting)
python content_quick_viewer.py data.json

# View an image file
python content_quick_viewer.py photo.jpg

# View with custom line limit
python content_quick_viewer.py --max-lines 50 large_file.log
```

### Command-line Options
```
usage: content_quick_viewer.py [-h] [--max-lines MAX_LINES] [--version] file

ContentQuickViewer - Quickly view and preview various file types

positional arguments:
  file                  Path to the file to view

options:
  -h, --help           show this help message and exit
  --max-lines MAX_LINES, -l MAX_LINES
                       Maximum number of lines to show for text files (default: 100)
  --version            show program version number and exit
```

### Examples

#### Viewing a Python file:
```bash
$ python content_quick_viewer.py content_quick_viewer.py
============================================================
ContentQuickViewer
============================================================
File: content_quick_viewer.py
Path: /path/to/content_quick_viewer.py
Size: 6.9 KB
Type: text/x-python
============================================================
#!/usr/bin/env python3
"""
ContentQuickViewer - A utility for quickly viewing and previewing various file types
"""

import argparse
import json
...
```

#### Viewing a JSON file:
```bash
$ python content_quick_viewer.py package.json
============================================================
ContentQuickViewer
============================================================
File: package.json
Path: /path/to/package.json
Size: 1.2 KB
Type: application/json
============================================================
{
  "name": "example-project",
  "version": "1.0.0",
  "description": "An example project",
  "main": "index.js"
}
```

#### Viewing an image:
```bash
$ python content_quick_viewer.py photo.jpg
============================================================
ContentQuickViewer
============================================================
File: photo.jpg
Path: /path/to/photo.jpg
Size: 2.4 MB
Type: image/jpeg
============================================================
Image Format: JPEG
Dimensions: 1920 x 1080
Mode: RGB
```

## Development

### Running Tests
```bash
# Create test files for manual testing
mkdir test_files
echo "Hello World" > test_files/hello.txt
echo '{"name": "test", "value": 42}' > test_files/data.json

# Test the viewer
python content_quick_viewer.py test_files/hello.txt
python content_quick_viewer.py test_files/data.json
```

## License

MIT License - feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
