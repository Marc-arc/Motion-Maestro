import { createWorker } from 'tesseract.js';
import type { Worker } from 'tesseract.js';
import * as fs from 'fs';
import * as path from 'path';

export class DocumentProcessor {
  private ocrWorker: Worker | null = null;

  async initialize() {
    if (!this.ocrWorker) {
      this.ocrWorker = await createWorker('eng');
    }
  }

  async extractTextFromImage(imagePath: string): Promise<string> {
    await this.initialize();
    
    if (!this.ocrWorker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      const { data: { text } } = await this.ocrWorker.recognize(imagePath);
      return text.trim();
    } catch (error) {
      throw new Error(`OCR processing failed: ${(error as Error).message}`);
    }
  }

  async extractTextFromPDF(pdfPath: string): Promise<string> {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const dataBuffer = fs.readFileSync(pdfPath);
      const data = await pdfParse(dataBuffer);
      return data.text.trim();
    } catch (error) {
      throw new Error(`PDF processing failed: ${(error as Error).message}`);
    }
  }

  async extractTextFromDocument(filePath: string, fileType: string): Promise<string> {
    try {
      const fileExtension = path.extname(filePath).toLowerCase();
      
      switch (fileExtension) {
        case '.jpg':
        case '.jpeg':
        case '.png':
          return await this.extractTextFromImage(filePath);
        case '.pdf':
          return await this.extractTextFromPDF(filePath);
        case '.doc':
        case '.docx':
          // For Word documents, you would use a library like mammoth or docx-parser
          return "Word document text extraction would be implemented here";
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }
    } catch (error) {
      throw new Error(`Document processing failed: ${(error as Error).message}`);
    }
  }

  async cleanup() {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
    }
  }
}

export const documentProcessor = new DocumentProcessor();
