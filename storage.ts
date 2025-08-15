import { randomUUID } from "crypto";
import { Document, ExtractedInformation, LegalTemplate } from "@shared/schema";

export interface IStorage {
  // Documents
  createDocument(doc: Omit<Document, "id" | "createdAt">): Promise<Document>;
  getDocument(id: string): Promise<Document | null>;
  getAllDocuments(): Promise<Document[]>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | null>;
  deleteDocument(id: string): Promise<boolean>;

  // Extracted Information
  createExtractedInfo(info: Omit<ExtractedInformation, "id" | "extractedAt">): Promise<ExtractedInformation>;
  getExtractedInfo(id: string): Promise<ExtractedInformation | null>;
  getExtractedInfoByDocumentId(documentId: string): Promise<ExtractedInformation | null>;
  updateExtractedInfo(id: string, updates: Partial<ExtractedInformation>): Promise<ExtractedInformation | null>;

  // Legal Templates
  getAllTemplates(): Promise<LegalTemplate[]>;
  getTemplate(id: string): Promise<LegalTemplate | null>;
}

export class MemStorage implements IStorage {
  private documents = new Map<string, Document>();
  private extractedInfo = new Map<string, ExtractedInformation>();
  private legalTemplates = new Map<string, LegalTemplate>();

  constructor() {
    // Initialize with some default legal templates
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const motionToDismiss: LegalTemplate = {
      id: randomUUID(),
      name: "Motion to Dismiss",
      type: "motion",
      category: "civil",
      template: "STATE OF MINNESOTA\nDISTRICT COURT\n{{court}}\n\n{{petitionerName}},\n    Petitioner,\nv.\n{{respondentName}},\n    Respondent.\n\nCase No. {{caseNumber}}\n\nMOTION TO DISMISS\n\nTO THE HONORABLE COURT:\n\nRespondent, {{respondentName}}, hereby moves this Court to dismiss the above-entitled action pursuant to Minn. R. Civ. P. 12.02(e) for failure to state a claim upon which relief can be granted.\n\nThis Motion is based upon the pleadings and files herein.\n\nDated: {{currentDate}}\n\n                    _________________________\n                    Attorney for Respondent\n                    {{attorneyName}}\n                    {{attorneyAddress}}\n                    {{attorneyPhone}}",
      requiredFields: ["court", "petitionerName", "respondentName", "caseNumber", "attorneyName", "attorneyAddress", "attorneyPhone"],
      createdAt: new Date(),
    };

    const petitionForDissolution: LegalTemplate = {
      id: randomUUID(),
      name: "Petition for Dissolution of Marriage",
      type: "petition",
      category: "family",
      template: "STATE OF MINNESOTA\nDISTRICT COURT\n{{court}}\n\nIn Re the Marriage of:\n{{petitionerName}},\n    Petitioner,\nand\n{{respondentName}},\n    Respondent.\n\nCase No. {{caseNumber}}\n\nPETITION FOR DISSOLUTION OF MARRIAGE\n\nTO THE HONORABLE COURT:\n\nPetitioner respectfully represents:\n\n1. Petitioner's name is {{petitionerName}} and Respondent's name is {{respondentName}}.\n\n2. Petitioner resides at {{petitionerAddress}}.\n\n3. Respondent resides at {{respondentAddress}}.\n\n4. The parties were married on {{marriageDate}}.\n\n5. The parties separated on {{separationDate}}.\n\n6. There has been an irretrievable breakdown of the marriage relationship.\n\nWHEREFORE, Petitioner prays that this Court grant a Decree of Dissolution of Marriage.\n\nDated: {{currentDate}}\n\n                    _________________________\n                    {{petitionerName}}\n                    Petitioner\n                    {{petitionerAddress}}\n                    {{petitionerPhone}}",
      requiredFields: ["court", "petitionerName", "respondentName", "caseNumber", "petitionerAddress", "respondentAddress", "marriageDate", "separationDate", "petitionerPhone"],
      createdAt: new Date(),
    };

    // Federal Court Templates
    const noticeOfAppeal: LegalTemplate = {
      id: randomUUID(),
      name: "Notice of Appeal (Civil)",
      type: "notice",
      category: "federal-civil",
      template: "UNITED STATES DISTRICT COURT\nDISTRICT OF MINNESOTA\n\n{{petitionerName}},\n    Plaintiff,\nv.\n{{respondentName}},\n    Defendant.\n\nCase No. {{caseNumber}}\n\nNOTICE OF APPEAL\n\nNotice is hereby given that {{appelantName}} hereby appeals to the United States Court of Appeals for the Eighth Circuit from the {{judgmentType}} entered in this action on {{judgmentDate}}.\n\nDated: {{currentDate}}\n\n                    _________________________\n                    {{attorneyName}}\n                    Attorney for {{appelantName}}\n                    {{attorneyAddress}}\n                    {{attorneyPhone}}\n                    {{attorneyEmail}}",
      requiredFields: ["petitionerName", "respondentName", "caseNumber", "appelantName", "judgmentType", "judgmentDate", "attorneyName", "attorneyAddress", "attorneyPhone", "attorneyEmail"],
      createdAt: new Date(),
    };

    const proHacVice: LegalTemplate = {
      id: randomUUID(),
      name: "Motion for Admission Pro Hac Vice",
      type: "motion",
      category: "federal-attorney",
      template: "UNITED STATES DISTRICT COURT\nDISTRICT OF MINNESOTA\n\n{{petitionerName}},\n    Plaintiff,\nv.\n{{respondentName}},\n    Defendant.\n\nCase No. {{caseNumber}}\n\nMOTION FOR ADMISSION PRO HAC VICE\n\nTO THE HONORABLE COURT:\n\nCounsel for {{clientName}} hereby moves this Court for an order admitting {{applicantName}} to practice before this Court pro hac vice in this action.\n\nIn support of this motion, counsel states:\n\n1. {{applicantName}} is a member in good standing of the bar of {{barState}} and has been since {{admissionDate}}.\n\n2. {{applicantName}} has not been admitted to practice before this Court.\n\n3. {{applicantName}} is qualified and familiar with the standards of practice before this Court.\n\n4. {{localCounselName}} of {{localCounselFirm}} is local counsel and will be responsible for compliance with all local rules.\n\nWHEREFORE, counsel respectfully requests that this Court admit {{applicantName}} to practice pro hac vice in this action.\n\nDated: {{currentDate}}\n\n                    _________________________\n                    {{localCounselName}}\n                    Local Counsel\n                    {{localCounselAddress}}\n                    {{localCounselPhone}}\n                    {{localCounselEmail}}",
      requiredFields: ["petitionerName", "respondentName", "caseNumber", "clientName", "applicantName", "barState", "admissionDate", "localCounselName", "localCounselFirm", "localCounselAddress", "localCounselPhone", "localCounselEmail"],
      createdAt: new Date(),
    };

    // Minnesota State Forms
    const childCustody: LegalTemplate = {
      id: randomUUID(),
      name: "Child Custody and Parenting Time Petition",
      type: "petition",
      category: "family",
      template: "STATE OF MINNESOTA\nDISTRICT COURT\n{{court}}\n\nIn Re the Custody of:\n{{childName}},\n    Minor Child.\n\nCase No. {{caseNumber}}\n\nPETITION FOR CHILD CUSTODY AND PARENTING TIME\n\nTO THE HONORABLE COURT:\n\nPetitioner, {{petitionerName}}, respectfully represents:\n\n1. Petitioner's name is {{petitionerName}} and resides at {{petitionerAddress}}.\n\n2. Respondent's name is {{respondentName}} and resides at {{respondentAddress}}.\n\n3. The minor child's name is {{childName}}, born {{childBirthDate}}.\n\n4. {{custodyBasis}}\n\n5. Petitioner requests custody and parenting time as follows: {{custodyRequest}}\n\n6. The best interests of the child will be served by granting this petition.\n\nWHEREFORE, Petitioner prays that this Court award custody and establish parenting time as requested.\n\nDated: {{currentDate}}\n\n                    _________________________\n                    {{petitionerName}}\n                    Petitioner\n                    {{petitionerAddress}}\n                    {{petitionerPhone}}",
      requiredFields: ["court", "childName", "caseNumber", "petitionerName", "petitionerAddress", "respondentName", "respondentAddress", "childBirthDate", "custodyBasis", "custodyRequest", "petitionerPhone"],
      createdAt: new Date(),
    };

    const domesticAbuse: LegalTemplate = {
      id: randomUUID(),
      name: "Domestic Abuse Order for Protection",
      type: "petition",
      category: "protective-order",
      template: "STATE OF MINNESOTA\nDISTRICT COURT\n{{court}}\n\n{{petitionerName}},\n    Petitioner,\nv.\n{{respondentName}},\n    Respondent.\n\nCase No. {{caseNumber}}\n\nPETITION FOR ORDER FOR PROTECTION\n\nTO THE HONORABLE COURT:\n\nPetitioner, {{petitionerName}}, respectfully represents:\n\n1. Petitioner resides at {{petitionerAddress}}.\n\n2. Respondent resides at {{respondentAddress}}.\n\n3. The relationship between Petitioner and Respondent is: {{relationship}}.\n\n4. Respondent has committed domestic abuse against Petitioner as follows: {{abuseDescription}}\n\n5. The abuse occurred on {{abuseDate}} at {{abuseLocation}}.\n\n6. Petitioner fears for their safety and requests protection from this Court.\n\nWHEREFORE, Petitioner prays that this Court issue an Order for Protection restraining Respondent from contact with Petitioner.\n\nDated: {{currentDate}}\n\n                    _________________________\n                    {{petitionerName}}\n                    Petitioner\n                    {{petitionerAddress}}\n                    {{petitionerPhone}}",
      requiredFields: ["court", "petitionerName", "caseNumber", "respondentName", "petitionerAddress", "respondentAddress", "relationship", "abuseDescription", "abuseDate", "abuseLocation", "petitionerPhone"],
      createdAt: new Date(),
    };

    const smallClaims: LegalTemplate = {
      id: randomUUID(),
      name: "Small Claims Complaint",
      type: "complaint",
      category: "civil",
      template: "STATE OF MINNESOTA\nCONCILIATION COURT\n{{court}}\n\n{{petitionerName}},\n    Plaintiff,\nv.\n{{respondentName}},\n    Defendant.\n\nCase No. {{caseNumber}}\n\nCOMPLAINT\n\nPlaintiff, {{petitionerName}}, complaining of Defendant, {{respondentName}}, states:\n\n1. Plaintiff resides at {{petitionerAddress}}.\n\n2. Defendant resides at {{respondentAddress}}.\n\n3. {{claimDescription}}\n\n4. As a result, Defendant owes Plaintiff the sum of ${{damageAmount}}.\n\n5. Demand has been made upon Defendant for payment, but payment has been refused.\n\nWHEREFORE, Plaintiff demands judgment against Defendant for ${{damageAmount}}, plus costs and disbursements.\n\nDated: {{currentDate}}\n\n                    _________________________\n                    {{petitionerName}}\n                    Plaintiff\n                    {{petitionerAddress}}\n                    {{petitionerPhone}}",
      requiredFields: ["court", "petitionerName", "caseNumber", "respondentName", "petitionerAddress", "respondentAddress", "claimDescription", "damageAmount", "petitionerPhone"],
      createdAt: new Date(),
    };

    const nameChange: LegalTemplate = {
      id: randomUUID(),
      name: "Name Change Petition",
      type: "petition",
      category: "civil",
      template: "STATE OF MINNESOTA\nDISTRICT COURT\n{{court}}\n\nIn Re the Matter of the Name Change of:\n{{currentName}}\n\nCase No. {{caseNumber}}\n\nPETITION FOR NAME CHANGE\n\nTO THE HONORABLE COURT:\n\nPetitioner, {{currentName}}, respectfully represents:\n\n1. Petitioner's current legal name is {{currentName}}.\n\n2. Petitioner resides at {{petitionerAddress}}.\n\n3. Petitioner was born on {{birthDate}} at {{birthPlace}}.\n\n4. Petitioner desires to change their name to {{newName}}.\n\n5. The reason for this name change is: {{reasonForChange}}\n\n6. Petitioner is not seeking this name change for any fraudulent or illegal purpose.\n\nWHEREFORE, Petitioner prays that this Court grant the name change from {{currentName}} to {{newName}}.\n\nDated: {{currentDate}}\n\n                    _________________________\n                    {{currentName}}\n                    Petitioner\n                    {{petitionerAddress}}\n                    {{petitionerPhone}}",
      requiredFields: ["court", "currentName", "caseNumber", "petitionerAddress", "birthDate", "birthPlace", "newName", "reasonForChange", "petitionerPhone"],
      createdAt: new Date(),
    };

    const templates = [motionToDismiss, petitionForDissolution, noticeOfAppeal, proHacVice, childCustody, domesticAbuse, smallClaims, nameChange];
    
    templates.forEach(template => {
      this.legalTemplates.set(template.id, template);
    });
  }

  // Document methods
  async createDocument(doc: Omit<Document, "id" | "createdAt">): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...doc,
      id,
      createdAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: string): Promise<Document | null> {
    return this.documents.get(id) || null;
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | null> {
    const existing = this.documents.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Extracted Information methods
  async createExtractedInfo(info: Omit<ExtractedInformation, "id" | "extractedAt">): Promise<ExtractedInformation> {
    const id = randomUUID();
    const extractedInfo: ExtractedInformation = {
      ...info,
      id,
      extractedAt: new Date(),
    };
    this.extractedInfo.set(id, extractedInfo);
    return extractedInfo;
  }

  async getExtractedInfo(id: string): Promise<ExtractedInformation | null> {
    return this.extractedInfo.get(id) || null;
  }

  async getExtractedInfoByDocumentId(documentId: string): Promise<ExtractedInformation | null> {
    for (const info of this.extractedInfo.values()) {
      if (info.documentId === documentId) {
        return info;
      }
    }
    return null;
  }

  async updateExtractedInfo(id: string, updates: Partial<ExtractedInformation>): Promise<ExtractedInformation | null> {
    const existing = this.extractedInfo.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.extractedInfo.set(id, updated);
    return updated;
  }

  // Legal Template methods
  async getAllTemplates(): Promise<LegalTemplate[]> {
    return Array.from(this.legalTemplates.values());
  }

  async getTemplate(id: string): Promise<LegalTemplate | null> {
    return this.legalTemplates.get(id) || null;
  }
}

export const storage = new MemStorage();