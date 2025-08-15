import { type User, type InsertUser, type Document, type InsertDocument, type ExtractedInformation, type InsertExtractedInformation, type LegalTemplate, type InsertLegalTemplate } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  
  createExtractedInformation(info: InsertExtractedInformation): Promise<ExtractedInformation>;
  getExtractedInformationByDocumentId(documentId: string): Promise<ExtractedInformation | undefined>;
  updateExtractedInformation(id: string, updates: Partial<ExtractedInformation>): Promise<ExtractedInformation | undefined>;
  
  getLegalTemplates(): Promise<LegalTemplate[]>;
  getLegalTemplate(id: string): Promise<LegalTemplate | undefined>;
  getLegalTemplatesByType(type: string): Promise<LegalTemplate[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private documents: Map<string, Document>;
  private extractedInformation: Map<string, ExtractedInformation>;
  private legalTemplates: Map<string, LegalTemplate>;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.extractedInformation = new Map();
    this.legalTemplates = new Map();
    
    // Initialize with some default legal templates
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const templates: LegalTemplate[] = [
      // State Court Templates
      {
        id: randomUUID(),
        name: "Motion to Dismiss",
        type: "motion",
        category: "civil",
        template: `STATE OF MINNESOTA
DISTRICT COURT
\{\{court\}\}

\{\{petitionerName\}\},
    Petitioner,
v.
\{\{respondentName\}\},
    Respondent.

Case No. \{\{caseNumber\}\}

MOTION TO DISMISS

TO THE HONORABLE COURT:

Respondent, \{\{respondentName\}\}, hereby moves this Court to dismiss the above-entitled action pursuant to Minn. R. Civ. P. 12.02(e) for failure to state a claim upon which relief can be granted.

This Motion is based upon the pleadings and files herein.

Dated: \{\{currentDate\}\}

                    _________________________
                    Attorney for Respondent
                    \{\{attorneyName\}\}
                    \{\{attorneyAddress\}\}
                    \{\{attorneyPhone\}\}`,
DISTRICT COURT
{{court}}

{{petitionerName}},
    Petitioner,
v.
{{respondentName}},
    Respondent.

Case No. {{caseNumber}}

MOTION TO DISMISS

TO THE HONORABLE COURT:

Respondent, {{respondentName}}, hereby moves this Court to dismiss the above-entitled action pursuant to Minn. R. Civ. P. 12.02(e) for failure to state a claim upon which relief can be granted.

This Motion is based upon the pleadings and files herein.

Dated: {{currentDate}}

                    _________________________
                    Attorney for Respondent
                    {{attorneyName}}
                    {{attorneyAddress}}
                    {{attorneyPhone}}`,
        requiredFields: ["court", "petitionerName", "respondentName", "caseNumber", "attorneyName", "attorneyAddress", "attorneyPhone"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Petition for Dissolution of Marriage",
        type: "petition",
        category: "family",
        template: `STATE OF MINNESOTA
DISTRICT COURT
{{court}}

In Re the Marriage of:
{{petitionerName}},
    Petitioner,
and
{{respondentName}},
    Respondent.

Case No. {{caseNumber}}

PETITION FOR DISSOLUTION OF MARRIAGE

TO THE HONORABLE COURT:

Petitioner respectfully represents:

1. Petitioner's name is {{petitionerName}} and Respondent's name is {{respondentName}}.

2. Petitioner resides at {{petitionerAddress}}.

3. Respondent resides at {{respondentAddress}}.

4. The parties were married on {{marriageDate}}.

5. The parties separated on {{separationDate}}.

6. There has been an irretrievable breakdown of the marriage relationship.

WHEREFORE, Petitioner prays that this Court grant a Decree of Dissolution of Marriage.

Dated: {{currentDate}}

                    _________________________
                    {{petitionerName}}
                    Petitioner
                    {{petitionerAddress}}
                    {{petitionerPhone}}`,
        requiredFields: ["court", "petitionerName", "respondentName", "caseNumber", "petitionerAddress", "respondentAddress", "marriageDate", "separationDate", "petitionerPhone"],
        createdAt: new Date(),
      },
      
      // Federal Court Templates from MN District Court
      {
        id: randomUUID(),
        name: "Notice of Appeal (Civil)",
        type: "notice",
        category: "federal-civil",
        template: `UNITED STATES DISTRICT COURT
DISTRICT OF MINNESOTA

{{petitionerName}},
    Plaintiff,
v.
{{respondentName}},
    Defendant.

Case No. {{caseNumber}}

NOTICE OF APPEAL

Notice is hereby given that {{appelantName}} hereby appeals to the United States Court of Appeals for the Eighth Circuit from the {{judgmentType}} entered in this action on {{judgmentDate}}.

Dated: {{currentDate}}

                    _________________________
                    {{attorneyName}}
                    Attorney for {{appelantName}}
                    {{attorneyAddress}}
                    {{attorneyPhone}}
                    {{attorneyEmail}}`,
        requiredFields: ["petitionerName", "respondentName", "caseNumber", "appelantName", "judgmentType", "judgmentDate", "attorneyName", "attorneyAddress", "attorneyPhone", "attorneyEmail"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Motion for Admission Pro Hac Vice",
        type: "motion",
        category: "federal-attorney",
        template: `UNITED STATES DISTRICT COURT
DISTRICT OF MINNESOTA

{{petitionerName}},
    Plaintiff,
v.
{{respondentName}},
    Defendant.

Case No. {{caseNumber}}

MOTION FOR ADMISSION PRO HAC VICE

TO THE HONORABLE COURT:

Counsel for {{clientName}} hereby moves this Court for an order admitting {{applicantName}} to practice before this Court pro hac vice in this action.

In support of this motion, counsel states:

1. {{applicantName}} is a member in good standing of the bar of {{barState}} and has been since {{admissionDate}}.

2. {{applicantName}} has not been admitted to practice before this Court.

3. {{applicantName}} is qualified and familiar with the standards of practice before this Court.

4. {{localCounselName}} of {{localCounselFirm}} is local counsel and will be responsible for compliance with all local rules.

WHEREFORE, counsel respectfully requests that this Court admit {{applicantName}} to practice pro hac vice in this action.

Dated: {{currentDate}}

                    _________________________
                    {{localCounselName}}
                    Local Counsel
                    {{localCounselAddress}}
                    {{localCounselPhone}}
                    {{localCounselEmail}}`,
        requiredFields: ["petitionerName", "respondentName", "caseNumber", "clientName", "applicantName", "barState", "admissionDate", "localCounselName", "localCounselFirm", "localCounselAddress", "localCounselPhone", "localCounselEmail"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Application to Proceed Without Prepaying Fees (In Forma Pauperis)",
        type: "application",
        category: "federal-civil",
        template: `UNITED STATES DISTRICT COURT
DISTRICT OF MINNESOTA

\{\{petitionerName\}\},
    Plaintiff,
v.
\{\{respondentName\}\},
    Defendant.

Case No. \{\{caseNumber\}\}

APPLICATION TO PROCEED WITHOUT PREPAYING FEES OR COSTS
(AFFIDAVIT IN SUPPORT OF REQUEST TO PROCEED IN FORMA PAUPERIS)

I, \{\{applicantName\}\}, declare under penalty of perjury that the following is true and correct:

1. I am the plaintiff/defendant in this case and am unable to pay the costs of these proceedings.

2. My monthly income is $\{\{monthlyIncome\}\}.

3. My monthly expenses are $\{\{monthlyExpenses\}\}.

4. I have $\{\{cashOnHand\}\} in cash and checking accounts.

5. I own the following property (describe): \{\{propertyDescription\}\}

6. I am \{\{employmentStatus\}\}.

Based on the information above, I declare that I am unable to pay the fees and costs of this proceeding and request permission to proceed in forma pauperis.

I declare under penalty of perjury that the foregoing is true and correct.

Dated: \{\{currentDate\}\}

                    _________________________
                    \{\{applicantName\}\}
                    \{\{applicantAddress\}\}
                    \{\{applicantPhone\}\}`,
        requiredFields: ["petitionerName", "respondentName", "caseNumber", "applicantName", "monthlyIncome", "monthlyExpenses", "cashOnHand", "propertyDescription", "employmentStatus", "applicantAddress", "applicantPhone"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "General Civil Complaint",
        type: "complaint",
        category: "federal-civil",
        template: `UNITED STATES DISTRICT COURT
DISTRICT OF MINNESOTA

{{petitionerName}},
    Plaintiff,
v.
{{respondentName}},
    Defendant.

Case No. {{caseNumber}}

COMPLAINT

Plaintiff, {{petitionerName}}, complaining of Defendant, {{respondentName}}, alleges:

JURISDICTION AND VENUE

1. This Court has jurisdiction over this action pursuant to {{jurisdictionBasis}}.

2. Venue is proper in this District pursuant to {{venueBasis}}.

PARTIES

3. Plaintiff {{petitionerName}} is {{plaintiffDescription}}.

4. Defendant {{respondentName}} is {{defendantDescription}}.

STATEMENT OF CLAIM

5. {{claimStatement}}

6. As a result of Defendant's actions, Plaintiff has suffered damages in the amount of {{damageAmount}}.

WHEREFORE, Plaintiff demands judgment against Defendant for damages in the amount of {{damageAmount}}, plus costs and such other relief as the Court deems just and proper.

Dated: {{currentDate}}

                    _________________________
                    {{attorneyName}}
                    Attorney for Plaintiff
                    {{attorneyAddress}}
                    {{attorneyPhone}}
                    {{attorneyEmail}}`,
        requiredFields: ["petitionerName", "respondentName", "caseNumber", "jurisdictionBasis", "venueBasis", "plaintiffDescription", "defendantDescription", "claimStatement", "damageAmount", "attorneyName", "attorneyAddress", "attorneyPhone", "attorneyEmail"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Notice of Related Cases",
        type: "notice",
        category: "federal-civil",
        template: `UNITED STATES DISTRICT COURT
DISTRICT OF MINNESOTA

{{petitionerName}},
    Plaintiff,
v.
{{respondentName}},
    Defendant.

Case No. {{caseNumber}}

NOTICE OF RELATED CASES

TO THE CLERK OF COURT:

Please take notice that the undersigned believes this case is related to the following pending or recently concluded case(s) in this Court:

1. Case Name: {{relatedCaseName}}
   Case Number: {{relatedCaseNumber}}
   Judge: {{relatedCaseJudge}}
   Relationship: {{relationshipDescription}}

The cases are related because {{reasonForRelation}}.

Dated: {{currentDate}}

                    _________________________
                    {{attorneyName}}
                    Attorney for {{clientName}}
                    {{attorneyAddress}}
                    {{attorneyPhone}}
                    {{attorneyEmail}}`,
        requiredFields: ["petitionerName", "respondentName", "caseNumber", "relatedCaseName", "relatedCaseNumber", "relatedCaseJudge", "relationshipDescription", "reasonForRelation", "attorneyName", "clientName", "attorneyAddress", "attorneyPhone", "attorneyEmail"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Motion to Exclude Time Under Speedy Trial Act",
        type: "motion",
        category: "federal-criminal",
        template: `UNITED STATES DISTRICT COURT
DISTRICT OF MINNESOTA

UNITED STATES OF AMERICA,
    Plaintiff,
v.
{{defendantName}},
    Defendant.

Case No. {{caseNumber}}

MOTION TO EXCLUDE TIME UNDER THE SPEEDY TRIAL ACT

TO THE HONORABLE COURT:

The parties hereby jointly move this Court for an order excluding time under the Speedy Trial Act, 18 U.S.C. § 3161, et seq.

In support of this motion, the parties state:

1. Defendant was arrested on {{arrestDate}} and initial appearance was held on {{initialAppearanceDate}}.

2. The parties require additional time to {{reasonForExclusion}}.

3. Excluding this time is in the interests of justice because {{justificationForExclusion}}.

4. The period to be excluded is from {{startDate}} to {{endDate}}.

WHEREFORE, the parties respectfully request that this Court exclude the above-described time period under the Speedy Trial Act.

Dated: {{currentDate}}

FOR THE GOVERNMENT:            FOR THE DEFENDANT:

_________________________     _________________________
{{prosecutorName}}             {{defenseAttorneyName}}
Assistant U.S. Attorney        Attorney for Defendant
{{prosecutorAddress}}          {{defenseAttorneyAddress}}
{{prosecutorPhone}}            {{defenseAttorneyPhone}}`,
        requiredFields: ["defendantName", "caseNumber", "arrestDate", "initialAppearanceDate", "reasonForExclusion", "justificationForExclusion", "startDate", "endDate", "prosecutorName", "prosecutorAddress", "prosecutorPhone", "defenseAttorneyName", "defenseAttorneyAddress", "defenseAttorneyPhone"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Subpoena to Testify at Hearing or Trial (Criminal)",
        type: "subpoena",
        category: "federal-criminal",
        template: `UNITED STATES DISTRICT COURT
DISTRICT OF MINNESOTA

UNITED STATES OF AMERICA,
    Plaintiff,
v.
{{defendantName}},
    Defendant.

Case No. {{caseNumber}}

SUBPOENA TO TESTIFY AT A HEARING OR TRIAL IN A CRIMINAL CASE

TO: {{witnessName}}
    {{witnessAddress}}

YOU ARE COMMANDED to appear in the United States District Court at the place, date, and time specified below to testify in the above case.

PLACE: {{courtLocation}}

DATE AND TIME: {{hearingDate}} at {{hearingTime}}

You must also bring with you the following documents or objects: {{documentsRequired}}

FAILURE TO APPEAR may result in punishment for contempt of court and the imposition of penalties provided by law.

Date: {{currentDate}}

                              CLERK OF COURT

                    By: _________________________
                        Deputy Clerk

Attorney's Name: {{attorneyName}}
Attorney's Address: {{attorneyAddress}}
Attorney's Phone: {{attorneyPhone}}`,
        requiredFields: ["defendantName", "caseNumber", "witnessName", "witnessAddress", "courtLocation", "hearingDate", "hearingTime", "documentsRequired", "attorneyName", "attorneyAddress", "attorneyPhone"],
        createdAt: new Date(),
      },
      
      // Minnesota State Forms from Law Library
      {
        id: randomUUID(),
        name: "Child Custody and Parenting Time Petition",
        type: "petition",
        category: "family",
        template: `STATE OF MINNESOTA
DISTRICT COURT
{{court}}

In Re the Custody of:
{{childName}},
    Minor Child.

Case No. {{caseNumber}}

PETITION FOR CHILD CUSTODY AND PARENTING TIME

TO THE HONORABLE COURT:

Petitioner, {{petitionerName}}, respectfully represents:

1. Petitioner's name is {{petitionerName}} and resides at {{petitionerAddress}}.

2. Respondent's name is {{respondentName}} and resides at {{respondentAddress}}.

3. The minor child's name is {{childName}}, born {{childBirthDate}}.

4. {{custodyBasis}}

5. Petitioner requests custody and parenting time as follows: {{custodyRequest}}

6. The best interests of the child will be served by granting this petition.

WHEREFORE, Petitioner prays that this Court award custody and establish parenting time as requested.

Dated: {{currentDate}}

                    _________________________
                    {{petitionerName}}
                    Petitioner
                    {{petitionerAddress}}
                    {{petitionerPhone}}`,
        requiredFields: ["court", "childName", "caseNumber", "petitionerName", "petitionerAddress", "respondentName", "respondentAddress", "childBirthDate", "custodyBasis", "custodyRequest", "petitionerPhone"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Domestic Abuse Order for Protection",
        type: "petition",
        category: "protective-order",
        template: `STATE OF MINNESOTA
DISTRICT COURT
{{court}}

{{petitionerName}},
    Petitioner,
v.
{{respondentName}},
    Respondent.

Case No. {{caseNumber}}

PETITION FOR ORDER FOR PROTECTION

TO THE HONORABLE COURT:

Petitioner, {{petitionerName}}, respectfully represents:

1. Petitioner resides at {{petitionerAddress}}.

2. Respondent resides at {{respondentAddress}}.

3. The relationship between Petitioner and Respondent is: {{relationship}}.

4. Respondent has committed domestic abuse against Petitioner as follows: {{abuseDescription}}

5. The abuse occurred on {{abuseDate}} at {{abuseLocation}}.

6. Petitioner fears for their safety and requests protection from this Court.

WHEREFORE, Petitioner prays that this Court issue an Order for Protection restraining Respondent from contact with Petitioner.

Dated: {{currentDate}}

                    _________________________
                    {{petitionerName}}
                    Petitioner
                    {{petitionerAddress}}
                    {{petitionerPhone}}`,
        requiredFields: ["court", "petitionerName", "caseNumber", "respondentName", "petitionerAddress", "respondentAddress", "relationship", "abuseDescription", "abuseDate", "abuseLocation", "petitionerPhone"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Harassment Restraining Order",
        type: "petition",
        category: "protective-order",
        template: `STATE OF MINNESOTA
DISTRICT COURT
{{court}}

{{petitionerName}},
    Petitioner,
v.
{{respondentName}},
    Respondent.

Case No. {{caseNumber}}

PETITION FOR HARASSMENT RESTRAINING ORDER

TO THE HONORABLE COURT:

Petitioner, {{petitionerName}}, respectfully represents:

1. Petitioner resides at {{petitionerAddress}}.

2. Respondent resides at {{respondentAddress}}.

3. Respondent has engaged in harassment against Petitioner as follows: {{harassmentDescription}}

4. The harassment occurred on {{harassmentDate}} at {{harassmentLocation}}.

5. Petitioner requests this Court issue a restraining order to stop the harassment.

WHEREFORE, Petitioner prays that this Court issue a Harassment Restraining Order against Respondent.

Dated: {{currentDate}}

                    _________________________
                    {{petitionerName}}
                    Petitioner
                    {{petitionerAddress}}
                    {{petitionerPhone}}`,
        requiredFields: ["court", "petitionerName", "caseNumber", "respondentName", "petitionerAddress", "respondentAddress", "harassmentDescription", "harassmentDate", "harassmentLocation", "petitionerPhone"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Small Claims Complaint",
        type: "complaint",
        category: "civil",
        template: `STATE OF MINNESOTA
CONCILIATION COURT
{{court}}

{{petitionerName}},
    Plaintiff,
v.
{{respondentName}},
    Defendant.

Case No. {{caseNumber}}

COMPLAINT

Plaintiff, {{petitionerName}}, complaining of Defendant, {{respondentName}}, states:

1. Plaintiff resides at {{petitionerAddress}}.

2. Defendant resides at {{respondentAddress}}.

3. {{claimDescription}}

4. As a result, Defendant owes Plaintiff the sum of ${{damageAmount}}.

5. Demand has been made upon Defendant for payment, but payment has been refused.

WHEREFORE, Plaintiff demands judgment against Defendant for ${{damageAmount}}, plus costs and disbursements.

Dated: {{currentDate}}

                    _________________________
                    {{petitionerName}}
                    Plaintiff
                    {{petitionerAddress}}
                    {{petitionerPhone}}`,
        requiredFields: ["court", "petitionerName", "caseNumber", "respondentName", "petitionerAddress", "respondentAddress", "claimDescription", "damageAmount", "petitionerPhone"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Name Change Petition",
        type: "petition",
        category: "civil",
        template: `STATE OF MINNESOTA
DISTRICT COURT
{{court}}

In Re the Matter of the Name Change of:
{{currentName}}

Case No. {{caseNumber}}

PETITION FOR NAME CHANGE

TO THE HONORABLE COURT:

Petitioner, {{currentName}}, respectfully represents:

1. Petitioner's current legal name is {{currentName}}.

2. Petitioner resides at {{petitionerAddress}}.

3. Petitioner was born on {{birthDate}} at {{birthPlace}}.

4. Petitioner desires to change their name to {{newName}}.

5. The reason for this name change is: {{reasonForChange}}

6. Petitioner is not seeking this name change for any fraudulent or illegal purpose.

WHEREFORE, Petitioner prays that this Court grant the name change from {{currentName}} to {{newName}}.

Dated: {{currentDate}}

                    _________________________
                    {{currentName}}
                    Petitioner
                    {{petitionerAddress}}
                    {{petitionerPhone}}`,
        requiredFields: ["court", "currentName", "caseNumber", "petitionerAddress", "birthDate", "birthPlace", "newName", "reasonForChange", "petitionerPhone"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Criminal Expungement Petition",
        type: "petition",
        category: "criminal",
        template: `STATE OF MINNESOTA
DISTRICT COURT
{{court}}

In Re the Matter of the Expungement of:
{{petitionerName}}

Case No. {{caseNumber}}

PETITION FOR EXPUNGEMENT

TO THE HONORABLE COURT:

Petitioner, {{petitionerName}}, respectfully represents:

1. Petitioner's name is {{petitionerName}} and resides at {{petitionerAddress}}.

2. Petitioner was convicted of {{criminalCharge}} on {{convictionDate}} in {{convictionCourt}}.

3. The case number for the conviction was {{convictionCaseNumber}}.

4. Petitioner has completed all terms of the sentence including {{sentenceCompleted}}.

5. Expungement would benefit Petitioner because {{expungementBenefit}}.

6. The interests of the public and public safety would be served by granting this petition.

WHEREFORE, Petitioner prays that this Court order the expungement of the criminal record.

Dated: {{currentDate}}

                    _________________________
                    {{petitionerName}}
                    Petitioner
                    {{petitionerAddress}}
                    {{petitionerPhone}}`,
        requiredFields: ["court", "petitionerName", "caseNumber", "petitionerAddress", "criminalCharge", "convictionDate", "convictionCourt", "convictionCaseNumber", "sentenceCompleted", "expungementBenefit", "petitionerPhone"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Landlord-Tenant Eviction Complaint",
        type: "complaint",
        category: "housing",
        template: `STATE OF MINNESOTA
DISTRICT COURT
{{court}}

{{petitionerName}},
    Plaintiff,
v.
{{respondentName}},
    Defendant.

Case No. {{caseNumber}}

COMPLAINT FOR UNLAWFUL DETAINER

Plaintiff, {{petitionerName}}, complaining of Defendant, {{respondentName}}, states:

1. Plaintiff is the owner of the property located at {{propertyAddress}}.

2. Defendant is in possession of said property under a {{tenancyType}} tenancy.

3. The monthly rent is ${{monthlyRent}}, due on the {{rentDueDate}} of each month.

4. Defendant is in default as follows: {{defaultDescription}}

5. {{noticeServed}} notice was served on Defendant on {{noticeDate}}.

6. The rental period expired on {{tenancyEndDate}}, and Defendant unlawfully holds over.

WHEREFORE, Plaintiff demands judgment for possession of the premises, rent in the amount of ${{rentOwed}}, and costs.

Dated: {{currentDate}}

                    _________________________
                    {{attorneyName}}
                    Attorney for Plaintiff
                    {{attorneyAddress}}
                    {{attorneyPhone}}`,
        requiredFields: ["court", "petitionerName", "caseNumber", "respondentName", "propertyAddress", "tenancyType", "monthlyRent", "rentDueDate", "defaultDescription", "noticeServed", "noticeDate", "tenancyEndDate", "rentOwed", "attorneyName", "attorneyAddress", "attorneyPhone"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Guardianship Petition",
        type: "petition",
        category: "probate",
        template: `STATE OF MINNESOTA
DISTRICT COURT
PROBATE DIVISION
{{court}}

In Re the Guardianship of:
{{wardName}},
    Ward.

Case No. {{caseNumber}}

PETITION FOR APPOINTMENT OF GUARDIAN

TO THE HONORABLE COURT:

Petitioner, {{petitionerName}}, respectfully represents:

1. Petitioner's name is {{petitionerName}} and resides at {{petitionerAddress}}.

2. The proposed Ward's name is {{wardName}}, born {{wardBirthDate}}, residing at {{wardAddress}}.

3. Ward is {{wardRelationship}} to Petitioner.

4. Ward requires a guardian because {{guardianshipReason}}.

5. Petitioner is qualified to serve as guardian because {{petitionerQualifications}}.

6. The following persons have priority or equal priority to serve as guardian: {{priorityPersons}}.

WHEREFORE, Petitioner prays that this Court appoint Petitioner as guardian of the person and/or estate of {{wardName}}.

Dated: {{currentDate}}

                    _________________________
                    {{petitionerName}}
                    Petitioner
                    {{petitionerAddress}}
                    {{petitionerPhone}}`,
        requiredFields: ["court", "petitionerName", "caseNumber", "wardName", "petitionerAddress", "wardBirthDate", "wardAddress", "wardRelationship", "guardianshipReason", "petitionerQualifications", "priorityPersons", "petitionerPhone"],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Probate Petition for Formal Administration",
        type: "petition",
        category: "probate",
        template: `STATE OF MINNESOTA
DISTRICT COURT
PROBATE DIVISION
{{court}}

In Re the Estate of:
{{decedentName}},
    Decedent.

Case No. {{caseNumber}}

PETITION FOR FORMAL PROBATE OF WILL AND APPOINTMENT OF PERSONAL REPRESENTATIVE

TO THE HONORABLE COURT:

Petitioner, {{petitionerName}}, respectfully represents:

1. Petitioner's name is {{petitionerName}} and resides at {{petitionerAddress}}.

2. Decedent's name was {{decedentName}}, who died on {{deathDate}} at {{deathPlace}}.

3. Decedent was domiciled in {{domicileCounty}} County, Minnesota at the time of death.

4. The original will dated {{willDate}} is filed with this petition.

5. The will names {{namedExecutor}} as personal representative.

6. The approximate value of the estate is ${{estateValue}}.

7. The heirs and devisees are: {{heirsDevisees}}.

WHEREFORE, Petitioner prays that this Court admit the will to probate and appoint {{requestedExecutor}} as personal representative.

Dated: {{currentDate}}

                    _________________________
                    {{petitionerName}}
                    Petitioner
                    {{petitionerAddress}}
                    {{petitionerPhone}}`,
        requiredFields: ["court", "petitionerName", "caseNumber", "decedentName", "petitionerAddress", "deathDate", "deathPlace", "domicileCounty", "willDate", "namedExecutor", "estateValue", "heirsDevisees", "requestedExecutor", "petitionerPhone"],
        createdAt: new Date(),
      }
    ];

    templates.forEach(template => {
      this.legalTemplates.set(template.id, template);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      uploadedAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...updates };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const deleted = this.documents.delete(id);
    // Also delete associated extracted information
    const extractedInfo = Array.from(this.extractedInformation.values()).find(
      info => info.documentId === id
    );
    if (extractedInfo) {
      this.extractedInformation.delete(extractedInfo.id);
    }
    return deleted;
  }

  async createExtractedInformation(insertInfo: InsertExtractedInformation): Promise<ExtractedInformation> {
    const id = randomUUID();
    const info: ExtractedInformation = {
      ...insertInfo,
      id,
      extractedAt: new Date(),
    };
    this.extractedInformation.set(id, info);
    return info;
  }

  async getExtractedInformationByDocumentId(documentId: string): Promise<ExtractedInformation | undefined> {
    return Array.from(this.extractedInformation.values()).find(
      info => info.documentId === documentId
    );
  }

  async updateExtractedInformation(id: string, updates: Partial<ExtractedInformation>): Promise<ExtractedInformation | undefined> {
    const info = this.extractedInformation.get(id);
    if (!info) return undefined;
    
    const updatedInfo = { ...info, ...updates };
    this.extractedInformation.set(id, updatedInfo);
    return updatedInfo;
  }

  async getLegalTemplates(): Promise<LegalTemplate[]> {
    return Array.from(this.legalTemplates.values());
  }

  async getLegalTemplate(id: string): Promise<LegalTemplate | undefined> {
    return this.legalTemplates.get(id);
  }

  async getLegalTemplatesByType(type: string): Promise<LegalTemplate[]> {
    return Array.from(this.legalTemplates.values()).filter(
      template => template.type === type
    );
  }
}

export const storage = new MemStorage();
