import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MeetingData, FileData } from "../types";

const AGENDA_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    meetingTitle: { type: Type.STRING, description: "A concise and professional title for the meeting." },
    summary: { type: Type.STRING, description: "A brief 2-3 sentence summary of the meeting goals." },
    stakeholders: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
        },
        required: ["name", "role"],
      },
    },
    agendaItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING, description: "Actionable details about what will be discussed." },
          durationMinutes: { type: Type.INTEGER, description: "Estimated time in minutes." },
          presenter: { type: Type.STRING, description: "Suggested presenter based on context, or 'All'" },
        },
        required: ["title", "description", "durationMinutes"],
      },
    },
  },
  required: ["meetingTitle", "summary", "stakeholders", "agendaItems"],
};

export const generateAgendaFromFiles = async (files: FileData[]): Promise<MeetingData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts = files.map(file => ({
    inlineData: {
      mimeType: file.type,
      data: file.content.split(',')[1],
    }
  }));

  parts.push({
    // @ts-ignore
    text: `Analyze the provided document(s) and generate a structured meeting agenda. 
    Identify key stakeholders who should attend. 
    Create a timeline of topics with estimated durations. 
    Ensure the tone is professional and the times are realistic.`
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: AGENDA_SCHEMA,
        systemInstruction: "You are an expert project manager and executive assistant. Your goal is to organize efficient, goal-oriented meetings based on raw documentation.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as MeetingData;
  } catch (error) {
    console.error("Gemini Agenda Generation Error:", error);
    throw error;
  }
};

export const streamChatResponse = async function* (
    history: { role: string; parts: { text: string }[] }[],
    newMessage: string,
    files: FileData[],
    meetingContext: MeetingData | null
) {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = "You are a helpful assistant answering questions about the uploaded meeting documents. " + 
    (meetingContext ? "You also have access to the currently generated/edited meeting agenda. Use this agenda context to answer questions about time, roles, and topics." : "Be concise and accurate.");
  
  const contents = [];
  
  // Reconstruct history
  history.forEach(h => {
      contents.push({
          role: h.role,
          parts: h.parts
      });
  });

  // Current turn construction
  const currentParts: any[] = [{ text: newMessage }];
  
  // If it's the start of a conversation, include files
  if (history.length === 0 && files.length > 0) {
       files.forEach(f => {
           currentParts.unshift({
               inlineData: {
                   mimeType: f.type,
                   data: f.content.split(',')[1]
               }
           });
       });
       currentParts.unshift({ text: "Here are the source documents:" });
  }

  // Always inject the latest meeting context data if available (lightweight text)
  // This allows the user to ask about *edits* they just made in the UI.
  if (meetingContext) {
      currentParts.unshift({
          text: `[CURRENT AGENDA CONTEXT]: ${JSON.stringify(meetingContext)}`
      });
  }

  contents.push({
      role: 'user',
      parts: currentParts
  });

  const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
          systemInstruction,
      }
  });

  for await (const chunk of responseStream as any) {
      const text = typeof chunk.text === 'function' ? chunk.text() : chunk.text;
      if (text) {
        yield text as string;
      }
  }
};