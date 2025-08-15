import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertExtractedInformationSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { documentProcessor } from "./services/documentProcessor";
import { aiExtractor } from "./services/aiExtractor";
import { templateEngine } from "./services/templateEngine";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload documents
  app.post("/api/documents/upload", upload.array('files'), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedDocuments = [];

      for (const file of files) {
        const documentData = {
          fileName: file.filename,
          originalName: file.originalname,
          fileType: path.extname(file.originalname).toLowerCase(),
          fileSize: file.size,
          status: "uploaded" as const,
          extractedText: null,
          processingError: null,
        };

        const document = await storage.createDocument(documentData);
        uploadedDocuments.push(document);

        // Start processing in background
        processDocumentAsync(document.id, file.path, file.originalname);
      }

      res.json({ documents: uploadedDocuments });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json({ documents });
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  // Get document by ID
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json({ document });
    } catch (error) {
      console.error("Get document error:", error);
      res.status(500).json({ message: "Failed to get document" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Delete file from disk
      const filePath = path.join(uploadDir, document.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const deleted = await storage.deleteDocument(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Get extracted information for a document
  app.get("/api/documents/:id/extracted-info", async (req, res) => {
    try {
      const extractedInfo = await storage.getExtractedInformationByDocumentId(req.params.id);
      if (!extractedInfo) {
        return res.status(404).json({ message: "No extracted information found" });
      }
      res.json({ extractedInfo });
    } catch (error) {
      console.error("Get extracted info error:", error);
      res.status(500).json({ message: "Failed to get extracted information" });
    }
  });

  // Update extracted information
  app.patch("/api/extracted-info/:id", async (req, res) => {
    try {
      const updates = req.body;
      const updatedInfo = await storage.updateExtractedInformation(req.params.id, updates);
      if (!updatedInfo) {
        return res.status(404).json({ message: "Extracted information not found" });
      }
      res.json({ extractedInfo: updatedInfo });
    } catch (error) {
      console.error("Update extracted info error:", error);
      res.status(500).json({ message: "Failed to update extracted information" });
    }
  });

  // Get legal templates
  app.get("/api/templates", async (req, res) => {
    try {
      const { type, category } = req.query;
      let templates;
      
      if (type) {
        templates = await storage.getLegalTemplatesByType(type as string);
      } else {
        templates = await storage.getLegalTemplates();
      }

      if (category) {
        templates = templates.filter(t => t.category === category);
      }

      res.json({ templates });
    } catch (error) {
      console.error("Get templates error:", error);
      res.status(500).json({ message: "Failed to get templates" });
    }
  });

  // Generate document from template
  app.post("/api/documents/generate", async (req, res) => {
    try {
      const { templateId, extractedInfoId } = req.body;

      const template = await storage.getLegalTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const extractedInfo = await storage.getExtractedInformationByDocumentId(extractedInfoId);
      if (!extractedInfo) {
        return res.status(404).json({ message: "Extracted information not found" });
      }

      const result = templateEngine.generateDocument(template, extractedInfo);

      res.json({
        document: result.document,
        validation: result.validation,
        template: template
      });
    } catch (error) {
      console.error("Generate document error:", error);
      res.status(500).json({ message: "Failed to generate document" });
    }
  });

  // Background document processing function
  async function processDocumentAsync(documentId: string, filePath: string, originalName: string) {
    try {
      // Update status to processing
      await storage.updateDocument(documentId, { status: "processing" });

      // Extract text from document
      const fileType = path.extname(originalName).toLowerCase();
      const extractedText = await documentProcessor.extractTextFromDocument(filePath, fileType);

      // Use AI to extract legal information
      const extractedInfo = await aiExtractor.extractLegalInformation(extractedText);

      // Save extracted information
      await storage.createExtractedInformation({
        documentId,
        ...extractedInfo
      });

      // Update document status
      await storage.updateDocument(documentId, {
        status: "processed",
        extractedText,
        processingError: null
      });

      console.log(`Document ${documentId} processed successfully`);
    } catch (error) {
      console.error(`Processing failed for document ${documentId}:`, error);
      
      // Update document with error status
      await storage.updateDocument(documentId, {
        status: "error",
        processingError: error.message
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
