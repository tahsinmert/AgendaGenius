import React, { useState } from 'react';
import { AgendaItem, MeetingData } from '../types';
import { Clock, User, Download, Copy, Check, Pencil, X, Save } from 'lucide-react';

interface AgendaTimelineProps {
  data: MeetingData;
  onUpdateItem: (index: number, item: AgendaItem) => void;
  onCopy: () => void;
}

const AgendaTimeline: React.FC<AgendaTimelineProps> = ({ data, onUpdateItem, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<AgendaItem | null>(null);

  // Calculate times
  let currentTime = new Date();
  currentTime.setHours(9, 0, 0, 0);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateEndTime = (startTime: Date, duration: number) => {
    return new Date(startTime.getTime() + duration * 60000);
  };

  const totalDuration = data.agendaItems.reduce((acc, item) => acc + item.durationMinutes, 0);

  const handleCopy = () => {
    const text = `Meeting: ${data.meetingTitle}\n\nSummary: ${data.summary}\n\nAgenda:\n${data.agendaItems.map(item => `- ${item.title} (${item.durationMinutes} min): ${item.description}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `# ${data.meetingTitle}\n\n**Summary:** ${data.summary}\n\n## Stakeholders\n${data.stakeholders.map(s => `- ${s.name} (${s.role})`).join('\n')}\n\n## Agenda\n${data.agendaItems.map(item => `### ${item.title} (${item.durationMinutes} min)\n${item.description}\n*Presenter: ${item.presenter || 'N/A'}*`).join('\n\n')}`;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meeting-agenda.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const startEditing = (index: number, item: AgendaItem) => {
    setEditingIndex(index);
    setEditForm({ ...item });
  };

  const saveEditing = () => {
    if (editForm && editingIndex !== null) {
      onUpdateItem(editingIndex, editForm);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
              {data.meetingTitle}
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">{data.summary}</p>
            <div className="flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium pt-2">
                <Clock className="w-4 h-4" />
                <span>Total Duration: {Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={handleCopy}
                className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                title="Copy to Clipboard"
            >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
            <button 
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium shadow-lg hover:opacity-90 transition-opacity"
            >
                <Download className="w-4 h-4" />
                <span>Export</span>
            </button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative border-l-2 border-dashed border-zinc-300 dark:border-zinc-700 ml-3 md:ml-6 space-y-8 py-4">
        {data.agendaItems.map((item, idx) => {
          const startTime = new Date(currentTime);
          const endTime = calculateEndTime(startTime, item.durationMinutes);
          currentTime = endTime; 
          const isEditing = editingIndex === idx;

          return (
            <div key={idx} className="relative pl-8 md:pl-12 group">
              {/* Timeline Dot */}
              <div className={`absolute -left-[9px] top-6 h-5 w-5 rounded-full border-4 border-white dark:border-zinc-900 shadow-sm transition-transform ${isEditing ? 'bg-green-500 scale-110' : 'bg-blue-500 dark:bg-blue-400 group-hover:scale-125'}`} />
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Time Block */}
                <div className="flex-shrink-0 w-28 pt-6">
                  <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 block">
                    {formatTime(startTime)}
                  </span>
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                    {isEditing && editForm ? (
                        <input 
                            type="number" 
                            className="w-16 bg-transparent border-b border-zinc-300 focus:border-blue-500 outline-none"
                            value={editForm.durationMinutes}
                            onChange={(e) => setEditForm({...editForm, durationMinutes: parseInt(e.target.value) || 0})}
                        />
                    ) : `${item.durationMinutes} min`}
                  </span>
                </div>

                {/* Content Card */}
                <div className={`flex-grow p-6 backdrop-blur-md rounded-2xl border transition-all 
                    ${isEditing 
                        ? 'bg-white dark:bg-zinc-900 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xl z-10' 
                        : 'bg-white/60 dark:bg-zinc-900/60 border-zinc-200/50 dark:border-zinc-700/50 shadow-sm hover:shadow-lg hover:bg-white/80 dark:hover:bg-zinc-900/80'
                    }`}>
                    
                    {isEditing && editForm ? (
                        <div className="space-y-4">
                            <input 
                                className="w-full text-lg font-bold text-zinc-800 dark:text-zinc-100 bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:border-blue-500 outline-none pb-1"
                                value={editForm.title}
                                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                placeholder="Topic Title"
                            />
                            <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-zinc-400" />
                                <input 
                                    className="flex-1 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 focus:border-blue-500 outline-none"
                                    value={editForm.presenter || ''}
                                    onChange={(e) => setEditForm({...editForm, presenter: e.target.value})}
                                    placeholder="Presenter"
                                />
                            </div>
                            <textarea 
                                className="w-full text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 focus:border-blue-500 outline-none resize-y min-h-[80px]"
                                value={editForm.description}
                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                placeholder="Description"
                            />
                            <div className="flex justify-end space-x-2 pt-2">
                                <button onClick={cancelEditing} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                                <button onClick={saveEditing} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors">
                                    <Save className="w-4 h-4" />
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                                <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{item.title}</h3>
                                <div className="flex items-center space-x-2 self-start">
                                    {item.presenter && (
                                        <div className="flex items-center space-x-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-100 dark:border-blue-800">
                                            <User className="w-3 h-3" />
                                            <span>{item.presenter}</span>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => startEditing(idx, item)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                        title="Edit Item"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </>
                    )}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* End Marker */}
        <div className="relative pl-8 md:pl-12 pt-4">
            <div className="absolute -left-[6px] top-5 h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <div className="flex items-center space-x-2 text-zinc-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Meeting End ({formatTime(currentTime)})</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaTimeline;