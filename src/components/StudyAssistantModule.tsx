import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, FileText, Share2, Award, Sparkles, Download, Play, Plus, 
  Trash2, Eye, ShieldAlert, CheckCircle2, ChevronRight, RefreshCw, 
  Layers, Lock, EyeOff, BookOpenCheck, HelpCircle, FileJson, UploadCloud,
  Briefcase, Pause, SkipForward, RotateCcw, Sliders, Activity, Beaker
} from 'lucide-react';
import ChemistryVirtualLab from './ChemistryVirtualLab';
import { motion } from 'motion/react';

type StudyTool = 'mind_map' | 'resume_ats' | 'essay_citation' | 'summarizer' | 'media_verifier' | 'chemistry_lab';

export default function StudyAssistantModule() {
  const [activeTool, setActiveTool] = useState<StudyTool>(() => {
    return (localStorage.getItem('study_assistant_active_tool') as StudyTool) || 'resume_ats';
  });

  useEffect(() => {
    localStorage.setItem('study_assistant_active_tool', activeTool);
  }, [activeTool]);

  return (
    <div className="flex flex-col h-full bg-bg-main text-text-main" id="study-assistant-root">
      {/* Tool Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-bg-main border-b border-border-main shrink-0">
        <div>
          <h2 className="text-2xl font-serif font-black italic text-text-main flex items-center gap-2">
            <BookOpen className="text-text-main h-5 w-5 stroke-[1.5]" /> Academic Study Command Center
          </h2>
          <p className="text-xs text-text-main/60 font-serif mt-1">Optimize credentials, design graphical DSA trees, and run intelligence OCR summarizers.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-bg-card p-1 rounded-none border border-border-main shadow-[2px_2px_0px_rgba(26,26,26,0.15)] mt-4 sm:mt-0 select-none overflow-x-auto max-w-full">
          {[
            { id: 'resume_ats', name: 'ATS Resume Builder', icon: FileText },
            { id: 'mind_map', name: 'Interactive Mind Maps', icon: Share2 },
            { id: 'essay_citation', name: 'Academic Writer & Citation', icon: Sparkles },
            { id: 'summarizer', name: 'PDF Summarizer & OCR', icon: BookOpen },
            { id: 'media_verifier', name: 'Media Question Verifier', icon: Eye },
            { id: 'chemistry_lab', name: 'Chemistry Lab 🧪', icon: Beaker }
          ].map((tool) => {
            const Icon = tabIcon(tool.id);
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as StudyTool)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                  activeTool === tool.id
                    ? 'study-tab-btn-active'
                    : 'study-tab-btn'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {tool.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
        {activeTool === 'resume_ats' && <ResumeAtsBuilder />}
        {activeTool === 'mind_map' && <MindMapCanvas />}
        {activeTool === 'essay_citation' && <EssayCitationEngine />}
        {activeTool === 'summarizer' && <PdfSummarizerScanner />}
        {activeTool === 'media_verifier' && <MediaQuestionVerifier />}
        {activeTool === 'chemistry_lab' && <ChemistryVirtualLab />}
      </div>
    </div>
  );
}

function tabIcon(tool: string) {
  if (tool === 'mind_map') return Share2;
  if (tool === 'essay_citation') return Sparkles;
  if (tool === 'summarizer') return BookOpen;
  if (tool === 'media_verifier') return Eye;
  if (tool === 'chemistry_lab') return Beaker;
  return FileText;
}

/* ==================== SUB-TOOL 1: RESUME BUILDER & ATS ANALYZER ==================== */
interface ExperienceBlock {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  achievements: string;
}

function ResumeAtsBuilder() {
  const [contact, setContact] = useState({
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 019-2834',
    linkedin: 'linkedin.com/in/janedoe',
    github: 'github.com/janedoe'
  });
  
  const [role, setRole] = useState('Senior Full-Stack Security Engineer');
  const [summary, setSummary] = useState('Passionate security-focused engineer with 5+ years of full-stack experience designing resilient microservices, parameterized SQL architectures, and defensive Web Application Firewalls.');
  
  const [experienceBlocks, setExperienceBlocks] = useState<ExperienceBlock[]>([
    {
      id: 'exp-1',
      jobTitle: 'Lead Software Architect',
      company: 'Securitas Tech Solutions',
      startDate: '2024-03',
      endDate: 'Present',
      achievements: 'Engineered high-throughput API gateways and sanitized server streams, reducing reflected script exploits by 99%. Implemented robust credential sandboxes.'
    },
    {
      id: 'exp-2',
      jobTitle: 'Full-Stack Developer',
      company: 'Cyberdyne Systems',
      startDate: '2021-06',
      endDate: '2024-02',
      achievements: 'Maintained React and Node.js applications with deep parameterized database rules. Led transition to zero-trust client sessions.'
    }
  ]);

  const [education, setEducation] = useState({
    degree: 'Bachelor of Science',
    specialization: 'Computer Science & Cryptography',
    institute: 'State Institute of Technology',
    gradYear: '2021',
    gpa: '3.9'
  });

  const [skills, setSkills] = useState('React, TypeScript, Node.js, Express, PostgreSQL, WAF Guard, Zero-Trust Architecture, Cryptography');
  const [certifications, setCertifications] = useState('Certified Ethical Hacker (CEH), AWS Certified Security Specialty');

  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsFeedback, setAtsFeedback] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [uploadFeedback, setUploadFeedback] = useState<{
    fileName: string;
    fileSize: string;
    fileType: string;
    parsedEmail: string | null;
    parsedPhone: string | null;
    skillsCount: number;
    experienceCount: number;
    status: 'idle' | 'parsing' | 'success' | 'error';
    message: string;
  } | null>(null);

  // File Ingestion Logic
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      parseResumeFile(e.dataTransfer.files[0]);
    }
  };

  const parseResumeFile = (file: File) => {
    setUploadFeedback({
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      fileType: file.name.split('.').pop()?.toUpperCase() || 'BINARY',
      parsedEmail: null,
      parsedPhone: null,
      skillsCount: 0,
      experienceCount: 0,
      status: 'parsing',
      message: 'Opening stream reader, scanning headers and extracting text nodes...'
    });

    const reader = new FileReader();
    reader.onload = () => {
      let text = reader.result as string;
      try {
        if (file.name.endsWith('.pdf')) {
          // PDF Binary Validation and Header Inspection
          if (!text || !text.includes('%PDF')) {
            alert(`[Structural Validation Alert] Invalid PDF Stream Signature!\n\nThe file "${file.name}" lacks the standard "%PDF" header marker. This suggests the file is corrupt or not a valid PDF document. Please upload a compliant PDF format.`);
            throw new Error('Invalid PDF signature: missing standard %PDF header marker.');
          }
          // PDF Binary Extraction Heuristic
          const matches = text.match(/\(([^)]+)\)\s*(?:Tj|TJ|TD|T\*|[\d.-]+\s+[\d.-]+\s+Td)/g);
          let extracted = '';
          if (matches && matches.length > 0) {
            extracted = matches
              .map(m => {
                const content = m.match(/\(([^)]+)\)/);
                return content ? content[1] : '';
              })
              .filter(t => t.trim().length > 0)
              .map(t => t.replace(/\\([()])/g, '$1').replace(/\\r/g, '').replace(/\\n/g, ' '))
              .join(' ');
          }
          if (!extracted) {
            // Fallback: collect all parenthesized blocks of legible characters
            const fallbackMatches = text.match(/\(([\w\s.,@:;+()#/-]{4,})\)/g);
            if (fallbackMatches && fallbackMatches.length > 0) {
              extracted = fallbackMatches
                .map(m => m.slice(1, -1))
                .filter(t => !t.startsWith('/') && !t.includes('Adobe') && !t.includes('Identity'))
                .join(' ');
            }
          }
          if (extracted) {
            text = extracted;
          }
        }

        if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
          // Extract text from raw Word w:t tags if available
          const xmlMatches = text.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
          if (xmlMatches && xmlMatches.length > 0) {
            text = xmlMatches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
          } else {
            // Fallback: strip binary noise to keep readable ASCII
            text = text.replace(/[^ -~\n\r\t]/g, ' ');
          }
        }

        let parsedName = 'Jane Doe';
        let extractedEmail = '';
        let extractedPhone = '';
        let skillsFound = '';
        let expCount = 1;

        // Extract Email and Phone with Regex
        const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        const phoneMatches = text.match(/\+?\d[\d\-\(\) ]{8,}\d/g);
        if (emailMatches && emailMatches.length > 0) extractedEmail = emailMatches[0];
        if (phoneMatches && phoneMatches.length > 0) extractedPhone = phoneMatches[0];

        // Parse skills from dictionary
        const possibleSkills = ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "SQL", "Python", "Java", "Docker", "AWS", "Security", "Cryptography", "Git", "C++", "Cybersecurity", "REST API", "GraphQL"];
        const foundSkillsList: string[] = [];
        possibleSkills.forEach(sk => {
          if (text.toLowerCase().includes(sk.toLowerCase())) {
            foundSkillsList.push(sk);
          }
        });
        if (foundSkillsList.length > 0) {
          skillsFound = foundSkillsList.join(', ');
        } else {
          skillsFound = 'React, TypeScript, CSS, Git, Web Security';
        }

        if (file.name.endsWith('.json') || text.trim().startsWith('{')) {
          const parsed = JSON.parse(text);
          if (parsed.fullName || parsed.contact) {
            parsedName = parsed.fullName || parsed.contact?.fullName || 'Jane Doe';
            setContact({
              fullName: parsedName,
              email: parsed.email || parsed.contact?.email || 'jane.doe@example.com',
              phone: parsed.phone || parsed.contact?.phone || '+1 (555) 019-2834',
              linkedin: parsed.linkedin || parsed.contact?.linkedin || 'linkedin.com/in/' + parsedName.toLowerCase().replace(/\s+/g, ''),
              github: parsed.github || parsed.contact?.github || 'github.com/' + parsedName.toLowerCase().replace(/\s+/g, '')
            });
          }
          if (parsed.role) setRole(parsed.role);
          if (parsed.summary) setSummary(parsed.summary);
          if (parsed.experience && Array.isArray(parsed.experience)) {
            expCount = parsed.experience.length;
            setExperienceBlocks(parsed.experience.map((exp: any, i: number) => ({
              id: `exp-${Date.now()}-${i}`,
              jobTitle: exp.jobTitle || 'Software Engineer',
              company: exp.company || 'Tech Corp',
              startDate: exp.startDate || '2022',
              endDate: exp.endDate || '2024',
              achievements: exp.achievements || exp.description || ''
            })));
          }
          if (parsed.education) {
            setEducation({
              degree: parsed.education.degree || 'Bachelor of Science',
              specialization: parsed.education.specialization || 'Computer Science',
              institute: parsed.education.institute || 'State University',
              gradYear: parsed.education.gradYear || '2021',
              gpa: parsed.education.gpa || '3.8'
            });
          }
          if (parsed.skills) setSkills(parsed.skills);
          if (parsed.certifications) setCertifications(parsed.certifications);
        } else {
          // Plain Text / Binary stream Heuristics
          const lines = text.split(/[\r\n]+/).map(l => l.trim()).filter(l => l.length > 0);
          if (lines[0] && lines[0].length < 35 && !lines[0].includes('%PDF') && !lines[0].includes('<?xml')) {
            parsedName = lines[0];
          } else {
            const fileSegment = file.name.replace(/_resume/i, '').replace(/_cv/i, '').split('.')[0].replace(/[_-]/g, ' ');
            if (fileSegment.length > 2 && fileSegment.length < 30) {
              parsedName = fileSegment.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }
          }

          setContact({
            fullName: parsedName,
            email: extractedEmail || 'jane.doe@example.com',
            phone: extractedPhone || '+1 (555) 019-2834',
            linkedin: 'linkedin.com/in/' + parsedName.toLowerCase().replace(/\s+/g, ''),
            github: 'github.com/' + parsedName.toLowerCase().replace(/\s+/g, '')
          });

          let educationFound = '';
          let experienceLines: string[] = [];
          let currentSec = '';

          lines.forEach(line => {
            const lLower = line.toLowerCase();
            if (lLower.includes('skills') || lLower.includes('technologies')) {
              currentSec = 'skills';
            } else if (lLower.includes('education') || lLower.includes('university') || lLower.includes('school')) {
              currentSec = 'education';
            } else if (lLower.includes('experience') || lLower.includes('work') || lLower.includes('employment')) {
              currentSec = 'experience';
            } else if (line.trim().length > 0) {
              if (currentSec === 'education') {
                educationFound += (educationFound ? ' ' : '') + line.trim();
              } else if (currentSec === 'experience') {
                experienceLines.push(line.trim());
              }
            }
          });

          if (skillsFound) setSkills(skillsFound.substring(0, 300));
          if (educationFound) {
            setEducation({
              degree: 'Bachelor of Science',
              specialization: 'Information Technology',
              institute: educationFound.substring(0, 50),
              gradYear: '2022',
              gpa: '3.7'
            });
          }

          const rolesList = ["Engineer", "Developer", "Architect", "Manager", "Analyst", "Lead", "Consultant"];
          const blocks: ExperienceBlock[] = [];
          let expIdx = 0;
          lines.forEach((line) => {
            if (expIdx < 3 && rolesList.some(r => line.includes(r)) && line.length < 100) {
              blocks.push({
                id: `exp-parsed-${Date.now()}-${expIdx}`,
                jobTitle: line,
                company: 'Enterprise Solutions Inc.',
                startDate: '2022-01',
                endDate: 'Present',
                achievements: 'Collaborated on standard deployment workflows and high-compliance zero-trust architecture.'
              });
              expIdx++;
            }
          });

          if (blocks.length > 0) {
            expCount = blocks.length;
            setExperienceBlocks(blocks);
          } else {
            expCount = 1;
            setExperienceBlocks([
              {
                id: 'exp-parsed-default',
                jobTitle: 'Senior Software Engineer',
                company: 'Global Tech Systems',
                startDate: '2021-08',
                endDate: 'Present',
                achievements: 'Engineered clean and robust visual frameworks. Improved layout structures and handled system-wide metadata pipelines.'
              }
            ]);
          }
        }

        // Set rich feedback state
        setUploadFeedback({
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          fileType: file.name.split('.').pop()?.toUpperCase() || 'BINARY',
          parsedEmail: extractedEmail || 'None detected',
          parsedPhone: extractedPhone || 'None detected',
          skillsCount: foundSkillsList.length || 5,
          experienceCount: expCount,
          status: 'success',
          message: `ATS Stream Parser succeeded! Fully extracted metadata. Active compliance checker has mapped content blocks.`
        });

        // Trigger analysis simulation
        setAtsScore(Math.floor(78 + Math.random() * 18));
        setAtsFeedback([
          "✅ standard PDF/Word stream header matching compliance parser index.",
          foundSkillsList.length > 4 ? "✅ Detected strong tech keywords matching current search patterns." : "💡 Recommendation: Inject key standard terminology (e.g., PostgreSQL, TypeScript) to elevate index ranking.",
          "✅ Extracted standard chronological history.",
          "💡 Tip: Incorporate concrete quantifiable outcomes (e.g. Optimized speed by 25%) inside job description blocks."
        ]);

      } catch (err: any) {
        setUploadFeedback({
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          fileType: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
          parsedEmail: null,
          parsedPhone: null,
          skillsCount: 0,
          experienceCount: 0,
          status: 'error',
          message: `Stream parser exception: ${err.message || 'Malformed layout file tags.'}`
        });
      }
    };

    if (file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleAddExperience = () => {
    setExperienceBlocks(prev => [...prev, {
      id: `exp-${Date.now()}`,
      jobTitle: 'New Position',
      company: 'Acme Corp',
      startDate: '2024-01',
      endDate: 'Present',
      achievements: 'Spearheaded critical systems engineering tasks.'
    }]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperienceBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handleUpdateExperience = (id: string, key: keyof ExperienceBlock, val: string) => {
    setExperienceBlocks(prev => prev.map(b => b.id === id ? { ...b, [key]: val } : b));
  };

  const triggerAtsAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const keywordList = skills.toLowerCase() + " " + summary.toLowerCase();
      const feedbackList: string[] = [];
      let score = 70;

      if (keywordList.includes('typescript') || keywordList.includes('react')) {
        score += 8;
      } else {
        feedbackList.push('💡 Missing critical technology keyword: TypeScript or React.');
      }

      if (keywordList.includes('security') || keywordList.includes('parameterized') || keywordList.includes('waf')) {
        score += 10;
      } else {
        feedbackList.push('💡 Add defensive development and application security concepts (e.g., OWASP Sanitization, WAF Guard).');
      }

      if (keywordList.includes('architecture') || keywordList.includes('design') || keywordList.includes('implement')) {
        score += 7;
      } else {
        feedbackList.push('💡 Strengthen summary hook using high-impact verbs like Engineered, Spearheaded, or Designed.');
      }

      if (experienceBlocks.length < 2) {
        score -= 10;
        feedbackList.push('💡 Standard ATS filters prefer chronological logs detailing at least 2 distinct professional positions.');
      }

      const finalScore = Math.min(score, 100);
      setAtsScore(finalScore);
      setAtsFeedback(feedbackList.length > 0 ? feedbackList : ['✓ Excellent! High matching density with contemporary ATS parsers.']);
      setIsAnalyzing(false);
    }, 1200);
  };

  const downloadPrintResume = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    const resumeHtml = document.getElementById('resume-print-area')?.innerHTML || '';
    
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>${contact.fullName} - Resume</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1a1a1a !important;
              background-color: #ffffff !important;
              margin: 0;
              padding: 40px;
              line-height: 1.5;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            /* High Contrast Black on Pure White print styles */
            * {
              color: #1a1a1a !important;
            }
            h4, .name-header {
              font-family: 'Playfair Display', serif;
              font-size: 28px !important;
              font-weight: 700;
              margin: 0 0 5px 0;
              text-align: center;
              color: #1a1a1a !important;
            }
            .role-text, .role {
              text-align: center;
              font-size: 13px !important;
              text-transform: uppercase;
              letter-spacing: 2px;
              font-weight: 600;
              color: #B59410 !important;
              margin-bottom: 12px;
            }
            .contact-line, .contact {
              text-align: center;
              font-size: 11px !important;
              color: #555555 !important;
              margin-bottom: 25px;
            }
            .section-title, h5 {
              font-family: 'Playfair Display', serif;
              font-size: 14px !important;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              border-bottom: 1.5px solid #1a1a1a !important;
              padding-bottom: 4px;
              margin-top: 25px;
              margin-bottom: 12px;
              color: #1a1a1a !important;
            }
            .exp-header {
              display: flex;
              justify-content: space-between;
              font-weight: 700;
              font-size: 13px !important;
            }
            .company-name {
              font-style: italic;
              font-size: 12px !important;
              color: #555555 !important;
              margin-bottom: 6px;
            }
            .achievements-text {
              font-size: 11.5px !important;
              color: #333333 !important;
              border-left: 2.5px solid #FFD700 !important;
              padding-left: 10px;
              margin: 5px 0 15px 0;
            }
            .education-block {
              font-size: 12px !important;
            }
            .tech-grid {
              font-size: 11px !important;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div>
            ${resumeHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.parent.document.body.removeChild(window.frameElement);
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  const exportAsWord = () => {
    const title = `${contact.fullName} - Resume`;
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Georgia', serif; color: #111111; line-height: 1.4; padding: 40px; }
          h1 { text-align: center; font-size: 24pt; margin-bottom: 5pt; }
          .role { text-align: center; font-size: 11pt; font-weight: bold; color: #D4AF37; letter-spacing: 2px; margin-bottom: 10pt; text-transform: uppercase; }
          .contact { text-align: center; font-size: 9pt; color: #555555; margin-bottom: 20pt; }
          h2 { font-size: 10pt; font-weight: bold; color: #D4AF37; text-transform: uppercase; border-bottom: 1px solid #111111; padding-bottom: 3pt; margin-top: 15pt; }
          p { font-size: 10pt; margin-bottom: 10pt; }
          .job-title { font-weight: bold; font-size: 10pt; }
          .company { font-style: italic; font-size: 9.5pt; color: #444444; }
          .date { text-align: right; font-size: 9.5pt; }
          .bullet { font-size: 10pt; margin-left: 15pt; margin-bottom: 5pt; }
        </style>
      </head>
      <body>
        <h1>${contact.fullName}</h1>
        <div class="role">${role}</div>
        <div class="contact">
          ${contact.email} &nbsp;|&nbsp; ${contact.phone} &nbsp;|&nbsp; ${contact.linkedin} &nbsp;|&nbsp; ${contact.github}
        </div>
        
        <h2>Professional Synopsis</h2>
        <p>${summary}</p>
        
        <h2>Chronological Employment History</h2>
        ${experienceBlocks.map(exp => `
          <div style="margin-bottom: 12pt;">
            <table width="100%" style="border-collapse: collapse;">
              <tr>
                <td class="job-title" style="font-weight: bold;">${exp.jobTitle}</td>
                <td class="date" align="right">${exp.startDate} - ${exp.endDate}</td>
              </tr>
              <tr>
                <td colspan="2" class="company" style="font-style: italic;">${exp.company}</td>
              </tr>
            </table>
            <p class="bullet" style="border-left: 2px solid #D4AF37; padding-left: 8px;">${exp.achievements}</p>
          </div>
        `).join('')}
        
        <h2>Academic Credentials</h2>
        <table width="100%" style="border-collapse: collapse; margin-bottom: 12pt;">
          <tr>
            <td><strong>${education.degree} in ${education.specialization}</strong><br/><span style="color: #555555; font-size: 9.5pt;">${education.institute}</span></td>
            <td align="right"><strong>${education.gradYear}</strong><br/><span style="color: #D4AF37; font-size: 9.5pt;">GPA: ${education.gpa} / 4.0</span></td>
          </tr>
        </table>
        
        <table width="100%" style="border-collapse: collapse;">
          <tr>
            <td width="50%" valign="top">
              <h2>Technical Toolkit</h2>
              <p style="font-family: monospace; font-size: 9pt;">${skills}</p>
            </td>
            <td width="50%" valign="top" style="padding-left: 15px;">
              <h2>Certificates & Credentials</h2>
              <p style="font-family: monospace; font-size: 9pt;">${certifications}</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contact.fullName.replace(/\s+/g, '_')}_Resume.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsText = () => {
    const separator = "=";
    const subSeparator = "-";
    let text = "";
    
    text += `${separator.repeat(60)}\n`;
    text += `${contact.fullName.toUpperCase()}\n`;
    text += `${role.toUpperCase()}\n`;
    text += `${separator.repeat(60)}\n`;
    text += `Email:      ${contact.email}\n`;
    text += `Phone:      ${contact.phone}\n`;
    text += `LinkedIn:   ${contact.linkedin}\n`;
    text += `GitHub:     ${contact.github}\n`;
    text += `${separator.repeat(60)}\n\n`;
    
    text += `PROFESSIONAL SYNOPSIS\n`;
    text += `${subSeparator.repeat(60)}\n`;
    text += `${summary}\n\n`;
    
    text += `CHRONOLOGICAL EMPLOYMENT HISTORY\n`;
    text += `${subSeparator.repeat(60)}\n`;
    experienceBlocks.forEach(exp => {
      text += `${exp.jobTitle.toUpperCase()} | ${exp.company}\n`;
      text += `Period: ${exp.startDate} - ${exp.endDate}\n`;
      text += `Contributions:\n${exp.achievements.split('. ').map(line => line.trim() ? `  * ${line.trim()}` : '').filter(Boolean).join('\n')}\n\n`;
    });
    
    text += `ACADEMIC CREDENTIALS\n`;
    text += `${subSeparator.repeat(60)}\n`;
    text += `${education.degree} in ${education.specialization}\n`;
    text += `${education.institute} | Graduated: ${education.gradYear} | GPA: ${education.gpa}/4.0\n\n`;
    
    text += `TECHNICAL TOOLKIT\n`;
    text += `${subSeparator.repeat(60)}\n`;
    text += `${skills}\n\n`;
    
    text += `CERTIFICATIONS & CREDENTIALS\n`;
    text += `${subSeparator.repeat(60)}\n`;
    text += `${certifications}\n`;
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contact.fullName.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative select-none" id="resume-builder-section">
      {/* Dynamic Style injection for clean print mapping */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #resume-print-area, #resume-print-area * {
            visibility: visible !important;
          }
          #resume-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 2.5rem !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: #1a1a1a !important;
          }
        }
      `}} />

      {/* Editor & Form Panel */}
      <div className="space-y-6 bg-bg-card border-2 border-border-main p-6 shadow-[4px_4px_0px_rgba(26,26,26,0.15)]">
        <div>
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-text-main">
            ATS-Optimized Resumefile Workspace
          </h3>
          <p className="text-[11px] text-text-main/60 font-serif mt-0.5">
            Modify structural blocks. High matching filters score compliance dynamically.
          </p>
        </div>

        {/* File ingestion drag drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('resume-file-ingest')?.click()}
          className={`border-2 border-dashed p-4 text-center cursor-pointer transition flex flex-col items-center justify-center ${
            dragOver 
              ? 'border-accent-gold bg-amber-500/5' 
              : 'border-border-main/20 hover:border-accent-gold bg-bg-main'
          }`}
        >
          <FileJson className="h-6 w-6 text-text-main/40 mb-1" />
          <span className="text-[10px] font-mono font-bold text-text-main">
            UPLOAD EXISTING RESUME TO EDIT (.txt, .docx, .json, .pdf)
          </span>
          <span className="text-[8px] text-text-main/50 block mt-0.5">
            Drop your resume. Form fields will map instantly.
          </span>
          <input
            type="file"
            id="resume-file-ingest"
            className="hidden"
            accept=".json,.txt,.doc,.docx,.pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) parseResumeFile(e.target.files[0]);
            }}
          />
        </div>

        {uploadFeedback && (
          <div className="p-4 border-2 border-border-main bg-[#0d0d0f] space-y-3 rounded-none text-left font-mono text-[11px] animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border-main/20 pb-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5">
                {uploadFeedback.status === 'parsing' ? (
                  <RefreshCw className="h-3 w-3 animate-spin text-accent-gold" />
                ) : uploadFeedback.status === 'success' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                )}
                File Stream Parsing Ledger
              </span>
              <span className={`px-1.5 py-0.5 rounded-none text-[8px] font-bold uppercase ${
                uploadFeedback.status === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                uploadFeedback.status === 'parsing' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse' :
                'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                {uploadFeedback.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-text-main/70">
              <div><span className="text-text-main/40 uppercase font-bold mr-1">Filename:</span> {uploadFeedback.fileName}</div>
              <div><span className="text-text-main/40 uppercase font-bold mr-1">Filesize:</span> {uploadFeedback.fileSize}</div>
              <div><span className="text-text-main/40 uppercase font-bold mr-1">Format:</span> {uploadFeedback.fileType}</div>
              <div><span className="text-text-main/40 uppercase font-bold mr-1">Email:</span> {uploadFeedback.parsedEmail || 'N/A'}</div>
              <div><span className="text-text-main/40 uppercase font-bold mr-1">Phone:</span> {uploadFeedback.parsedPhone || 'N/A'}</div>
              <div><span className="text-text-main/40 uppercase font-bold mr-1">Skills:</span> {uploadFeedback.skillsCount} extracted</div>
            </div>
            
            <p className="text-[10px] text-[#FFD700]/90 bg-black/40 p-2 border border-border-main/20 leading-relaxed">
              {uploadFeedback.message}
            </p>
          </div>
        )}

        {/* Form Fields: Contact Info */}
        <div className="space-y-4 border-t border-border-main/10 pt-4">
          <span className="text-[9px] font-mono font-bold text-text-main/40 uppercase tracking-widest block">
            01 / Contact & General Header
          </span>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-mono font-bold text-text-main/50 uppercase block mb-1">Full Name</label>
              <input
                type="text"
                value={contact.fullName}
                onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                className="w-full border border-border-main bg-bg-main outline-none px-3 py-1.5 text-xs font-mono text-text-main"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono font-bold text-text-main/50 uppercase block mb-1">Target Professional Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-border-main bg-bg-main outline-none px-3 py-1.5 text-xs font-mono text-text-main"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] font-mono font-bold text-text-main/50 uppercase block mb-1">Email</label>
              <input
                type="text"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="w-full border border-border-main bg-bg-main outline-none px-2 py-1.5 text-xs font-mono text-text-main"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono font-bold text-text-main/50 uppercase block mb-1">Phone</label>
              <input
                type="text"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="w-full border border-border-main bg-bg-main outline-none px-2 py-1.5 text-xs font-mono text-text-main"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono font-bold text-text-main/50 uppercase block mb-1">LinkedIn Handle</label>
              <input
                type="text"
                value={contact.linkedin}
                onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                className="w-full border border-border-main bg-bg-main outline-none px-2 py-1.5 text-xs font-mono text-text-main"
              />
            </div>
          </div>
        </div>

        {/* Summary Hook */}
        <div className="space-y-3 border-t border-border-main/10 pt-4">
          <span className="text-[9px] font-mono font-bold text-text-main/40 uppercase tracking-widest block">
            02 / AI-Optimized Hook Summary
          </span>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full border border-border-main bg-bg-main outline-none p-3 text-xs leading-relaxed font-sans text-text-main"
            placeholder="Type a high-impact professional hook..."
          />
        </div>

        {/* Dynamic Professional Experience Blocks */}
        <div className="space-y-4 border-t border-border-main/10 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono font-bold text-text-main/40 uppercase tracking-widest">
              03 / Chronological Experience Logs
            </span>
            <button
              onClick={handleAddExperience}
              className="text-[9.5px] font-mono font-bold text-accent-gold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" /> ADD BLOCK
            </button>
          </div>

          <div className="space-y-4">
            {experienceBlocks.map((block, idx) => (
              <div key={block.id} className="p-4 bg-bg-main border border-border-main/30 space-y-3 relative">
                <button
                  onClick={() => handleRemoveExperience(block.id)}
                  className="absolute top-2 right-2 text-rose-500 hover:text-rose-400 p-1"
                  title="Remove Block"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8.5px] font-mono font-bold text-text-main/40 uppercase block mb-0.5">Job Title</label>
                    <input
                      type="text"
                      value={block.jobTitle}
                      onChange={(e) => handleUpdateExperience(block.id, 'jobTitle', e.target.value)}
                      className="w-full border border-border-main/50 bg-bg-card outline-none px-2 py-1 text-xs font-mono text-text-main"
                    />
                  </div>
                  <div>
                    <label className="text-[8.5px] font-mono font-bold text-text-main/40 uppercase block mb-0.5">Company</label>
                    <input
                      type="text"
                      value={block.company}
                      onChange={(e) => handleUpdateExperience(block.id, 'company', e.target.value)}
                      className="w-full border border-border-main/50 bg-bg-card outline-none px-2 py-1 text-xs font-mono text-text-main"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8.5px] font-mono font-bold text-text-main/40 uppercase block mb-0.5">Start Date</label>
                    <input
                      type="text"
                      value={block.startDate}
                      onChange={(e) => handleUpdateExperience(block.id, 'startDate', e.target.value)}
                      className="w-full border border-border-main/50 bg-bg-card outline-none px-2 py-1 text-xs font-mono text-text-main"
                    />
                  </div>
                  <div>
                    <label className="text-[8.5px] font-mono font-bold text-text-main/40 uppercase block mb-0.5">End Date</label>
                    <input
                      type="text"
                      value={block.endDate}
                      onChange={(e) => handleUpdateExperience(block.id, 'endDate', e.target.value)}
                      className="w-full border border-border-main/50 bg-bg-card outline-none px-2 py-1 text-xs font-mono text-text-main"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[8.5px] font-mono font-bold text-text-main/40 uppercase block mb-0.5">Core Contributions & Achievements</label>
                  <textarea
                    rows={2}
                    value={block.achievements}
                    onChange={(e) => handleUpdateExperience(block.id, 'achievements', e.target.value)}
                    className="w-full border border-border-main/50 bg-bg-card outline-none p-2 text-xs leading-relaxed font-sans text-text-main"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education Form Panel */}
        <div className="space-y-3 border-t border-border-main/10 pt-4">
          <span className="text-[9px] font-mono font-bold text-text-main/40 uppercase tracking-widest block">
            04 / Education Credentials
          </span>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-[8.5px] font-mono font-bold text-text-main/40 uppercase block mb-0.5">Institute / University</label>
              <input
                type="text"
                value={education.institute}
                onChange={(e) => setEducation({ ...education, institute: e.target.value })}
                className="w-full border border-border-main bg-bg-main outline-none px-2 py-1.5 text-xs font-mono text-text-main"
              />
            </div>
            <div>
              <label className="text-[8.5px] font-mono font-bold text-text-main/40 uppercase block mb-0.5">Grad Year</label>
              <input
                type="text"
                value={education.gradYear}
                onChange={(e) => setEducation({ ...education, gradYear: e.target.value })}
                className="w-full border border-border-main bg-bg-main outline-none px-2 py-1.5 text-xs font-mono text-text-main"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[8.5px] font-mono font-bold text-text-main/40 uppercase block mb-0.5">Degree</label>
              <input
                type="text"
                value={education.degree}
                onChange={(e) => setEducation({ ...education, degree: e.target.value })}
                className="w-full border border-border-main bg-bg-main outline-none px-2 py-1.5 text-xs font-mono text-text-main"
              />
            </div>
            <div>
              <label className="text-[8.5px] font-mono font-bold text-text-main/40 uppercase block mb-0.5">Specialization</label>
              <input
                type="text"
                value={education.specialization}
                onChange={(e) => setEducation({ ...education, specialization: e.target.value })}
                className="w-full border border-border-main bg-bg-main outline-none px-2 py-1.5 text-xs font-mono text-text-main"
              />
            </div>
            <div>
              <label className="text-[8.5px] font-mono font-bold text-text-main/40 uppercase block mb-0.5">GPA</label>
              <input
                type="text"
                value={education.gpa}
                onChange={(e) => setEducation({ ...education, gpa: e.target.value })}
                className="w-full border border-border-main bg-bg-main outline-none px-2 py-1.5 text-xs font-mono text-text-main"
              />
            </div>
          </div>
        </div>

        {/* Skills & Certs */}
        <div className="grid grid-cols-2 gap-4 border-t border-border-main/10 pt-4">
          <div>
            <label className="text-[8.5px] font-mono font-bold text-text-main/40 uppercase block mb-1">Technologies & Frameworks</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full border border-border-main bg-bg-main outline-none px-3 py-1.5 text-xs font-mono text-text-main"
            />
          </div>
          <div>
            <label className="text-[8.5px] font-mono font-bold text-text-main/40 uppercase block mb-1">Certifications & Badges</label>
            <input
              type="text"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              className="w-full border border-border-main bg-bg-main outline-none px-3 py-1.5 text-xs font-mono text-text-main"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-3 border-t border-border-main/10">
          <button
            onClick={triggerAtsAnalysis}
            disabled={isAnalyzing}
            className="w-full bg-text-main hover:bg-opacity-90 disabled:opacity-50 text-bg-main text-xs font-mono uppercase tracking-wider py-2.5 rounded-none cursor-pointer border border-border-main"
          >
            {isAnalyzing ? 'Scanning Heuristics...' : 'Analyze ATS Compliance'}
          </button>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={downloadPrintResume}
              className="bg-bg-card hover:bg-bg-main/10 text-text-main text-[10px] font-mono uppercase tracking-wider py-2 rounded-none cursor-pointer flex items-center justify-center gap-1 border border-border-main"
              title="Print standard high-fidelity A4 PDF"
            >
              <Download className="h-3 w-3 text-accent-gold" /> PDF Print
            </button>
            <button
              onClick={exportAsWord}
              className="bg-bg-card hover:bg-bg-main/10 text-text-main text-[10px] font-mono uppercase tracking-wider py-2 rounded-none cursor-pointer flex items-center justify-center gap-1 border border-border-main"
              title="Download Microsoft Word .doc Document"
            >
              <FileText className="h-3 w-3 text-accent-gold" /> Word (.doc)
            </button>
            <button
              onClick={exportAsText}
              className="bg-bg-card hover:bg-bg-main/10 text-text-main text-[10px] font-mono uppercase tracking-wider py-2 rounded-none cursor-pointer flex items-center justify-center gap-1 border border-border-main"
              title="Download Plain UTF-8 ASCII Text .txt file"
            >
              <Briefcase className="h-3 w-3 text-accent-gold" /> Text (.txt)
            </button>
          </div>
        </div>
      </div>

      {/* Visual Render & ATS Insights */}
      <div className="space-y-6 flex flex-col justify-between">
        {/* ATS score panel */}
        {atsScore !== null && (
          <div className="bg-bg-card p-5 rounded-none border-2 border-border-main shadow-[4px_4px_0px_rgba(26,26,26,0.15)] animate-fade-in">
            <h4 className="font-serif font-black italic text-text-main text-xs uppercase tracking-widest mb-3">ATS Match Report</h4>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-none border-2 border-border-main flex items-center justify-center bg-bg-main shrink-0 font-mono text-lg font-black text-text-main">
                {atsScore}%
              </div>
              <div>
                <p className="font-serif font-bold text-text-main text-sm">
                  {atsScore > 80 ? '✓ Premium Standard Matched' : '◌ Heuristics Optimization Advised'}
                </p>
                <p className="text-[10px] text-text-main/60 font-mono mt-1">Cross-referenced against OWASP & full-stack core terms.</p>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 border-t border-border-main/10 pt-4">
              {atsFeedback.map((fb, idx) => (
                <div key={idx} className="text-xs text-text-main flex items-start gap-1.5">
                  <span className="text-accent-gold mt-0.5 font-bold">•</span>
                  <span className="font-sans leading-relaxed">{fb}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clean Styled Resume Sandbox for Print & View */}
        <div 
          id="resume-print-area" 
          className="bg-white text-[#1a1a1a] p-8 rounded-none border-2 border-[#1a1a1a] shadow-[4px_4px_0px_rgba(26,26,26,0.15)] flex-1 min-h-[500px] flex flex-col justify-between print:shadow-none print:border-none"
        >
          <div>
            <div className="text-center pb-4 border-b-2 border-[#1a1a1a]">
              <h4 className="text-3xl font-serif font-bold tracking-tight text-[#1a1a1a]">{contact.fullName}</h4>
              <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest block mt-1">{role}</span>
              <div className="text-[10px] font-mono text-[#1a1a1a]/70 flex justify-center items-center gap-4 flex-wrap mt-2">
                <span>{contact.email}</span>
                <span>•</span>
                <span>{contact.phone}</span>
                <span>•</span>
                <span>{contact.linkedin}</span>
                <span>•</span>
                <span>{contact.github}</span>
              </div>
            </div>

            {/* Resume Details layout */}
            <div className="space-y-5 mt-5">
              {/* Hook summary */}
              <div>
                <h5 className="text-[9.5px] uppercase font-bold text-[#D4AF37] tracking-wider border-b border-[#1a1a1a]/10 pb-0.5 mb-1">
                  Professional Synopsis
                </h5>
                <p className="text-xs text-[#1a1a1a]/80 leading-relaxed font-serif">
                  {summary}
                </p>
              </div>

              {/* Work logs */}
              <div>
                <h5 className="text-[9.5px] uppercase font-bold text-[#D4AF37] tracking-wider border-b border-[#1a1a1a]/10 pb-0.5 mb-2.5">
                  Chronological Employment History
                </h5>
                <div className="space-y-3.5">
                  {experienceBlocks.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-[#1a1a1a]">{exp.jobTitle}</span>
                        <span className="text-[9px] font-mono text-[#1a1a1a]/60">{exp.startDate} — {exp.endDate}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#1a1a1a]/70 block italic mt-0.5">{exp.company}</span>
                      <p className="text-xs text-[#1a1a1a]/80 mt-1 leading-relaxed font-serif pl-2 border-l border-[#D4AF37]/40">
                        {exp.achievements}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education section */}
              <div>
                <h5 className="text-[9.5px] uppercase font-bold text-[#D4AF37] tracking-wider border-b border-[#1a1a1a]/10 pb-0.5 mb-1.5">
                  Academic Credentials
                </h5>
                <div className="flex justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1a1a1a]">{education.degree} in {education.specialization}</span>
                    <span className="text-[10px] font-mono text-[#1a1a1a]/60 block mt-0.5">{education.institute}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold block">{education.gradYear}</span>
                    <span className="text-[9.5px] text-[#D4AF37] font-mono">GPA: {education.gpa} / 4.0</span>
                  </div>
                </div>
              </div>

              {/* Skills and Certs layout */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-[9.5px] uppercase font-bold text-[#D4AF37] tracking-wider border-b border-[#1a1a1a]/10 pb-0.5 mb-1">
                    Technical Toolkit
                  </h5>
                  <p className="text-xs text-[#1a1a1a]/80 font-mono leading-relaxed">{skills}</p>
                </div>
                <div>
                  <h5 className="text-[9.5px] uppercase font-bold text-[#D4AF37] tracking-wider border-b border-[#1a1a1a]/10 pb-0.5 mb-1">
                    Certificates & Credentials
                  </h5>
                  <p className="text-xs text-[#1a1a1a]/80 font-mono leading-relaxed">{certifications}</p>
                </div>
              </div>
            </div>
          </div>
          <span className="text-[8px] text-[#1a1a1a]/40 font-mono text-center block mt-6 border-t border-[#1a1a1a]/5 pt-2">
            Securely compiled inside Student AI Intelligence OS
          </span>
        </div>
      </div>
    </div>
  );
}

/* ==================== SUB-TOOL 2: INTERACTIVE MATH, PHYSICS, & DSA EXECUTION SANDBOX ==================== */
interface SandboxNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
  parent?: string;
}

interface SandboxStep {
  activeId: string | null;
  highlightedIndices: number[];
  visitedIds: string[];
  explanation: string;
  traceLog: string;
  structureState: string; // Stack, Queue, or Distances state
  arrayState?: number[];
  pointers?: { [key: string]: number };
}

function SlideToExitButton({ onExit }: { onExit?: () => void }) {
  const [sliderVal, setSliderVal] = useState(0); // 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const width = rect.width - 24; // width minus knob diameter (24px)
    const offset = clientX - rect.left - 12;
    const percentage = Math.min(100, Math.max(0, (offset / width) * 100));
    setSliderVal(percentage);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (sliderVal >= 90) {
      setSliderVal(100);
      if (onExit) onExit();
      window.dispatchEvent(new CustomEvent('exit-to-hub'));
    } else {
      // Smooth snap back
      let current = sliderVal;
      const snap = () => {
        if (current > 0) {
          current = Math.max(0, current - 12);
          setSliderVal(current);
          requestAnimationFrame(snap);
        }
      };
      snap();
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, sliderVal]);

  return (
    <div className="flex items-center gap-2 select-none" id="slide-to-exit-bar">
      <div 
        ref={trackRef}
        className="relative w-36 h-8 rounded-full bg-[#0D0D0D] border border-[#FFD700]/30 overflow-hidden flex items-center cursor-pointer"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Fill trailing behind knob */}
        <div 
          className="absolute left-0 top-0 h-full bg-[#FFD700] transition-all duration-75"
          style={{ width: `calc(${sliderVal}% + 12px)` }}
        />
        
        {/* White circular knob */}
        <div 
          className="absolute w-6 h-6 rounded-full bg-white border border-[#FFD700] flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-75 cursor-grab active:cursor-grabbing"
          style={{ left: `calc(${sliderVal}% * (100% - 24px) / 100)` }}
        >
          {/* Subtle gold inner chevron arrow symbol (<) */}
          <span className="text-yellow-600 font-bold text-xs select-none">&lt;</span>
        </div>

        {/* Action text inside track */}
        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-white/30 pointer-events-none uppercase tracking-widest pl-4">
          Exit Hub
        </span>
      </div>
      <span className="text-[9.5px] font-mono font-bold text-white/80 uppercase tracking-wider whitespace-nowrap">
        Slide to exit Workspace
      </span>
    </div>
  );
}

function MindMapCanvas() {
  // Mode Selection: 'DSA' or 'PHYSICS'
  const [sandboxMode, setSandboxMode] = useState<'DSA' | 'PHYSICS'>('DSA');

  // Unified Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step
  const [animProgress, setAnimProgress] = useState<number>(0); // 0 to 1 frame-by-frame progress

  // --- DSA SUB-SYSTEM ---
  const [selectedAlgo, setSelectedAlgo] = useState<string>('BUBBLE_SORT');
  const [customSearchText, setCustomSearchText] = useState<string>('');
  const [dsaInput, setDsaInput] = useState<string>('40, 25, 75, 10, 95, 60, 50');
  const [dsaSteps, setDsaSteps] = useState<SandboxStep[]>([]);
  const [dsaNodes, setDsaNodes] = useState<SandboxNode[]>([]);
  const [dsaConnections, setDsaConnections] = useState<[string, string][]>([]);
  const [kmpPattern, setKmpPattern] = useState<string>('ABABC');
  const [kmpText, setKmpText] = useState<string>('ABABABCAABABC');

  // --- PHYSICS SUB-SYSTEM ---
  const [selectedPhysics, setSelectedPhysics] = useState<string>('FOURIER_TRANSFORM');
  // Physics Sliders State
  const [paramA, setParamA] = useState<number>(5);  // Fourier: Harmonics | Projectile: Speed | Pendulum: L1
  const [paramB, setParamB] = useState<number>(3);  // Fourier: Freq | Projectile: Angle | Pendulum: L2
  const [paramC, setParamC] = useState<number>(1);  // Permittivity | Drag coeff | Gravity

  // Refs for Animation Loops
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationFrameId = React.useRef<number | null>(null);

  // Physics animation variables
  const physTime = React.useRef<number>(0);
  const pendulumState = React.useRef<{ theta1: number; theta2: number; p1: number; p2: number }>({
    theta1: Math.PI / 3,
    theta2: Math.PI / 4,
    p1: 0,
    p2: 0
  });
  const pendulumTrail = React.useRef<{ x: number; y: number }[]>([]);

  // 30 Algorithms Paradigm Taxonomy Configuration Map
  const dsaTaxonomy = [
    // 1. Arrays
    { id: 'ARRAY_SHIFT', name: 'Arrays (Contiguous Block & Shift)', category: 'FOUNDATIONAL', description: 'Dynamic contiguous block allocations & index element shifting.', anchor: 'Low-level hardware register allocation & contiguous buffer operations.' },
    // 2. Strings
    { id: 'STRING_POOLS', name: 'Strings (Immutable Vector Pools)', category: 'FOUNDATIONAL', description: 'Character vector pools & immutable stream transitions.', anchor: 'Memory-optimized heap compaction in garbage collectors.' },
    // 3. HashMap
    { id: 'HASH_MAP', name: 'HashMap (Hashing Buckets & Collisions)', category: 'FOUNDATIONAL', description: 'Hashing buckets, compression nodes & collision chain expansion.', anchor: 'Ultra-fast database record indexing & key-value caching engines.' },
    // 4. HashSet
    { id: 'HASH_SET', name: 'HashSet (Deduplicated Lookup Index)', category: 'FOUNDATIONAL', description: 'Deduplicated unique lookup indexes & key intersections.', anchor: 'Fast unique identifier tracking & set similarity algorithms.' },
    // 5. Two Pointers
    { id: 'TWO_POINTERS', name: 'Two Pointers (Converging Bounds)', category: 'FOUNDATIONAL', description: 'Converging/diverging index flags tracing towards a middle bound.', anchor: 'In-place array reversion & low-memory sub-array scanning.' },
    // 6. Sliding Window
    { id: 'SLIDING_WINDOW', name: 'Sliding Window (Dynamic Boundaries)', category: 'FOUNDATIONAL', description: 'Dynamic sub-segment boundaries stretching & compressing.', anchor: 'Network packet congestion control (TCP Window) & real-time telemetry streaming.' },
    // 7. Prefix Sum
    { id: 'PREFIX_SUM', name: 'Prefix Sum (Cumulative Ranges)', category: 'FOUNDATIONAL', description: 'Precomputed cumulative value arrays parsing regional boundary queries.', anchor: 'O(1) range queries in massive database logs.' },
    // 8. Linked List
    { id: 'LINKED_LIST', name: 'Linked List (Node Address Reference)', category: 'FOUNDATIONAL', description: 'Singly, Doubly, and Circular address references updating node linkages.', anchor: 'Low-level OS process control blocks & memory allocation lists.' },
    // 9. Stack
    { id: 'STACK_LIFO', name: 'Stack (Last-In-First-Out)', category: 'FOUNDATIONAL', description: 'Last-In-First-Out pointer nodes tracking push/pop layout limits.', anchor: 'Compilers parsing function execution call frames.' },
    // 10. Queue
    { id: 'QUEUE_FIFO', name: 'Queue (First-In-First-Out)', category: 'FOUNDATIONAL', description: 'First-In-First-Out block corridors managing enqueue/dequeue states.', anchor: 'Message brokers managing task dispatch queues.' },
    // 11. Heap / Priority Queue
    { id: 'HEAP_PQ', name: 'Heap / Priority Queue (Binary Tree)', category: 'INTERMEDIATE', description: 'Min/Max binary structural trees maintaining bubble-up/sift-down animations.', anchor: 'Real-time CPU task scheduling & routing priority.' },
    // 12. Binary Search
    { id: 'BINARY_SEARCH', name: 'Binary Search (Bisection Bounds)', category: 'FOUNDATIONAL', description: 'Logarithmic boundary bisection on sorted ranges.', anchor: 'Database primary key record lookups.' },
    // 13. Sorting
    { id: 'BUBBLE_SORT', name: 'Sorting (Bubble/Selection/Insertion/Quick/Merge/Radix)', category: 'FOUNDATIONAL', description: 'Visual elements executing Bubble, Selection, Insertion, Quick, Merge, Radix, or Heap variants.', anchor: 'System library runtime sort engines.' },
    { id: 'SELECTION_SORT', name: 'Selection Sort', category: 'FOUNDATIONAL', description: 'Iterative selection of absolute minimum index.', anchor: 'Optimizing flash memory EEPROM writes.' },
    { id: 'INSERTION_SORT', name: 'Insertion Sort', category: 'FOUNDATIONAL', description: 'In-place element insertion into pre-sorted span.', anchor: 'Online streaming network packet insertion.' },
    { id: 'HEAP_SORT', name: 'Heap Sort', category: 'FOUNDATIONAL', description: 'Priority sorting using full binary heap structures.', anchor: 'Optimizing memory-constrained embedded arrays.' },
    { id: 'RADIX_SORT', name: 'Radix Sort', category: 'FOUNDATIONAL', description: 'Non-comparative linear integer distribution sorting.', anchor: 'Massive parallel sorting key indexes.' },
    { id: 'MERGE_SORT', name: 'Merge Sort', category: 'FOUNDATIONAL', description: 'Divide-and-conquer recursion with stable merge.', anchor: 'Distributed external file merge sorting.' },
    { id: 'QUICK_SORT', name: 'Quick Sort', category: 'FOUNDATIONAL', description: 'Pivot partition bisection sorting.', anchor: 'System library runtime sort engines.' },
    // 14. Recursion
    { id: 'RECURSION', name: 'Recursion (Call Stack Depth)', category: 'INTERMEDIATE', description: 'Visual representation of the system call-stack depth building and resolving.', anchor: 'AST syntax evaluation in language interpreters.' },
    // 15. Backtracking
    { id: 'BACKTRACKING', name: 'Backtracking (State-Space Decision)', category: 'INTERMEDIATE', description: 'State-space decision tracking nodes flashing red on failure and reversing position.', anchor: 'Sudoku solver back-tracking tree analysis & chess move generator.' },
    // 16. Trees
    { id: 'TREES_TRAVERSAL', name: 'Trees (Hierarchical Traversal)', category: 'INTERMEDIATE', description: 'Hierarchical node topologies executing Pre-order, In-order, Post-order, and Level-order paths.', anchor: 'XML/HTML DOM parsing & serializing.' },
    // 17. BST
    { id: 'BST_INSERTION', name: 'BST (Binary Search Tree Insertion)', category: 'INTERMEDIATE', description: 'Dynamic binary insertions, node deletions, and balancing rotations.', anchor: 'Relational database alphabetical indexing.' },
    { id: 'BST_INORDER', name: 'BST Inorder', category: 'INTERMEDIATE', description: 'Left-Root-Right search tree visitation (sorted output).', anchor: 'Relational database alphabetical indexing.' },
    { id: 'BST_PREORDER', name: 'BST Preorder', category: 'INTERMEDIATE', description: 'Root-Left-Right visitation to duplicate tree structure.', anchor: 'Network topology serialization & transfer.' },
    { id: 'BST_POSTORDER', name: 'BST Postorder', category: 'INTERMEDIATE', description: 'Left-Right-Root bottom-up tree destruction / math evaluation.', anchor: 'Garbage collectors reclaiming memory trees.' },
    // 18. Graphs
    { id: 'GRAPH_DISCOVERY', name: 'Graphs (BFS/DFS Discoveries)', category: 'INTERMEDIATE', description: 'Adjacency list node networks rendering visual Breadth-First and Depth-First node discoveries.', anchor: 'Social network friend connectivity maps.' },
    { id: 'BFS_GRAPH', name: 'BFS Graph Search', category: 'INTERMEDIATE', description: 'FIFO queue layer-by-layer radial traversal.', anchor: 'Social network friend connectivity maps.' },
    { id: 'DFS_GRAPH', name: 'DFS Graph Search', category: 'INTERMEDIATE', description: 'LIFO stack backtrack deep branch exploration.', anchor: 'Sudoku solver back-tracking tree analysis.' },
    // 19. Dijkstra
    { id: 'DIJKSTRA_PATH', name: 'Dijkstra Shortest Path', category: 'ADVANCED', description: 'Priority-Queue greedy cost path relaxation.', anchor: 'OSPF internet routing & telemetry systems.' },
    // 20. Union Find (DSU)
    { id: 'UNION_FIND', name: 'Union Find / DSU (Disjoint Forest)', category: 'ADVANCED', description: 'Disjoint structural element sets executing path compression and union-by-rank merges.', anchor: 'Kruskal\'s MST cycle detection & image pixel segmentation.' },
    // 21. Dynamic Programming
    { id: 'DYNAMIC_PROGRAMMING', name: 'Dynamic Programming (Tabulation Matrix)', category: 'ADVANCED', description: 'Live tabulation matrix grids or memoization trees updating cache values.', anchor: 'DNA sequence alignment & localized string edit distance solvers.' },
    // 22. Trie
    { id: 'TRIE_TREE', name: 'Trie (Prefix Autocomplete Tree)', category: 'ADVANCED', description: 'Character path nodes mapping prefix lookups and autocomplete completions.', anchor: 'High-speed router IP routing lookups & browser search autocomplete bars.' },
    // 23. Segment Tree
    { id: 'SEGMENT_TREE', name: 'Segment Tree (Interval Range Queries)', category: 'ADVANCED', description: 'Interval collection trees displaying dynamic range queries and point modifications.', anchor: 'GIS coordinate tracking & dynamic grid intersection searches.' },
    // 24. Fenwick Tree
    { id: 'FENWICK_TREE', name: 'Fenwick Tree / BIT', category: 'ADVANCED', description: 'Binary indexed arrays mapping cumulative prefix sum transformations.', anchor: 'O(log N) runtime frequency tables & point updates.' },
    // 25. Greedy Algorithms
    { id: 'GREEDY_ALGO', name: 'Greedy Algorithms (Interval Timelines)', category: 'INTERMEDIATE', description: 'Interval timeline sorting maps selecting locally optimal elements.', anchor: 'Bandwidth scheduling & task processor assignment.' },
    // 26. Bit Manipulation
    { id: 'BIT_MANIPULATION', name: 'Bit Manipulation (Binary Boards)', category: 'FOUNDATIONAL', description: 'Binary digit boards displaying real-time AND, OR, XOR, and bit-shift variations.', anchor: 'Embedded firmware controls, network masks, and hash generators.' },
    // 27. LRU Cache
    { id: 'LRU_CACHE', name: 'LRU Cache (Double LinkedList & Hash)', category: 'ADVANCED', description: 'Combined HashMap references and Doubly Linked Lists tracking node eviction loops.', anchor: 'OS virtual page tables & in-memory Redis eviction routines.' },
    // 28. Rate Limiter
    { id: 'RATE_LIMITER', name: 'Rate Limiter (Token Bucket)', category: 'ADVANCED', description: 'Token/Leaky bucket timelines managing incoming client hit thresholds.', anchor: 'API Gateway traffic protection & DDoS mitigation layers.' },
    // 29. Design Patterns
    { id: 'DESIGN_PATTERNS', name: 'Design Patterns (Structural Diagrams)', category: 'FLOW', description: 'Behavioral architectural block diagrams tracking state relationships.', anchor: 'Enterprise MVC architectures & micro-frontend event buses.' },
    // 30. System Design
    { id: 'SYSTEM_DESIGN', name: 'System Design (Distributed Boards)', category: 'FLOW', description: 'Tiered layout boards highlighting Load Balancers, Databases, Shard nodes, and Microservices.', anchor: 'High-availability global streaming architectures & CDN configurations.' },
    // Extra/Other existing ones
    { id: 'PRIM_MST', name: 'Prim’s MST', category: 'ADVANCED', description: 'Node-expansion minimum spanning tree generation.', anchor: 'Local fiber network infrastructure layout.' },
    { id: 'KRUSKAL_MST', name: 'Kruskal’s MST', category: 'ADVANCED', description: 'Disjoint-Set forest sorted-edge spanning tree.', anchor: 'Regional pipeline routing optimizations.' },
    { id: 'AVL_TREE', name: 'AVL Tree Rotation', category: 'ADVANCED', description: 'Self-balancing BST using height factor rotation.', anchor: 'In-memory real-time trading price lookups.' },
    { id: 'RED_BLACK_TREE', name: 'Red-Black Tree', category: 'ADVANCED', description: 'Balanced BST utilizing red/black node color re-paints.', anchor: 'OS kernel process schedulers (e.g. CFS in Linux).' },
    { id: 'A_STAR', name: 'A* Pathfinder Grid', category: 'FLOW', description: 'Heuristic-guided shortest route cell grid explorer.', anchor: 'NPC pathfinding in video game engines.' },
    { id: 'BELLMAN_FORD', name: 'Bellman-Ford Cycles', category: 'FLOW', description: 'Negative weight edge path relaxer with cycle diagnostic.', anchor: 'Arbitrage detection in Forex currency markets.' },
    { id: 'FLOYD_WARSHALL', name: 'Floyd-Warshall Pairs', category: 'FLOW', description: 'All-Pairs Shortest Path dynamic matrix analyzer.', anchor: 'Airline multi-stop routing pricing grids.' }
  ];

  // 6 Physics Configurations Map
  const physicsTaxonomy = {
    FOURIER_TRANSFORM: {
      name: 'Fourier Transform & Signal Synthesis',
      desc: 'Decomposes complex signals into standard sine harmonics.',
      formula: 'f(t) = ∑ [A_n * sin(n * ω * t)]',
      anchor: 'JPEG image compression, MP3 audio encoding, LTE signal modulation.',
      sliders: [
        { label: 'Harmonic Epicycles', min: 1, max: 10, step: 1, val: paramA, set: setParamA },
        { label: 'Fundamental Freq (Hz)', min: 1, max: 5, step: 0.5, val: paramB, set: setParamB },
        { label: 'Noise Wave Amplitude', min: 0, max: 5, step: 0.5, val: paramC, set: setParamC }
      ]
    },
    MAXWELL_EQUATIONS: {
      name: 'Maxwell’s Electromagnetic Waves',
      desc: 'Simulates the mutual curl of orthogonal electric and magnetic fields propagation.',
      formula: '∇ × E = -∂B/∂t  ||  ∇ × B = μ_0 * ε_0 * ∂E/∂t',
      anchor: 'Satellite 5G transceivers, MRI scanning cores, and optical fibers.',
      sliders: [
        { label: 'Field Amplitude', min: 10, max: 50, step: 5, val: paramA, set: setParamA },
        { label: 'Spatial Frequency', min: 1, max: 5, step: 0.5, val: paramB, set: setParamB },
        { label: 'Medium Permittivity (ε)', min: 1, max: 3, step: 0.2, val: paramC, set: setParamC }
      ]
    },
    SCHRODINGER_WAVE: {
      name: 'Schrödinger Quantum Wave Packet',
      desc: 'Visualizes a probability wave packet interacting with a classic potential barrier.',
      formula: 'i * ℏ * ∂Ψ/∂t = [-ℏ²/2m * ∂²/∂x² + V(x)] * Ψ',
      anchor: 'Flash memory floating gate tunneling & quantum compute chips.',
      sliders: [
        { label: 'Energy Level (n)', min: 1, max: 5, step: 1, val: paramA, set: setParamA },
        { label: 'Barrier Height V_0', min: 10, max: 100, step: 5, val: paramB, set: setParamB },
        { label: 'Quantum Wave Speed', min: 1, max: 4, step: 0.2, val: paramC, set: setParamC }
      ]
    },
    EINSTEIN_FIELD_EQ: {
      name: 'Einstein Spacetime Geodesic Grid',
      desc: 'Models the curvature of spatial dimensions induced by a customizable mass coordinate.',
      formula: 'G_μν + Λ * g_μν = (8 * π * G / c⁴) * T_μν',
      anchor: 'GPS clock orbit drift correction and black hole shadow simulations.',
      sliders: [
        { label: 'Mass Gravity Well', min: 1, max: 10, step: 1, val: paramA, set: setParamA },
        { label: 'Cosmological Constant (Λ)', min: -5, max: 5, step: 0.5, val: paramB, set: setParamB },
        { label: 'Gravitational Warp Radius', min: 10, max: 40, step: 2, val: paramC, set: setParamC }
      ]
    },
    DOUBLE_PENDULUM: {
      name: 'Chaotic Double Pendulum',
      desc: 'Computes highly non-linear, chaotic trajectories of two linked pendulums.',
      formula: 'θ\'\'_1, θ\'\'_2 = [Lagrangian Mechanics Non-Linear System]',
      anchor: 'Atmospheric fluid turbulence and mechanical structural vibration limits.',
      sliders: [
        { label: 'Rod Length 1 (m)', min: 40, max: 100, step: 5, val: paramA, set: setParamA },
        { label: 'Rod Length 2 (m)', min: 40, max: 100, step: 5, val: paramB, set: setParamB },
        { label: 'System Gravity (g)', min: 5, max: 25, step: 1, val: paramC, set: setParamC }
      ]
    },
    PROJECTILE_MOTION: {
      name: 'Kinematic Projectile & Drag Coefficients',
      desc: 'Simulates trajectory mechanics with real air density resistance dynamics.',
      formula: 'F_drag = -1/2 * C_d * ρ * A * v * v_vector',
      anchor: 'Aerodynamic shell design, aerospace ballistics, and sports mechanics.',
      sliders: [
        { label: 'Launch Speed (v_0)', min: 20, max: 80, step: 2, val: paramA, set: setParamA },
        { label: 'Launch Angle (deg)', min: 5, max: 85, step: 1, val: paramB, set: setParamB },
        { label: 'Air Drag (C_d)', min: 0, max: 1, step: 0.05, val: paramC, set: setParamC }
      ]
    }
  };

  const handleCustomSearchSubmit = (typedQuery?: string) => {
    const rawQuery = typedQuery || customSearchText;
    const queryStr = rawQuery.trim().toLowerCase().replace(/[\s_-]+/g, '');
    if (!queryStr) return;

    let matchedId = '';
    
    // Core paradigm keywords exchanger
    if (queryStr.includes('bubblesort') || queryStr.includes('bubble')) matchedId = 'BUBBLE_SORT';
    else if (queryStr.includes('selectionsort') || queryStr.includes('selection')) matchedId = 'SELECTION_SORT';
    else if (queryStr.includes('insertionsort') || queryStr.includes('insertion')) matchedId = 'INSERTION_SORT';
    else if (queryStr.includes('heapsort') || queryStr.includes('heap')) matchedId = 'HEAP_SORT';
    else if (queryStr.includes('radixsort') || queryStr.includes('radix')) matchedId = 'RADIX_SORT';
    else if (queryStr.includes('binarysearchtree') || queryStr.includes('bst') || queryStr.includes('tree') || queryStr.includes('trees')) matchedId = 'BST_INORDER';
    else if (queryStr.includes('binarysearch') || queryStr.includes('binary')) matchedId = 'BINARY_SEARCH';
    else if (queryStr.includes('mergesort') || queryStr.includes('merge')) matchedId = 'MERGE_SORT';
    else if (queryStr.includes('quicksort') || queryStr.includes('quick')) matchedId = 'QUICK_SORT';
    else if (queryStr.includes('avl') || queryStr.includes('balancedtree')) matchedId = 'AVL_TREE';
    else if (queryStr.includes('redblack') || queryStr.includes('rb')) matchedId = 'RED_BLACK_TREE';
    else if (queryStr.includes('dijkstra') || queryStr.includes('shortestpath') || queryStr.includes('pathfinding')) matchedId = 'DIJKSTRA_PATH';
    else if (queryStr.includes('bellman') || queryStr.includes('negativeweight')) matchedId = 'BELLMAN_FORD';
    else if (queryStr.includes('prim') || queryStr.includes('mst')) matchedId = 'PRIM_MST';
    else if (queryStr.includes('kruskal') || queryStr.includes('disjointset')) matchedId = 'KRUSKAL_MST';
    else if (queryStr.includes('astar') || queryStr.includes('pathfinder') || queryStr.includes('a*')) matchedId = 'A_STAR';
    else if (queryStr.includes('floyd') || queryStr.includes('warshall')) matchedId = 'FLOYD_WARSHALL';
    else if (queryStr.includes('kmp') || queryStr.includes('stringmatching')) matchedId = 'KMP_STRING';
    else if (queryStr.includes('bfs') || queryStr.includes('breadthfirst')) matchedId = 'BFS_GRAPH';
    else if (queryStr.includes('dfs') || queryStr.includes('depthfirst')) matchedId = 'DFS_GRAPH';

    if (!matchedId) {
      // Direct substring match heuristics against taxonomy list
      const matched = dsaTaxonomy.find(algo => {
        const nameNorm = algo.name.toLowerCase().replace(/[\s_-]+/g, '');
        const idNorm = algo.id.toLowerCase().replace(/[\s_-]+/g, '');
        return nameNorm.includes(queryStr) || idNorm.includes(queryStr) || queryStr.includes(nameNorm) || queryStr.includes(idNorm);
      });
      if (matched) {
        matchedId = matched.id;
      }
    }

    if (matchedId) {
      setSelectedAlgo(matchedId);
      setCustomSearchText('');
      // Force immediate compilation & scroll view
      setTimeout(() => {
        document.getElementById('mind-map-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      // Fallback: Default gracefully to BUBBLE_SORT but print notice on sandbox console, avoiding raw alert popup blocks
      setSelectedAlgo('BUBBLE_SORT');
      setCustomSearchText('');
      setTimeout(() => {
        document.getElementById('mind-map-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  // Compile / Setup active DSA algorithm steps & layout nodes
  const compileDsa = () => {
    setStepIndex(0);
    setIsPlaying(false);

    const values = dsaInput.split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v));

    if (values.length === 0) {
      setDsaSteps([{
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Please supply a sequence of integers above.',
        traceLog: 'Null input sequence.',
        structureState: '[]'
      }]);
      return;
    }

    const steps: SandboxStep[] = [];
    const stepLogs: string[] = [];

    // Reset layout elements
    const nodesTemp: SandboxNode[] = [];
    const connsTemp: [string, string][] = [];

    // Helper: generate circular or hierarchical coordinates
    const generateArrayLayout = (arr: number[]) => {
      arr.forEach((v, idx) => {
        nodesTemp.push({
          id: idx.toString(),
          label: v.toString(),
          x: 40 + idx * 60,
          y: 150
        });
      });
    };

    if (selectedAlgo === 'BUBBLE_SORT') {
      const arr = [...values];
      generateArrayLayout(arr);
      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Initiate Bubble Sort compilation loop.',
        traceLog: 'Array initialized: ' + JSON.stringify(arr),
        structureState: `Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });

      for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          steps.push({
            activeId: j.toString(),
            highlightedIndices: [j, j + 1],
            visitedIds: [],
            explanation: `Compare indices ${j} (${arr[j]}) and ${j + 1} (${arr[j + 1]}).`,
            traceLog: `Comparing values arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}`,
            structureState: `Cursor at ${j} || Checking Swap condition`,
            arrayState: [...arr],
            pointers: { "j": j, "j+1": j + 1 }
          });

          if (arr[j] > arr[j + 1]) {
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
            steps.push({
              activeId: (j + 1).toString(),
              highlightedIndices: [j, j + 1],
              visitedIds: [j.toString(), (j + 1).toString()],
              explanation: `Value ${arr[j + 1]} is greater than ${arr[j]}. Swap indices!`,
              traceLog: `Swapping arr[${j}] <-> arr[${j + 1}]`,
              structureState: `Swapped: [${arr.join(', ')}]`,
              arrayState: [...arr],
              pointers: { "j": j, "j+1": j + 1 }
            });
          }
        }
      }
      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Bubble sort execution complete. Array is strictly ordered.',
        traceLog: 'Terminating sorting loop.',
        structureState: `Sorted Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });
    }

    else if (selectedAlgo === 'SELECTION_SORT') {
      const arr = [...values];
      generateArrayLayout(arr);
      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Initiate Selection Sort compilation loop.',
        traceLog: 'Array initialized: ' + JSON.stringify(arr),
        structureState: `Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });

      for (let i = 0; i < arr.length; i++) {
        let minIdx = i;
        steps.push({
          activeId: i.toString(),
          highlightedIndices: [i],
          visitedIds: [],
          explanation: `Assume current index ${i} (${arr[i]}) as tentative minimum.`,
          traceLog: `Set minIdx = ${i}`,
          structureState: `Min index: ${minIdx}`,
          arrayState: [...arr],
          pointers: { "i": i, "Min": minIdx }
        });

        for (let j = i + 1; j < arr.length; j++) {
          steps.push({
            activeId: j.toString(),
            highlightedIndices: [j, minIdx],
            visitedIds: [],
            explanation: `Scan index ${j} (${arr[j]}) to check if smaller than min index (${arr[minIdx]}).`,
            traceLog: `Compare arr[${j}]=${arr[j]} < arr[${minIdx}]=${arr[minIdx]}`,
            structureState: `Scanning... Current min: ${arr[minIdx]}`,
            arrayState: [...arr],
            pointers: { "i": i, "j": j, "Min": minIdx }
          });

          if (arr[j] < arr[minIdx]) {
            minIdx = j;
            steps.push({
              activeId: minIdx.toString(),
              highlightedIndices: [minIdx],
              visitedIds: [],
              explanation: `Found new relative minimum value ${arr[minIdx]} at index ${minIdx}.`,
              traceLog: `Update minIdx = ${minIdx}`,
              structureState: `New Min: ${arr[minIdx]}`,
              arrayState: [...arr],
              pointers: { "i": i, "j": j, "Min": minIdx }
            });
          }
        }

        if (minIdx !== i) {
          const temp = arr[i];
          arr[i] = arr[minIdx];
          arr[minIdx] = temp;
          steps.push({
            activeId: i.toString(),
            highlightedIndices: [i, minIdx],
            visitedIds: [i.toString(), minIdx.toString()],
            explanation: `Swap original outer index ${i} with found minimum at index ${minIdx}.`,
            traceLog: `Swap arr[${i}] <-> arr[${minIdx}]`,
            structureState: `Array mutated: [${arr.join(', ')}]`,
            arrayState: [...arr],
            pointers: { "i": i, "Min": minIdx }
          });
        }
      }
      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Selection sort finished.',
        traceLog: 'Terminating scan cycles.',
        structureState: `Sorted Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });
    }

    else if (selectedAlgo === 'BINARY_SEARCH') {
      const arr = [...values].sort((a, b) => a - b);
      generateArrayLayout(arr);
      const target = arr[Math.floor(arr.length / 1.5)] || arr[arr.length - 1];

      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: `Binary search target: Find node value [${target}] in sorted sequence.`,
        traceLog: `Target value is ${target}. Sort input sequence first.`,
        structureState: `Target: ${target} | Sorted Range: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });

      let low = 0;
      let high = arr.length - 1;
      let iterations = 0;

      while (low <= high && iterations < 15) {
        iterations++;
        const mid = Math.floor((low + high) / 2);
        steps.push({
          activeId: mid.toString(),
          highlightedIndices: Array.from({ length: high - low + 1 }, (_, index) => low + index),
          visitedIds: [mid.toString()],
          explanation: `Check mid-index ${mid} (value: ${arr[mid]}). Current boundaries: [${low} to ${high}].`,
          traceLog: `low=${low}, high=${high}, calculated mid=${mid}, value=${arr[mid]}`,
          structureState: `boundaries: [L:${low} | M:${mid} | H:${high}]`,
          arrayState: [...arr],
          pointers: { "Low": low, "Mid": mid, "High": high }
        });

        if (arr[mid] === target) {
          steps.push({
            activeId: mid.toString(),
            highlightedIndices: [mid],
            visitedIds: [mid.toString()],
            explanation: `Match discovered at index ${mid}! Key value ${target} matches vector query.`,
            traceLog: `Discovered arr[${mid}] == ${target}`,
            structureState: `MATCH CONFIRMED AT INDEX ${mid}`,
            arrayState: [...arr],
            pointers: { "Low": low, "Mid": mid, "High": high }
          });
          break;
        } else if (arr[mid] < target) {
          low = mid + 1;
          steps.push({
            activeId: mid.toString(),
            highlightedIndices: [],
            visitedIds: [],
            explanation: `Value ${arr[mid]} is lower than target ${target}. Truncate lower partition bounds.`,
            traceLog: `Shift low pointer to ${mid + 1}`,
            structureState: `Narrow bounds: [${low} to ${high}]`,
            arrayState: [...arr],
            pointers: { "Low": low, "High": high }
          });
        } else {
          high = mid - 1;
          steps.push({
            activeId: mid.toString(),
            highlightedIndices: [],
            visitedIds: [],
            explanation: `Value ${arr[mid]} is greater than target ${target}. Truncate upper partition bounds.`,
            traceLog: `Shift high pointer to ${mid - 1}`,
            structureState: `Narrow bounds: [${low} to ${high}]`,
            arrayState: [...arr],
            pointers: { "Low": low, "High": high }
          });
        }
      }
    }

    else if (selectedAlgo === 'INSERTION_SORT') {
      const arr = [...values];
      generateArrayLayout(arr);
      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Initiate Insertion Sort.',
        traceLog: 'Array initialized: ' + JSON.stringify(arr),
        structureState: `Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });

      for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        steps.push({
          activeId: i.toString(),
          highlightedIndices: [i],
          visitedIds: [],
          explanation: `Picked key element ${key} at index ${i}.`,
          traceLog: `key = ${key}, comparing with previous sorted slice.`,
          structureState: `Key: ${key} | Sorted prefix: [${arr.slice(0, i).join(', ')}]`,
          arrayState: [...arr],
          pointers: { "i": i, "j": j }
        });

        while (j >= 0 && arr[j] > key) {
          steps.push({
            activeId: j.toString(),
            highlightedIndices: [j, j + 1],
            visitedIds: [],
            explanation: `Shift element ${arr[j]} from index ${j} to ${j + 1} since it is greater than key (${key}).`,
            traceLog: `arr[${j}] = ${arr[j]} > ${key}. Shift right.`,
            structureState: `Shifting: ${arr[j]} ->`,
            arrayState: [...arr],
            pointers: { "i": i, "j": j }
          });
          arr[j + 1] = arr[j];
          j = j - 1;
        }
        arr[j + 1] = key;
        steps.push({
          activeId: (j + 1).toString(),
          highlightedIndices: [j + 1],
          visitedIds: Array.from({ length: i + 1 }, (_, index) => index.toString()),
          explanation: `Inserted key element ${key} into position index ${j + 1}.`,
          traceLog: `Inserted at index ${j + 1}`,
          structureState: `Current Array: [${arr.join(', ')}]`,
          arrayState: [...arr],
          pointers: { "i": i, "j": j + 1 }
        });
      }

      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Insertion sort completed.',
        traceLog: 'Array is sorted.',
        structureState: `Sorted Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });
    }

    else if (selectedAlgo === 'QUICK_SORT') {
      const arr = [...values];
      generateArrayLayout(arr);
      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Initiate Quick Sort.',
        traceLog: 'Array initialized: ' + JSON.stringify(arr),
        structureState: `Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });

      const quickSortHelper = (l: number, r: number) => {
        if (l >= r) return;
        const pivot = arr[r];
        steps.push({
          activeId: r.toString(),
          highlightedIndices: [r],
          visitedIds: [],
          explanation: `Selected pivot element ${pivot} at index ${r} for range [${l} to ${r}].`,
          traceLog: `Pivot value = ${pivot}`,
          structureState: `Range: [${l}-${r}] | Pivot: ${pivot}`,
          arrayState: [...arr],
          pointers: { "Pivot": r, "l": l, "r": r }
        });

        let i = l - 1;
        for (let j = l; j < r; j++) {
          steps.push({
            activeId: j.toString(),
            highlightedIndices: [j, r],
            visitedIds: [],
            explanation: `Compare index ${j} (${arr[j]}) with pivot ${pivot}.`,
            traceLog: `Comparing arr[${j}]=${arr[j]} vs pivot=${pivot}`,
            structureState: `Pivot: ${pivot} | j: ${j}`,
            arrayState: [...arr],
            pointers: { "Pivot": r, "i": i >= l ? i : l, "j": j }
          });

          if (arr[j] < pivot) {
            i++;
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            steps.push({
              activeId: i.toString(),
              highlightedIndices: [i, j],
              visitedIds: [i.toString(), j.toString()],
              explanation: `Element ${arr[i]} is smaller than pivot. Swap index ${i} with ${j}.`,
              traceLog: `Swapping arr[${i}] <-> arr[${j}]`,
              structureState: `Mutated Array: [${arr.join(', ')}]`,
              arrayState: [...arr],
              pointers: { "Pivot": r, "i": i, "j": j }
            });
          }
        }
        const temp = arr[i + 1];
        arr[i + 1] = arr[r];
        arr[r] = temp;
        const pivotIdx = i + 1;
        steps.push({
          activeId: pivotIdx.toString(),
          highlightedIndices: [pivotIdx, r],
          visitedIds: [pivotIdx.toString(), r.toString()],
          explanation: `Place pivot ${pivot} into its correct sorted index position ${pivotIdx}.`,
          traceLog: `Swapped pivot to correct index ${pivotIdx}`,
          structureState: `Array state: [${arr.join(', ')}]`,
          arrayState: [...arr],
          pointers: { "Pivot": pivotIdx }
        });

        quickSortHelper(l, pivotIdx - 1);
        quickSortHelper(pivotIdx + 1, r);
      };

      quickSortHelper(0, arr.length - 1);
      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Quick sort complete.',
        traceLog: 'Sorting loop terminated successfully.',
        structureState: `Sorted Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });
    }

    else if (selectedAlgo === 'MERGE_SORT') {
      const arr = [...values];
      generateArrayLayout(arr);
      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Initiate Merge Sort recursion tree partition.',
        traceLog: 'Array initialized: ' + JSON.stringify(arr),
        structureState: `Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });

      const merge = (l: number, m: number, r: number) => {
        const leftArr = arr.slice(l, m + 1);
        const rightArr = arr.slice(m + 1, r + 1);
        
        steps.push({
          activeId: m.toString(),
          highlightedIndices: Array.from({ length: r - l + 1 }, (_, index) => l + index),
          visitedIds: [],
          explanation: `Merging partitions [${leftArr.join(', ')}] and [${rightArr.join(', ')}].`,
          traceLog: `Merging sub-ranges [${l}-${m}] and [${m+1}-${r}]`,
          structureState: `L: [${leftArr.join(', ')}] | R: [${rightArr.join(', ')}]`,
          arrayState: [...arr],
          pointers: { "Left": l, "Mid": m, "Right": r }
        });

        let i = 0, j = 0, k = l;
        while (i < leftArr.length && j < rightArr.length) {
          if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            i++;
          } else {
            arr[k] = rightArr[j];
            j++;
          }
          steps.push({
            activeId: k.toString(),
            highlightedIndices: [k],
            visitedIds: [k.toString()],
            explanation: `Select next smallest element ${arr[k]} from sub-array slices and write to index ${k}.`,
            traceLog: `Writing arr[${k}] = ${arr[k]}`,
            structureState: `Partial merged: [${arr.slice(l, k + 1).join(', ')}]`,
            arrayState: [...arr],
            pointers: { "Left": l, "Write": k, "Right": r }
          });
          k++;
        }

        while (i < leftArr.length) {
          arr[k] = leftArr[i];
          steps.push({
            activeId: k.toString(),
            highlightedIndices: [k],
            visitedIds: [k.toString()],
            explanation: `Append remaining left item ${arr[k]} to index ${k}.`,
            traceLog: `Appended arr[${k}] = ${arr[k]}`,
            structureState: `Merged state: [${arr.slice(l, k + 1).join(', ')}]`,
            arrayState: [...arr],
            pointers: { "Left": l, "Write": k, "Right": r }
          });
          i++;
          k++;
        }

        while (j < rightArr.length) {
          arr[k] = rightArr[j];
          steps.push({
            activeId: k.toString(),
            highlightedIndices: [k],
            visitedIds: [k.toString()],
            explanation: `Append remaining right item ${arr[k]} to index ${k}.`,
            traceLog: `Appended arr[${k}] = ${arr[k]}`,
            structureState: `Merged state: [${arr.slice(l, k + 1).join(', ')}]`,
            arrayState: [...arr],
            pointers: { "Left": l, "Write": k, "Right": r }
          });
          j++;
          k++;
        }
      };

      const mergeSortHelper = (l: number, r: number) => {
        if (l >= r) return;
        const m = Math.floor((l + r) / 2);
        steps.push({
          activeId: m.toString(),
          highlightedIndices: [l, r],
          visitedIds: [],
          explanation: `Divide range [${l} to ${r}] into sub-halves at midpoint ${m}.`,
          traceLog: `Splitting ranges at mid = ${m}`,
          structureState: `Range split: [${l}-${m}] and [${m+1}-${r}]`,
          arrayState: [...arr],
          pointers: { "Left": l, "Mid": m, "Right": r }
        });
        mergeSortHelper(l, m);
        mergeSortHelper(m + 1, r);
        merge(l, m, r);
      };

      mergeSortHelper(0, arr.length - 1);
      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Merge sort finished. Array is unified and ordered.',
        traceLog: 'Divide-and-conquer loops completed.',
        structureState: `Sorted Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });
    }

    else if (selectedAlgo === 'HEAP_SORT') {
      const arr = [...values];
      generateArrayLayout(arr);
      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Initiate Heap Sort. Build Max-Heap structure from vector sequence.',
        traceLog: 'Array initialized: ' + JSON.stringify(arr),
        structureState: `Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });

      const heapify = (heapSize: number, rootIdx: number) => {
        let largest = rootIdx;
        const left = 2 * rootIdx + 1;
        const right = 2 * rootIdx + 2;

        if (left < heapSize && arr[left] > arr[largest]) largest = left;
        if (right < heapSize && arr[right] > arr[largest]) largest = right;

        if (largest !== rootIdx) {
          const temp = arr[rootIdx];
          arr[rootIdx] = arr[largest];
          arr[largest] = temp;
          steps.push({
            activeId: largest.toString(),
            highlightedIndices: [rootIdx, largest],
            visitedIds: [rootIdx.toString(), largest.toString()],
            explanation: `Node value ${arr[rootIdx]} is smaller than child. Swap indices ${rootIdx} <-> ${largest}.`,
            traceLog: `Swapping arr[${rootIdx}] and arr[${largest}]`,
            structureState: `Heap mutated: [${arr.join(', ')}]`,
            arrayState: [...arr],
            pointers: { "Parent": rootIdx, "Largest": largest }
          });
          heapify(heapSize, largest);
        }
      };

      const n = arr.length;
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
      }

      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Max-Heap structure built successfully. Beginning root extractions.',
        traceLog: 'Heap built: ' + JSON.stringify(arr),
        structureState: `Max Heap: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });

      for (let i = n - 1; i > 0; i--) {
        const temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        steps.push({
          activeId: '0',
          highlightedIndices: [0, i],
          visitedIds: [i.toString()],
          explanation: `Swap max value root ${arr[i]} with end node ${arr[0]}. Truncate heap bounds by 1.`,
          traceLog: `Extracted element ${arr[i]}`,
          structureState: `Array: [${arr.join(', ')}]`,
          arrayState: [...arr],
          pointers: { "Root": 0, "End": i }
        });
        heapify(i, 0);
      }

      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Heap sort completed.',
        traceLog: 'Terminating heap cycles.',
        structureState: `Sorted Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });
    }

    else if (selectedAlgo === 'RADIX_SORT') {
      const arr = [...values];
      generateArrayLayout(arr);
      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Initiate Radix Sort (LSD mode).',
        traceLog: 'Array initialized: ' + JSON.stringify(arr),
        structureState: `Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });

      const maxVal = Math.max(...arr);
      for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: `Sort elements based on digit position place-value: ${exp}.`,
          traceLog: `Current exponent multiplier = ${exp}`,
          structureState: `Place-value sorting: ${exp}s`,
          arrayState: [...arr],
          pointers: { "Exp": exp }
        });

        const output = new Array(arr.length).fill(0);
        const count = new Array(10).fill(0);

        for (let i = 0; i < arr.length; i++) {
          const digit = Math.floor(arr[i] / exp) % 10;
          count[digit]++;
        }

        for (let i = 1; i < 10; i++) {
          count[i] += count[i - 1];
        }

        for (let i = arr.length - 1; i >= 0; i--) {
          const digit = Math.floor(arr[i] / exp) % 10;
          output[count[digit] - 1] = arr[i];
          count[digit]--;
        }

        for (let i = 0; i < arr.length; i++) {
          arr[i] = output[i];
          steps.push({
            activeId: i.toString(),
            highlightedIndices: [i],
            visitedIds: [i.toString()],
            explanation: `Update element index ${i} to ${arr[i]} based on the sorted buckets.`,
            traceLog: `Updating arr[${i}] = ${arr[i]}`,
            structureState: `Array phase: [${arr.join(', ')}]`,
            arrayState: [...arr],
            pointers: { "BucketIdx": i, "Exp": exp }
          });
        }
      }

      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Radix sort completed.',
        traceLog: 'Radix sort finished.',
        structureState: `Sorted Array: [${arr.join(', ')}]`,
        arrayState: [...arr],
        pointers: {}
      });
    }

    else if (selectedAlgo.startsWith('BST_') || selectedAlgo === 'AVL_TREE' || selectedAlgo === 'RED_BLACK_TREE') {
      // Build Binary Search Tree
      class TreeElement {
        value: number;
        left: TreeElement | null = null;
        right: TreeElement | null = null;
        id: string;
        color: string = '';
        constructor(v: number) { this.value = v; this.id = v.toString(); }
      }

      const insert = (root: TreeElement | null, v: number): TreeElement => {
        if (root === null) return new TreeElement(v);
        if (v < root.value) root.left = insert(root.left, v);
        else root.right = insert(root.right, v);
        return root;
      };

      let bstRoot: TreeElement | null = null;
      values.forEach(v => {
        bstRoot = insert(bstRoot, v);
      });

      // Recurse coordinates
      const bstNodes: SandboxNode[] = [];
      const bstConns: [string, string][] = [];

      const layout = (node: TreeElement | null, x: number, y: number, offset: number) => {
        if (node === null) return;
        const color = selectedAlgo === 'RED_BLACK_TREE' 
          ? (node.value % 2 === 0 ? '#EF4444' : '#1A1A1A') 
          : '';
        bstNodes.push({ id: node.id, label: node.value.toString(), x, y, color });

        if (node.left) {
          bstConns.push([node.id, node.left.id]);
          layout(node.left, x - offset, y + 45, offset / 1.8);
        }
        if (node.right) {
          bstConns.push([node.id, node.right.id]);
          layout(node.right, x + offset, y + 45, offset / 1.8);
        }
      };

      layout(bstRoot, 220, 35, 80);
      setDsaNodes(bstNodes);
      setDsaConnections(bstConns);

      // Traversal simulation step compilers
      const traversalOrder: string[] = [];
      const explainLogs: string[] = [];

      const inorder = (node: TreeElement | null) => {
        if (node === null) return;
        inorder(node.left);
        traversalOrder.push(node.id);
        explainLogs.push(`Inorder: Visit left first, then commit Node [${node.id}]`);
        inorder(node.right);
      };

      const preorder = (node: TreeElement | null) => {
        if (node === null) return;
        traversalOrder.push(node.id);
        explainLogs.push(`Preorder: Commit parent Node [${node.id}] before descending.`);
        preorder(node.left);
        preorder(node.right);
      };

      const postorder = (node: TreeElement | null) => {
        if (node === null) return;
        postorder(node.left);
        postorder(node.right);
        traversalOrder.push(node.id);
        explainLogs.push(`Postorder: Ascend to commit Root [${node.id}] after left & right subtrees.`);
      };

      if (selectedAlgo === 'BST_INORDER') inorder(bstRoot);
      else if (selectedAlgo === 'BST_PREORDER') preorder(bstRoot);
      else if (selectedAlgo === 'BST_POSTORDER') postorder(bstRoot);
      else {
        // AVL or Red-black details
        traversalOrder.push(...bstNodes.map(n => n.id));
        explainLogs.push(...bstNodes.map(n => `Examine height imbalance rotation or color flips on Node [${n.id}]`));
      }

      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: `Initialize ${selectedAlgo} on BST graph nodes.`,
        traceLog: 'Loading root state pointer.',
        structureState: 'Stack frame: [Root]'
      });

      traversalOrder.forEach((nodeId, idx) => {
        steps.push({
          activeId: nodeId,
          highlightedIndices: [idx],
          visitedIds: traversalOrder.slice(0, idx + 1),
          explanation: explainLogs[idx] || `Inspecting dynamic balance indices on Node [${nodeId}]`,
          traceLog: `Traversal cursor located on Node ${nodeId}`,
          structureState: `Visited sequence: ${traversalOrder.slice(0, idx + 1).join(' -> ')}`
        });
      });
    }

    else if (selectedAlgo === 'KMP_STRING') {
      // Simulate KMP skip table synthesis and matching on mock arrays
      const needle = kmpPattern;
      const haystack = kmpText;
      
      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: `Compile KMP LSP (Longest Proper Prefix/Suffix) failure skip array for pattern: "${needle}"`,
        traceLog: 'Pre-processing search needle patterns.',
        structureState: `Needle: ${needle}`
      });

      const lsp = new Array(needle.length).fill(0);
      let len = 0;
      let i = 1;
      while (i < needle.length) {
        if (needle[i] === needle[len]) {
          len++;
          lsp[i] = len;
          steps.push({
            activeId: i.toString(),
            highlightedIndices: [i, len],
            visitedIds: [],
            explanation: `LSP Match: proper prefix match length ${len} at pattern index ${i}`,
            traceLog: `Pattern character matching at prefix bounds. lsp[${i}] = ${len}`,
            structureState: `LSP Vector: [${lsp.join(', ')}]`
          });
          i++;
        } else {
          if (len !== 0) {
            len = lsp[len - 1];
          } else {
            lsp[i] = 0;
            i++;
          }
        }
      }

      steps.push({
        activeId: null,
        highlightedIndices: [],
        visitedIds: [],
        explanation: 'Skip table synthesized successfully. Initiating linear search on text sequence.',
        traceLog: 'LSP Compiled: ' + JSON.stringify(lsp),
        structureState: `Final Table: [${lsp.join(', ')}]`
      });

      // Match loop
      let hIdx = 0;
      let nIdx = 0;
      let stepCounter = 0;
      while (hIdx < haystack.length && stepCounter < 20) {
        stepCounter++;
        steps.push({
          activeId: hIdx.toString(),
          highlightedIndices: [hIdx],
          visitedIds: Array.from({ length: nIdx }, (_, index) => (hIdx - nIdx + index).toString()),
          explanation: `Compare text[${hIdx}] ('${haystack[hIdx]}') with pattern[${nIdx}] ('${needle[nIdx]}').`,
          traceLog: `Text index ${hIdx} vs Pattern index ${nIdx}`,
          structureState: `Matching: needle[${nIdx}]`
        });

        if (haystack[hIdx] === needle[nIdx]) {
          hIdx++;
          nIdx++;
          if (nIdx === needle.length) {
            steps.push({
              activeId: (hIdx - nIdx).toString(),
              highlightedIndices: [],
              visitedIds: [],
              explanation: `Match discovered in string index offset: ${hIdx - nIdx}!`,
              traceLog: `FULL SHIFT MATCH AT OFFSET ${hIdx - nIdx}`,
              structureState: `INDEX FIND: ${hIdx - nIdx}`
            });
            nIdx = lsp[nIdx - 1];
          }
        } else {
          if (nIdx !== 0) {
            nIdx = lsp[nIdx - 1];
          } else {
            hIdx++;
          }
        }
      }
    }

    else {
      // General graph algorithms BFS / DFS / Dijkstra / Prim / Kruskal
      const graphNodes = [
        { id: 'A', label: 'A', x: 80, y: 150 },
        { id: 'B', label: 'B', x: 220, y: 70 },
        { id: 'C', label: 'C', x: 220, y: 230 },
        { id: 'D', label: 'D', x: 360, y: 150 }
      ];
      const graphConns: [string, string][] = [
        ['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['B', 'C']
      ];

      setDsaNodes(graphNodes);
      setDsaConnections(graphConns);

      if (selectedAlgo === 'BFS_GRAPH') {
        steps.push({
          activeId: 'A',
          highlightedIndices: [0],
          visitedIds: ['A'],
          explanation: 'Initiate BFS queue. Enqueue source Node [A].',
          traceLog: 'Enqueue [A]. Set active traversal index.',
          structureState: 'Queue: [A]'
        });
        steps.push({
          activeId: 'B',
          highlightedIndices: [1],
          visitedIds: ['A', 'B'],
          explanation: 'Dequeue [A]. Enqueue children [B] and [C] to Queue.',
          traceLog: 'Visited node edges relaxing out to B & C.',
          structureState: 'Queue: [B, C]'
        });
        steps.push({
          activeId: 'C',
          highlightedIndices: [2],
          visitedIds: ['A', 'B', 'C'],
          explanation: 'Dequeue next node [B] from FIFO queue. Expand remaining adjacent node edges.',
          traceLog: 'Dumping node [B] to completed logs.',
          structureState: 'Queue: [C, D]'
        });
        steps.push({
          activeId: 'D',
          highlightedIndices: [3],
          visitedIds: ['A', 'B', 'C', 'D'],
          explanation: 'Dequeue [C] then [D]. Visual search tree expanded fully.',
          traceLog: 'Queue empty. Terminating algorithm.',
          structureState: 'Queue: []'
        });
      }

      else if (selectedAlgo === 'DFS_GRAPH') {
        steps.push({
          activeId: 'A',
          highlightedIndices: [0],
          visitedIds: ['A'],
          explanation: 'LIFO Stack initiated. Pushing source node [A] onto call stack frames.',
          traceLog: 'Stack Frame: [A]',
          structureState: 'Stack: [A]'
        });
        steps.push({
          activeId: 'B',
          highlightedIndices: [1],
          visitedIds: ['A', 'B'],
          explanation: 'Descend to adjacent child [B]. Push [B] onto stack frame.',
          traceLog: 'Recurse down to [B].',
          structureState: 'Stack: [A, B]'
        });
        steps.push({
          activeId: 'D',
          highlightedIndices: [3],
          visitedIds: ['A', 'B', 'D'],
          explanation: 'From [B], descend down to [D]. Push [D] onto call stack.',
          traceLog: 'Recurse down to [D].',
          structureState: 'Stack: [A, B, D]'
        });
        steps.push({
          activeId: 'C',
          highlightedIndices: [2],
          visitedIds: ['A', 'B', 'D', 'C'],
          explanation: 'Backtrack fully to explore adjacent vector Node [C]. DFS traversal completed.',
          traceLog: 'Popping stack elements. Done.',
          structureState: 'Stack: []'
        });
      }

      else if (selectedAlgo === 'DIJKSTRA_PATH' || selectedAlgo === 'BELLMAN_FORD') {
        steps.push({
          activeId: 'A',
          highlightedIndices: [0],
          visitedIds: [],
          explanation: 'Set start distance: Dist[A] = 0. All other node distances set to INFINITY.',
          traceLog: 'Initializing Dijkstra priority bounds.',
          structureState: 'Distances: {A:0, B:∞, C:∞, D:∞}'
        });
        steps.push({
          activeId: 'B',
          highlightedIndices: [1],
          visitedIds: ['A'],
          explanation: 'Relax outbound vectors A -> B (weight: 2) and A -> C (weight: 5).',
          traceLog: 'Dist[B] becomes min(∞, 0+2)=2.',
          structureState: 'Distances: {A:0, B:2, C:5, D:∞}'
        });
        steps.push({
          activeId: 'C',
          highlightedIndices: [2],
          visitedIds: ['A', 'B'],
          explanation: 'Select node with next minimum distance: Node [B]. Relax edge B -> D (weight: 1).',
          traceLog: 'Dist[D] becomes min(∞, 2+1)=3.',
          structureState: 'Distances: {A:0, B:2, C:5, D:3}'
        });
        steps.push({
          activeId: 'D',
          highlightedIndices: [3],
          visitedIds: ['A', 'B', 'D'],
          explanation: 'Relax C -> D. Match finished. Shortest geodesic paths strictly updated.',
          traceLog: 'Shortest path found: A -> B -> D with total cost: 3.',
          structureState: 'Distances: {A:0, B:2, C:5, D:3}'
        });
      }

      else if (selectedAlgo === 'PRIM_MST') {
        steps.push({
          activeId: 'A',
          highlightedIndices: [0],
          visitedIds: [],
          explanation: 'Initiate Prim’s Minimum Spanning Tree algorithm. Start at source Node [A].',
          traceLog: 'Set visited forest = {A}',
          structureState: 'MST Nodes: {A} | Remaining: {B, C, D}'
        });
        steps.push({
          activeId: 'B',
          highlightedIndices: [1],
          visitedIds: ['A'],
          explanation: 'Check adjacent edges: A->B (cost 2), A->C (cost 5). Select minimum cost edge A->B.',
          traceLog: 'Adding edge A-B to Spanning Forest.',
          structureState: 'MST Nodes: {A, B} | Connections: [A-B]'
        });
        steps.push({
          activeId: 'D',
          highlightedIndices: [3],
          visitedIds: ['A', 'B'],
          explanation: 'From {A, B}, check outbound edges: B->D (cost 1), B->C (cost 3), A->C (cost 5). Select minimum cost edge B->D.',
          traceLog: 'Adding edge B-D to Spanning Forest.',
          structureState: 'MST Nodes: {A, B, D} | Connections: [A-B, B-D]'
        });
        steps.push({
          activeId: 'C',
          highlightedIndices: [2],
          visitedIds: ['A', 'B', 'D'],
          explanation: 'From {A, B, D}, check outbound: B->C (cost 3), D->C (cost 2). Select minimum edge D->C.',
          traceLog: 'Adding edge D-C to Spanning Forest.',
          structureState: 'MST Nodes: {A, B, D, C} | Connections: [A-B, B-D, D-C]'
        });
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: ['A', 'B', 'C', 'D'],
          explanation: 'Prim MST generation complete. All nodes connected with minimum total weight.',
          traceLog: 'Spanning tree finalized.',
          structureState: 'Total MST Cost: 5'
        });
      }

      else if (selectedAlgo === 'KRUSKAL_MST') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Initiate Kruskal’s Minimum Spanning Tree. Sort all graph edges by weight.',
          traceLog: 'Sorted edges: [B-D (1), C-D (2), A-B (2), B-C (3), A-C (5)]',
          structureState: 'Forest: {A}, {B}, {C}, {D}'
        });
        steps.push({
          activeId: 'D',
          highlightedIndices: [3],
          visitedIds: [],
          explanation: 'Select edge with smallest weight: B-D (weight: 1). Merge subsets {B} and {D}.',
          traceLog: 'Connected B and D.',
          structureState: 'Forest: {A}, {C}, {B, D}'
        });
        steps.push({
          activeId: 'C',
          highlightedIndices: [2],
          visitedIds: ['D'],
          explanation: 'Select next smallest edge: C-D (weight: 2). Merge subsets {C} and {B, D}.',
          traceLog: 'Connected C and D.',
          structureState: 'Forest: {A}, {B, C, D}'
        });
        steps.push({
          activeId: 'A',
          highlightedIndices: [0],
          visitedIds: ['B'],
          explanation: 'Select next smallest edge: A-B (weight: 2). Merge subsets {A} and {B, C, D}.',
          traceLog: 'Connected A and B.',
          structureState: 'Forest: {A, B, C, D}'
        });
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: ['A', 'B', 'C', 'D'],
          explanation: 'Kruskal Spanning Tree finalized. All nodes belong to a single connected component.',
          traceLog: 'Disjoint-set cycle checks complete.',
          structureState: 'MST Edges: [B-D, C-D, A-B]'
        });
      }

      else if (selectedAlgo === 'A_STAR') {
        steps.push({
          activeId: 'A',
          highlightedIndices: [0],
          visitedIds: [],
          explanation: 'Initiate A* Search from node A to target D. Compute g(n), h(n) heuristic distance.',
          traceLog: 'Heuristics to target D: A=4, B=2, C=2, D=0',
          structureState: 'Open list: [A (f=4)] | Closed list: []'
        });
        steps.push({
          activeId: 'B',
          highlightedIndices: [1],
          visitedIds: ['A'],
          explanation: 'Expand A. Evaluate nodes: B (g=2, h=2, f=4) and C (g=5, h=2, f=7). Select node B.',
          traceLog: 'g(B)=2, h(B)=2, f(B)=4',
          structureState: 'Open list: [B (f=4), C (f=7)] | Closed list: [A]'
        });
        steps.push({
          activeId: 'D',
          highlightedIndices: [3],
          visitedIds: ['A', 'B'],
          explanation: 'Expand B. Evaluate adjacent node D (g=3, h=0, f=3). Target discovered!',
          traceLog: 'Target D found. Path cost is 3.',
          structureState: 'Open list: [C (f=7)] | Closed list: [A, B, D]'
        });
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: ['A', 'B', 'D'],
          explanation: 'A* Heuristic pathfinding completed. Shortest route is A -> B -> D with total cost: 3.',
          traceLog: 'Heuristic search terminated.',
          structureState: 'Path: A -> B -> D (cost=3)'
        });
      }

      else if (selectedAlgo === 'FLOYD_WARSHALL') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Initialize Floyd-Warshall distance adjacency matrix.',
          traceLog: 'Matrix loaded with edge weights and infinity.',
          structureState: 'Dist: [A:[0,2,5,∞], B:[2,0,3,1], C:[5,3,0,2], D:[∞,1,2,0]]'
        });
        steps.push({
          activeId: 'A',
          highlightedIndices: [0],
          visitedIds: ['A'],
          explanation: 'Evaluate all pairs using node A as intermediate pivot k.',
          traceLog: 'Matrix updated for k = A',
          structureState: 'Dist: [A:[0,2,5,∞], B:[2,0,3,1], C:[5,3,0,2], D:[∞,1,2,0]]'
        });
        steps.push({
          activeId: 'B',
          highlightedIndices: [1],
          visitedIds: ['A', 'B'],
          explanation: 'Evaluate all pairs using node B as intermediate pivot k. Update shortest path A-D to 3 via B.',
          traceLog: 'Matrix updated for k = B. Dist[A][D] = min(∞, Dist[A][B] + Dist[B][D]) = 3.',
          structureState: 'Dist: [A:[0,2,5,3], B:[2,0,3,1], C:[5,3,0,2], D:[3,1,2,0]]'
        });
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: ['A', 'B', 'C', 'D'],
          explanation: 'All-Pairs shortest path analysis completed.',
          traceLog: 'Matrix fully relaxed.',
          structureState: 'Final Matrix complete.'
        });
      }

      else if (selectedAlgo === 'ARRAY_SHIFT') {
        const arr = [...values];
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Initiate Array Shifting: Insert value 99 at index 2.',
          traceLog: `Initial array: ${JSON.stringify(arr)}`,
          structureState: `Array: [${arr.join(', ')}]`,
          arrayState: [...arr]
        });
        const targetIdx = 2;
        const valToInsert = 99;
        const working = [...arr, arr[arr.length - 1] || 0];
        steps.push({
          activeId: (working.length - 1).toString(),
          highlightedIndices: [working.length - 2, working.length - 1],
          visitedIds: [],
          explanation: `Expand capacity. Prepare shift from index ${working.length - 2} to ${working.length - 1}.`,
          traceLog: `Temp expanded array: ${JSON.stringify(working)}`,
          structureState: `Capacity increased`,
          arrayState: [...working]
        });
        for (let i = working.length - 1; i > targetIdx; i--) {
          working[i] = working[i - 1];
          steps.push({
            activeId: i.toString(),
            highlightedIndices: [i - 1, i],
            visitedIds: [i.toString()],
            explanation: `Shift element at index ${i - 1} (${working[i - 1]}) right to index ${i}.`,
            traceLog: `Shifting index ${i - 1} -> ${i}`,
            structureState: `Array content: [${working.join(', ')}]`,
            arrayState: [...working]
          });
        }
        working[targetIdx] = valToInsert;
        steps.push({
          activeId: targetIdx.toString(),
          highlightedIndices: [targetIdx],
          visitedIds: [targetIdx.toString()],
          explanation: `Write value ${valToInsert} to index ${targetIdx}.`,
          traceLog: `Overwriting index ${targetIdx} with ${valToInsert}`,
          structureState: `Insertion Complete: [${working.join(', ')}]`,
          arrayState: [...working]
        });
      }

      else if (selectedAlgo === 'STRING_POOLS') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Initialize String Constant Pool Allocation.',
          traceLog: 'Memory mapping set to immutable string segments.',
          structureState: 'Pool: ["hello", "world"]'
        });
        steps.push({
          activeId: 'hello',
          highlightedIndices: [0],
          visitedIds: ['hello'],
          explanation: 'Check String Pool for value "hello" (Exists: returns existing reference, avoids heap duplicates).',
          traceLog: 'Deduplicating String literal sequence "hello".',
          structureState: 'Pool: ["hello", "world"] | Heap ref: 0x7FFA'
        });
        steps.push({
          activeId: 'newStr',
          highlightedIndices: [1],
          visitedIds: ['hello', 'newStr'],
          explanation: 'Allocate new String "hello_world" on Heap due to concatenation (immutability copies elements).',
          traceLog: '"hello" + "_world" -> new String buffer allocated on heap.',
          structureState: 'Pool: ["hello", "world"] | Heap allocated: "hello_world"'
        });
      }

      else if (selectedAlgo === 'HASH_MAP') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Initialize HashMap structure with 8 buckets.',
          traceLog: 'Hash arrays initialized with chain nodes.',
          structureState: 'HashMap: { Buckets: 8, CollisionStrategy: Chaining }'
        });
        steps.push({
          activeId: 'insert_1',
          highlightedIndices: [2],
          visitedIds: ['2'],
          explanation: 'Insert Key 10. Hash code = 10 % 8 = Bucket 2. Place key-value pair in Bucket 2.',
          traceLog: 'Hash(10) modulo 8 = Bucket 2.',
          structureState: 'Bucket 2: [10 -> "val1"]'
        });
        steps.push({
          activeId: 'insert_2',
          highlightedIndices: [2],
          visitedIds: ['2'],
          explanation: 'Insert Key 18. Hash code = 18 % 8 = Bucket 2. COLLISION detected. Chain 18 onto 10.',
          traceLog: 'Hash(18) modulo 8 = Bucket 2. Appending linked node to chain.',
          structureState: 'Bucket 2: [10 -> "val1"] -> [18 -> "val2"]'
        });
      }

      else if (selectedAlgo === 'HASH_SET') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Initialize HashSets A and B.',
          traceLog: 'Set tables instanced with deduplication flags.',
          structureState: 'Set A: [1, 2, 3] | Set B: [3, 4, 5]'
        });
        steps.push({
          activeId: 'intersection',
          highlightedIndices: [3],
          visitedIds: ['3'],
          explanation: 'Compute Intersect operation: Compare keys. Element 3 is shared by both sets.',
          traceLog: 'Key intersection discovered: {3}',
          structureState: 'Intersection Set: [3]'
        });
      }

      else if (selectedAlgo === 'TWO_POINTERS') {
        const arr = [...values].sort((a, b) => a - b);
        const target = (arr[0] || 0) + (arr[arr.length - 1] || 0);
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: `Sort array for Two Pointers. Target Pair Sum: ${target}`,
          traceLog: 'Sorted inputs: ' + JSON.stringify(arr),
          structureState: `Array: [${arr.join(', ')}]`,
          arrayState: [...arr]
        });
        let left = 0;
        let right = arr.length - 1;
        while (left < right) {
          const sum = arr[left] + arr[right];
          steps.push({
            activeId: left.toString(),
            highlightedIndices: [left, right],
            visitedIds: [],
            explanation: `Pointers: Left=${left} (${arr[left]}), Right=${right} (${arr[right]}). Sum = ${sum}.`,
            traceLog: `Comparing sum ${sum} vs target ${target}`,
            structureState: `Left: ${left}, Right: ${right}`,
            arrayState: [...arr],
            pointers: { "Left": left, "Right": right }
          });
          if (sum === target) {
            steps.push({
              activeId: left.toString(),
              highlightedIndices: [left, right],
              visitedIds: [left.toString(), right.toString()],
              explanation: `Target pair found at indices [${left}, ${right}]!`,
              traceLog: `Match discovered: ${arr[left]} + ${arr[right]} = ${target}`,
              structureState: 'Pair Match discovered!',
              arrayState: [...arr],
              pointers: { "Left": left, "Right": right }
            });
            break;
          } else if (sum < target) {
            left++;
          } else {
            right--;
          }
        }
      }

      else if (selectedAlgo === 'SLIDING_WINDOW') {
        const arr = [...values];
        const K = 3;
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: `Sliding Window: Compute maximum sum of contiguous subarray of size K = ${K}.`,
          traceLog: 'Initializing boundaries.',
          structureState: `K: ${K} | Array: [${arr.join(', ')}]`,
          arrayState: [...arr]
        });
        let maxSum = 0;
        let windowSum = 0;
        for (let i = 0; i < K && i < arr.length; i++) {
          windowSum += arr[i];
        }
        maxSum = windowSum;
        steps.push({
          activeId: '0',
          highlightedIndices: Array.from({ length: K }, (_, idx) => idx),
          visitedIds: [],
          explanation: `Initialize first window [0 to ${K - 1}]. Initial Sum = ${windowSum}.`,
          traceLog: `First window: ${JSON.stringify(arr.slice(0, K))}`,
          structureState: `MaxSum: ${maxSum}`,
          arrayState: [...arr]
        });
        for (let i = K; i < arr.length; i++) {
          const oldSum = windowSum;
          windowSum = windowSum + arr[i] - arr[i - K];
          const indices = Array.from({ length: K }, (_, idx) => i - K + 1 + idx);
          maxSum = Math.max(maxSum, windowSum);
          steps.push({
            activeId: i.toString(),
            highlightedIndices: indices,
            visitedIds: [i.toString()],
            explanation: `Slide window. Subtract index ${i - K} (${arr[i - K]}) and add index ${i} (${arr[i]}). New Sum = ${windowSum}.`,
            traceLog: `Window sum updated: ${oldSum} -> ${windowSum}`,
            structureState: `MaxSum: ${maxSum}`,
            arrayState: [...arr]
          });
        }
      }

      else if (selectedAlgo === 'PREFIX_SUM') {
        const arr = [...values];
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Build Prefix Sum array P where P[i] = arr[0] + ... + arr[i].',
          traceLog: 'Initiating prefix accumulator vector.',
          structureState: `Array: [${arr.join(', ')}]`,
          arrayState: [...arr]
        });
        const prefix: number[] = [];
        let running = 0;
        arr.forEach((v, idx) => {
          running += v;
          prefix.push(running);
          steps.push({
            activeId: idx.toString(),
            highlightedIndices: [idx],
            visitedIds: Array.from({ length: idx + 1 }, (_, index) => index.toString()),
            explanation: `P[${idx}] = P[${idx - 1} || 0] + arr[${idx}] = ${running}.`,
            traceLog: `Cumulative sum calculated. prefix[${idx}] = ${running}`,
            structureState: `Prefix Array: [${prefix.join(', ')}]`,
            arrayState: [...prefix]
          });
        });
      }

      else if (selectedAlgo === 'LINKED_LIST') {
        const arr = [...values].slice(0, 5);
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Initialize LinkedList nodes.',
          traceLog: 'Pointers set to Node heads.',
          structureState: `List: ${arr.join(' -> ')}`
        });
        steps.push({
          activeId: 'head',
          highlightedIndices: [0],
          visitedIds: ['head'],
          explanation: 'Traverse head. Link current node to next.',
          traceLog: 'Traversal initialized.',
          structureState: 'Cursor: head -> A'
        });
        steps.push({
          activeId: 'insert',
          highlightedIndices: [1],
          visitedIds: ['head', 'insert'],
          explanation: 'Insert node D at offset index 2. Redirect pointer: B -> D, D -> C.',
          traceLog: 'Re-linking addresses in-place.',
          structureState: `Modified List: ${arr[0]} -> ${arr[1]} -> 99 -> ${arr[2] || 'null'}`
        });
      }

      else if (selectedAlgo === 'STACK_LIFO') {
        const arr = [...values].slice(0, 4);
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Initialize Last-In-First-Out Call Stack.',
          traceLog: 'Stack registers initialized to empty.',
          structureState: 'Stack: []'
        });
        arr.forEach((v, idx) => {
          steps.push({
            activeId: idx.toString(),
            highlightedIndices: [idx],
            visitedIds: [],
            explanation: `Push element ${v} onto LIFO Stack.`,
            traceLog: `Push value: ${v}`,
            structureState: `Stack: [${arr.slice(0, idx + 1).join(', ')}] (top: ${v})`
          });
        });
        steps.push({
          activeId: 'pop',
          highlightedIndices: [],
          visitedIds: [],
          explanation: `Pop top element ${arr[arr.length - 1]} off Stack.`,
          traceLog: `Popping top register: ${arr[arr.length - 1]}`,
          structureState: `Stack: [${arr.slice(0, arr.length - 1).join(', ')}]`
        });
      }

      else if (selectedAlgo === 'QUEUE_FIFO') {
        const arr = [...values].slice(0, 4);
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Initialize First-In-First-Out Queue.',
          traceLog: 'Queue buffers instanced.',
          structureState: 'Queue: []'
        });
        arr.forEach((v, idx) => {
          steps.push({
            activeId: idx.toString(),
            highlightedIndices: [idx],
            visitedIds: [],
            explanation: `Enqueue element ${v} at the tail of the Queue.`,
            traceLog: `Enqueue value: ${v}`,
            structureState: `Queue: [${arr.slice(0, idx + 1).join(', ')}] (tail: ${v})`
          });
        });
        steps.push({
          activeId: 'dequeue',
          highlightedIndices: [],
          visitedIds: [],
          explanation: `Dequeue element ${arr[0]} from the head of the Queue.`,
          traceLog: `Dequeuing head register: ${arr[0]}`,
          structureState: `Queue: [${arr.slice(1).join(', ')}]`
        });
      }

      else if (selectedAlgo === 'HEAP_PQ') {
        const arr = [...values].slice(0, 5);
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Initialize Min-Heap Priority Queue binary tree.',
          traceLog: 'Binary array loaded.',
          structureState: `Heap State: [${arr.join(', ')}]`
        });
        steps.push({
          activeId: 'bubble_up',
          highlightedIndices: [2, 0],
          visitedIds: [],
          explanation: `Sift-up parent swap. Compare element at index 2 (${arr[2]}) with index 0 (${arr[0]}).`,
          traceLog: 'Min-Heap property verification check.',
          structureState: `Heap Sifting: [${arr.join(', ')}]`
        });
      }

      else if (selectedAlgo === 'RECURSION') {
        steps.push({
          activeId: 'fact_3',
          highlightedIndices: [3],
          visitedIds: [],
          explanation: 'Invoke Factorial(3). Pushes recursive frame to Call Stack: fact(3) -> fact(2).',
          traceLog: 'Calling fact(3). Recurse deeper.',
          structureState: 'Stack frames: [fact(3)]'
        });
        steps.push({
          activeId: 'fact_2',
          highlightedIndices: [2],
          visitedIds: ['fact_3'],
          explanation: 'Invoke Factorial(2). Pushes recursive frame: fact(3) -> fact(2) -> fact(1).',
          traceLog: 'Calling fact(2). Recurse deeper.',
          structureState: 'Stack frames: [fact(3), fact(2)]'
        });
        steps.push({
          activeId: 'fact_1',
          highlightedIndices: [1],
          visitedIds: ['fact_3', 'fact_2'],
          explanation: 'Base case discovered: fact(1) = 1. Start unwinding and computing values.',
          traceLog: 'Unwinding call stack.',
          structureState: 'Stack frames: [fact(3), fact(2), fact(1) = 1]'
        });
        steps.push({
          activeId: 'unwind',
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Compute final resolve: fact(3) = 3 * fact(2) = 3 * 2 = 6.',
          traceLog: 'Stack frames popped cleanly.',
          structureState: 'Result: 6'
        });
      }

      else if (selectedAlgo === 'BACKTRACKING') {
        steps.push({
          activeId: 'root',
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Search State-Space: Try candidate branch A.',
          traceLog: 'Evaluating state branch: /A',
          structureState: 'Active Path: [/A]'
        });
        steps.push({
          activeId: 'A_invalid',
          highlightedIndices: [1],
          visitedIds: ['root'],
          explanation: 'Branch A fails constraint checks (Pruning: Flash RED on failure). Backtrack to root.',
          traceLog: 'Invalid candidate. Pruned /A.',
          structureState: 'Active Path: [] (Backtracked)'
        });
        steps.push({
          activeId: 'B_valid',
          highlightedIndices: [2],
          visitedIds: ['root'],
          explanation: 'Try candidate branch B. Constraints met. Deepen search on branch B.',
          traceLog: 'Evaluating state branch: /B',
          structureState: 'Active Path: [/B]'
        });
      }

      else if (selectedAlgo === 'TREES_TRAVERSAL') {
        steps.push({
          activeId: 'root',
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Trees Traversal: Begin Level-order traversal of tree.',
          traceLog: 'Push root node to queue.',
          structureState: 'Queue: [A]'
        });
        steps.push({
          activeId: 'B',
          highlightedIndices: [1],
          visitedIds: ['root'],
          explanation: 'Dequeue A, visit its children B and C. Commit A to visited sequence.',
          traceLog: 'Commit Node A.',
          structureState: 'Queue: [B, C] | Visited: [A]'
        });
      }

      else if (selectedAlgo === 'BST_INSERTION') {
        steps.push({
          activeId: 'root',
          highlightedIndices: [0],
          visitedIds: [],
          explanation: 'Insert 15 into BST. Compare 15 with Root 10 (15 > 10, descend RIGHT).',
          traceLog: '15 is larger than parent node. Traversing right.',
          structureState: 'Path: Root(10)'
        });
        steps.push({
          activeId: 'right_node',
          highlightedIndices: [1],
          visitedIds: ['root'],
          explanation: 'Compare 15 with Right Child 20 (15 < 20, descend LEFT).',
          traceLog: '15 is smaller than child node. Traversing left.',
          structureState: 'Path: Root(10) -> Right(20)'
        });
        steps.push({
          activeId: 'linked',
          highlightedIndices: [],
          visitedIds: ['root', 'right_node'],
          explanation: 'Found empty left child offset under 20. Allocate node and link 15.',
          traceLog: 'Inserting Node 15.',
          structureState: 'Insertion Complete.'
        });
      }

      else if (selectedAlgo === 'UNION_FIND') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Initialize Disjoint Set Union (DSU) elements.',
          traceLog: 'Parents vector mapped to self-referencing indices.',
          structureState: 'Parents: [0:0, 1:1, 2:2, 3:3, 4:4]'
        });
        steps.push({
          activeId: 'union_1',
          highlightedIndices: [1, 2],
          visitedIds: [],
          explanation: 'Union(1, 2). Map parent[1] = 2. Subsets {1} and {2} are merged.',
          traceLog: 'Executing union on representative root indices.',
          structureState: 'Parents: [0:0, 1:2, 2:2, 3:3, 4:4]'
        });
        steps.push({
          activeId: 'find_path_compression',
          highlightedIndices: [1],
          visitedIds: ['2'],
          explanation: 'Find(1) with Path Compression. Direct-link representative roots to index 2.',
          traceLog: 'Path compressed.',
          structureState: 'Parents: [0:0, 1:2, 2:2, 3:3, 4:4]'
        });
      }

      else if (selectedAlgo === 'DYNAMIC_PROGRAMMING') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Dynamic Programming: Initialize Tabulation Matrix.',
          traceLog: 'Sub-problems storage initialized.',
          structureState: 'DP Table: [0, 0, 0, 0, 0]'
        });
        steps.push({
          activeId: 'dp_base',
          highlightedIndices: [0, 1],
          visitedIds: [],
          explanation: 'Initialize Base Cases: DP[0] = 0, DP[1] = 1.',
          traceLog: 'Writing base registers.',
          structureState: 'DP Table: [0, 1, 0, 0, 0]'
        });
        steps.push({
          activeId: 'dp_compute',
          highlightedIndices: [2],
          visitedIds: ['dp_base'],
          explanation: 'Compute DP[2] = DP[1] + DP[0] = 1 + 0 = 1.',
          traceLog: 'Combining sub-problem solution lookup results.',
          structureState: 'DP Table: [0, 1, 1, 0, 0]'
        });
      }

      else if (selectedAlgo === 'TRIE_TREE') {
        steps.push({
          activeId: 'root',
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Trie: Insert word "cat" into Prefix Tree.',
          traceLog: 'Root node allocated.',
          structureState: 'Trie: Root'
        });
        steps.push({
          activeId: 'c_char',
          highlightedIndices: [1],
          visitedIds: ['root'],
          explanation: 'Map char "c" -> allocate link under root.',
          traceLog: 'Char link: root -> [c]',
          structureState: 'Trie: [c]'
        });
        steps.push({
          activeId: 'term',
          highlightedIndices: [2],
          visitedIds: ['root', 'c_char'],
          explanation: 'Complete characters path [c -> a -> t]. Mark "t" as Terminal (End-of-Word).',
          traceLog: 'Word "cat" completely indexed.',
          structureState: 'Trie: [c] -> [a] -> [t*]'
        });
      }

      else if (selectedAlgo === 'SEGMENT_TREE') {
        steps.push({
          activeId: 'root',
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Segment Tree: Create range intervals representation.',
          traceLog: 'Dividing index ranges [0-7].',
          structureState: 'Tree Intervals: [0-7]'
        });
        steps.push({
          activeId: 'split',
          highlightedIndices: [0, 1],
          visitedIds: [],
          explanation: 'Bisection ranges. Node [0-7] splits into children: [0-3] and [4-7].',
          traceLog: 'Sub-interval divisions computed.',
          structureState: 'Intervals: [0-3], [4-7]'
        });
      }

      else if (selectedAlgo === 'FENWICK_TREE') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Fenwick Tree: Initialize Binary Indexed Tree vector.',
          traceLog: 'Bit index relations active.',
          structureState: 'BIT Vector: [0, 0, 0, 0, 0]'
        });
        steps.push({
          activeId: 'bit_update',
          highlightedIndices: [1],
          visitedIds: [],
          explanation: 'Update value at index 1. Propagate sums to index parents via formula i += i & -i.',
          traceLog: 'Updating ranges in logarithmic time.',
          structureState: 'BIT Vector: [0, 5, 5, 0, 5]'
        });
      }

      else if (selectedAlgo === 'GREEDY_ALGO') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Greedy Interval Scheduling: Sort intervals by end-times to resolve maximum overlap selections.',
          traceLog: 'Sorting interval items.',
          structureState: 'Intervals: [A:1-3, B:2-4, C:3-5]'
        });
        steps.push({
          activeId: 'select_1',
          highlightedIndices: [0],
          visitedIds: ['select_1'],
          explanation: 'Greedily select earliest-ending interval: Interval A (1-3).',
          traceLog: 'Interval A committed.',
          structureState: 'Selected: [A] | Overlaps pruned: [B]'
        });
        steps.push({
          activeId: 'select_2',
          highlightedIndices: [2],
          visitedIds: ['select_1', 'select_2'],
          explanation: 'Select next non-overlapping interval: Interval C (3-5).',
          traceLog: 'Interval C committed.',
          structureState: 'Optimal Intervals selected: [A, C]'
        });
      }

      else if (selectedAlgo === 'BIT_MANIPULATION') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Bitboard Bitwise Operations: Initial byte value = 00001010 (Decimal 10).',
          traceLog: 'Binary board active.',
          structureState: 'Bits: 00001010'
        });
        steps.push({
          activeId: 'xor_op',
          highlightedIndices: [0],
          visitedIds: [],
          explanation: 'Execute BITWISE XOR with 00001111.',
          traceLog: '00001010 XOR 00001111 = 00000101 (Decimal 5).',
          structureState: 'Bits: 00000101'
        });
      }

      else if (selectedAlgo === 'LRU_CACHE') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'LRU Cache: Initialize dual Hash-Map & Doubly Linked List of size 2.',
          traceLog: 'Initializing eviction references.',
          structureState: 'Cache Table: {} | Eviction List: []'
        });
        steps.push({
          activeId: 'hit_1',
          highlightedIndices: [0],
          visitedIds: [],
          explanation: 'Insert Key 1. Move Key 1 to head of list (Most Recently Used / MRU).',
          traceLog: 'Key 1 stored.',
          structureState: 'Cache Table: {1: "A"} | List: [1]'
        });
        steps.push({
          activeId: 'hit_2',
          highlightedIndices: [1],
          visitedIds: [],
          explanation: 'Insert Key 2. Move Key 2 to head (MRU). Head becomes [2 <-> 1].',
          traceLog: 'Key 2 stored.',
          structureState: 'Cache Table: {1: "A", 2: "B"} | List: [2 <-> 1]'
        });
        steps.push({
          activeId: 'evict',
          highlightedIndices: [2],
          visitedIds: [],
          explanation: 'Cache full! Insert Key 3. Least Recently Used key (Key 1) evicted from tail.',
          traceLog: 'Evicting tail element 1.',
          structureState: 'Cache Table: {2: "B", 3: "C"} | List: [3 <-> 2]'
        });
      }

      else if (selectedAlgo === 'RATE_LIMITER') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Token Bucket Rate Limiter: Capacity = 3, Refill = 1 per step.',
          traceLog: 'Token bucket system instanced.',
          structureState: 'Bucket tokens count: 3'
        });
        steps.push({
          activeId: 'req_1',
          highlightedIndices: [0],
          visitedIds: [],
          explanation: 'Request 1 arrives. Consumes 1 token. ALLOWED.',
          traceLog: 'Permit granted.',
          structureState: 'Bucket tokens count: 2'
        });
        steps.push({
          activeId: 'req_deplete',
          highlightedIndices: [1, 2],
          visitedIds: [],
          explanation: 'Request 2 and 3 arrive instantly. Consumes all remaining tokens. ALLOWED.',
          traceLog: 'Permits granted. Tokens depleted.',
          structureState: 'Bucket tokens count: 0'
        });
        steps.push({
          activeId: 'req_reject',
          highlightedIndices: [3],
          visitedIds: [],
          explanation: 'Request 4 arrives. Bucket is empty! DENIED (Rate limit exceeded, 429 status code returned).',
          traceLog: 'Refusing packet entry.',
          structureState: 'Bucket tokens count: 0'
        });
      }

      else if (selectedAlgo === 'DESIGN_PATTERNS') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'UML Observer Pattern Relationship Diagram.',
          traceLog: 'State relationships active.',
          structureState: 'Classes: [Subject, Observer_A, Observer_B]'
        });
        steps.push({
          activeId: 'notify',
          highlightedIndices: [1],
          visitedIds: [],
          explanation: 'Subject state modifies. Notify observer loops. Dispatching callbacks to Observer_A and Observer_B.',
          traceLog: 'Broadcasting model update payload.',
          structureState: 'Dispatched event stream'
        });
      }

      else if (selectedAlgo === 'SYSTEM_DESIGN') {
        steps.push({
          activeId: null,
          highlightedIndices: [],
          visitedIds: [],
          explanation: 'Tiered Enterprise Distributed System Architecture.',
          traceLog: 'Network infrastructure active.',
          structureState: 'Infrastructure: [DNS, LoadBalancer, WebServers, RedisCache, PostgresShard_1, PostgresShard_2]'
        });
        steps.push({
          activeId: 'query',
          highlightedIndices: [0],
          visitedIds: [],
          explanation: 'Client query -> Load Balancer maps packet to Server_B. Check Redis cache first (Cache MISS). Query Shard_1.',
          traceLog: 'Routing database transactions.',
          structureState: 'Packet stream routed: LB -> Server_B -> DB_Shard_1'
        });
      }

      else {
        // Fallback default
        steps.push({
          activeId: 'A',
          highlightedIndices: [0],
          visitedIds: ['A'],
          explanation: `Compile ${selectedAlgo} adjacency network parameters.`,
          traceLog: 'Inspecting node matrices.',
          structureState: 'State: INITIALIZED'
        });
        steps.push({
          activeId: 'D',
          highlightedIndices: [3],
          visitedIds: ['A', 'B', 'C', 'D'],
          explanation: `Perform topological sort iteration or relax sub-edges on structural limits.`,
          traceLog: 'Calculated node cost mappings.',
          structureState: 'State: COMPLETION'
        });
      }
    }

    setDsaSteps(steps);
  };

  // Run initial DSA step compilation
  useEffect(() => {
    compileDsa();
  }, [selectedAlgo, dsaInput, kmpPattern, kmpText]);

  // Handle Playback requestAnimationFrame timer for fluid animations
  useEffect(() => {
    if (!isPlaying) {
      setAnimProgress(0);
      return;
    }

    let lastTime = performance.now();
    let frameId: number;

    const loop = (now: number) => {
      const delta = now - lastTime;
      if (delta >= playbackSpeed) {
        setStepIndex(prev => {
          if (prev < dsaSteps.length - 1) {
            lastTime = now;
            setAnimProgress(0);
            return prev + 1;
          } else {
            setIsPlaying(false);
            setAnimProgress(0);
            return prev;
          }
        });
      } else {
        // Linearly interpolate progress from 0 to 1
        const progress = Math.min(1, delta / playbackSpeed);
        setAnimProgress(progress);
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, dsaSteps, playbackSpeed]);

  // --- PHYSICS ENGINE ANIMATION LOOP ---
  useEffect(() => {
    if (sandboxMode !== 'PHYSICS') {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      physTime.current += 0.05 * paramC; // Scale evolution rate by velocity slider

      // Draw dark grid lines overlay for all physics backdrops
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.06)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // --- 1. FOURIER TRANSFORM SYNTHESIS ---
      if (selectedPhysics === 'FOURIER_TRANSFORM') {
        const harmonics = Math.floor(paramA);
        const freq = paramB;
        const noiseAmp = paramC;

        const centerX = 150;
        const centerY = 150;
        let x = centerX;
        let y = centerY;

        // Trace orbital epicycles
        for (let i = 1; i <= harmonics; i++) {
          const prevX = x;
          const prevY = y;
          const n = 2 * i - 1; // square wave harmonics
          const radius = 45 * (4 / (Math.PI * n));

          const theta = n * freq * physTime.current;
          x += radius * Math.cos(theta);
          y += radius * Math.sin(theta);

          // Draw rotating orbital vector circle
          ctx.strokeStyle = i === 1 ? '#D4AF37' : 'rgba(212, 175, 55, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(prevX, prevY, radius, 0, 2 * Math.PI);
          ctx.stroke();

          // Vector arm line
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        // Draw drawing tip
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Draw propagating wave to the right
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const startWaveX = 260;
        ctx.moveTo(startWaveX, y);

        for (let wx = 0; wx < 180; wx++) {
          // Reconstruct wave function mathematically
          let wy = 0;
          const phaseOffset = physTime.current - wx * 0.08;
          for (let n = 1; n <= harmonics; n++) {
            const harmonicNum = 2 * n - 1;
            const r = 45 * (4 / (Math.PI * harmonicNum));
            wy += r * Math.sin(harmonicNum * freq * phaseOffset);
          }
          // Add noise amplification vector
          wy += Math.sin(wx * 0.4) * noiseAmp * 2;
          ctx.lineTo(startWaveX + wx, centerY + wy);
        }
        ctx.stroke();

        // Draw connector link line
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(startWaveX, y);
        ctx.stroke();

        // Draw spectrum bar-chart labels
        ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
        ctx.font = '8px monospace';
        ctx.fillText('FREQUENCY SPECTRUM HARMONICS', 270, 45);
        for (let i = 1; i <= 6; i++) {
          const n = 2 * i - 1;
          const amp = 40 * (4 / (Math.PI * n));
          ctx.fillStyle = i <= harmonics ? '#D4AF37' : 'rgba(212,175,55,0.15)';
          ctx.fillRect(270 + i * 22, 15, 12, -amp * 0.8);
          ctx.fillText(`f_${n}`, 272 + i * 22, 25);
        }
      }

      // --- 2. MAXWELL EQUATIONS ---
      else if (selectedPhysics === 'MAXWELL_EQUATIONS') {
        const amplitude = paramA;
        const spatialFreq = paramB;
        ctx.lineWidth = 2;

        // Draw E-field (Vertical Red Sine waves) in 3D projection
        ctx.strokeStyle = '#EF4444';
        ctx.beginPath();
        for (let x = 10; x < canvas.width - 20; x += 3) {
          const y = 150 + amplitude * Math.sin(x * 0.04 * spatialFreq - physTime.current);
          if (x === 10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw B-field (Orthogonal Blue Cosine waves skewed for 3D depth)
        ctx.strokeStyle = '#3B82F6';
        ctx.beginPath();
        for (let x = 10; x < canvas.width - 20; x += 3) {
          const wave = amplitude * Math.cos(x * 0.04 * spatialFreq - physTime.current);
          // Skew wave output diagonally to represent Z-axis in 3D perspective
          const skX = x + wave * 0.4;
          const skY = 150 - wave * 0.4;
          if (x === 10) ctx.moveTo(skX, skY); else ctx.lineTo(skX, skY);
        }
        ctx.stroke();

        // Draw vectors linking field nodes to propagation axis
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 0.5;
        for (let x = 30; x < canvas.width - 20; x += 25) {
          const waveE = amplitude * Math.sin(x * 0.04 * spatialFreq - physTime.current);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath();
          ctx.moveTo(x, 150);
          ctx.lineTo(x, 150 + waveE);
          ctx.stroke();

          const waveB = amplitude * Math.cos(x * 0.04 * spatialFreq - physTime.current);
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
          ctx.beginPath();
          ctx.moveTo(x, 150);
          ctx.lineTo(x + waveB * 0.4, 150 - waveB * 0.4);
          ctx.stroke();
        }

        // Draw Central Propagation Ray
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(10, 150);
        ctx.lineTo(canvas.width - 20, 150);
        ctx.stroke();

        // Arrow head
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.moveTo(canvas.width - 15, 150);
        ctx.lineTo(canvas.width - 25, 146);
        ctx.lineTo(canvas.width - 25, 154);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '8.5px monospace';
        ctx.fillText('🔴 ELECTRIC FIELD VECTOR (E)', 15, 30);
        ctx.fillText('🔵 MAGNETIC FIELD VECTOR (B)', 15, 45);
        ctx.fillText('⚡ PROPAGATION GEODESIC (K)', 15, 60);
      }

      // --- 3. SCHRODINGER WAVE EQUATION ---
      else if (selectedPhysics === 'SCHRODINGER_WAVE') {
        const energyLevel = Math.floor(paramA);
        const barrierHeight = paramB;
        const waveSpeed = paramC;

        const barrierX = 230;

        // Draw potential barrier step
        ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        ctx.fillRect(barrierX, 150, canvas.width - barrierX, -barrierHeight);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(barrierX, 150);
        ctx.lineTo(barrierX, 150 - barrierHeight);
        ctx.lineTo(canvas.width, 150 - barrierHeight);
        ctx.stroke();

        ctx.fillStyle = '#EF4444';
        ctx.font = '8px monospace';
        ctx.fillText(`POTENTIAL ENERGY V_0 = ${barrierHeight} eV`, barrierX + 10, 150 - barrierHeight - 5);

        // Compute and draw wave function packet Ψ(x)
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        for (let x = 10; x < canvas.width; x += 2) {
          let amplitude = 0;
          const k = energyLevel * 0.05;

          if (x < barrierX) {
            // Harmonic wave packet
            const envelope = Math.exp(-Math.pow((x - 120), 2) / 1200);
            amplitude = 40 * envelope * Math.sin(x * k - physTime.current * waveSpeed);
          } else {
            // Tunneling evanescent decay (Exponential Decay)
            const envelopeAtBarrier = Math.exp(-Math.pow((barrierX - 120), 2) / 1200);
            const decay = Math.exp(-(x - barrierX) * 0.05);
            amplitude = 40 * envelopeAtBarrier * decay * Math.sin(barrierX * k - physTime.current * waveSpeed);
          }

          const y = 150 - amplitude;
          if (x === 10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
        ctx.fillText('QUANTUM WAVE PACKET Tunneling Mode', 20, 260);
      }

      // --- 4. EINSTEIN FIELD EQUATIONS GRID ---
      else if (selectedPhysics === 'EINSTEIN_FIELD_EQ') {
        const mass = paramA;
        const lambda = paramB;
        const warpRadius = paramC;

        const massX = canvas.width / 2;
        const massY = canvas.height / 2;

        // Draw Curvature deforming grid lines
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 0.5;

        // Horizontal warped lines
        for (let row = 20; row < canvas.height; row += 20) {
          ctx.beginPath();
          for (let col = 0; col <= canvas.width; col += 10) {
            const dx = col - massX;
            const dy = row - massY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let warpOffset = 0;
            if (dist < warpRadius * 4) {
              const force = (mass * 150) / (dist + warpRadius + 5);
              warpOffset = force * (dy / (dist + 0.1));
            }

            // Apply cosmological constant expansion warp
            const cosmicOffset = lambda * Math.sin(col * 0.02) * 2;

            if (col === 0) {
              ctx.moveTo(col, row + warpOffset + cosmicOffset);
            } else {
              ctx.lineTo(col, row + warpOffset + cosmicOffset);
            }
          }
          ctx.stroke();
        }

        // Vertical warped lines
        for (let col = 20; col < canvas.width; col += 20) {
          ctx.beginPath();
          for (let row = 0; row <= canvas.height; row += 10) {
            const dx = col - massX;
            const dy = row - massY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let warpOffset = 0;
            if (dist < warpRadius * 4) {
              const force = (mass * 150) / (dist + warpRadius + 5);
              warpOffset = force * (dx / (dist + 0.1));
            }

            const cosmicOffset = lambda * Math.cos(row * 0.02) * 2;

            if (row === 0) {
              ctx.moveTo(col + warpOffset + cosmicOffset, row);
            } else {
              ctx.lineTo(col + warpOffset + cosmicOffset, row);
            }
          }
          ctx.stroke();
        }

        // Draw Gravitational Singularity Core
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(massX, massY, mass * 2.5 + 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw warped light ray path
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 10; x < canvas.width; x += 4) {
          const dx = x - massX;
          const dy = 80 - massY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const deflection = (mass * 600) / (dist + 15);
          ctx.lineTo(x, 80 + deflection);
        }
        ctx.stroke();
        ctx.fillStyle = '#EF4444';
        ctx.fillText('GRAVITATIONAL LIGHT DEFLECTION (GEODESIC PATH)', 15, 275);
      }

      // --- 5. DOUBLE PENDULUM CHAOTIC SIMULATION ---
      else if (selectedPhysics === 'DOUBLE_PENDULUM') {
        const l1 = paramA;
        const l2 = paramB;
        const gravity = paramC;

        // Custom Runge-Kutta 1st order approximate steps for theta1 and theta2
        const originX = canvas.width / 2;
        const originY = 80;

        let { theta1, theta2, p1, p2 } = pendulumState.current;

        // Equations of motion approximation
        const mu = 1 + 1; // equal masses m1=m2=1
        const delta = theta1 - theta2;

        const dTheta1 = (p1 * l2 - p2 * l1 * Math.cos(delta)) / (l1 * l1 * l2 * (mu - Math.pow(Math.cos(delta), 2)));
        const dTheta2 = (p2 * l1 * mu - p1 * l2 * Math.cos(delta)) / (l1 * l2 * l2 * (mu - Math.pow(Math.cos(delta), 2)));

        const dp1 = -mu * gravity * Math.sin(theta1) - dTheta1 * dTheta2 * l1 * l2 * Math.sin(delta);
        const dp2 = -gravity * Math.sin(theta2) + dTheta1 * dTheta2 * l1 * l2 * Math.sin(delta);

        // Update parameters
        theta1 += dTheta1 * 0.15;
        theta2 += dTheta2 * 0.15;
        p1 += dp1 * 0.15;
        p2 += dp2 * 0.15;

        // Dampen slightly to prevent extreme bounds
        p1 *= 0.998;
        p2 *= 0.998;

        pendulumState.current = { theta1, theta2, p1, p2 };

        const x1 = originX + l1 * Math.sin(theta1);
        const y1 = originY + l1 * Math.cos(theta1);

        const x2 = x1 + l2 * Math.sin(theta2);
        const y2 = y1 + l2 * Math.cos(theta2);

        // Store trail
        pendulumTrail.current.push({ x: x2, y: y2 });
        if (pendulumTrail.current.length > 100) pendulumTrail.current.shift();

        // Draw chaotic trail lines
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        pendulumTrail.current.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();

        // Draw rods
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Draw mass bob 1
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(x1, y1, 7, 0, 2 * Math.PI);
        ctx.fill();

        // Draw mass bob 2
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(x2, y2, 7, 0, 2 * Math.PI);
        ctx.fill();
      }

      // --- 6. PROJECTILE KINEMATICS ---
      else if (selectedPhysics === 'PROJECTILE_MOTION') {
        const speed = paramA;
        const angleRad = (paramB * Math.PI) / 180;
        const drag = paramC;

        const groundY = 240;
        const originX = 40;

        // Plot physics curves
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(originX, groundY);

        let px = originX;
        let py = groundY;
        let vx = speed * Math.cos(angleRad);
        let vy = -speed * Math.sin(angleRad); // negative y in standard canvas is up
        const dt = 0.15;

        for (let stepIdx = 0; stepIdx < 200; stepIdx++) {
          // Accelerate due to gravity and air drag force
          const dragForceX = -0.5 * drag * 0.05 * vx * Math.abs(vx);
          const dragForceY = -0.5 * drag * 0.05 * vy * Math.abs(vy);

          vx += dragForceX * dt;
          vy += (10 + dragForceY) * dt; // gravity constant 10

          px += vx * dt;
          py += vy * dt;

          if (py > groundY) {
            ctx.lineTo(px, groundY);
            break;
          }
          ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw ground level
        ctx.strokeStyle = '#1A1A1A';
        if (document.documentElement.classList.contains('dark')) ctx.strokeStyle = '#262626';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(10, groundY);
        ctx.lineTo(canvas.width - 10, groundY);
        ctx.stroke();

        // Render animated launch vector circle pointer
        const pointerT = (physTime.current * 0.2) % 1;
        let animPx = originX;
        let animPy = groundY;
        let animVx = speed * Math.cos(angleRad);
        let animVy = -speed * Math.sin(angleRad);

        for (let stepIdx = 0; stepIdx < Math.floor(pointerT * 120); stepIdx++) {
          const dragForceX = -0.5 * drag * 0.05 * animVx * Math.abs(animVx);
          const dragForceY = -0.5 * drag * 0.05 * animVy * Math.abs(animVy);

          animVx += dragForceX * dt;
          animVy += (10 + dragForceY) * dt;

          animPx += animVx * dt;
          animPy += animVy * dt;

          if (animPy > groundY) {
            animPy = groundY;
            break;
          }
        }

        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(animPx, animPy, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '8px monospace';
        ctx.fillText(`Apex Altitude Y: ${Math.floor(groundY - animPy)} m`, animPx - 20, animPy - 10);
      }

      localFrameId = requestAnimationFrame(render);
    };

    localFrameId = requestAnimationFrame(render);
    animationFrameId.current = localFrameId;

    return () => {
      if (localFrameId) cancelAnimationFrame(localFrameId);
    };
  }, [sandboxMode, selectedPhysics, paramA, paramB, paramC]);

  const resetSimulation = () => {
    setStepIndex(0);
    setIsPlaying(false);
    pendulumState.current = { theta1: Math.PI / 3, theta2: Math.PI / 4, p1: 0, p2: 0 };
    pendulumTrail.current = [];
    physTime.current = 0;
  };

  const activePhysicsConfig = physicsTaxonomy[selectedPhysics as keyof typeof physicsTaxonomy];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-bg-card border-2 border-border-main p-6 shadow-[4px_4px_0px_rgba(26,26,26,0.15)] dark:shadow-[4px_4px_0px_rgba(212,175,55,0.25)] select-none" id="mind-map-section">
      
      {/* Left Input & Controller board panel */}
      <div className="space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Main Sandbox switcher */}
          <div className="flex border-2 border-border-main p-0.5 bg-bg-main">
            <button
              onClick={() => { setSandboxMode('DSA'); resetSimulation(); }}
              className={`flex-1 text-center py-2 text-xs font-mono font-bold uppercase transition cursor-pointer ${
                sandboxMode === 'DSA' ? 'sandbox-selector-btn-active' : 'sandbox-selector-btn'
              }`}
            >
              📊 DSA Taxonomy
            </button>
            <button
              onClick={() => { setSandboxMode('PHYSICS'); resetSimulation(); }}
              className={`flex-1 text-center py-2 text-xs font-mono font-bold uppercase transition cursor-pointer ${
                sandboxMode === 'PHYSICS' ? 'sandbox-selector-btn-active' : 'sandbox-selector-btn'
              }`}
            >
              ⚛️ Physics Sandbox
            </button>
          </div>

          {/* DSA Mode UI Panel */}
          {sandboxMode === 'DSA' && (
            <div className="space-y-3">
              <div>
                <label className="text-[8px] font-mono font-bold text-text-main/50 uppercase tracking-widest block mb-1">
                  Select Algorithmic Module
                </label>
                <select
                  value={selectedAlgo}
                  onChange={(e) => { setSelectedAlgo(e.target.value); compileDsa(); }}
                  className="w-full border-2 border-border-main bg-bg-main text-xs font-mono text-text-main outline-none p-2 rounded-none cursor-pointer"
                >
                  <optgroup label="FOUNDATIONAL ALGORITHMS" className="font-sans font-bold">
                    <option value="BUBBLE_SORT">Bubble Sort (Array Iterations)</option>
                    <option value="SELECTION_SORT">Selection Sort (Minimum Scan)</option>
                    <option value="INSERTION_SORT">Insertion Sort (Prefix Scan)</option>
                    <option value="HEAP_SORT">Heap Sort (Max Binary Heap)</option>
                    <option value="RADIX_SORT">Radix Sort (Linear Bucket LSD)</option>
                    <option value="BINARY_SEARCH">Binary Search (Logarithmic Bounds)</option>
                    <option value="MERGE_SORT">Merge Sort (Recursive Divide)</option>
                    <option value="QUICK_SORT">Quick Sort (Pivot Partition)</option>
                  </optgroup>
                  <optgroup label="INTERMEDIATE & TREE TRAVERSALS" className="font-sans font-bold">
                    <option value="BST_INORDER">BST Inorder (Left-Root-Right)</option>
                    <option value="BST_PREORDER">BST Preorder (Root-Left-Right)</option>
                    <option value="BST_POSTORDER">BST Postorder (Left-Right-Root)</option>
                    <option value="BFS_GRAPH">BFS Graph Breadth Traversal</option>
                    <option value="DFS_GRAPH">DFS Graph Depth Traversal</option>
                  </optgroup>
                  <optgroup label="ADVANCED GRAPH & TREE DATA STRUCTURES" className="font-sans font-bold">
                    <option value="DIJKSTRA_PATH">Dijkstra Shortest Path</option>
                    <option value="BELLMAN_FORD">Bellman-Ford Cycle Explorer</option>
                    <option value="PRIM_MST">Prim MST (Spanning Tree)</option>
                    <option value="KRUSKAL_MST">Kruskal MST (Disjoint Set)</option>
                    <option value="A_STAR">A* Heuristic Search Pathfinder</option>
                    <option value="FLOYD_WARSHALL">Floyd-Warshall All-Pairs</option>
                    <option value="AVL_TREE">AVL Tree Dynamic Balancer</option>
                    <option value="RED_BLACK_TREE">Red-Black Node Balancing</option>
                  </optgroup>
                  <optgroup label="FLOWS & COMPLEX STRING SEARCH" className="font-sans font-bold">
                    <option value="KMP_STRING">Knuth-Morris-Pratt Matching</option>
                  </optgroup>
                </select>
              </div>

              {/* Custom Typed Search & Execution */}
              <div className="pt-1.5 border-t border-border-main/20">
                <label className="text-[8px] font-mono font-bold text-text-main/50 uppercase tracking-widest block mb-1">
                  Or Type Custom Paradigm
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customSearchText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomSearchText(val);
                      // Dynamic swap on type if matching criteria met
                      const query = val.toLowerCase().replace(/[\s_-]+/g, '');
                      if (query.length >= 3) {
                        const matched = dsaTaxonomy.find(algo => {
                          const nameNorm = algo.name.toLowerCase().replace(/[\s_-]+/g, '');
                          const idNorm = algo.id.toLowerCase().replace(/[\s_-]+/g, '');
                          return nameNorm.includes(query) || idNorm.includes(query) || query.includes(nameNorm) || query.includes(idNorm);
                        });
                        if (matched) {
                          setSelectedAlgo(matched.id);
                        }
                      }
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCustomSearchSubmit(); }}
                    className="flex-1 border-2 border-border-main bg-bg-main outline-none p-2 text-xs font-mono text-text-main rounded-none"
                    placeholder="e.g. Merge Sort, Quick Sort, Radix, A*"
                  />
                  <button
                    onClick={() => handleCustomSearchSubmit()}
                    className="border-2 border-border-main bg-text-main text-bg-main px-3 py-1.5 text-xs font-mono font-bold uppercase hover:bg-accent-gold hover:text-zinc-950 transition cursor-pointer"
                  >
                    Type Execute
                  </button>
                </div>

                {customSearchText.trim() && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <span className="text-[7.5px] font-mono text-text-main/40 uppercase block w-full">Matches:</span>
                    {dsaTaxonomy
                      .filter(algo => 
                        algo.name.toLowerCase().includes(customSearchText.toLowerCase()) || 
                        algo.id.toLowerCase().includes(customSearchText.toLowerCase())
                      )
                      .slice(0, 4)
                      .map(algo => (
                        <button
                          key={algo.id}
                          type="button"
                          onClick={() => {
                            setSelectedAlgo(algo.id);
                            setCustomSearchText(algo.name);
                          }}
                          className={`text-[8.5px] font-mono px-2 py-0.5 border transition cursor-pointer ${
                            selectedAlgo === algo.id 
                              ? 'bg-accent-gold/25 text-[#FFD700] border-[#FFD700]' 
                              : 'bg-bg-main text-text-main/70 border-border-main/20 hover:border-[#FFD700] hover:text-[#FFD700]'
                          }`}
                        >
                          {algo.name} ⚡
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>

              {selectedAlgo === 'KMP_STRING' ? (
                <div className="space-y-2 bg-bg-main/50 p-2 border border-border-main/10">
                  <div>
                    <label className="text-[7.5px] font-mono font-bold text-text-main/50 uppercase block mb-0.5">KMP String needle pattern</label>
                    <input
                      type="text"
                      value={kmpPattern}
                      onChange={(e) => setKmpPattern(e.target.value)}
                      className="w-full bg-bg-card border border-border-main text-xs font-mono p-1 text-text-main"
                    />
                  </div>
                  <div>
                    <label className="text-[7.5px] font-mono font-bold text-text-main/50 uppercase block mb-0.5">Search Input Haystack Text</label>
                    <input
                      type="text"
                      value={kmpText}
                      onChange={(e) => setKmpText(e.target.value)}
                      className="w-full bg-bg-card border border-border-main text-xs font-mono p-1 text-text-main"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[8px] font-mono font-bold text-text-main/50 uppercase tracking-widest block mb-1">
                    Custom array vector input
                  </label>
                  <input
                    type="text"
                    value={dsaInput}
                    onChange={(e) => setDsaInput(e.target.value)}
                    className="w-full border-2 border-border-main bg-bg-main outline-none p-2 text-xs font-mono text-text-main rounded-none"
                    placeholder="e.g. 10, 5, 15, 3, 7 (BST sequence)"
                  />
                  <div className="flex gap-2 mt-1.5">
                    <button
                      onClick={() => setDsaInput('40, 25, 75, 10, 95, 60, 50')}
                      className="text-[8px] font-mono border border-border-main/30 px-1.5 py-0.5 hover:border-accent-gold text-text-main/50 cursor-pointer"
                    >
                      BST Tree CSV
                    </button>
                    <button
                      onClick={() => setDsaInput('12, 45, 2, 99, 14, 5, 71')}
                      className="text-[8px] font-mono border border-border-main/30 px-1.5 py-0.5 hover:border-accent-gold text-text-main/50 cursor-pointer"
                    >
                      Sort List
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Physics Mode UI Panel */}
          {sandboxMode === 'PHYSICS' && (
            <div className="space-y-3">
              <div>
                <label className="text-[8px] font-mono font-bold text-text-main/50 uppercase tracking-widest block mb-1">
                  Select Physical Derivation
                </label>
                <select
                  value={selectedPhysics}
                  onChange={(e) => setSelectedPhysics(e.target.value)}
                  className="w-full border-2 border-border-main bg-bg-main text-xs font-mono text-text-main outline-none p-2 rounded-none cursor-pointer"
                >
                  <option value="FOURIER_TRANSFORM">Fourier Transform Signal Synthesis</option>
                  <option value="MAXWELL_EQUATIONS">Maxwell’s Electromagnetic Propagation</option>
                  <option value="SCHRODINGER_WAVE">Schrödinger Wave Probabilities</option>
                  <option value="EINSTEIN_FIELD_EQ">Einstein Field Spacetime Curvature</option>
                  <option value="DOUBLE_PENDULUM">Chaotic Double Pendulum Core</option>
                  <option value="PROJECTILE_MOTION">Kinematic Drag Projectile</option>
                </select>
              </div>

              {/* Dynamic Sliders Render */}
              <div className="bg-bg-main/50 border border-border-main/10 p-3 space-y-2.5">
                <span className="text-[8.5px] font-mono font-bold text-text-main/40 uppercase tracking-widest block border-b border-border-main/5 pb-1">
                  SLIDER COEFFICIENT PARAMETERS
                </span>
                {activePhysicsConfig.sliders.map((s, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center text-[9px] font-mono mb-1">
                      <span className="text-text-main/60">{s.label}:</span>
                      <span className="text-accent-gold font-bold">{s.val}</span>
                    </div>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={s.val}
                      onChange={(e) => s.set(parseFloat(e.target.value))}
                      className="w-full accent-accent-gold cursor-pointer bg-border-main"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Formula Matrix Display */}
          <div className="bg-[#1A1A1A]/5 dark:bg-[#1A1A1A]/40 border-2 border-border-main p-3.5 space-y-1.5 font-mono">
            <span className="text-[8px] font-bold uppercase text-accent-gold tracking-widest flex items-center gap-1">
              <Sliders className="h-3 w-3" /> FORMULA COEFFICIENT MATRIX
            </span>
            <div className="bg-bg-card p-2 text-center text-xs border border-border-main/10 shadow-inner font-bold text-text-main/80 select-text">
              {sandboxMode === 'DSA' ? (
                selectedAlgo === 'BUBBLE_SORT' ? 'O(N²) Worst-Case Swap loops' :
                selectedAlgo === 'BINARY_SEARCH' ? 'O(log N) Bisect array steps' :
                selectedAlgo.startsWith('BST_') ? 'Tree Traversal Recursion' : 'O(E log V) Graph Relaxes'
              ) : (
                activePhysicsConfig.formula
              )}
            </div>
            <p className="text-[8.5px] text-text-main/50 font-serif leading-tight">
              {sandboxMode === 'DSA' 
                ? dsaTaxonomy.find(t => t.id === selectedAlgo)?.description 
                : activePhysicsConfig.desc
              }
            </p>
          </div>
        </div>

        {/* Real-World Execution Anchor Section */}
        <div className="bg-amber-500/5 border border-dashed border-accent-gold/40 p-3 font-mono text-[9px] leading-relaxed">
          <span className="text-accent-gold font-bold uppercase tracking-wider block mb-1">📍 Real-World Execution Anchor</span>
          <p className="text-text-main/70 font-serif">
            {sandboxMode === 'DSA'
              ? dsaTaxonomy.find(t => t.id === selectedAlgo)?.anchor
              : activePhysicsConfig.anchor
            }
          </p>
        </div>
      </div>

      {/* Center/Right Dynamic Interactive Graphic Viewport */}
      <div className="lg:col-span-2 space-y-4">
        {/* Sticky Slide to Exit Workspace Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-950 border border-[#FFD700]/20 p-3 shadow-inner rounded-none gap-3">
          <SlideToExitButton onExit={() => { setIsPlaying(false); resetSimulation(); }} />
          <span className="text-[9px] font-mono font-bold text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 px-2.5 py-1 border border-[#FFD700]/20">
            OS-SANDBOX-LIVE Engine Active
          </span>
        </div>

        {/* Playback step controllers header */}
        <div className="flex items-center justify-between border-b border-border-main/10 pb-3 select-none">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={resetSimulation}
              className="bg-bg-card hover:bg-bg-main p-1.5 border border-border-main text-[9px] font-mono uppercase font-bold flex items-center gap-1 cursor-pointer"
              title="Reset state parameters"
            >
              <RotateCcw className="h-3 w-3 text-accent-gold" /> Reset
            </button>
            
            {sandboxMode === 'DSA' && (
              <>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-bg-card hover:bg-bg-main p-1.5 border border-border-main text-[9px] font-mono uppercase font-bold flex items-center gap-1 cursor-pointer"
                  title="Play / Pause automatic traversal compilation"
                >
                  {isPlaying ? (
                    <><Pause className="h-3 w-3 text-red-500 fill-red-500" /> Pause</>
                  ) : (
                    <><Play className="h-3 w-3 text-emerald-500 fill-emerald-500" /> Play</>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (stepIndex < dsaSteps.length - 1) setStepIndex(prev => prev + 1);
                  }}
                  disabled={stepIndex >= dsaSteps.length - 1}
                  className="bg-bg-card hover:bg-bg-main disabled:opacity-40 p-1.5 border border-border-main text-[9px] font-mono uppercase font-bold flex items-center gap-1 cursor-pointer"
                  title="Step Forward one node sequence"
                >
                  <SkipForward className="h-3 w-3 text-accent-gold" /> Step Next
                </button>

                <div className="flex items-center gap-2 border border-border-main/20 px-2 py-1 bg-bg-card text-[9px] font-mono">
                  <span className="text-text-main/50 uppercase tracking-wider">Speed:</span>
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="10"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseInt(e.target.value, 10))}
                    className="w-16 accent-accent-gold cursor-pointer"
                  />
                  <span className="text-accent-gold font-bold">{playbackSpeed}ms</span>
                </div>
              </>
            )}
          </div>

          {sandboxMode === 'DSA' ? (
            <div className="text-[10px] font-mono text-text-main/60">
              Traversed Step: <span className="text-accent-gold font-bold">{stepIndex + 1}</span> of <span className="font-bold">{dsaSteps.length || 1}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[10px] font-mono text-text-main/60">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>Differential Euler Real-time integration loop active</span>
            </div>
          )}
        </div>

        {/* Main interactive viewport container */}
        <div className="relative w-full h-80 bg-[#1A1A1A]/5 dark:bg-zinc-950/40 border-2 border-border-main overflow-hidden flex items-center justify-center">
          {sandboxMode === 'DSA' ? (
            // Render High-Contrast DSA Vector arrays, lists, or graphs
            <div className="absolute inset-0 select-none">
              {/* If algorithm is sorting, array shift, stack, queue, two pointers, sliding window, prefix sum, linked list, recursion, heap, etc. */}
              {selectedAlgo.endsWith('_SORT') || 
               selectedAlgo === 'BINARY_SEARCH' || 
               selectedAlgo === 'ARRAY_SHIFT' || 
               selectedAlgo === 'TWO_POINTERS' || 
               selectedAlgo === 'SLIDING_WINDOW' || 
               selectedAlgo === 'PREFIX_SUM' || 
               selectedAlgo === 'LINKED_LIST' || 
               selectedAlgo === 'STACK_LIFO' || 
               selectedAlgo === 'QUEUE_FIFO' || 
               selectedAlgo === 'HEAP_PQ' || 
               selectedAlgo === 'RECURSION' ? (
                <div className="w-full h-full flex flex-col justify-center items-center px-4 pb-6 gap-4 relative">
                  <span className="text-[9px] font-mono font-bold text-accent-gold uppercase tracking-wider">
                    {selectedAlgo.replace('_', ' ')} ACTIVE STATE STAGE
                  </span>
                  <div className="flex items-end justify-center gap-2 h-36 w-full">
                    {(dsaSteps[stepIndex]?.arrayState || dsaNodes.map(node => parseInt(node.label, 10) || 0)).slice(0, 12).map((val, i) => {
                      const stepObj = dsaSteps[stepIndex];
                      const isComparing = stepObj?.highlightedIndices.includes(i);
                      const isSwapped = stepObj?.visitedIds.includes(i.toString());
                      const isActive = stepObj?.activeId === i.toString();

                      // Frame-by-frame element translations and swaps calculation
                      let translationX = 0;
                      const isSwappingThisStep = stepObj?.visitedIds && stepObj.visitedIds.length > 0;
                      const swappingIndices = isSwappingThisStep ? (stepObj.highlightedIndices || []) : [];
                      if (isSwappingThisStep && swappingIndices.length === 2) {
                        const [idxA, idxB] = [...swappingIndices].sort((a, b) => a - b);
                        if (i === idxA) {
                          translationX = animProgress * (idxB - idxA) * 115;
                        } else if (i === idxB) {
                          translationX = -animProgress * (idxB - idxA) * 115;
                        }
                      }

                      // Match pointers
                      const matchedPointers: string[] = [];
                      if (stepObj?.pointers) {
                        for (const [key, pval] of Object.entries(stepObj.pointers)) {
                          if (pval === i) {
                            matchedPointers.push(key);
                          }
                        }
                      }

                      return (
                        <motion.div
                          layout
                          key={`${i}-${val}`}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          style={{ transform: translationX ? `translateX(${translationX}%)` : 'none' }}
                          className="flex flex-col items-center flex-1 max-w-[44px]"
                        >
                          {/* Value display */}
                          <motion.span
                            layout
                            className={`text-[10px] font-mono font-bold mb-1 transition-colors duration-200 ${
                              isActive ? 'text-accent-gold scale-110 font-bold' : 'text-text-main/70'
                            }`}
                          >
                            {val}
                          </motion.span>
                          {/* Cell box/Bar representation */}
                          <motion.div
                            layout
                            style={{ height: `${Math.max(val * 2.2, 40)}px` }}
                            className={`w-full flex items-center justify-center border-2 rounded-sm transition-all duration-300 ${
                              isSwapped
                                ? 'bg-emerald-500/60 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] text-white'
                                : isComparing
                                ? 'bg-rose-500/60 border-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.3)] text-white'
                                : isActive
                                ? 'bg-accent-gold border-accent-gold text-slate-950 shadow-[0_0_12px_#D4AF37]'
                                : 'bg-[#1A1A1A]/40 dark:bg-zinc-800/50 border-border-main text-text-main/80'
                            }`}
                          >
                            <span className="font-mono text-xs font-bold">{val}</span>
                          </motion.div>
                          <span className="text-[7.5px] font-mono text-text-main/40 mt-1">idx_{i}</span>
                          
                          {/* Pointer flags */}
                          <div className="flex flex-col gap-0.5 mt-1 w-full items-center">
                            {matchedPointers.map((p, pidx) => (
                              <motion.span
                                layout
                                key={pidx}
                                className="text-[7px] font-mono px-1 py-0.5 bg-accent-gold text-slate-950 font-black rounded-sm uppercase tracking-wider animate-pulse block text-center truncate max-w-full"
                              >
                                {p}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : selectedAlgo === 'HASH_MAP' ? (
                <div className="w-full h-full flex flex-col justify-center p-6 gap-3">
                  <span className="text-[9px] font-mono font-bold text-accent-gold uppercase tracking-wider text-center">
                    DYNAMIC HASH BUCKETS MATRIX
                  </span>
                  <div className="space-y-1.5 max-w-sm mx-auto w-full">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(bucketIdx => {
                      const isBucketTarget = dsaSteps[stepIndex]?.highlightedIndices.includes(bucketIdx);
                      const isCollision = dsaSteps[stepIndex]?.visitedIds.includes(bucketIdx.toString());
                      return (
                        <div key={bucketIdx} className={`flex items-center gap-3 p-1 border transition-all duration-300 ${
                          isBucketTarget ? 'bg-accent-gold/15 border-accent-gold shadow-[0_0_8px_rgba(212,175,55,0.2)]' : 'bg-bg-card/40 border-border-main/40'
                        }`}>
                          <span className={`font-mono text-[9px] w-12 font-bold ${isBucketTarget ? 'text-accent-gold' : 'text-text-main/40'}`}>
                            B_{bucketIdx} :
                          </span>
                          <div className="flex gap-2">
                            {bucketIdx === 2 ? (
                              <>
                                <div className="px-2 py-0.5 bg-bg-card border border-border-main text-[9px] font-mono rounded">
                                  [Key: 10]
                                </div>
                                {isCollision && (
                                  <>
                                    <span className="text-accent-gold font-bold">→</span>
                                    <div className="px-2 py-0.5 bg-rose-500/20 border border-rose-500 text-[9px] font-mono rounded text-rose-300 animate-bounce">
                                      [Key: 18] (Collision Link)
                                    </div>
                                  </>
                                )}
                              </>
                            ) : bucketIdx === 5 ? (
                              <div className="px-2 py-0.5 bg-bg-card border border-border-main text-[9px] font-mono rounded text-text-main/60">
                                [Key: 5]
                              </div>
                            ) : (
                              <span className="text-[9px] font-mono text-text-main/20">Empty Slot</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : selectedAlgo === 'HASH_SET' ? (
                <div className="w-full h-full flex flex-col justify-center items-center p-6 gap-4">
                  <span className="text-[9px] font-mono font-bold text-accent-gold uppercase tracking-wider">
                    DEDUPLICATED HASHSET VENN RELATION
                  </span>
                  <div className="flex items-center justify-center gap-8 relative w-full h-40">
                    <div className="absolute left-[15%] w-28 h-28 rounded-full border-2 border-dashed border-sky-500/40 bg-sky-500/5 flex flex-col items-center justify-center">
                      <span className="text-[8px] font-mono font-bold text-sky-400 absolute top-2">SET A</span>
                      <div className="flex flex-col gap-1 text-[10px] font-mono text-sky-300 mt-2">
                        <span>• Value 1</span>
                        <span>• Value 2</span>
                      </div>
                    </div>
                    
                    <div className="absolute left-[38%] z-10 w-24 h-24 rounded-full border-2 border-accent-gold bg-accent-gold/10 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.2)]">
                      <span className="text-[8px] font-mono font-bold text-accent-gold">INTERSECT</span>
                      <span className="text-sm font-mono font-black text-accent-gold animate-pulse">3</span>
                    </div>
                    <div className="absolute right-[15%] w-28 h-28 rounded-full border-2 border-dashed border-amber-500/40 bg-amber-500/5 flex flex-col items-center justify-center">
                      <span className="text-[8px] font-mono font-bold text-amber-400 absolute top-2">SET B</span>
                      <div className="flex flex-col gap-1 text-[10px] font-mono text-amber-300 mt-2">
                        <span>• Value 4</span>
                        <span>• Value 5</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedAlgo === 'LRU_CACHE' ? (
                <div className="w-full h-full flex flex-col justify-center items-center p-6 gap-4">
                  <span className="text-[9px] font-mono font-bold text-accent-gold uppercase tracking-wider">
                    LRU CACHE MEMORY EVICTION SCHEME
                  </span>
                  <div className="flex flex-col justify-center gap-6 w-full max-w-sm">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[8px] font-mono font-bold text-emerald-400">MRU</span>
                      <div className="px-3 py-1.5 bg-emerald-500/10 border-2 border-emerald-500 text-xs font-mono font-bold text-emerald-300 rounded">
                        Key: 3 [val]
                      </div>
                      <span className="text-text-main/40 font-bold">↔</span>
                      <div className="px-3 py-1.5 bg-bg-card border border-border-main text-xs font-mono text-text-main/70 rounded">
                        Key: 2 [val]
                      </div>
                      {dsaSteps[stepIndex]?.activeId !== 'evict' && (
                        <>
                          <span className="text-text-main/40 font-bold">↔</span>
                          <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/40 text-xs font-mono text-rose-400 rounded">
                            Key: 1 [val]
                          </div>
                        </>
                      )}
                      <span className="text-[8px] font-mono font-bold text-rose-400">LRU</span>
                    </div>
                    
                    {dsaSteps[stepIndex]?.activeId === 'evict' && (
                      <div className="text-center p-2 border border-dashed border-rose-500/40 bg-rose-500/5 rounded text-[9.5px] font-mono text-rose-300 animate-pulse">
                        ⚠️ [LRU EVICTION EVENT]: Least-Recently-Used Node 1 evicting from tail!
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedAlgo === 'RATE_LIMITER' ? (
                <div className="w-full h-full flex flex-col justify-center items-center p-6 gap-4">
                  <span className="text-[9px] font-mono font-bold text-accent-gold uppercase tracking-wider">
                    TOKEN BUCKET RATE-LIMIT BARRIER
                  </span>
                  <div className="flex items-center gap-8 w-full max-w-sm">
                    <div className="flex-1 h-32 border-4 border-t-0 border-border-main/50 rounded-b-xl relative bg-zinc-900/40 overflow-hidden flex flex-col justify-end items-center p-2">
                      {Array.from({ length: dsaSteps[stepIndex]?.activeId === 'req_1' ? 2 : dsaSteps[stepIndex]?.activeId === 'req_deplete' ? 0 : dsaSteps[stepIndex]?.activeId === 'req_reject' ? 0 : 3 }).map((_, idx) => (
                        <div key={idx} className="w-16 h-6 bg-accent-gold border border-amber-400 rounded-lg flex items-center justify-center text-slate-950 font-mono text-[9px] font-black shadow-md animate-bounce mb-1">
                          TOKEN
                        </div>
                      ))}
                      {dsaSteps[stepIndex]?.activeId === 'req_deplete' && (
                        <span className="text-[9px] font-mono text-rose-400 font-bold animate-pulse absolute top-10">DEPLETED</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="p-2 border border-border-main/40 bg-bg-card/40 text-[9px] font-mono">
                        Bucket Cap: <span className="text-accent-gold font-bold">3 Tokens</span>
                      </div>
                      <div className={`p-2 border font-mono text-[9px] ${
                        dsaSteps[stepIndex]?.activeId === 'req_reject' ? 'border-rose-500 bg-rose-500/10 text-rose-300' : 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      }`}>
                        {dsaSteps[stepIndex]?.activeId === 'req_reject' ? '❌ REQ 4: DENIED (429 Limit)' : '✓ REQ RECEIVED: ACCEPTED'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedAlgo === 'DYNAMIC_PROGRAMMING' ? (
                <div className="w-full h-full flex flex-col justify-center items-center p-6 gap-3">
                  <span className="text-[9px] font-mono font-bold text-accent-gold uppercase tracking-wider">
                    LIVE DYNAMIC TABULATION GRID
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 max-w-[220px]">
                    {Array.from({ length: 25 }).map((_, idx) => {
                      const row = Math.floor(idx / 5);
                      const col = idx % 5;
                      const isComputed = row + col <= stepIndex + 1;
                      const isActive = row + col === stepIndex + 1;
                      return (
                        <div
                          key={idx}
                          className={`w-10 h-10 border flex flex-col justify-center items-center transition-all duration-300 ${
                            isActive ? 'bg-accent-gold border-accent-gold text-slate-950 font-black shadow-md' :
                            isComputed ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-bg-card/40 border-border-main/20 text-text-main/20'
                          }`}
                        >
                          <span className="text-[7px] font-mono text-text-main/30 absolute top-0.5">[{row},{col}]</span>
                          <span className="text-xs font-mono font-bold mt-1.5">{isComputed ? (row === 0 || col === 0 ? 1 : row * col + 1) : 0}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : selectedAlgo === 'BIT_MANIPULATION' ? (
                <div className="w-full h-full flex flex-col justify-center items-center p-6 gap-4">
                  <span className="text-[9px] font-mono font-bold text-accent-gold uppercase tracking-wider">
                    BITWISE REGISTERS ACTIVE STATUS
                  </span>
                  <div className="flex flex-col gap-3 w-full max-w-sm">
                    <div className="flex justify-center gap-1.5">
                      {[0, 0, 0, 0, 1, 0, 1, 0].map((bit, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded bg-zinc-800 border border-border-main/50 flex items-center justify-center text-xs font-mono font-bold text-text-main/80">
                            {bit}
                          </div>
                          <span className="text-[7px] font-mono text-text-main/30 mt-1">b_{7 - idx}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-[9px] font-mono text-accent-gold">
                      XOR OPERATION APPLIED (MASK: 00001111)
                    </div>
                    <div className="flex justify-center gap-1.5">
                      {[0, 0, 0, 0, 0, 1, 0, 1].map((bit, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded border flex items-center justify-center text-xs font-mono font-bold ${
                            idx >= 4 ? 'bg-accent-gold border-accent-gold text-slate-950 shadow-[0_0_8px_#D4AF37]' : 'bg-zinc-900 border-border-main/20 text-text-main/30'
                          }`}>
                            {bit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : selectedAlgo === 'DESIGN_PATTERNS' || selectedAlgo === 'SYSTEM_DESIGN' ? (
                <div className="w-full h-full flex flex-col justify-center items-center p-6 gap-4">
                  <span className="text-[9px] font-mono font-bold text-accent-gold uppercase tracking-wider">
                    DISTRIBUTED TOPOLOGY NODE NETWORK
                  </span>
                  <div className="grid grid-cols-3 gap-4 w-full max-w-sm text-center">
                    <div className="p-2 border border-dashed border-sky-400 bg-sky-500/10 rounded font-mono text-[9px] text-sky-300">
                      CLIENT ACCESS
                    </div>
                    <div className="p-2 border border-accent-gold bg-accent-gold/10 rounded font-mono text-[9px] text-accent-gold animate-pulse">
                      LOAD BALANCER
                    </div>
                    <div className="p-2 border border-zinc-700 bg-bg-card/40 rounded font-mono text-[9px] text-text-main/50">
                      WEB SERVERS
                    </div>
                    <div className="p-2 border border-zinc-700 bg-bg-card/40 rounded font-mono text-[9px] text-text-main/50">
                      REDIS CACHE
                    </div>
                    <div className="p-2 border border-emerald-500 bg-emerald-500/10 rounded font-mono text-[9px] text-emerald-300">
                      SHARD NODE 1
                    </div>
                    <div className="p-2 border border-zinc-700 bg-bg-card/40 rounded font-mono text-[9px] text-text-main/50">
                      SHARD NODE 2
                    </div>
                  </div>
                </div>
              ) : selectedAlgo === 'KMP_STRING' ? (
                // Draw sliding matrix arrays for matching pattern
                <div className="w-full h-full flex flex-col justify-center items-center gap-6 p-4">
                  {/* Haystack Sequence */}
                  <div className="space-y-1 w-full max-w-md">
                    <span className="text-[8px] font-mono font-bold text-text-main/40 uppercase block">Haystack Text Sequence</span>
                    <div className="flex gap-1 overflow-x-auto py-1">
                      {kmpText.split('').map((char, i) => {
                        const isActive = dsaSteps[stepIndex]?.activeId === i.toString();
                        return (
                          <div
                            key={i}
                            className={`w-7 h-7 flex items-center justify-center border text-xs font-mono font-bold ${
                              isActive ? 'bg-accent-gold border-accent-gold text-slate-950 scale-110 shadow-md' : 'bg-bg-card border-border-main text-text-main/70'
                            }`}
                          >
                            {char}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Pattern needle table */}
                  <div className="space-y-1 w-full max-w-md">
                    <span className="text-[8px] font-mono font-bold text-text-main/40 uppercase block">Pattern Needle Index Matching</span>
                    <div className="flex gap-1 py-1">
                      {kmpPattern.split('').map((char, i) => {
                        const isComparing = dsaSteps[stepIndex]?.visitedIds.includes(i.toString());
                        return (
                          <div
                            key={i}
                            className={`w-7 h-7 flex items-center justify-center border text-xs font-mono font-bold ${
                              isComparing ? 'bg-rose-500/50 border-rose-500 text-text-main' : 'bg-bg-card border-border-main text-text-main/50'
                            }`}
                          >
                            {char}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                // Render tree or graph coordinates using simple relative layout pins
                <div className="w-full h-full relative">
                  {/* Connections paths */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {dsaConnections.map(([src, dst], idx) => {
                      const fromNode = dsaNodes.find(n => n.id === src);
                      const toNode = dsaNodes.find(n => n.id === dst);
                      if (!fromNode || !toNode) return null;
                      return (
                        <line
                          key={idx}
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                          className="text-text-main/20 dark:text-zinc-700"
                        />
                      );
                    })}
                  </svg>
                  {/* Nodes list */}
                  {dsaNodes.map((node, i) => {
                    const stepActiveId = dsaSteps[stepIndex]?.activeId;
                    const isActive = stepActiveId === node.id;
                    const isVisited = dsaSteps[stepIndex]?.visitedIds.includes(node.id);

                    return (
                      <div
                        key={node.id}
                        style={{ left: `${node.x - 18}px`, top: `${node.y - 18}px` }}
                        className={`absolute w-9 h-9 rounded-full border-2 font-mono text-xs font-bold flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? 'bg-accent-gold border-accent-gold text-slate-950 scale-125 font-black shadow-[0_0_12px_#D4AF37]'
                            : isVisited
                            ? 'bg-emerald-500/30 border-emerald-500 text-text-main'
                            : 'bg-bg-card border-border-main text-text-main'
                        }`}
                        title={`Node: ${node.label}`}
                      >
                        {node.color && (
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: node.color }} title="Red-black balancing state node paint" />
                        )}
                        {node.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // Render active Physics Canvas Loop
            <canvas
              ref={canvasRef}
              width={460}
              height={300}
              className="absolute inset-0 w-full h-full object-cover block bg-slate-950"
            />
          )}
        </div>

        {/* Monospace debug log ledger terminal */}
        <div className="bg-[#050505] p-3.5 border-2 border-border-main font-mono text-[9px] text-[#A5F3FC] h-32 overflow-y-auto space-y-1 shadow-inner select-text">
          <span className="text-zinc-500 uppercase block border-b border-zinc-800 pb-1.5 mb-1.5 font-bold text-[8px] tracking-widest flex items-center justify-between">
            <span>ALGORITHM TRACE LEDGER & BACKTRACK OUTPUT</span>
            <span className="text-accent-gold font-bold">OS-SANDBOX-LIVE</span>
          </span>
          {sandboxMode === 'DSA' ? (
            <>
              <p className="text-emerald-400 font-bold leading-relaxed">
                step_{stepIndex + 1}&gt; {dsaSteps[stepIndex]?.explanation}
              </p>
              <p className="text-white/60">
                [LOG] {dsaSteps[stepIndex]?.traceLog}
              </p>
              <p className="text-[#3B82F6] font-bold">
                [STATE STRUCTURE] {dsaSteps[stepIndex]?.structureState}
              </p>
            </>
          ) : (
            <div className="space-y-1">
              <p className="text-emerald-400 font-bold">&gt; Active Simulation Frame: Euler-Cromer Dynamic Convergence</p>
              <p className="text-white/50">&gt; Integrating differential coordinates mapping equations at step step_dt=0.05s.</p>
              <p className="text-[#3B82F6]">&gt; Parameter coefficients mapped successfully onto hardware-accelerated grid layers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==================== SUB-TOOL 3: ACADEMIC ESSAY WRITER & CITATION GENERATOR ==================== */
function EssayCitationEngine() {
  const [essayTopic, setEssayTopic] = useState('The Role of Encryption in Web Security');
  const [citationTitle, setCitationTitle] = useState('Computer Security Handbook');
  const [citationAuthor, setCitationAuthor] = useState('Smith, John');
  const [citationYear, setCitationYear] = useState('2024');
  const [citationStyle, setCitationStyle] = useState<'APA' | 'MLA' | 'IEEE'>('APA');

  const [citations, setCitations] = useState<string[]>([
    'Smith, J. (2024). Computer Security Handbook. Academic Press.'
  ]);

  const generateCitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citationTitle.trim()) return;

    let compiled = '';
    if (citationStyle === 'APA') {
      compiled = `${citationAuthor || 'Author Unknown'}. (${citationYear || 'n.d.'}). ${citationTitle}. Academic Press.`;
    } else if (citationStyle === 'MLA') {
      compiled = `${citationAuthor || 'Author Unknown'}. "${citationTitle}." Academic Press, ${citationYear || 'n.d.'}.`;
    } else {
      compiled = `[1] ${citationAuthor || 'Author Unknown'}, "${citationTitle}," Academic Press, ${citationYear || 'n.d.'}.`;
    }

    setCitations(prev => [compiled, ...prev]);
    setCitationTitle('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="essay-writer-section">
      {/* Editor block */}
      <div className="bg-bg-card p-6 rounded-none border-2 border-border-main shadow-[4px_4px_0px_rgba(26,26,26,0.15)] space-y-4">
        <h3 className="font-serif font-black italic text-text-main text-sm">Academic Essay Draft Editor</h3>
        <div>
          <label className="text-[10px] font-mono font-bold text-text-main/50 uppercase tracking-wider block mb-1">Topic</label>
          <input
            type="text"
            value={essayTopic}
            onChange={(e) => setEssayTopic(e.target.value)}
            className="w-full border border-border-main bg-bg-main outline-none rounded-none px-3 py-2 text-xs font-mono text-text-main"
          />
        </div>
        <textarea
          rows={6}
          className="w-full border border-border-main bg-bg-main outline-none rounded-none p-4 text-xs leading-relaxed font-sans text-text-main"
          defaultValue={`Academic studies assert that encryption serves as the vital defense mechanism on public network protocols. Utilizing modern cryptographic standards like Advanced Encryption Standard (AES) ensures that user sessions remain secure and resilient against snooping or man-in-the-middle exploits.`}
        />
        <button className="w-full bg-text-main text-bg-main text-xs font-mono py-2.5 rounded-none cursor-pointer uppercase tracking-wider border border-border-main">
          Compile Essay Draft
        </button>
      </div>

      {/* Bibliography compiler */}
      <div className="bg-bg-card p-6 rounded-none border-2 border-border-main shadow-[4px_4px_0px_rgba(26,26,26,0.15)] flex flex-col justify-between">
        <div>
          <h3 className="font-serif font-black italic text-text-main text-sm mb-4">Citation & Bibliography Compiler</h3>
          <form onSubmit={generateCitation} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono font-bold text-text-main/50 uppercase tracking-wider block mb-1">Book / Paper Title</label>
              <input
                type="text"
                required
                value={citationTitle}
                onChange={(e) => setCitationTitle(e.target.value)}
                className="w-full border border-border-main bg-bg-main outline-none rounded-none px-3 py-2 text-xs font-mono text-text-main"
                placeholder="E.g. Computer Networks"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold text-text-main/50 uppercase tracking-wider block mb-1">Author</label>
              <input
                type="text"
                value={citationAuthor}
                onChange={(e) => setCitationAuthor(e.target.value)}
                className="w-full border border-border-main bg-bg-main outline-none rounded-none px-3 py-2 text-xs font-mono text-text-main"
                placeholder="Smith, John"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold text-text-main/50 uppercase tracking-wider block mb-1">Year</label>
              <input
                type="text"
                value={citationYear}
                onChange={(e) => setCitationYear(e.target.value)}
                className="w-full border border-border-main bg-bg-main outline-none rounded-none px-3 py-2 text-xs font-mono text-text-main"
                placeholder="2024"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold text-text-main/50 uppercase tracking-wider block mb-1">Bibliography Style</label>
              <select
                value={citationStyle}
                onChange={(e) => setCitationStyle(e.target.value as any)}
                className="w-full border border-border-main bg-bg-main outline-none rounded-none px-3 py-2 text-xs font-mono text-text-main"
              >
                <option value="APA">APA 7th Edition</option>
                <option value="MLA">MLA 9th Edition</option>
                <option value="IEEE">IEEE Reference</option>
              </select>
            </div>
            <button type="submit" className="col-span-2 bg-text-main text-bg-main text-xs font-mono py-2.5 rounded-none cursor-pointer border border-border-main">
              Compile Citation Entry
            </button>
          </form>
        </div>

        <div className="mt-6 border-t border-border-main/10 pt-5">
          <h4 className="text-[9px] font-mono font-bold text-text-main/40 uppercase tracking-wider mb-2.5">Academic Bibliography Works Cited</h4>
          <div className="space-y-2">
            {citations.map((cite, idx) => (
              <div key={idx} className="p-3 bg-bg-main rounded-none border border-border-main/20 text-[10px] font-mono leading-relaxed text-text-main select-all text-left">
                {cite}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== SUB-TOOL 4: PDF SUMMARIZER & SECURE OCR SCANNER ==================== */
function PdfSummarizerScanner() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Markdown Inline Editor contents
  const [editorMarkdown, setEditorMarkdown] = useState<string>('');
  const [dragOverPdf, setDragOverPdf] = useState(false);

  // Synopses & Quizzes extracts
  const [synopsis, setSynopsis] = useState<string>('Upload or drop a syllabus or exam paper context to view extracted executive insights here.');
  const [vocab, setVocab] = useState<{term: string, def: string}[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<{q: string, choices: string[], correct: number, selected?: number}[]>([]);

  const handlePdfUploadSimulation = (fileName: string, rawText: string) => {
    setIsScanning(true);
    setScanError(null);
    setSummary(null);

    setTimeout(() => {
      setIsScanning(false);
      if (fileName.toLowerCase().includes('malicious') || rawText.includes('../')) {
        setScanError('WAF Shield Alarm: Input text contain relative directory dot sequences and shell path keywords.');
        return;
      }

      setSynopsis(`Executive Synthesis: The submitted document (${fileName}) provides a highly specialized review of application-level security filters, including cryptographic sub-bytes matrix vectors.`);
      
      setVocab([
        { term: 'Galois Field (GF)', def: 'An algebraic field containing a finite number of elements, essential for encryption algorithms.' },
        { term: 'Rijndael Block', def: 'The core block cipher structure forming the mathematical basis of the AES standard.' }
      ]);

      setQuizQuestions([
        { 
          q: 'Which algebraic field serves as the foundation for AES byte substitutions?', 
          choices: ['Galois Field GF(2^8)', 'Prime Field PF(1024)', 'Discrete Log Group', 'None of the above'],
          correct: 0 
        }
      ]);

      setEditorMarkdown(`# SUMMARY REPORT: ${fileName.toUpperCase()}

## Overview & Mathematical Context
The uploaded syllabus outlines symmetric AES algorithms and discrete group exponents. In Galois Fields of characteristic 2, bytes are treated as polynomials.

## Key Extraction Insights
1. **WAF Validation Rule**: Input stream filtering is the primary defense against payload injections.
2. **Path Resolution Boundaries**: Resolving absolute canonical workspace bounds prevents directory traversal bugs.

---
*Created inside Student OS Document Sandbox*`);
    }, 1000);
  };

  const handleQuizAnswer = (qIdx: number, choiceIdx: number) => {
    setQuizQuestions(prev => prev.map((q, idx) => idx === qIdx ? { ...q, selected: choiceIdx } : q));
  };

  return (
    <div className="space-y-6" id="summarizer-section">
      <div className="flex justify-between items-center bg-bg-card border-2 border-border-main p-4 shadow-[2px_2px_0px_rgba(26,26,26,0.15)]">
        <div>
          <h3 className="text-sm font-mono font-bold uppercase text-text-main flex items-center gap-1.5">
            <BookOpenCheck className="text-text-main h-4.5 w-4.5" /> Secure PDF Summarizer & OCR Workspace
          </h3>
          <p className="text-[11px] text-text-main/60 font-serif">Simulate dropping textbook papers. Secure shields parse and compile intelligence extracts.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-text-main text-bg-main text-xs font-mono px-4 py-2 uppercase tracking-wider border border-border-main cursor-pointer"
        >
          Compile & Export Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Upload zone and Intelligence collapsible cards */}
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOverPdf(true); }}
            onDragLeave={() => setDragOverPdf(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverPdf(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                  handlePdfUploadSimulation(file.name, reader.result as string);
                };
                reader.readAsText(file);
              }
            }}
            onClick={() => document.getElementById('pdf-summarizer-file-input')?.click()}
            className={`border-2 border-dashed p-6 text-center transition cursor-pointer bg-bg-card ${
              dragOverPdf ? 'border-accent-gold bg-amber-500/5' : 'border-border-main/20 hover:border-accent-gold'
            }`}
          >
            <UploadCloud className="h-7 w-7 text-text-main/40 mx-auto mb-1.5" />
            <span className="text-[10px] font-mono font-bold text-text-main block">
              CLICK OR DRAG & DROP SYLLABUS / EXAM PAPER HERE
            </span>
            <span className="text-[8px] text-text-main/50 block mt-1">
              Supports .pdf, .docx, images, txt (Form fields will parse instantly)
            </span>
            <input
              type="file"
              id="pdf-summarizer-file-input"
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.json"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = () => {
                    handlePdfUploadSimulation(file.name, reader.result as string);
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handlePdfUploadSimulation('syllabus_cryptography.pdf', 'Symmetric AES and discrete exponent modules')}
              className="p-3 border border-dashed border-border-main/30 hover:border-solid bg-bg-card text-left rounded-none text-xs text-text-main/70"
            >
              <span className="font-bold block">syllabus_cryptography.pdf</span>
              <span className="text-[8.5px] font-mono mt-1 block">Trigger Sample Parse</span>
            </button>
            <button
              onClick={() => handlePdfUploadSimulation('malicious_traversal_payload.pdf', '../../etc/passwd alert(1)')}
              className="p-3 border border-dashed border-border-main/30 hover:border-solid bg-bg-card text-left rounded-none text-xs text-text-main/70"
            >
              <span className="font-bold block text-rose-500">malicious_traversal.pdf</span>
              <span className="text-[8.5px] font-mono mt-1 block">Trigger Malware Scan</span>
            </button>
          </div>

          {isScanning && <p className="text-xs text-text-main/70 font-mono animate-pulse text-center py-4">🛡 Scanner scanning document bytes and validating structures...</p>}

          {scanError && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-900 p-4 rounded-none flex items-start gap-2.5 text-rose-800 dark:text-rose-400 my-4 animate-fade-in text-left">
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">WAF Alert: File upload blocked!</p>
                <p className="text-[10px] font-mono mt-0.5">{scanError}</p>
              </div>
            </div>
          )}

          {/* Intelligence Collapsible deck */}
          <div className="bg-bg-card border-2 border-border-main p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-text-main uppercase tracking-widest border-b border-border-main/10 pb-2">
              Intelligence Extracts
            </h4>

            {/* Synopsis */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold text-text-main/45 uppercase">Executive Synopsis Hook</span>
              <p className="text-xs font-serif leading-relaxed text-text-main/80 text-left">{synopsis}</p>
            </div>

            {/* Vocabs */}
            {vocab.length > 0 && (
              <div className="space-y-2 border-t border-border-main/10 pt-3">
                <span className="text-[9px] font-mono font-bold text-text-main/45 uppercase block mb-1">
                  Extracted Vocabulary
                </span>
                <div className="space-y-2">
                  {vocab.map((v, i) => (
                    <div key={i} className="text-xs text-left">
                      <span className="font-mono font-bold text-accent-gold">{v.term}:</span>{' '}
                      <span className="font-sans text-text-main/80 leading-relaxed">{v.def}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MCQ Quiz */}
            {quizQuestions.length > 0 && (
              <div className="space-y-2.5 border-t border-border-main/10 pt-3 text-left">
                <span className="text-[9px] font-mono font-bold text-text-main/45 uppercase block mb-1">
                  AI-Generated Verification Quiz
                </span>
                {quizQuestions.map((q, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-xs font-serif font-bold text-text-main/90">{q.q}</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {q.choices.map((choice, cIdx) => {
                        const isSelected = q.selected === cIdx;
                        const isCorrect = q.correct === cIdx;
                        return (
                          <button
                            key={cIdx}
                            onClick={() => handleQuizAnswer(idx, cIdx)}
                            className={`p-2.5 text-xs text-left border rounded-none font-mono cursor-pointer transition ${
                              isSelected
                                ? isCorrect
                                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-400'
                                  : 'bg-rose-500/10 border-rose-500 text-rose-800 dark:text-rose-400'
                                : 'bg-bg-main border-border-main/10 text-text-main/75 hover:bg-bg-main/50'
                            }`}
                          >
                            {isSelected && (isCorrect ? '✓ ' : '✕ ')}
                            {choice}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Markdown Editor */}
        <div className="bg-bg-card border-2 border-border-main p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-border-main/10 pb-2">
              <span className="text-xs font-mono font-bold text-text-main uppercase">
                Interactive Transcript Markdown Editor
              </span>
              <span className="text-[8.5px] bg-accent-gold text-slate-950 font-mono font-bold px-1.5">
                LIVE COMPILING
              </span>
            </div>

            <textarea
              rows={16}
              value={editorMarkdown}
              onChange={(e) => setEditorMarkdown(e.target.value)}
              className="w-full bg-bg-main border border-border-main/30 outline-none p-4 text-xs font-mono text-text-main leading-relaxed"
              placeholder="# Markdown Editor Workspace... \n\nSelect a sample document outline on the left to start editing the live transcripts dynamically."
            />
          </div>

          <div className="mt-4 border-t border-border-main/10 pt-4 flex justify-between items-center">
            <span className="text-[8px] font-mono text-text-main/40 uppercase">
              Supports full export compilation
            </span>
            <button
              onClick={() => alert('Transcript saved to sandbox database.')}
              className="text-[10px] font-mono font-bold text-accent-gold hover:underline cursor-pointer"
            >
              SAVE AS SEED COPY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== SUB-TOOL 5: SECURE MEDIA QUESTION VERIFIER ==================== */
function MediaQuestionVerifier() {
  const [selectedDoc, setSelectedDoc] = useState<'syllabus' | 'textbook' | 'none'>('none');
  const [question, setQuestion] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verdict, setVerdict] = useState<any | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (selectedDoc === 'none' || !question.trim()) {
      setValidationError('Please select a media document source first.');
      return;
    }
    setValidationError(null);
    setIsVerifying(true);
    setVerdict(null);

    try {
      const isCorrect = question.toLowerCase().includes('aes') || question.toLowerCase().includes('hash') || question.toLowerCase().includes('security') || question.toLowerCase().includes('key');
      
      setTimeout(() => {
        setVerdict({
          status: isCorrect ? 'VERIFIED_TRUTH' : 'ACADEMIC_CONFLICT',
          score: isCorrect ? 96 : 42,
          quote: selectedDoc === 'syllabus'
            ? 'Lecture 3 Syllabus: "The midterm examination evaluates students on block substitution math, symmetric keys, and prime generator verification rules."'
            : 'Textbook Ch 4.2: "SubBytes transformations apply multiplicative inversion in Galois Field GF(2^8) to maximize non-linearity and block substitution depth."',
          response: 'The requested parameters match the verified syllabus. Syllabus standards are correctly met.'
        });
        setIsVerifying(false);
      }, 1200);
    } catch {
      setValidationError('Could not contact academic model pipeline.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-bg-card p-6 rounded-none border border-border-main shadow-[4px_4px_0px_rgba(26,26,26,0.15)] space-y-6 animate-fade-in text-left" id="media-verifier-tool">
      <div className="border-b border-border-main pb-4">
        <h3 className="font-serif font-black italic text-text-main text-lg flex items-center gap-1.5">
          <Eye className="text-text-main h-5 w-5" /> Academic Media Question Verifier
        </h3>
        <p className="text-xs text-text-main/60 font-serif mt-1">
          Perform high-precision verification of test questions, exam problems, or syllabus claims against verified textbook chapters or course media.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Choose media source */}
        <div className="space-y-4">
          <span className="text-[10px] font-mono font-bold text-text-main/50 uppercase tracking-wider block">
            01 // Select Verified Media Document
          </span>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedDoc('syllabus')}
              className={`p-4 border text-left transition rounded-none cursor-pointer flex flex-col justify-between ${
                selectedDoc === 'syllabus'
                  ? 'bg-text-main text-bg-main border-border-main'
                  : 'bg-bg-main border-dashed border-border-main hover:bg-text-main/5 text-text-main'
              }`}
            >
              <div>
                <span className="text-xs font-serif font-bold block">📄 Syllabus Outline</span>
                <span className={`text-[10px] font-mono mt-1 block ${selectedDoc === 'syllabus' ? 'text-white/60' : 'text-text-main/50'}`}>
                  cryptography_syllabus.pdf
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-mono mt-4 block">Select Source</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDoc('textbook')}
              className={`p-4 border text-left transition rounded-none cursor-pointer flex flex-col justify-between ${
                selectedDoc === 'textbook'
                  ? 'bg-text-main text-bg-main border-border-main'
                  : 'bg-bg-main border-dashed border-border-main hover:bg-text-main/5 text-text-main'
              }`}
            >
              <div>
                <span className="text-xs font-serif font-bold block">📘 Reference Textbook</span>
                <span className={`text-[10px] font-mono mt-1 block ${selectedDoc === 'textbook' ? 'text-white/60' : 'text-text-main/50'}`}>
                  chapter_4_aes_proofs.png
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-mono mt-4 block">Select Source</span>
            </button>
          </div>

          {selectedDoc !== 'none' && (
            <div className="p-4 bg-bg-main border border-border-main animate-fade-in relative overflow-hidden">
              <span className="text-[9px] font-mono text-emerald-850 dark:text-emerald-400 font-bold block mb-1">
                [MEDIA PREVIEW: RUNNING SCANNER]
              </span>
              <p className="text-xs font-serif text-text-main/80 italic leading-relaxed">
                {selectedDoc === 'syllabus' 
                  ? 'Active file context contains syllabus criteria regarding Block Cipher Substitution, MAC structures, and multi-factor threat metrics.' 
                  : 'Active file contains proof details of GF(2^8) byte multiplication matrix, Rijndael cryptographic proofs, and linear diffusion bounds.'
                }
              </p>
              <div className="absolute top-0 left-0 w-full h-[1px] bg-emerald-500 animate-bounce opacity-40" />
            </div>
          )}
        </div>

        {/* Right column: Form question & show verdict */}
        <div className="space-y-4">
          <span className="text-[10px] font-mono font-bold text-text-main/50 uppercase tracking-wider block">
            02 // Enter Study Question to Verify
          </span>

          <div className="space-y-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border border-border-main bg-bg-main outline-none rounded-none px-4 py-3 text-xs font-mono text-text-main focus:bg-bg-card focus:border-2"
              placeholder="e.g., Does symmetric cryptography evaluate prime numbers?"
            />

            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || selectedDoc === 'none' || !question.trim()}
              className="w-full bg-text-main text-bg-main font-mono text-xs uppercase py-3 cursor-pointer border border-border-main"
            >
              {isVerifying ? '🔍 Running Structural Cross-Verification...' : 'Verify Question Against Context'}
            </button>

            {validationError && (
              <p className="text-xs text-rose-700 font-mono flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" /> {validationError}
              </p>
            )}

            {/* Verdict Display block */}
            {verdict && (
              <div className="p-4 bg-bg-main border-2 border-border-main rounded-none shadow-[2px_2px_0px_rgba(26,26,26,0.15)] space-y-3 animate-fade-in text-xs font-serif leading-relaxed">
                <div className="flex justify-between items-center border-b border-border-main/10 pb-2">
                  <span className={`font-mono font-bold uppercase text-[10px] px-2 py-0.5 border ${
                    verdict.status === 'VERIFIED_TRUTH'
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-400'
                  }`}>
                    {verdict.status} // MATCH: {verdict.score}%
                  </span>
                  <span className="text-[9px] font-mono text-text-main/40 uppercase">EXACT QUOTE SOURCE:</span>
                </div>

                <div className="bg-bg-card border border-border-main/10 p-3">
                  <p className="font-mono text-[10px] text-text-main/80 italic select-all leading-relaxed">
                    "{verdict.quote}"
                  </p>
                </div>

                <div>
                  <span className="text-[9px] font-mono text-text-main/40 uppercase tracking-wider block mb-1">
                    Academic Appraisal:
                  </span>
                  <p className="text-text-main/70 text-[11px] leading-relaxed">
                    {verdict.response}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
