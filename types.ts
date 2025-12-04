export interface FileData {
    id: string;
    name: string;
    type: string;
    content: string; // Base64 encoded string
    size: number;
}

export interface Stakeholder {
    name: string;
    role: string;
    initials?: string;
}

export interface AgendaItem {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    presenter?: string;
}

export interface MeetingData {
    meetingTitle: string;
    summary: string;
    date?: string;
    stakeholders: Stakeholder[];
    agendaItems: AgendaItem[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}