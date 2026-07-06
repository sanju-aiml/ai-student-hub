import React, { useState, useEffect } from 'react';
import { User, Shield, HardDrive, Key, Download, Upload, Pin, Trash2, Plus, Brain, MessageSquare, Check, Sparkles } from 'lucide-react';
import { StudentProfile } from '../types';

interface AIMemory {
  id: string;
  type: 'preference' | 'chat_context';
  text: string;
  pinned: boolean;
  createdAt: string;
}

export default function SettingsModule() {
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('student_profile');
    return saved ? JSON.parse(saved) : {
      id: 'student-1',
      name: 'Jane Doe',
      email: 'jane.doe@university.edu',
      avatar: '👩‍💻',
      currentGrade: 'Junior Year',
      major: 'Computer Science & Security',
      xp: 1540,
      badges: ['WAF Guard', 'Math Captain']
    };
  });

  const [isGuestMode, setIsGuestMode] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState('http://localhost:11434');
  const [providerPriority, setProviderPriority] = useState('Local Ollama -> Gemini -> OpenAI');

  const [memories, setMemories] = useState<AIMemory[]>(() => {
    const saved = localStorage.getItem('student_ai_memories');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'm1', type: 'preference', text: 'Prefers TypeScript over JavaScript for all coding tasks & explanations', pinned: true, createdAt: '2026-07-01' },
      { id: 'm2', type: 'preference', text: 'Asks for detailed security audit notes and OWASP Top 10 vulnerabilities', pinned: false, createdAt: '2026-07-03' },
      { id: 'm3', type: 'preference', text: 'Prefers minimalist cyber dark themes for terminal sandboxes', pinned: true, createdAt: '2026-07-05' },
      { id: 'm4', type: 'chat_context', text: 'Chat Context: Implemented Express & SQLite parameterized injection shielding', pinned: false, createdAt: '2026-07-04' },
      { id: 'm5', type: 'chat_context', text: 'Chat Context: Configured real-time login streaks synced securely to Firebase', pinned: false, createdAt: '2026-07-06' },
    ];
  });

  const [newPrefText, setNewPrefText] = useState('');
  const [newMemoryType, setNewMemoryType] = useState<'preference' | 'chat_context'>('preference');
  const [memoryFilter, setMemoryFilter] = useState<'all' | 'preference' | 'chat_context'>('all');
  const [memorySearch, setMemorySearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    localStorage.setItem('student_ai_memories', JSON.stringify(memories));
  }, [memories]);

  const handleAddPreference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrefText.trim()) return;
    
    const newId = `m_${Date.now()}`;
    const newMem: AIMemory = {
      id: newId,
      type: newMemoryType,
      text: newPrefText.trim(),
      pinned: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setMemories([newMem, ...memories]);

    // Sync with RAG knowledge base if type is chat_context
    if (newMemoryType === 'chat_context') {
      try {
        const kbSaved = localStorage.getItem('knowledge_base');
        const kb = kbSaved ? JSON.parse(kbSaved) : [];
        kb.push({
          id: newId,
          title: `Custom context: ${newPrefText.trim().substring(0, 20)}...`,
          content: newPrefText.trim()
        });
        localStorage.setItem('knowledge_base', JSON.stringify(kb));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error("Failed to sync new memory to knowledge base:", err);
      }
    }
    
    setNewPrefText('');
  };

  const handleTogglePin = (id: string) => {
    setMemories(memories.map(m => m.id === id ? { ...m, pinned: !m.pinned } : m));
  };

  const handleDeleteMemory = (id: string) => {
    const memoryToDelete = memories.find(m => m.id === id);
    setMemories(memories.filter(m => m.id !== id));

    // Remove from RAG knowledge base if type was chat_context
    if (memoryToDelete && memoryToDelete.type === 'chat_context') {
      try {
        const kbSaved = localStorage.getItem('knowledge_base');
        if (kbSaved) {
          const kb = JSON.parse(kbSaved);
          const filteredKb = kb.filter((item: any) => item.id !== id);
          localStorage.setItem('knowledge_base', JSON.stringify(filteredKb));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (err) {
        console.error("Failed to delete synced knowledge base item:", err);
      }
    }
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return;
    
    setMemories(memories.map(m => m.id === id ? { ...m, text: editingText.trim() } : m));
    
    // Sync update to RAG knowledge base if applicable
    const memoryToEdit = memories.find(m => m.id === id);
    if (memoryToEdit && memoryToEdit.type === 'chat_context') {
      try {
        const kbSaved = localStorage.getItem('knowledge_base');
        if (kbSaved) {
          const kb = JSON.parse(kbSaved);
          const updatedKb = kb.map((item: any) => 
            item.id === id 
              ? { ...item, content: editingText.trim(), title: `Custom context: ${editingText.trim().substring(0, 20)}...` }
              : item
          );
          localStorage.setItem('knowledge_base', JSON.stringify(updatedKb));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (err) {
        console.error("Failed to edit synced knowledge base item:", err);
      }
    }

    setEditingId(null);
    setEditingText('');
  };

  const filteredMemories = memories
    .filter(m => memoryFilter === 'all' || m.type === memoryFilter)
    .filter(m => m.text.toLowerCase().includes(memorySearch.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('student_profile', JSON.stringify(profile));
    alert('Student profile configurations saved securely!');
  };

  const exportBackupJSON = () => {
    const backupData = {
      profile,
      guestMode: isGuestMode,
      customServerUrl,
      providerPriority,
      tasks: localStorage.getItem('productivity_tasks'),
      calendar: localStorage.getItem('productivity_calendar'),
      knowledgeBase: localStorage.getItem('knowledge_base')
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_os_secure_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.profile) setProfile(data.profile);
        if (data.customServerUrl) setCustomServerUrl(data.customServerUrl);
        if (data.providerPriority) setProviderPriority(data.providerPriority);

        if (data.tasks) localStorage.setItem('productivity_tasks', data.tasks);
        if (data.calendar) localStorage.setItem('productivity_calendar', data.calendar);
        if (data.knowledgeBase) localStorage.setItem('knowledge_base', data.knowledgeBase);

        alert('Backup database imported and encrypted locally successfully!');
        window.location.reload();
      } catch {
        alert('Vulnerability Alert: Malformed backup JSON format detected. Rejected.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A]" id="settings-root">
      {/* Header */}
      <div className="p-6 bg-[#F9F8F6] border-b border-[#1A1A1A] shrink-0">
        <h2 className="text-2xl font-serif font-black italic text-[#1A1A1A] flex items-center gap-2">
          <Shield className="text-[#1A1A1A] h-5 w-5 stroke-[1.5]" /> Profile & System Configurations
        </h2>
        <p className="text-xs text-[#1A1A1A]/60 font-serif mt-1">Configure student identity modules, private backup encryption, and model prioritizers.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity panel */}
          <div className="bg-white p-6 rounded-none border border-[#1A1A1A] shadow-[4px_4px_0px_rgba(26,26,26,0.15)]">
            <h3 className="font-serif font-black italic text-[#1A1A1A] text-sm mb-4 flex items-center gap-1.5 border-b border-[#1A1A1A]/10 pb-2">
              <User className="text-[#1A1A1A] h-4.5 w-4.5" /> Student Identity Card
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="flex items-center gap-3 bg-[#F9F8F6] p-4 rounded-none border border-[#1A1A1A]/20">
                <span className="text-4xl">{profile.avatar}</span>
                <div>
                  <span className="text-[10px] text-[#1A1A1A]/50 font-mono font-bold block">Current Profile</span>
                  <span className="font-serif font-bold text-[#1A1A1A]">{profile.name}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-2 text-xs font-mono text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-2 text-xs font-mono text-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Grade</label>
                  <input
                    type="text"
                    value={profile.currentGrade}
                    onChange={(e) => setProfile({ ...profile, currentGrade: e.target.value })}
                    className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-2 text-xs font-mono text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Major</label>
                  <input
                    type="text"
                    value={profile.major}
                    onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                    className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-2 text-xs font-mono text-[#1A1A1A]"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#1A1A1A] hover:bg-opacity-90 text-[#F9F8F6] text-xs font-mono py-2.5 rounded-none cursor-pointer border border-[#1A1A1A]">
                Save Profile Configuration
              </button>
            </form>
          </div>

          {/* Model prioritizers & Guest Switches */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-none border border-[#1A1A1A] shadow-[4px_4px_0px_rgba(26,26,26,0.15)] space-y-4">
              <h3 className="font-serif font-black italic text-[#1A1A1A] text-sm flex items-center gap-1.5 border-b border-[#1A1A1A]/10 pb-2">
                <Key className="text-[#1A1A1A] h-4.5 w-4.5" /> Model Priorities & Endpoints
              </h3>

              <div>
                <label className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Custom API Server URL</label>
                <input
                  type="text"
                  value={customServerUrl}
                  onChange={(e) => setCustomServerUrl(e.target.value)}
                  className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-2 text-xs font-mono text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Switch Failover Priority</label>
                <input
                  type="text"
                  value={providerPriority}
                  onChange={(e) => setProviderPriority(e.target.value)}
                  className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-2 text-xs font-mono text-[#1A1A1A]"
                />
              </div>

              <div className="flex items-center justify-between bg-[#F9F8F6] p-4 rounded-none border border-[#1A1A1A]/20">
                <div>
                  <span className="font-serif font-bold text-[#1A1A1A] text-xs block">Guest Browsing Mode</span>
                  <span className="text-[10px] text-[#1A1A1A]/60 font-mono block mt-0.5">Encrypts and drops session cookies instantly.</span>
                </div>
                <input
                  type="checkbox"
                  checked={isGuestMode}
                  onChange={(e) => setIsGuestMode(e.target.checked)}
                  className="h-4 w-4 rounded-none border-[#1A1A1A] text-[#1A1A1A] focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Backups / restore */}
            <div className="bg-white p-6 rounded-none border border-[#1A1A1A] shadow-[4px_4px_0px_rgba(26,26,26,0.15)]">
              <h3 className="font-serif font-black italic text-[#1A1A1A] text-sm mb-4 flex items-center gap-1.5 border-b border-[#1A1A1A]/10 pb-2">
                <HardDrive className="text-[#1A1A1A] h-4.5 w-4.5" /> Backup Databases (Export / Import)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={exportBackupJSON}
                  className="bg-[#F9F8F6] hover:bg-[#1A1A1A]/5 text-[#1A1A1A] font-mono py-3.5 rounded-none text-xs flex flex-col items-center justify-center gap-1 cursor-pointer border border-[#1A1A1A]"
                >
                  <Download className="h-5 w-5 text-[#1A1A1A]" />
                  <span>Download Backup</span>
                </button>

                <label className="bg-[#F9F8F6] hover:bg-[#1A1A1A]/5 text-[#1A1A1A] font-mono py-3.5 rounded-none text-xs flex flex-col items-center justify-center gap-1 cursor-pointer border border-[#1A1A1A] border-solid text-center">
                  <Upload className="h-5 w-5 text-[#1A1A1A] mx-auto" />
                  <span className="mt-1">Import Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importBackupJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* AI Memory & Context Manager (Durable Learned Preferences / Chat Context RAG database) */}
        <div className="bg-white p-6 rounded-none border border-[#1A1A1A] shadow-[4px_4px_0px_rgba(26,26,26,0.15)] space-y-6" id="settings-memory-manager">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1A1A1A]/10 pb-4 gap-3">
            <div>
              <h3 className="font-serif font-black italic text-[#1A1A1A] text-lg flex items-center gap-1.5">
                <Brain className="text-accent-gold h-5.5 w-5.5 animate-pulse" /> Student AI Memory Manager
              </h3>
              <p className="text-xs text-[#1A1A1A]/60 font-serif mt-1">
                View, pin, edit, or delete specific chat contexts and learned user preferences that the AI companion uses to customize responses.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono font-bold bg-[#1A1A1A]/5 px-2 py-1 border border-[#1A1A1A]/10 text-[#1A1A1A]">
                TOTAL: {memories.length} MEMORIES
              </span>
              <span className="text-[10px] font-mono font-bold bg-accent-gold/10 px-2 py-1 border border-accent-gold/20 text-accent-gold">
                PINNED: {memories.filter(m => m.pinned).length} ACTIVE
              </span>
            </div>
          </div>

          {/* Quick Creator */}
          <form onSubmit={handleAddPreference} className="p-4 bg-[#F9F8F6] border border-[#1A1A1A]/20 space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#1A1A1A]/60 uppercase tracking-wider block">
              💡 Teach AI Companion (Train Custom Preference or Context)
            </span>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  required
                  placeholder="e.g. Prefers detailed TypeScript breakdowns with security audit guidelines"
                  value={newPrefText}
                  onChange={(e) => setNewPrefText(e.target.value)}
                  className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-2 text-xs font-mono text-[#1A1A1A] placeholder-zinc-400"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={newMemoryType}
                  onChange={(e) => setNewMemoryType(e.target.value as 'preference' | 'chat_context')}
                  className="border border-[#1A1A1A] bg-white outline-none rounded-none px-2 py-2 text-xs font-mono text-[#1A1A1A] h-full"
                >
                  <option value="preference">Personal Preference</option>
                  <option value="chat_context">Chat Context / Topic</option>
                </select>
                <button
                  type="submit"
                  className="bg-[#1A1A1A] hover:bg-zinc-800 text-white font-mono text-xs px-4 py-2 flex items-center gap-1.5 h-full cursor-pointer transition-colors"
                >
                  <Plus className="h-4 w-4" /> Teach
                </button>
              </div>
            </div>
          </form>

          {/* Filter & Search Panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50 p-3 border border-[#1A1A1A]/10">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setMemoryFilter('all')}
                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition cursor-pointer ${
                  memoryFilter === 'all'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-white border border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5'
                }`}
              >
                All Memories
              </button>
              <button
                onClick={() => setMemoryFilter('preference')}
                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition cursor-pointer ${
                  memoryFilter === 'preference'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-white border border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5'
                }`}
              >
                Preferences
              </button>
              <button
                onClick={() => setMemoryFilter('chat_context')}
                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition cursor-pointer ${
                  memoryFilter === 'chat_context'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-white border border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5'
                }`}
              >
                Saved Contexts
              </button>
            </div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search learned memory logs..."
                value={memorySearch}
                onChange={(e) => setMemorySearch(e.target.value)}
                className="w-full border border-[#1A1A1A]/30 focus:border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-1 text-[10px] font-mono text-[#1A1A1A] placeholder-[#1A1A1A]/35"
              />
            </div>
          </div>

          {/* Memories Listing */}
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredMemories.length > 0 ? (
              filteredMemories.map((mem) => {
                const isEditing = editingId === mem.id;
                return (
                  <div
                    key={mem.id}
                    className={`p-3.5 border transition-all duration-200 ${
                      mem.pinned
                        ? 'bg-accent-gold/5 border-accent-gold shadow-[2px_2px_0px_rgba(212,175,55,0.15)]'
                        : 'bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/40'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex flex-col gap-2.5">
                        <textarea
                          rows={2}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-2 border border-[#1A1A1A] text-xs font-mono outline-none bg-[#F9F8F6] text-[#1A1A1A]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditingText('');
                            }}
                            className="px-2.5 py-1 font-mono text-[9px] font-bold border border-[#1A1A1A]/20 hover:bg-black/5 uppercase transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(mem.id)}
                            className="px-3 py-1 font-mono text-[9px] font-bold bg-[#1A1A1A] text-white hover:bg-zinc-800 uppercase transition cursor-pointer flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" /> Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 border ${
                              mem.type === 'preference'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-blue-50 border-blue-200 text-blue-700'
                            }`}>
                              {mem.type === 'preference' ? (
                                <>
                                  <Sparkles className="h-2 w-2 text-emerald-600" /> Learned Preference
                                </>
                              ) : (
                                <>
                                  <MessageSquare className="h-2 w-2 text-blue-600" /> Chat Context RAG
                                </>
                              )}
                            </span>
                            {mem.pinned && (
                              <span className="inline-flex items-center gap-0.5 text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 border bg-amber-50 border-accent-gold/45 text-amber-700 animate-pulse">
                                <Pin className="h-2 w-2 fill-accent-gold text-accent-gold" /> Active Context Priority
                              </span>
                            )}
                            <span className="text-[9px] font-mono text-[#1A1A1A]/40">
                              Logged: {mem.createdAt}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-[#1A1A1A] leading-relaxed break-words">
                            {mem.text}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleTogglePin(mem.id)}
                            className={`p-1.5 border transition-all cursor-pointer ${
                              mem.pinned
                                ? 'bg-accent-gold/10 border-accent-gold text-accent-gold hover:bg-accent-gold/25'
                                : 'bg-transparent border-[#1A1A1A]/10 text-zinc-400 hover:text-accent-gold hover:border-accent-gold/50'
                            }`}
                            title={mem.pinned ? "Unpin Memory (Lower context priority)" : "Pin Memory (Elevate to active context priority)"}
                          >
                            <Pin className={`h-3.5 w-3.5 ${mem.pinned ? 'fill-accent-gold' : ''}`} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(mem.id);
                              setEditingText(mem.text);
                            }}
                            className="p-1.5 border border-[#1A1A1A]/10 text-zinc-400 hover:text-zinc-800 hover:border-[#1A1A1A]/40 transition-all cursor-pointer"
                            title="Edit Memory Text"
                          >
                            <span className="text-[9px] font-mono font-bold px-1 block">EDIT</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMemory(mem.id)}
                            className="p-1.5 border border-transparent text-zinc-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Delete learned memory"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center border border-dashed border-[#1A1A1A]/10 bg-[#1A1A1A]/5">
                <Brain className="h-7 w-7 text-zinc-300 mx-auto mb-2" />
                <span className="text-[10px] font-mono text-[#1A1A1A]/50 uppercase tracking-widest block">
                  No memory profiles found
                </span>
                <span className="text-[9px] font-mono text-[#1A1A1A]/40 block mt-1">
                  Teach your Student AI preferences or use other search filters.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
