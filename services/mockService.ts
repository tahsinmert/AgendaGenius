import { MeetingData, FileData } from "../types";

// Pre-defined realistic meeting data for demo purposes
const MOCK_MEETING_DATA: MeetingData = {
  meetingTitle: "Q3 Product Launch Strategy",
  summary: "Strategic planning session for the upcoming 'AgendaGenius' mobile app launch. Focus on marketing channels, technical readiness, and budget allocation.",
  stakeholders: [
    { name: "Sarah Connor", role: "Product Owner" },
    { name: "John Smith", role: "Lead Developer" },
    { name: "Emily Blunt", role: "Marketing Director" },
    { name: "Michael Ross", role: "UX Designer" }
  ],
  agendaItems: [
    {
      id: "1",
      title: "Review Q2 Development Milestones",
      description: "Analyze completed features, pending bugs, and overall velocity from the previous quarter.",
      durationMinutes: 15,
      presenter: "John Smith"
    },
    {
      id: "2",
      title: "Marketing Campaign Reveal",
      description: "Presentation of the visual identity, social media roadmap, and influencer partnership targets.",
      durationMinutes: 30,
      presenter: "Emily Blunt"
    },
    {
      id: "3",
      title: "Budget & Resource Allocation",
      description: "Finalizing the budget for ad spend and contracting additional QA support.",
      durationMinutes: 20,
      presenter: "Sarah Connor"
    },
    {
      id: "4",
      title: "Go/No-Go Decision Criteria",
      description: "Defining the critical metrics that must be met 48 hours before launch.",
      durationMinutes: 10,
      presenter: "All"
    }
  ]
};

export const generateAgendaFromFiles = async (_files: FileData[]): Promise<MeetingData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock data regardless of input file in demo mode
  return MOCK_MEETING_DATA;
};

export const streamChatResponse = async function* (
    _history: { role: string; parts: { text: string }[] }[],
    newMessage: string,
    _files: FileData[],
    _meetingContext: MeetingData | null
) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  const demoResponses = [
      "In demo mode, I can confirm the timeline looks tight but achievable.",
      "Based on the mock agenda, Emily is presenting the marketing campaign for 30 minutes.",
      "The main risk identified in this demo scenario is the budget allocation for QA.",
      "I am running in Demo Mode (No API Key). I cannot read your actual file content, but I'm simulating a conversation based on the generated example agenda."
  ];

  // Pick a response based on simple keyword matching or random
  let responseText = demoResponses[3];
  if (newMessage.toLowerCase().includes('who')) responseText = demoResponses[1];
  if (newMessage.toLowerCase().includes('risk')) responseText = demoResponses[2];
  if (newMessage.toLowerCase().includes('time')) responseText = demoResponses[0];

  // Stream the response character by character to simulate typing
  const chunkSize = 5;
  for (let i = 0; i < responseText.length; i += chunkSize) {
      yield responseText.slice(0, i + chunkSize);
      await new Promise(resolve => setTimeout(resolve, 30));
  }
  yield responseText; // Ensure full text is sent at end
};