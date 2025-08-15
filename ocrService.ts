import { createWorker, Worker } from 'tesseract.js';

export class OCRService {
  private worker: Worker | null = null;

  async initialize(): Promise<void> {
    if (!this.worker) {
      this.worker = await createWorker();
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
    }
  }

  async extractText(imagePath: string): Promise<string> {
    await this.initialize();
    
    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      const { data: { text } } = await this.worker.recognize(imagePath);
      return text.trim();
    } catch (error) {
      throw new Error(`OCR failed: ${error.message}`);
    }
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();
