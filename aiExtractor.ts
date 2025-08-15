import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || ""
});

export interface ExtractedLegalInfo {
  caseNumber?: string;
  court?: string;
  judge?: string;
  petitionerName?: string;
  petitionerAddress?: string;
  petitionerPhone?: string;
  respondentName?: string;
  respondentAddress?: string;
  respondentPhone?: string;
  marriageDate?: string;
  separationDate?: string;
  filingDate?: string;
  additionalInfo?: Record<string, any>;
}

export class AIExtractor {
  async extractLegalInformation(text: string): Promise<ExtractedLegalInfo> {
    try {
      const prompt = `
You are a legal document analysis expert. Extract key information from the following legal document text.
Please analyze the text and extract the following information if present:

- Case number (court case number, file number, etc.)
- Court name (which court/jurisdiction)
- Judge name
- Petitioner name (plaintiff, applicant)
- Petitioner address
- Petitioner phone number
- Respondent name (defendant)
- Respondent address  
- Respondent phone number
- Marriage date
- Separation date
- Filing date
- Any other relevant legal information

Return the information in JSON format with these exact keys:
{
  "caseNumber": "string or null",
  "court": "string or null", 
  "judge": "string or null",
  "petitionerName": "string or null",
  "petitionerAddress": "string or null",
  "petitionerPhone": "string or null",
  "respondentName": "string or null",
  "respondentAddress": "string or null",
  "respondentPhone": "string or null",
  "marriageDate": "string or null",
  "separationDate": "string or null", 
  "filingDate": "string or null",
  "additionalInfo": {}
}

Document text:
${text}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a legal document analysis expert. Extract information accurately and return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No response from AI service");
      }

      const extractedInfo = JSON.parse(content);
      return extractedInfo;

    } catch (error) {
      console.error("AI extraction failed:", error);
      throw new Error(`AI extraction failed: ${error.message}`);
    }
  }

  async analyzeDocumentType(text: string): Promise<{ type: string; category: string; confidence: number }> {
    try {
      const prompt = `
Analyze this legal document text and determine its type and category.

Legal document types include:
- petition (petitions for divorce, probate, etc.)
- motion (motion to dismiss, motion for summary judgment, etc.)
- order (court orders)
- decree (final decrees)
- agreement (settlement agreements, custody agreements)
- notice (notice of hearing, etc.)
- brief (legal briefs, memoranda)

Categories include:
- family (divorce, custody, adoption)
- civil (contract disputes, personal injury)
- criminal (criminal cases)
- probate (wills, estates)
- real estate (property disputes)
- business (corporate law)

Return JSON with:
{
  "type": "document type",
  "category": "legal category", 
  "confidence": 0.95
}

Document text:
${text.substring(0, 2000)}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No response from AI service");
      }

      return JSON.parse(content);

    } catch (error) {
      console.error("Document analysis failed:", error);
      return {
        type: "unknown",
        category: "general",
        confidence: 0.0
      };
    }
  }
}

export const aiExtractor = new AIExtractor();
