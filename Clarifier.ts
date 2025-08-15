// server/services/clarifier.ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export class Clarifier {
  history: QuestionAnswer[] = [];

  addQA(question: string, answer: string) {
    this.history.push({ question, answer });
  }

  getHistory() {
    return this.history;
  }

  async generateQuestions(documentType: string, confidence: number, extractedInfo: object) {
    const numQuestions = confidence > 0.85 ? 1 : 3;

    const prompt = `
      You are a legal assistant.
      Document type: ${documentType}
      Extracted info: ${JSON.stringify(extractedInfo)}
      Confidence: ${confidence}
      Generate ${numQuestions} clarifying questions to complete this legal document.
      Keep them concise and relevant.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    return response.choices[0].message.content?.split("\n").filter(q => q.trim() !== "");
  }

  suggestAnswers(question: string): string[] | null {
    if (question.toLowerCase().includes("jurisdiction")) {
      return ["Federal", "State", "County"];
    }
    if (question.toLowerCase().includes("filing date")) {
      return ["Today", "Next Week", "Custom Date"];
    }
    return null;
  }
}
