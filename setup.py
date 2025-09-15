#!/usr/bin/env python3
"""
Setup script for ContentQuickViewer
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read the README file
readme_path = Path(__file__).parent / "README.md"
if readme_path.exists():
    with open(readme_path, 'r', encoding='utf-8') as f:
        long_description = f.read()
else:
    long_description = "ContentQuickViewer - A utility for quickly viewing and previewing various file types"

setup(
    name="content-quick-viewer",
    version="1.0.0",
    author="ContentQuickViewer",
    description="A utility for quickly viewing and previewing various file types",
    long_description=long_description,
    long_description_content_type="text/markdown",
    py_modules=["content_quick_viewer"],
    python_requires=">=3.6",
    entry_points={
        "console_scripts": [
            "cqv=content_quick_viewer:main",
            "content-quick-viewer=content_quick_viewer:main",
        ]
    },
    extras_require={
        "full": ["Pillow>=8.0.0"],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: End Users/Desktop",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: System :: Systems Administration",
        "Topic :: Text Processing",
        "Topic :: Utilities",
    ],
    keywords="file viewer, content preview, text viewer, image info, quick view",
)