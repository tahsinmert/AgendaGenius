import React, { useState, useEffect } from 'react';
import { Layout, Calendar, Sparkles, FileText, ChevronRight, Menu, X, ToggleLeft, ToggleRight } from 'lucide-react';
import FileUpload from './components/FileUpload';
import AgendaTimeline from './components/AgendaTimeline';
import StakeholdersList from './components/StakeholdersList';
import ChatBot from './components/ChatBot';
import ToastContainer, { ToastMessage, ToastType } from './components/Toast';
import { FileData, MeetingData, AgendaItem, Stakeholder } from './types';
import * as realService from './services/geminiService';
import * as mockService from './services/mockService';

function App() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Demo Mode State
  // Default to true if no API key is found in environment
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!process.env.API_KEY);

  const BACKGROUND_VIDEO_URL = "https://cdn.aistudio.google.com/56578052-1981-4357-9d7a-13137888b506/2025-02-14-15-55-16.mp4"; 

  // Select service based on mode
  const currentService = isDemoMode ? mockService : realService;

  const addToast = (message: string, type: ToastType) => {
    setToasts(prev => [...prev, { id: Date.now().toString(), message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleFilesSelected = (newFiles: FileData[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleGenerate = async () => {
    if (files.length === 0) {
      addToast("Please upload at least one file.", "error");
      return;
    }

    setIsGenerating(true);
    setMobileMenuOpen(false); 

    try {
      const data = await currentService.generateAgendaFromFiles(files);
      setMeetingData(data);
      addToast(isDemoMode ? "Demo agenda generated!" : "Agenda generated successfully!", "success");
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Failed to generate agenda.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Editing Handlers ---

  const handleUpdateAgendaItem = (index: number, newItem: AgendaItem) => {
    if (!meetingData) return;
    const newItems = [...meetingData.agendaItems];
    newItems[index] = newItem;
    setMeetingData({ ...meetingData, agendaItems: newItems });
    addToast("Agenda item updated", "success");
  };

  const handleAddStakeholder = (stakeholder: Stakeholder) => {
    if (!meetingData) return;
    setMeetingData({
        ...meetingData,
        stakeholders: [...meetingData.stakeholders, stakeholder]
    });
    addToast("Stakeholder added", "success");
  };

  const handleRemoveStakeholder = (index: number) => {
    if (!meetingData) return;
    const newStakeholders = [...meetingData.stakeholders];
    newStakeholders.splice(index, 1);
    setMeetingData({ ...meetingData, stakeholders: newStakeholders });
    addToast("Stakeholder removed", "info");
  };

  return (
    <div className="relative flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans">
      
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {BACKGROUND_VIDEO_URL && (
            <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover opacity-100"
            >
                <source src={BACKGROUND_VIDEO_URL} type="video/mp4" />
            </video>
        )}
        {/* Optimized Overlay */}
        <div className={`absolute inset-0 ${BACKGROUND_VIDEO_URL ? 'bg-white/85 dark:bg-black/85 backdrop-blur-[2px]' : 'bg-zinc-50 dark:bg-black'}`} />
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Content Wrapper */}
      <div className="relative z-10 flex w-full h-full">
          
          {/* Sidebar */}
          <aside className={`
            fixed md:relative inset-y-0 left-0 w-full md:w-[400px] 
            bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800 
            flex flex-col shadow-2xl z-40 transform transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <img
                      src="/AgendaGenius_logo.png"
                      alt="AgendaGenius logo"
                      className="w-20 h-20 object-contain"
                    />
                    <div>
                    <h1 className="text-xl font-bold tracking-tight">AgendaGenius</h1>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">AI Meeting Architect</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                {/* Demo Mode Toggle */}
                <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <span className="text-sm font-semibold block">Demo Mode</span>
                        <span className="text-xs text-zinc-500">Use mock data (No API Key)</span>
                    </div>
                    <button 
                        onClick={() => setIsDemoMode(!isDemoMode)}
                        className={`transition-colors ${isDemoMode ? 'text-blue-500' : 'text-zinc-400'}`}
                    >
                        {isDemoMode ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-zinc-800 dark:text-zinc-200 font-semibold">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <h2>Context</h2>
                        </div>
                        {files.length > 0 && <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-zinc-500">{files.length} files</span>}
                    </div>
                    
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Upload briefing documents, emails, or transcripts. The AI will extract the structure.
                    </p>
                    <FileUpload 
                        files={files} 
                        onFilesSelected={handleFilesSelected} 
                        onRemoveFile={handleRemoveFile} 
                    />
                </div>

                {meetingData && (
                    <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-left-4">
                        <div className="flex items-center space-x-2 text-zinc-800 dark:text-zinc-200 font-semibold">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            <h2>Actions</h2>
                        </div>
                        <button 
                            onClick={() => { setMeetingData(null); setFiles([]); addToast("Ready for new agenda", "info"); }}
                            className="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-left flex justify-between items-center group"
                        >
                            <span>Create New Agenda</span>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
                        </button>
                    </div>
                )}
            </div>

            <div className="p-6 bg-zinc-50/80 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || files.length === 0}
                    className={`group w-full py-3.5 px-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 overflow-hidden relative
                        ${isDemoMode 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/20'
                            : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-zinc-900/20 dark:shadow-white/10'
                        }`}
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    {isGenerating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{isDemoMode ? 'Simulating...' : 'Building Agenda...'}</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            <span>{isDemoMode ? 'Generate Demo' : 'Generate Agenda'}</span>
                        </>
                    )}
                </button>
                
                <div className="mt-6 text-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold">
                        Coded by
                    </p>
                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
                        Tahsin Mert MUTLU
                    </p>
                </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-transparent p-6 md:p-12 scroll-smooth">
            <div className="max-w-5xl mx-auto min-h-full">
                {!meetingData ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 mt-20 animate-in fade-in duration-1000">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse" />
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <img
                                  src="/AgendaGenius_logo.png"
                                  alt="AgendaGenius logo"
                                  className="w-24 h-24 object-contain"
                                />
                            </div>
                        </div>
                        <div className="space-y-4 max-w-lg">
                            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                Turn documents into <br/>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">actionable plans</span>
                            </h2>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Upload your project briefs or notes on the left. Gemini will structure the meeting, assign roles, and estimate time.
                            </p>
                            {isDemoMode && (
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-sm text-orange-800 dark:text-orange-200">
                                    <strong>Demo Mode Active:</strong> Upload any file to see a simulated result without using an API Key.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12 pb-32">
                        <StakeholdersList 
                            stakeholders={meetingData.stakeholders} 
                            onAdd={handleAddStakeholder}
                            onRemove={handleRemoveStakeholder}
                        />
                        <AgendaTimeline 
                            data={meetingData} 
                            onUpdateItem={handleUpdateAgendaItem}
                            onCopy={() => addToast("Agenda copied to clipboard", "success")}
                        />
                    </div>
                )}
            </div>
          </main>

          {/* Chat Interface - Now context aware */}
          <ChatBot 
            files={files} 
            contextData={meetingData} 
            chatService={currentService.streamChatResponse}
            isDemoMode={isDemoMode}
          />
      </div>

    </div>
  );
}

export default App;