# Minnesota Legal Document Generator

## Overview

The Minnesota Legal Document Generator is a comprehensive full-stack web application designed to streamline the creation of legal documents for both Minnesota state courts and federal courts. The system allows users to upload legal documents (PDFs, images, Word docs), extract relevant information using AI and OCR technology, and generate properly formatted legal motions, petitions, and court forms using an extensive library of predefined templates.

The application follows a guided workflow: document upload → information extraction → template selection → document generation. It's built to handle a wide range of legal document types including divorce petitions, motions to dismiss, custody arrangements, protective orders, criminal expungements, probate petitions, federal court filings, and attorney admission forms, with comprehensive coverage of both Minnesota state court and U.S. District Court formatting requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom legal-themed color scheme and typography
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **File Handling**: React Dropzone for drag-and-drop file uploads

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for document management and processing
- **File Processing**: Multer for handling multipart file uploads with size and type restrictions
- **Storage Pattern**: Repository pattern with in-memory storage implementation (ready for database migration)

### Data Storage Solutions
- **Database ORM**: Drizzle ORM configured for PostgreSQL with Neon Database integration
- **Schema Design**: Four main entities - users, documents, extracted information, and legal templates
- **Extended Schema**: Comprehensive field support for 50+ legal document types including federal court forms, state court petitions, protective orders, probate documents, and attorney admission forms
- **File Storage**: Local filesystem storage for uploaded documents in dedicated uploads directory
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)

### Document Processing Pipeline
- **OCR Engine**: Tesseract.js for extracting text from image-based documents
- **AI Integration**: OpenAI GPT-4o for intelligent information extraction from legal documents
- **Template Engine**: Custom template system with variable substitution and field validation supporting 15+ legal document templates
- **Template Categories**: Federal Civil, Federal Criminal, Federal Attorney, State Civil, State Family, State Criminal, State Probate, Protective Orders, Housing/Landlord-Tenant
- **Supported Formats**: PDF, DOC/DOCX, JPG, JPEG, PNG with 10MB file size limit

### Authentication and Authorization
- **Authentication**: Session-based authentication with secure password handling
- **User Management**: Basic user registration and login system
- **Authorization**: Role-based access control ready for implementation

### API Structure
- **Document Management**: CRUD operations for document lifecycle
- **Information Extraction**: AI-powered extraction with manual editing capabilities supporting 50+ legal document fields
- **Template System**: Dynamic template selection and document generation with category-based filtering (Federal Civil, Federal Criminal, State Family, etc.)
- **File Operations**: Secure file upload, processing, and retrieval
- **Template Library**: Comprehensive collection including Minnesota U.S. District Court forms and Minnesota State Law Library forms

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database driver for Neon
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database migration and schema management tool

### AI and Processing Services
- **OpenAI API**: GPT-4o model for intelligent document analysis and information extraction
- **Tesseract.js**: Client-side OCR for text extraction from images
- **Multer**: File upload middleware for handling document submissions

### UI and Frontend Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **@tanstack/react-query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development tools and error handling

### File Processing Libraries
- **date-fns**: Date manipulation and formatting
- **react-dropzone**: Drag-and-drop file upload interface
- **class-variance-authority**: Type-safe CSS class variants
- **clsx**: Conditional CSS class composition utility

## Recent Changes (August 2025)

### Major Template Library Expansion
- **Federal Court Integration**: Added comprehensive Minnesota U.S. District Court forms including:
  - Notice of Appeal (Civil and Criminal)
  - Motion for Admission Pro Hac Vice
  - Application to Proceed In Forma Pauperis
  - General Civil Complaint
  - Notice of Related Cases
  - Motion to Exclude Time Under Speedy Trial Act
  - Criminal Subpoenas

- **Minnesota State Forms Integration**: Added Minnesota State Law Library forms including:
  - Child Custody and Parenting Time Petition
  - Domestic Abuse Order for Protection
  - Harassment Restraining Order
  - Small Claims Complaint
  - Name Change Petition
  - Criminal Expungement Petition
  - Landlord-Tenant Eviction Complaint
  - Guardianship Petition
  - Probate Petition for Formal Administration

- **Enhanced Template Filtering**: Implemented category-based filtering system with 9 distinct categories:
  - Federal Civil, Federal Criminal, Federal Attorney
  - State Civil, State Family, State Criminal, State Probate
  - Protective Orders, Housing/Landlord-Tenant

- **Extended Schema Support**: Database schema expanded to support 50+ legal document fields covering all major legal document types for both state and federal courts