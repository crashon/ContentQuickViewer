# Overview

Content Quick Viewer (CQV) is a multimedia content viewer application built as a full-stack web application. It provides an intuitive interface for browsing and previewing various file types including text files, images, videos, and audio files within folder structures. The application features a file explorer with folder tree navigation, content preview panes, and specialized viewers for different media types.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with React and TypeScript using Vite as the build tool. The application follows a component-based architecture with:

- **UI Framework**: React 18 with functional components and hooks
- **Styling**: Tailwind CSS with a comprehensive design system using CSS custom properties
- **Component Library**: Radix UI components wrapped with custom styling via shadcn/ui
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **File Structure**: Organized into pages, components, hooks, and utility libraries

The frontend implements a three-panel layout with resizable panels:
- Left panel: Folder tree navigation
- Middle panel: File list view with search functionality
- Right panel: Content preview based on file type

## Backend Architecture
The server is built with Express.js and TypeScript, providing a REST API for file operations:

- **Server Framework**: Express.js with middleware for logging, JSON parsing, and error handling
- **Development Setup**: Vite integration for hot reloading and development server
- **File Operations**: In-memory storage implementation for demonstration purposes
- **API Endpoints**: RESTful endpoints for file listing, content retrieval, and recent folder management

The backend follows a modular structure with separate route handlers and storage abstractions.

## Data Storage Solutions
The application uses a hybrid approach for data persistence:

- **Development Storage**: In-memory storage with sample data for demonstration
- **Database Schema**: Drizzle ORM schemas defined for PostgreSQL with tables for file entries and recent folders
- **Database Migration**: Drizzle Kit configured for schema management and migrations

The schema includes:
- File entries table with path, metadata, and hierarchical relationships
- Recent folders table for user convenience features

## Content Viewing System
The application implements specialized viewers for different content types:

- **Text Viewer**: Supports multiple text formats with syntax highlighting capability
- **Image Viewer**: Interactive image display with zoom, pan, rotation, and slideshow features
- **Video Viewer**: HTML5 video player with custom controls
- **Audio Viewer**: Audio player with visualizer effects and playback controls

Each viewer is designed as a separate component with file-type-specific functionality.

## User Interface Design
The interface uses a dark theme by default with a comprehensive design system:

- **Design Tokens**: CSS custom properties for consistent theming
- **Typography**: Multiple font families including monospace for code
- **Interactive Elements**: Keyboard shortcuts, drag-and-drop support, and responsive design
- **Accessibility**: Proper ARIA labels and keyboard navigation support

# External Dependencies

## Core Frameworks
- **React**: Frontend UI framework with hooks and functional components
- **Express.js**: Backend web server framework
- **TypeScript**: Type-safe development across frontend and backend

## Database and ORM
- **Drizzle ORM**: Type-safe database ORM with schema validation
- **@neondatabase/serverless**: Neon database connector for PostgreSQL
- **Drizzle Kit**: Database migration and schema management tool

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI components for accessibility
- **shadcn/ui**: Pre-styled component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Build tool and development server
- **TanStack Query**: Data fetching and caching library for React
- **Wouter**: Lightweight routing library
- **ESBuild**: Fast JavaScript bundler for production builds

## File Handling
- **mime-types**: MIME type detection for file classification
- **class-variance-authority**: Utility for managing component variants
- **clsx**: Conditional className utility

## Session and State Management
- **connect-pg-simple**: PostgreSQL session store (configured but not actively used in current implementation)

The application is designed to be deployed on platforms like Replit with environment-based configuration for database connections and development features.