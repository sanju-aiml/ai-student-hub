import React, { useState, useEffect, useRef } from 'react';
import { Calendar, CheckSquare, Clock, BookOpen, Award, BarChart3, Plus, Trash2, Play, Pause, RotateCcw, Flame, CheckCircle, Brain, X } from 'lucide-react';
import { Task, StudyNote, CalendarEvent } from '../types';

export default function ProductivityModule() {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'planner' | 'pomodoro' | 'tasks'>('dashboard');

  const [streakCount, setStreakCount] = useState<number>(() => {
    const saved = localStorage.getItem('study_streak_count');
    return saved ? parseInt(saved, 10) : 4;
  });
  const [lastCheckIn, setLastCheckIn] = useState<string>(() => {
    return localStorage.getItem('study_streak_last_checkin') || '';
  });

  const handleCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    if (lastCheckIn === today) {
      alert("You have already checked in for today!");
      return;
    }

    let newStreak = streakCount;
    if (lastCheckIn) {
      const lastDate = new Date(lastCheckIn);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1; // Reset streak if missed days
      } else {
        newStreak += 1;
      }
    } else {
      newStreak = 5; // Increment from initial 4
    }

    setStreakCount(newStreak);
    setLastCheckIn(today);
    localStorage.setItem('study_streak_count', newStreak.toString());
    localStorage.setItem('study_streak_last_checkin', today);
  };

  // Marginalia Notes interface & local states
  interface MarginaliaNote {
    id: string;
    targetId: string;
    targetType: 'task' | 'file';
    title: string;
    content: string;
    annotation: string;
    anchorText?: string;
    colorTheme: 'yellow' | 'blue' | 'red' | 'green' | 'charcoal';
    createdAt: string;
  }

  const [showMarginalia, setShowMarginalia] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteFilter, setNoteFilter] = useState<string>('all');

  const [marginaliaNotes, setMarginaliaNotes] = useState<MarginaliaNote[]>(() => {
    const saved = localStorage.getItem('productivity_marginalia');
    return saved ? JSON.parse(saved) : [
      {
        id: 'mn-1',
        targetId: 't1',
        targetType: 'task',
        title: 'AES substitution network',
        content: 'Requires S-box operations which are mathematically secure against linear cryptanalysis.',
        annotation: 'Key aspect to memorize for the midterm exam next Friday. Double check Rijndael S-box details.',
        anchorText: 'Study AES & DES security proofs',
        colorTheme: 'yellow',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mn-2',
        targetId: 'lecture_notes_week1.pdf',
        targetType: 'file',
        title: 'OWASP Injection Guard',
        content: 'Any external data source used in dynamic queries must be sanitized via strict escaping rules.',
        annotation: 'Verify whether the server rate-limiting is sufficient to slow down brute force injection attempts.',
        anchorText: 'A03:2021-Injection defense patterns',
        colorTheme: 'blue',
        createdAt: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('productivity_marginalia', JSON.stringify(marginaliaNotes));
  }, [marginaliaNotes]);

  // Form states for new Marginalia note
  const [newNoteTarget, setNewNoteTarget] = useState('t1'); // can be task id or file name
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteAnchorText, setNewNoteAnchorText] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteAnnotation, setNewNoteAnnotation] = useState('');
  const [newNoteColorTheme, setNewNoteColorTheme] = useState<'yellow' | 'blue' | 'red' | 'green' | 'charcoal'>('yellow');

  const handleAddMarginalia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteAnnotation.trim()) return;

    // Check if target is in current tasks
    const isTask = tasks.some(t => t.id === newNoteTarget);

    const newNote: MarginaliaNote = {
      id: `mn-${Date.now()}`,
      targetId: newNoteTarget,
      targetType: isTask ? 'task' : 'file',
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      annotation: newNoteAnnotation.trim(),
      anchorText: newNoteAnchorText.trim() || undefined,
      colorTheme: newNoteColorTheme,
      createdAt: new Date().toISOString()
    };

    setMarginaliaNotes(prev => [newNote, ...prev]);
    // Reset form
    setNewNoteTitle('');
    setNewNoteAnchorText('');
    setNewNoteContent('');
    setNewNoteAnnotation('');
    setIsAddingNote(false);
  };

  const handleDeleteMarginalia = (id: string) => {
    setMarginaliaNotes(prev => prev.filter(n => n.id !== id));
  };

  // In-memory local states with safe local persistence
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('productivity_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 't1', title: 'Revise cryptography lecture notes', description: 'Study AES & DES security proofs', dueDate: '2026-07-06', completed: false, priority: 'high', category: 'study', pomodorosSpent: 1, pomodorosEstimated: 3 },
      { id: 't2', title: 'Prepare presentation deck', description: 'Assemble full-stack engineering diagrams', dueDate: '2026-07-08', completed: true, priority: 'medium', category: 'assignment', pomodorosSpent: 2, pomodorosEstimated: 2 }
    ];
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('productivity_calendar');
    return saved ? JSON.parse(saved) : [
      { id: 'e1', title: 'Full-Stack exam demo', date: '2026-07-10', type: 'exam', description: 'Bring secure coding guidelines' },
      { id: 'e2', title: 'Project proposal submission', date: '2026-07-12', type: 'deadline', description: 'Upload encrypted ZIP artifact' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('productivity_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('productivity_calendar', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  // Pomodoro Timer States
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // New item forms
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<'study' | 'exam' | 'assignment' | 'personal'>('study');
  const [newCalTitle, setNewCalTitle] = useState('');
  const [newCalDate, setNewCalDate] = useState('');
  const [newCalType, setNewCalType] = useState<'exam' | 'deadline' | 'study_group' | 'reminder'>('reminder');

  // Pomodoro Loop Tick
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(prev => prev - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer expired
            clearInterval(timerRef.current!);
            setIsActive(false);
            if (!isBreak) {
              setMinutes(5); // 5 min break
              setIsBreak(true);
              alert('Pomodoro completed! Take a well-deserved breaks.');
            } else {
              setMinutes(25); // Back to work
              setIsBreak(false);
              alert('Break over! Back to deep work mode.');
            }
          } else {
            setMinutes(prev => prev - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, minutes, seconds, isBreak]);

  const toggleTaskCompletion = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
      pomodorosSpent: 0,
      pomodorosEstimated: 2
    };
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
  };

  const handleAddCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalTitle.trim() || !newCalDate) return;
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newCalTitle.trim(),
      date: newCalDate,
      type: newCalType,
      description: ''
    };
    setCalendarEvents(prev => [...prev, newEvent]);
    setNewCalTitle('');
    setNewCalDate('');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  // Calculations for analytics
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const studyStreak = streakCount; // Simulated daily study streak

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A]" id="productivity-root">
      {/* Upper Navigation Rail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#F9F8F6] border-b border-[#1A1A1A]">
        <div>
          <h2 className="text-2xl font-serif font-black italic text-[#1A1A1A] flex items-center gap-2">
            <CheckSquare className="text-[#1A1A1A] h-5 w-5 stroke-[1.5]" /> Student Productivity Suite
          </h2>
          <p className="text-xs text-[#1A1A1A]/60 font-serif mt-1">Manage deep study intervals, schedule key milestones, and review metrics.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-none border border-[#1A1A1A] shadow-[2px_2px_0px_rgba(26,26,26,0.15)] mt-4 sm:mt-0 select-none">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'planner', name: 'Milestone Planner', icon: Calendar },
              { id: 'pomodoro', name: 'Pomodoro Timer', icon: Clock },
              { id: 'tasks', name: 'Task Manager', icon: CheckSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-mono transition cursor-pointer ${
                    activeSubTab === tab.id
                      ? 'bg-[#1A1A1A] text-[#F9F8F6]'
                      : 'text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {tab.name}
                </button>
              );
            })}
            <button
              onClick={() => setShowMarginalia(!showMarginalia)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#1A1A1A] rounded-none border border-[#1A1A1A] shadow-[2px_2px_0px_rgba(26,26,26,0.15)] hover:bg-[#1A1A1A]/5 text-xs font-mono font-bold cursor-pointer transition select-none ml-2"
              title="Toggle Marginalia annotated side-notes panel"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>{showMarginalia ? 'Hide Margin Notes' : 'Show Margin Notes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar Split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            {activeSubTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                {/* Stats Cards */}
                <div className="bg-white p-6 rounded-none border border-[#1A1A1A] shadow-[3px_3px_0px_rgba(26,26,26,0.15)] flex flex-col justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-[#1A1A1A] text-[#F9F8F6] rounded-none flex items-center justify-center border border-[#1A1A1A]">
                      <Flame className="h-5 w-5 text-amber-500 fill-current animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#1A1A1A]/50 font-mono uppercase tracking-widest block">Study Streak</span>
                      <span className="text-xl font-serif font-bold italic text-[#1A1A1A]">{streakCount} Days</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-dashed border-[#1A1A1A]/15">
                    {lastCheckIn === new Date().toISOString().split('T')[0] ? (
                      <div className="text-center text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 py-1.5 border border-emerald-300">
                        ✓ CHECKED IN TODAY
                      </div>
                    ) : (
                      <button
                        onClick={handleCheckIn}
                        className="w-full bg-[#1A1A1A] hover:bg-opacity-90 text-[#F9F8F6] text-[9px] font-mono font-bold uppercase py-1.5 border border-[#1A1A1A] cursor-pointer"
                      >
                        ⚡ CHECK IN TODAY
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-none border border-[#1A1A1A] shadow-[3px_3px_0px_rgba(26,26,26,0.15)] flex items-center gap-4">
                  <div className="h-10 w-10 bg-[#1A1A1A] text-[#F9F8F6] rounded-none flex items-center justify-center border border-[#1A1A1A]">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#1A1A1A]/50 font-mono uppercase tracking-widest block">Task Completion Rate</span>
                    <span className="text-xl font-serif font-bold italic text-[#1A1A1A]">{completionRate}%</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-none border border-[#1A1A1A] shadow-[3px_3px_0px_rgba(26,26,26,0.15)] flex items-center gap-4">
                  <div className="h-10 w-10 bg-[#1A1A1A] text-[#F9F8F6] rounded-none flex items-center justify-center border border-[#1A1A1A]">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#1A1A1A]/50 font-mono uppercase tracking-widest block">Achievements Unlock</span>
                    <span className="text-xl font-serif font-bold italic text-[#1A1A1A]">Elite Defender</span>
                  </div>
                </div>

                {/* SVG Progress chart visualizers */}
                <div className="bg-white p-6 rounded-none border border-[#1A1A1A] shadow-[4px_4px_0px_rgba(26,26,26,0.15)] md:col-span-2">
                  <h3 className="font-serif font-black italic text-[#1A1A1A] text-sm mb-4">Deep Focus Hours (Past Week)</h3>
                  <div className="h-44 w-full flex items-end justify-between px-4 pt-4 border-b border-[#1A1A1A]">
                    {[
                      { day: 'Mon', hrs: 2.5 },
                      { day: 'Tue', hrs: 4.0 },
                      { day: 'Wed', hrs: 1.5 },
                      { day: 'Thu', hrs: 5.2 },
                      { day: 'Fri', hrs: 3.0 },
                      { day: 'Sat', hrs: 6.0 },
                      { day: 'Sun', hrs: 2.0 }
                    ].map((d, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-[9px] font-mono text-[#1A1A1A]/60">{d.hrs}h</span>
                        <div
                          className="w-8 bg-[#1A1A1A] hover:opacity-90 transition rounded-none border border-[#1A1A1A]"
                          style={{ height: `${(d.hrs / 6) * 120}px` }}
                        />
                        <span className="text-[9px] font-mono font-bold text-[#1A1A1A]/60 mt-1">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Badges Drawer */}
                <div className="bg-white p-6 rounded-none border border-[#1A1A1A] shadow-[4px_4px_0px_rgba(26,26,26,0.15)]">
                  <h3 className="font-serif font-black italic text-[#1A1A1A] text-sm mb-4 flex items-center gap-2">
                    <Award className="text-[#1A1A1A] h-4.5 w-4.5" /> Academic Milestones
                  </h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { name: 'Deep Focus Cadet', desc: 'Finished 5 deep work pomodoros.', unlocked: true },
                      { name: 'Math Blitz Captain', desc: 'Scored 100+ points on math games.', unlocked: true },
                      { name: 'WAF Guard', desc: 'Warded off an injection test payload.', unlocked: true },
                      { name: 'Doc Optimizer', desc: 'Uploaded clear validated resumes.', unlocked: false }
                    ].map((b, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 rounded-none border border-[#1A1A1A]/10 bg-[#F9F8F6]">
                        <span className={`h-8 w-8 rounded-none border flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                          b.unlocked ? 'bg-[#1A1A1A] text-[#F9F8F6] border-[#1A1A1A]' : 'bg-white text-[#1A1A1A]/30 border-dashed border-[#1A1A1A]/30'
                        }`}>
                          ★
                        </span>
                        <div>
                          <h4 className={`text-xs font-serif font-bold ${b.unlocked ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/40'}`}>{b.name}</h4>
                          <p className="text-[10px] text-[#1A1A1A]/50 mt-0.5">{b.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'planner' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                {/* Add calendar form */}
                <div className="bg-white p-6 rounded-none border border-[#1A1A1A] shadow-[4px_4px_0px_rgba(26,26,26,0.15)] h-fit">
                  <h3 className="font-serif font-black italic text-[#1A1A1A] text-sm mb-4 flex items-center gap-1.5">
                    <Calendar className="text-[#1A1A1A] h-4.5 w-4.5" /> Schedule Milestone
                  </h3>
                  <form onSubmit={handleAddCalendar} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={newCalTitle}
                        onChange={(e) => setNewCalTitle(e.target.value)}
                        className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-2 text-xs font-mono"
                        placeholder="E.g., Algorithms Midterm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Target Date</label>
                      <input
                        type="date"
                        required
                        value={newCalDate}
                        onChange={(e) => setNewCalDate(e.target.value)}
                        className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-2 text-xs font-mono text-[#1A1A1A]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Milestone Type</label>
                      <select
                        value={newCalType}
                        onChange={(e) => setNewCalType(e.target.value as any)}
                        className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-2 text-xs font-mono text-[#1A1A1A]"
                      >
                        <option value="exam">Major Examination</option>
                        <option value="deadline">Submission Deadline</option>
                        <option value="study_group">Study Group Session</option>
                        <option value="reminder">Personal Reminder</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-[#1A1A1A] hover:bg-opacity-90 text-[#F9F8F6] text-xs font-mono uppercase tracking-wider py-2.5 rounded-none cursor-pointer border border-[#1A1A1A]">
                      Append Calendar Event
                    </button>
                  </form>
                </div>

                {/* Events List */}
                <div className="bg-white p-6 rounded-none border border-[#1A1A1A] shadow-[4px_4px_0px_rgba(26,26,26,0.15)] md:col-span-2">
                  <h3 className="font-serif font-black italic text-[#1A1A1A] text-sm mb-4">Milestones & Deadlines Calendar</h3>
                  <div className="space-y-3">
                    {calendarEvents.length === 0 ? (
                      <p className="text-[#1A1A1A]/40 text-xs font-serif text-center py-8">No milestones scheduled. Keep organizing!</p>
                    ) : (
                      calendarEvents.map((evt) => (
                        <div key={evt.id} className="flex items-center justify-between p-4 bg-[#F9F8F6] rounded-none border border-[#1A1A1A]/10">
                          <div className="flex items-start gap-3">
                            <span className={`h-8 w-8 rounded-none border flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                              evt.type === 'exam' ? 'bg-red-50 text-red-600 border-red-300' :
                              evt.type === 'deadline' ? 'bg-amber-50 text-amber-600 border-amber-300' :
                              'bg-blue-50 text-blue-600 border-blue-300'
                            }`}>
                              ★
                            </span>
                            <div>
                              <h4 className="text-xs font-serif font-bold text-[#1A1A1A]">{evt.title}</h4>
                              <p className="text-[10px] font-mono text-[#1A1A1A]/50 mt-0.5">{evt.date}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteEvent(evt.id)} className="text-[#1A1A1A]/40 hover:text-rose-600 p-1 rounded-none">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'pomodoro' && (
              <div className="max-w-md mx-auto bg-white p-8 rounded-none border border-[#1A1A1A] shadow-[4px_4px_0px_rgba(26,26,26,0.15)] text-center animate-fade-in">
                <h3 className="text-base font-serif font-black italic text-[#1A1A1A] flex items-center justify-center gap-1.5 mb-2">
                  <Brain className="text-[#1A1A1A] h-4.5 w-4.5 stroke-[1.5]" /> Deep Study Pomodoro
                </h3>
                <p className="text-xs text-[#1A1A1A]/60 font-serif mb-8">Maintain deep focus using 25-minute intervals. Avoid distracting tabs.</p>

                <div className="text-6xl font-mono font-black text-[#1A1A1A] tracking-tight my-8 select-none">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>

                <p className="text-[10px] font-mono font-bold text-[#1A1A1A] bg-[#F9F8F6] border border-[#1A1A1A] py-1 px-3 inline-block rounded-none mb-8">
                  {isBreak ? '☕ RESTING BREAK ACTIVE' : '⚡ DEEP INTELLECTUAL WORK'}
                </p>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className="bg-[#1A1A1A] hover:bg-opacity-90 text-[#F9F8F6] font-mono text-xs px-6 py-3 rounded-none cursor-pointer border border-[#1A1A1A]"
                  >
                    {isActive ? 'Pause Timer' : 'Start Focus'}
                  </button>
                  <button
                    onClick={() => {
                      setIsActive(false);
                      setIsBreak(false);
                      setMinutes(25);
                      setSeconds(0);
                    }}
                    className="bg-white hover:bg-slate-50 text-[#1A1A1A] font-mono text-xs px-4 py-3 rounded-none cursor-pointer border border-[#1A1A1A]"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {activeSubTab === 'tasks' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                {/* Add Task Form */}
                <div className="bg-white p-6 rounded-none border border-[#1A1A1A] shadow-[4px_4px_0px_rgba(26,26,26,0.15)] h-fit">
                  <h3 className="font-serif font-black italic text-[#1A1A1A] text-sm mb-4">Append Active Task</h3>
                  <form onSubmit={handleAddTask} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Task Title</label>
                      <input
                        type="text"
                        required
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-2 text-xs font-mono"
                        placeholder="E.g., Complete math workbook"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-2 text-xs font-mono text-[#1A1A1A]"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Category</label>
                      <select
                        value={newTaskCategory}
                        onChange={(e) => setNewTaskCategory(e.target.value as any)}
                        className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-3 py-2 text-xs font-mono text-[#1A1A1A]"
                      >
                        <option value="study">Study</option>
                        <option value="exam">Exam</option>
                        <option value="assignment">Assignment</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-[#1A1A1A] hover:bg-opacity-90 text-[#F9F8F6] text-xs font-mono uppercase tracking-wider py-2.5 rounded-none cursor-pointer border border-[#1A1A1A]">
                      Save Task
                    </button>
                  </form>
                </div>

                {/* Tasks list */}
                <div className="bg-white p-6 rounded-none border border-[#1A1A1A] shadow-[4px_4px_0px_rgba(26,26,26,0.15)] md:col-span-2">
                  <h3 className="font-serif font-black italic text-[#1A1A1A] text-sm mb-4">Todo Checklist</h3>
                  <div className="space-y-3">
                    {tasks.length === 0 ? (
                      <p className="text-[#1A1A1A]/40 text-xs font-serif text-center py-8">All tasks cleared. Good work!</p>
                    ) : (
                      tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-4 rounded-none border transition border-[#1A1A1A]/10 bg-[#F9F8F6]"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTaskCompletion(task.id)}
                              className="h-4.5 w-4.5 rounded-none border border-[#1A1A1A] text-[#1A1A1A] focus:ring-0 cursor-pointer"
                            />
                            <div>
                              <span className={`text-xs font-serif font-bold ${task.completed ? 'line-through text-[#1A1A1A]/40 font-normal' : 'text-[#1A1A1A]'}`}>
                                {task.title}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border border-[#1A1A1A] bg-white text-[#1A1A1A]`}>
                                  {task.priority}
                                </span>
                                <span className="text-[10px] text-[#1A1A1A]/40 font-mono">Category: {task.category}</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteTask(task.id)} className="text-[#1A1A1A]/40 hover:text-rose-600 p-1.5 rounded-none cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Marginalia Sidebar panel */}
        {showMarginalia ? (
          <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-[#1A1A1A] flex flex-col shrink-0 overflow-hidden" id="marginalia-sidebar">
            {/* Header of Marginalia */}
            <div className="p-4 bg-[#F9F8F6] border-b border-[#1A1A1A] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black italic text-[#1A1A1A] text-sm">✒ Marginalia Notes</span>
                <span className="text-[10px] bg-[#1A1A1A] text-[#F9F8F6] px-1.5 py-0.5 font-mono rounded-none font-bold">
                  {marginaliaNotes.length} ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="px-2 py-1 text-[10px] font-mono border border-[#1A1A1A] bg-white hover:bg-[#1A1A1A]/5 text-[#1A1A1A] rounded-none cursor-pointer"
                >
                  {isAddingNote ? '← Back' : '+ Add'}
                </button>
                <button
                  onClick={() => setShowMarginalia(false)}
                  className="p-1 text-[#1A1A1A]/60 hover:text-[#1A1A1A] rounded-none cursor-pointer"
                  title="Close Sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-4 bg-white space-y-4">
              {isAddingNote ? (
                /* ADD NOTE FORM */
                <form onSubmit={handleAddMarginalia} className="space-y-3.5">
                  <h4 className="text-[10px] font-mono font-bold text-[#1A1A1A]/60 uppercase tracking-widest border-b border-[#1A1A1A]/10 pb-1">Create Margin Critique</h4>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Select Study Target</label>
                    <select
                      value={newNoteTarget}
                      onChange={(e) => setNewNoteTarget(e.target.value)}
                      className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-2 py-1.5 text-xs font-mono text-[#1A1A1A]"
                    >
                      <optgroup label="Active Productivity Tasks">
                        {tasks.map(t => (
                          <option key={t.id} value={t.id}>Task: {t.title.substring(0, 32)}...</option>
                        ))}
                      </optgroup>
                      <optgroup label="Reference Study Files">
                        <option value="lecture_notes_week1.pdf">File: lecture_notes_week1.pdf</option>
                        <option value="main.cpp">File: main.cpp</option>
                        <option value="syllabus.md">File: syllabus.md</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Annotation Heading</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. SPN vs Feistel"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-2.5 py-1.5 text-xs font-sans text-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Underline Source Quote (Optional)</label>
                    <input
                      type="text"
                      placeholder="E.g. Study AES & DES security proofs"
                      value={newNoteAnchorText}
                      onChange={(e) => setNewNoteAnchorText(e.target.value)}
                      className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none px-2.5 py-1.5 text-xs font-sans text-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Highlighted Reference Fact (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="E.g. AES S-box uses inversion in GF(2^8) followed by an affine transformation."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none p-2 text-xs font-mono text-[#1A1A1A] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Your Margin Critique / Thought</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="E.g. Rijndael design allows efficient bitsliced implementations. Memorize GF(2^8) generator polynomial."
                      value={newNoteAnnotation}
                      onChange={(e) => setNewNoteAnnotation(e.target.value)}
                      className="w-full border border-[#1A1A1A] bg-white outline-none rounded-none p-2 text-xs font-sans text-[#1A1A1A] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">Highlighter Ink Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      {(['yellow', 'blue', 'red', 'green', 'charcoal'] as const).map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewNoteColorTheme(color)}
                          className={`h-5 w-5 rounded-none border border-[#1A1A1A] cursor-pointer transition ${
                            newNoteColorTheme === color ? 'ring-2 ring-offset-1 ring-[#1A1A1A]' : 'opacity-70'
                          } ${
                            color === 'yellow' ? 'bg-amber-100' :
                            color === 'blue' ? 'bg-sky-100' :
                            color === 'red' ? 'bg-rose-100' :
                            color === 'green' ? 'bg-emerald-100' :
                            'bg-zinc-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1A1A1A] hover:bg-opacity-90 text-[#F9F8F6] text-xs font-mono py-2 rounded-none border border-[#1A1A1A] cursor-pointer mt-2"
                  >
                    Attach Margin Annotation
                  </button>
                </form>
              ) : (
                /* NOTES LIST */
                <div className="space-y-4">
                  {/* Filter bar */}
                  <div className="bg-[#F9F8F6] p-2 border border-[#1A1A1A]/10 flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-[#1A1A1A]/50 uppercase">Filter notes:</span>
                    <select
                      value={noteFilter}
                      onChange={(e) => setNoteFilter(e.target.value)}
                      className="text-[10px] font-mono bg-transparent border-none outline-none text-[#1A1A1A] cursor-pointer max-w-[180px] truncate"
                    >
                      <option value="all">📚 All Targets</option>
                      <optgroup label="Active Tasks">
                        {tasks.map(t => (
                          <option key={t.id} value={t.id}>Task: {t.title}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Reference Files">
                        <option value="lecture_notes_week1.pdf">File: lecture_notes_week1.pdf</option>
                        <option value="main.cpp">File: main.cpp</option>
                        <option value="syllabus.md">File: syllabus.md</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Render filtered notes */}
                  {(() => {
                    const filtered = marginaliaNotes.filter(n => noteFilter === 'all' || n.targetId === noteFilter);
                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-10 font-serif italic text-xs text-[#1A1A1A]/40">
                          No margin notes found here. Try creating a new annotation card.
                        </div>
                      );
                    }
                    return filtered.map((note) => {
                      const colorClasses =
                        note.colorTheme === 'yellow' ? 'bg-amber-50/75 border-l-4 border-l-amber-500 text-amber-950' :
                        note.colorTheme === 'blue' ? 'bg-sky-50/75 border-l-4 border-l-sky-500 text-sky-950' :
                        note.colorTheme === 'red' ? 'bg-rose-50/75 border-l-4 border-l-rose-500 text-rose-950' :
                        note.colorTheme === 'green' ? 'bg-emerald-50/75 border-l-4 border-l-emerald-500 text-emerald-950' :
                        'bg-zinc-50 border-l-4 border-l-zinc-800 text-zinc-950';

                      // Find target display name
                      const taskObj = tasks.find(t => t.id === note.targetId);
                      const displayName = taskObj ? `Task: ${taskObj.title}` : `File: ${note.targetId}`;

                      return (
                        <div key={note.id} className={`p-3 border border-[#1A1A1A]/10 shadow-sm rounded-none relative ${colorClasses} animate-fade-in`}>
                          <button
                            onClick={() => handleDeleteMarginalia(note.id)}
                            className="absolute top-2 right-2 text-[#1A1A1A]/40 hover:text-rose-600 p-0.5 rounded-none cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>

                          <div className="text-[8px] font-mono uppercase tracking-widest font-black opacity-60 mb-1 max-w-[220px] truncate">
                            📎 {displayName}
                          </div>

                          <h5 className="font-serif font-bold text-xs leading-snug">{note.title}</h5>

                          {note.anchorText && (
                            <div className="mt-1.5 border-l-2 border-[#1A1A1A]/20 pl-2 py-0.5 text-[10px] font-mono italic opacity-75 bg-[#1A1A1A]/5">
                              "{note.anchorText}"
                            </div>
                          )}

                          {note.content && (
                            <p className="mt-2 text-[10px] font-mono leading-relaxed bg-white/40 p-1.5 border border-[#1A1A1A]/5">
                              {note.content}
                            </p>
                          )}

                          <p className="mt-2 text-xs leading-relaxed font-serif italic text-[#1A1A1A]/90 border-t border-[#1A1A1A]/10 pt-1.5">
                            {note.annotation}
                          </p>

                          <div className="text-[8px] font-mono text-[#1A1A1A]/40 mt-2 text-right">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Small elegant collapsed sidebar handle bar */
          <div className="hidden lg:flex flex-col justify-start items-center w-12 bg-white border-l border-[#1A1A1A] py-4 shrink-0">
            <button
              onClick={() => setShowMarginalia(true)}
              className="p-2 text-[#1A1A1A] hover:bg-[#1A1A1A]/5 rounded-none cursor-pointer"
              title="Open Marginalia Workspace Sidebar"
            >
              <BookOpen className="h-4.5 w-4.5" />
            </button>
            <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-[#1A1A1A]/40 mt-12 [writing-mode:vertical-lr] select-none">
              Margin Scribbles
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
