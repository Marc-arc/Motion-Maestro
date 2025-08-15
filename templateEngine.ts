import { LegalTemplate } from "@shared/schema";

export class TemplateEngine {
  fillTemplate(template: LegalTemplate, data: Record<string, any>): string {
    let filledTemplate = template.template;
    
    // Add current date
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    data.currentDate = currentDate;
    
    // Replace all template variables
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        filledTemplate = filledTemplate.replace(regex, String(value));
      }
    }
    
    // Clean up any remaining unfilled variables
    filledTemplate = filledTemplate.replace(/{{.*?}}/g, '[NOT PROVIDED]');
    
    return filledTemplate;
  }

  validateRequiredFields(template: LegalTemplate, data: Record<string, any>): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];
    
    for (const field of template.requiredFields) {
      if (!data[field] || data[field].toString().trim() === '') {
        missingFields.push(field);
      }
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  generateDocument(template: LegalTemplate, extractedInfo: any): { document: string; validation: { isValid: boolean; missingFields: string[] } } {
    // Map extracted information to template fields
    const templateData = {
      court: extractedInfo.court,
      caseNumber: extractedInfo.caseNumber,
      petitionerName: extractedInfo.petitionerName,
      petitionerAddress: extractedInfo.petitionerAddress,
      petitionerPhone: extractedInfo.petitionerPhone,
      respondentName: extractedInfo.respondentName,
      respondentAddress: extractedInfo.respondentAddress,
      respondentPhone: extractedInfo.respondentPhone,
      marriageDate: extractedInfo.marriageDate,
      separationDate: extractedInfo.separationDate,
      filingDate: extractedInfo.filingDate,
      judge: extractedInfo.judge,
      // Add default attorney info - in a real app, this would come from user profile
      attorneyName: "[ATTORNEY NAME]",
      attorneyAddress: "[ATTORNEY ADDRESS]",
      attorneyPhone: "[ATTORNEY PHONE]",
    };

    const validation = this.validateRequiredFields(template, templateData);
    const document = this.fillTemplate(template, templateData);

    return {
      document,
      validation
    };
  }
}

export const templateEngine = new TemplateEngine();
