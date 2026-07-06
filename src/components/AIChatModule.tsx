import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Terminal, ShieldAlert, Cpu, Network, CheckCircle2, Search, Plus, Trash2, FolderSync, Wallpaper, FileCode, Check, BookOpen, Type, Camera, Scan, X, Eye, Paperclip, Bold, Italic, Code, Quote, Highlighter, FileText, Download, ChevronLeft, ChevronRight, History, Play } from 'lucide-react';
import { ChatSession, ChatMessage, AIProvider } from '../types';

/* Helper to extract html code blocks */
function extractHtmlCode(content: string): string | null {
  if (!content) return null;
  // Look for ```html ... ``` block
  const htmlMatch = content.match(/```html\s*([\s\S]*?)```/i);
  if (htmlMatch && htmlMatch[1]) {
    return htmlMatch[1].trim();
  }
  
  // Or look for any block containing doctype or html
  const generalMatch = content.match(/```\w*\s*([\s\S]*?)```/);
  if (generalMatch && generalMatch[1]) {
    const code = generalMatch[1].trim();
    if (code.includes('<!DOCTYPE') || code.includes('<html') || code.includes('<body') || code.includes('<script')) {
      return code;
    }
  }

  // Check if content itself is pure HTML
  if (content.trim().startsWith('<!DOCTYPE') || (content.includes('<html') && content.includes('</html>'))) {
    return content.trim();
  }

  return null;
}

/* Beautiful Interactive HTML & JS Sandbox Game / Website Simulator */
function HtmlPreviewPanel({ htmlCode }: { htmlCode: string }) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interactive_app.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 border-2 border-[#1A1A1A] bg-white text-[#1a1a1a] shadow-[4px_4px_0px_rgba(26,26,26,0.15)] flex flex-col w-full max-w-2xl mx-auto overflow-hidden animate-fade-in z-10 relative">
      {/* Sandbox Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1A1A1A] text-[#F9F8F6] border-b border-[#1A1A1A] select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Live Sandbox Simulator</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-2 py-1 text-[9px] font-mono font-bold uppercase rounded-none transition cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#F9F8F6] text-[#1A1A1A]'
                : 'text-[#F9F8F6]/80 hover:bg-white/10'
            }`}
          >
            🎮 Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-2 py-1 text-[9px] font-mono font-bold uppercase rounded-none transition cursor-pointer ${
              activeTab === 'code'
                ? 'bg-[#F9F8F6] text-[#1A1A1A]'
                : 'text-[#F9F8F6]/80 hover:bg-white/10'
            }`}
          >
            💻 Code
          </button>
          <button
            onClick={handleDownload}
            className="px-2 py-1 text-[9px] font-mono font-bold uppercase rounded-none bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-1 transition cursor-pointer"
          >
            <Download className="h-3 w-3" /> Download HTML
          </button>
        </div>
      </div>

      {/* Simulator Frame Stage */}
      <div className="flex-1 bg-zinc-50 min-h-[350px] relative">
        {activeTab === 'preview' ? (
          <iframe
            title="Interactive App Live Preview"
            srcDoc={htmlCode}
            sandbox="allow-scripts"
            className="w-full h-[350px] bg-white border-none"
          />
        ) : (
          <pre className="p-4 text-[11px] font-mono overflow-auto max-h-[350px] bg-zinc-900 text-zinc-100 select-all leading-relaxed">
            {htmlCode}
          </pre>
        )}
      </div>
      <div className="bg-zinc-100 px-4 py-2 border-t border-[#1A1A1A]/10 text-[9px] font-mono text-[#1A1A1A]/60 flex justify-between select-none">
        <span>STATUS: ACTIVE RUNTIME</span>
        <span>SIZE: {(htmlCode.length / 1024).toFixed(2)} KB</span>
      </div>
    </div>
  );
}

function OfficeDocumentCard({
  docType,
  title,
  data,
  onUpdate,
  onPlaySlides
}: {
  docType: 'word' | 'excel' | 'ppt';
  title: string;
  data: any;
  onUpdate: (newData: any) => void;
  onPlaySlides: (pptData: any) => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  
  // Word state
  const [wordSections, setWordSections] = useState<any[]>(data.sections || []);

  // Excel state
  const [headers, setHeaders] = useState<string[]>(data.headers || []);
  const [rows, setRows] = useState<string[][]>(data.rows || []);
  const [editingCell, setEditingCell] = useState<{ rIdx: number, cIdx: number } | null>(null);
  const [cellValue, setCellValue] = useState('');

  // Slide Deck state
  const [slideIdx, setSlideIdx] = useState(0);
  const slides = data.slides || [];

  // Re-sync local states if prop changes
  useEffect(() => {
    setEditTitle(title);
  }, [title]);

  useEffect(() => {
    if (data.sections) setWordSections(data.sections);
    if (data.headers) setHeaders(data.headers);
    if (data.rows) setRows(data.rows);
  }, [data]);

  const saveTitleChange = () => {
    setIsEditingTitle(false);
    onUpdate({ ...data, title: editTitle });
  };

  // Function to download Microsoft Word Outline
  const downloadWordDoc = () => {
    const sectionsHtml = wordSections.map(sec => `
      <h1>${sec.heading}</h1>
      ${sec.paragraphs ? sec.paragraphs.map((p: string) => `<p>${p}</p>`).join('') : ''}
      ${sec.list && sec.list.length > 0 ? `<ul>${sec.list.map((li: string) => `<li>${li}</li>`).join('')}</ul>` : ''}
    `).join('');

    const htmlString = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${editTitle}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333333; padding: 40px; }
          h1 { color: #1e3a8a; font-size: 22px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; }
          p { font-size: 14px; margin-bottom: 12px; }
          ul { margin-left: 20px; margin-bottom: 12px; }
          li { font-size: 14px; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px;">
          <h1 style="font-size: 32px; color: #1e3a8a; border: none; margin-bottom: 5px;">${editTitle}</h1>
          <p style="color: #666666; font-style: italic;">${data.subtitle || 'Academic AI Document'}</p>
        </div>
        ${sectionsHtml}
      </body>
      </html>
    `;

    const blob = new Blob([htmlString], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to download Excel XML matrix table format
  const downloadExcelSheet = () => {
    const tableRowsHtml = [
      `<tr>${headers.map(h => `<th style="background-color: #15803d; color: white; font-weight: bold; padding: 8px; border: 1px solid #cbd5e1;">${h}</th>`).join('')}</tr>`,
      ...rows.map(row => `<tr>${row.map(cell => `<td style="padding: 8px; border: 1px solid #cbd5e1;">${cell}</td>`).join('')}</tr>`)
    ].join('');

    const htmlString = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${editTitle}</title>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${editTitle.substring(0, 31)}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
          th, td { text-align: left; }
        </style>
      </head>
      <body>
        <h2 style="font-family: sans-serif; color: #15803d;">${editTitle}</h2>
        <table>
          ${tableRowsHtml}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlString], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to download PowerPoint slide outlines
  const downloadPptOutline = () => {
    const outlineHtml = slides.map((slide: any, sIdx: number) => `
      <h1>Slide ${sIdx + 1}: ${slide.title}</h1>
      <ul>
        ${slide.bullets ? slide.bullets.map((b: string) => `<li>${b}</li>`).join('') : ''}
      </ul>
      <p style="font-size: 11px; color: #777;">Layout Suggestion: ${slide.layout || 'content'}</p>
      <br/><hr/><br/>
    `).join('');

    const htmlString = `
      <html>
      <head>
        <meta charset="utf-8">
        <title>${editTitle} - Presentation Outline</title>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 40px; color: #333333; line-height: 1.6; }
          h1 { color: #ea580c; font-size: 20px; border-bottom: 1px solid #ccc; margin-top: 30px; }
          ul { margin-left: 20px; }
          li { margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <h1>Presentation Slide Outline: ${editTitle}</h1>
        <h3>${data.subtitle || ''}</h3>
        <p style="font-style: italic; color: #666;">This document contains a rich PowerPoint Presentation template structured by slide deck frames.</p>
        <br/><br/>
        ${outlineHtml}
      </body>
      </html>
    `;

    const blob = new Blob([htmlString], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_slides.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startCellEdit = (rIdx: number, cIdx: number, val: string) => {
    setEditingCell({ rIdx, cIdx });
    setCellValue(val);
  };

  const saveExcelCell = (rIdx: number, cIdx: number) => {
    const updatedRows = [...rows];
    updatedRows[rIdx][cIdx] = cellValue;
    setRows(updatedRows);
    setEditingCell(null);
    onUpdate({ ...data, title: editTitle, rows: updatedRows });
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, rIdx: number, cIdx: number) => {
    if (e.key === 'Enter') {
      saveExcelCell(rIdx, cIdx);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const addExcelRow = () => {
    const newRow = Array(headers.length).fill('New Value');
    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    onUpdate({ ...data, title: editTitle, rows: updatedRows });
  };

  const updateWordSectionParagraph = (secIdx: number, pIdx: number, val: string) => {
    const updatedSections = [...wordSections];
    updatedSections[secIdx].paragraphs[pIdx] = val;
    setWordSections(updatedSections);
    onUpdate({ ...data, title: editTitle, sections: updatedSections });
  };

  const updateWordSectionHeader = (secIdx: number, val: string) => {
    const updatedSections = [...wordSections];
    updatedSections[secIdx].heading = val;
    setWordSections(updatedSections);
    onUpdate({ ...data, title: editTitle, sections: updatedSections });
  };

  const addWordSection = () => {
    const newSection = {
      heading: `Section ${wordSections.length + 1}: New Topic`,
      paragraphs: ['Click here to edit this paragraph and customize the contents.'],
      list: []
    };
    const updatedSections = [...wordSections, newSection];
    setWordSections(updatedSections);
    onUpdate({ ...data, title: editTitle, sections: updatedSections });
  };

  return (
    <div className="mt-4 border-2 border-zinc-800 bg-zinc-950 text-zinc-100 shadow-[4px_4px_0px_rgba(255,255,255,0.05)] flex flex-col w-full max-w-2xl mx-auto overflow-hidden animate-fade-in relative">
      {/* Header with distinctive colors based on Document Type */}
      <div className={`flex items-center justify-between px-4 py-3 select-none text-white ${
        docType === 'word' ? 'bg-[#2b579a]' : docType === 'excel' ? 'bg-[#217346]' : 'bg-[#d24726]'
      }`}>
        <div className="flex items-center gap-2">
          {docType === 'word' ? (
            <span className="font-bold text-xs bg-white text-[#2b579a] px-1.5 py-0.5 rounded-sm">W</span>
          ) : docType === 'excel' ? (
            <span className="font-bold text-xs bg-white text-[#217346] px-1.5 py-0.5 rounded-sm">X</span>
          ) : (
            <span className="font-bold text-xs bg-white text-[#d24726] px-1.5 py-0.5 rounded-sm">P</span>
          )}
          
          {isEditingTitle ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={saveTitleChange}
              onKeyDown={(e) => e.key === 'Enter' && saveTitleChange()}
              className="bg-black/40 text-white font-mono text-xs px-2 py-0.5 outline-none rounded border border-white/20"
              autoFocus
            />
          ) : (
            <span 
              className="font-serif font-black italic text-sm cursor-pointer hover:underline flex items-center gap-1.5"
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename document"
            >
              {editTitle}
              <span className="text-[10px] opacity-75 font-normal not-italic font-mono">(click to edit)</span>
            </span>
          )}
        </div>

        <button
          onClick={docType === 'word' ? downloadWordDoc : docType === 'excel' ? downloadExcelSheet : downloadPptOutline}
          className="flex items-center gap-1.5 bg-black/30 hover:bg-black/60 px-3 py-1 text-[10px] font-mono font-bold uppercase transition"
          title={`Download native Microsoft ${docType === 'word' ? 'Word' : docType === 'excel' ? 'Excel' : 'PowerPoint'} formatted file`}
        >
          <Download className="h-3 w-3" />
          <span>EXPORT</span>
        </button>
      </div>

      {/* Body Section for Word */}
      {docType === 'word' && (
        <div className="p-4 bg-zinc-900 text-zinc-100 max-h-96 overflow-y-auto space-y-4 font-sans text-xs">
          <p className="text-[10px] font-mono text-[#FFD700] uppercase tracking-wider border-b border-zinc-800 pb-1 flex items-center justify-between">
            <span>📄 Microsoft Word Live Paper Outline</span>
            <span>Click any text to live edit</span>
          </p>
          <div className="bg-zinc-950 p-6 border border-zinc-800 shadow-inner space-y-6">
            <h2 className="text-lg font-serif font-black italic text-center text-zinc-100">{editTitle}</h2>
            <p className="text-[10px] font-serif text-center text-zinc-500 italic border-b border-zinc-800 pb-4">{data.subtitle || 'Academic AI Publication Framework'}</p>
            
            {wordSections.map((sec, secIdx) => (
              <div key={secIdx} className="space-y-2 group">
                <input
                  type="text"
                  value={sec.heading}
                  onChange={(e) => updateWordSectionHeader(secIdx, e.target.value)}
                  className="w-full bg-transparent hover:bg-zinc-900 font-bold font-serif text-sm border-none outline-none text-[#FFD700] py-0.5 rounded px-1 transition"
                />
                
                {sec.paragraphs?.map((para: string, pIdx: number) => (
                  <textarea
                    key={pIdx}
                    value={para}
                    onChange={(e) => updateWordSectionParagraph(secIdx, pIdx, e.target.value)}
                    rows={Math.max(2, Math.ceil(para.length / 80))}
                    className="w-full bg-transparent hover:bg-zinc-900 leading-relaxed text-zinc-300 outline-none resize-none rounded px-1 py-0.5 transition font-sans text-xs"
                  />
                ))}

                {sec.list && sec.list.length > 0 && (
                  <ul className="list-disc list-inside pl-2 space-y-1 text-zinc-300">
                    {sec.list.map((li: string, lIdx: number) => (
                      <li key={lIdx} className="font-mono text-[11px] text-zinc-400">
                        {li}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <button
              onClick={addWordSection}
              className="w-full py-2 border border-dashed border-zinc-800 hover:border-zinc-500 hover:text-[#FFD700] transition text-[10px] font-mono uppercase text-zinc-500"
            >
              + Insert New Section Chapter
            </button>
          </div>
        </div>
      )}

      {/* Body Section for Excel */}
      {docType === 'excel' && (
        <div className="p-4 bg-zinc-900 text-zinc-100 max-h-96 overflow-y-auto space-y-3">
          <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider border-b border-zinc-800 pb-1 flex items-center justify-between">
            <span>📊 Microsoft Excel Grid Spreadsheet</span>
            <span>Double click any cell to edit</span>
          </p>

          <div className="overflow-x-auto border border-zinc-800 rounded-sm">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 select-none">
                  <th className="p-2 border-r border-zinc-800 text-center w-8 text-[9px]">#</th>
                  {headers.map((h, idx) => (
                    <th key={idx} className="p-2 border-r border-zinc-800 font-bold text-zinc-300">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-zinc-800 hover:bg-zinc-900/50 transition">
                    <td className="p-2 border-r border-zinc-800 bg-zinc-950/40 text-center text-[9px] text-zinc-500 select-none font-bold">
                      {rIdx + 1}
                    </td>
                    {row.map((cell, cIdx) => (
                      <td 
                        key={cIdx} 
                        className="p-2 border-r border-zinc-800 hover:bg-zinc-800 cursor-pointer text-zinc-200"
                        onDoubleClick={() => startCellEdit(rIdx, cIdx, cell)}
                      >
                        {editingCell && editingCell.rIdx === rIdx && editingCell.cIdx === cIdx ? (
                          <input
                            type="text"
                            value={cellValue}
                            onChange={(e) => setCellValue(e.target.value)}
                            onBlur={() => saveExcelCell(rIdx, cIdx)}
                            onKeyDown={(e) => handleCellKeyDown(e, rIdx, cIdx)}
                            className="bg-zinc-950 text-[#FFD700] w-full px-1 outline-none font-mono text-[11px] rounded border border-zinc-700"
                            autoFocus
                          />
                        ) : (
                          <span>{cell}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addExcelRow}
            className="w-full py-2 border border-dashed border-zinc-800 hover:border-zinc-500 hover:text-emerald-500 transition text-[10px] font-mono uppercase text-zinc-500"
          >
            + Add New Table Record Row
          </button>
        </div>
      )}

      {/* Body Section for PPT Slides */}
      {docType === 'ppt' && slides.length > 0 && (
        <div className="p-4 bg-zinc-900 text-zinc-100 space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-[10px] font-mono text-[#ea580c] uppercase tracking-wider">
              📈 Microsoft PowerPoint active slide ({slideIdx + 1} of {slides.length})
            </span>
            <button
              onClick={() => onPlaySlides(data)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#ea580c]/20 hover:bg-[#ea580c]/40 border border-[#ea580c]/50 text-[#ea580c] hover:text-white rounded font-mono text-[10px] font-bold uppercase transition"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Play Slideshow</span>
            </button>
          </div>

          {/* Core Slide Frame Projector */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-md p-6 h-56 flex flex-col justify-between shadow-inner relative overflow-hidden group">
            {/* Slide Ambient Background Pattern */}
            <div className="absolute inset-0 bg-radial-gradient from-zinc-800/10 to-transparent pointer-events-none" />

            <div>
              <h3 className="font-serif font-black italic text-lg text-zinc-100 tracking-tight leading-snug">
                {slides[slideIdx].title}
              </h3>
              
              <ul className="mt-4 space-y-2 pl-4 list-disc list-outside text-zinc-300 font-sans text-xs leading-relaxed">
                {slides[slideIdx].bullets?.map((bullet: string, bIdx: number) => (
                  <li key={bIdx} className="marker:text-[#ea580c]">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 select-none pt-4 border-t border-zinc-900 z-10">
              <span className="bg-zinc-900 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider text-zinc-400">
                Layout: {slides[slideIdx].layout || 'Standard Bullet Outline'}
              </span>
              <span>Slide {slideIdx + 1} / {slides.length}</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center bg-zinc-950/50 p-2 border border-zinc-800 rounded">
            <button
              onClick={() => setSlideIdx(prev => Math.max(0, prev - 1))}
              disabled={slideIdx === 0}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed rounded transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1">
              {slides.map((_: any, sIdx: number) => (
                <button
                  key={sIdx}
                  onClick={() => setSlideIdx(sIdx)}
                  className={`h-1.5 w-4 rounded-sm transition-all ${sIdx === slideIdx ? 'bg-[#ea580c] w-6' : 'bg-zinc-800'}`}
                />
              ))}
            </div>
            <button
              onClick={() => setSlideIdx(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={slideIdx === slides.length - 1}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed rounded transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIChatModule({ initialPrompt, onClearInitialPrompt }: { initialPrompt?: string; onClearInitialPrompt?: () => void }) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('ai_chat_sessions');
    return saved ? JSON.parse(saved) : [
      {
        id: 'session-1',
        title: 'Cryptography Homework Help',
        provider: 'local_ollama',
        model: 'llama3',
        createdAt: new Date().toISOString(),
        messages: [
          { id: 'm1', sender: 'user', content: 'What are the main parameters of RSA?', timestamp: new Date().toISOString() },
          { id: 'm2', sender: 'assistant', content: 'RSA relies on two large prime numbers, $p$ and $q$. Their product $N = pq$ serves as the modulus. The public exponent $e$ and private exponent $d$ are computed such that $(ed) \\equiv 1 \\pmod{\\phi(N)}$. This creates a mathematically secure trapsdoor function.', timestamp: new Date().toISOString() }
        ]
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return localStorage.getItem('ai_chat_active_session_id') || 'session-1';
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('ai_chat_active_session_id', activeSessionId);
  }, [activeSessionId]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Progress indicators for long-running AI tasks & export actions
  const [activeProgressTask, setActiveProgressTask] = useState<string | null>(null);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('ai-task-progress', {
      detail: { taskName: activeProgressTask, progress: progressPercentage }
    }));
  }, [activeProgressTask, progressPercentage]);

  const simulateProgress = (taskName: string, durationMs: number = 3000, onComplete?: () => void) => {
    setActiveProgressTask(taskName);
    setProgressPercentage(0);
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percent = Math.min(95, Math.floor((elapsed / durationMs) * 100));
      setProgressPercentage(percent);
      
      if (elapsed >= durationMs) {
        clearInterval(interval);
      }
    }, 100);

    return {
      complete: () => {
        clearInterval(interval);
        setProgressPercentage(100);
        setTimeout(() => {
          setActiveProgressTask(null);
          setProgressPercentage(0);
          if (onComplete) onComplete();
        }, 400);
      },
      cancel: () => {
        clearInterval(interval);
        setActiveProgressTask(null);
        setProgressPercentage(0);
      }
    };
  };

  // Extended AI Image and Office Document Studio States
  const [activeAIActionTab, setActiveAIActionTab] = useState<'image' | 'word' | 'excel' | 'ppt' | 'rag' | 'wallpaper' | null>(null);
  const [imageStyle, setImageStyle] = useState('Photorealistic');
  const [imageRatio, setImageRatio] = useState('1:1');
  const [attachedEditImage, setAttachedEditImage] = useState<string | null>(null);
  const [fullscreenPresentation, setFullscreenPresentation] = useState<any | null>(null);
  const [fullscreenSlideIndex, setFullscreenSlideIndex] = useState(0);

  const chatCommands = [
    { cmd: '/explain', label: 'EXPLAIN SYLLABUS', desc: 'Break down complex cryptography concepts', icon: Cpu, isHighPriority: true },
    { cmd: '/verify', label: 'VERIFY NOTES', desc: 'Cross-verify materials against exam paper constraints', icon: ShieldAlert, isHighPriority: true },
    { cmd: '/image', label: 'GENERATE / EDIT IMAGE', desc: 'Synthesize customized images with styles or edits', icon: Wallpaper, isHighPriority: true },
    { cmd: '/word', label: 'WORD DOC GENERATOR', desc: 'Make Word files from academic prompts', icon: FileText, isHighPriority: true },
    { cmd: '/excel', label: 'EXCEL TABLE MAKER', desc: 'Make interactive data spreadsheets', icon: FolderSync, isHighPriority: true },
    { cmd: '/ppt', label: 'PPT SLIDE DECK BUILDER', desc: 'Make presentation outlines & view slides', icon: Sparkles, isHighPriority: true },
    { cmd: '/rag', label: 'SEMANTIC INGESTION', desc: 'Query locally indexable knowledge base', icon: Sparkles, isHighPriority: false },
    { cmd: '/pomo', label: 'POMODORO SESSION', desc: 'Initialize active study focus interval', icon: Terminal, isHighPriority: false },
    { cmd: '/clear', label: 'RESET THREAD', desc: 'Clear secure session context logs', icon: Plus, isHighPriority: false },
    { cmd: '/scan', label: 'INTEL-LENS OCR', desc: 'Toggle hardware-accelerated image scanner', icon: Camera, isHighPriority: false },
  ];

  // Connection failover detection simulation
  const [localServerOnline, setLocalServerOnline] = useState(false);
  const [aiProvider, setAiProvider] = useState<AIProvider>('local_ollama');
  const [modelSelector, setModelSelector] = useState('llama3');
  const [showCorsModal, setShowCorsModal] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  // RAG Local Database Simulation
  const [knowledgeBase, setKnowledgeBase] = useState<{ id: string; title: string; content: string }[]>(() => {
    const saved = localStorage.getItem('knowledge_base');
    return saved ? JSON.parse(saved) : [
      { id: 'kb1', title: 'AES Protocol notes', content: 'Advanced Encryption Standard uses block cycles of 128, 192, or 256 bits with secure Substitution boxes.' },
      { id: 'kb2', title: 'CORS Configuration principles', content: 'CORS requires explicit Origin validations. Never wildcard Allow-Origin: * on authenticated session endpoints.' }
    ];
  });

  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState<{ title: string; content: string; score: number }[]>([]);
  const [newKbTitle, setNewKbTitle] = useState('');
  const [newKbContent, setNewKbContent] = useState('');

  // Wallpaper prompt builder options
  const [wallpaperType, setWallpaperType] = useState('Cyberpunk');
  const [wallpaperRatio, setWallpaperRatio] = useState('Mobile (9:16)');
  const [wallpaperPromptResult, setWallpaperPromptResult] = useState('');

  // Editorial Reader Mode State
  const [readerMode, setReaderMode] = useState(false);

  // Lens Camera States in Chat Command Center with browser camera streaming
  const [lensOpen, setLensOpen] = useState(false);
  const [lensFilter, setLensFilter] = useState<'ocr' | 'math' | 'code'>('ocr');
  const [lensScanning, setLensScanning] = useState(false);
  const [lensCapturedText, setLensCapturedText] = useState('');
  const [lensCapturedEditable, setLensCapturedEditable] = useState('');
  const [lensCameraStream, setLensCameraStream] = useState<MediaStream | null>(null);
  const [lensCameraError, setLensCameraError] = useState<string | null>(null);
  const lensVideoRef = React.useRef<HTMLVideoElement | null>(null);

  // File attachments and Annotation highlighting
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; type: 'pdf' | 'image'; textContext: string; dataUrl?: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [annotatingFile, setAnnotatingFile] = useState<any | null>(null);
  const [activeHighlight, setActiveHighlight] = useState('');
  const [customAnnotationNote, setCustomAnnotationNote] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Handle camera stream acquisition and teardown dynamically
  useEffect(() => {
    if (lensOpen) {
      setLensCameraError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then(stream => {
            setLensCameraStream(stream);
            if (lensVideoRef.current) {
              lensVideoRef.current.srcObject = stream;
              lensVideoRef.current.play().catch(e => console.warn("Camera playback stalled:", e));
            }
          })
          .catch(err => {
            console.warn("Camera capture failed:", err);
            setLensCameraError("Camera permission blocked or hardware busy. Operating in simulation fallback mode.");
          });
      } else {
        setLensCameraError("Browser mediaDevices API not supported in this frame context. Operating in simulation mode.");
      }
    } else {
      if (lensCameraStream) {
        lensCameraStream.getTracks().forEach(track => track.stop());
        setLensCameraStream(null);
      }
    }
    return () => {
      if (lensCameraStream) {
        lensCameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [lensOpen]);

  // Handle injected initial prompt from Bento Dashboard
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setUserInput(initialPrompt);
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt]);

  // Auto detect Ollama / Local server
  useEffect(() => {
    const checkLocalStatus = async () => {
      try {
        const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(1000) });
        if (res.ok) setLocalServerOnline(true);
      } catch {
        setLocalServerOnline(false); // local offline fallback
      }
    };
    checkLocalStatus();
    const interval = setInterval(checkLocalStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('knowledge_base', JSON.stringify(knowledgeBase));
  }, [knowledgeBase]);

  // Rich-text insertion helper
  const insertRichTextFormat = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const txt = textareaRef.current;
    const start = txt.selectionStart;
    const end = txt.selectionEnd;
    const originalText = txt.value;
    const selected = originalText.substring(start, end);
    const updated = originalText.substring(0, start) + prefix + selected + suffix + originalText.substring(end);
    setUserInput(updated);
    setTimeout(() => {
      txt.focus();
      txt.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const downloadMessageAsWord = (content: string, title: string = 'AI Generated Academic Article') => {
    simulateProgress("Formulating academic document structures to Word Doc...", 1500, () => {
      const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
      const sectionsHtml = lines.map(line => {
        if (line.startsWith('# ')) {
          return `<h1 style="color: #1e3a8a; font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px;">${line.replace('# ', '')}</h1>`;
        } else if (line.startsWith('## ')) {
          return `<h2 style="color: #1e3a8a; font-size: 18px; margin-top: 18px;">${line.replace('## ', '')}</h2>`;
        } else if (line.startsWith('### ')) {
          return `<h3 style="color: #3b82f6; font-size: 14px; margin-top: 14px;">${line.replace('### ', '')}</h3>`;
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          return `<li style="font-size: 14px; margin-bottom: 4px;">${line.substring(2)}</li>`;
        } else {
          return `<p style="font-size: 14px; margin-bottom: 12px; line-height: 1.6;">${line}</p>`;
        }
      }).join('\n');

      let finalHtml = '';
      let inList = false;
      sectionsHtml.split('\n').forEach(line => {
        if (line.startsWith('<li')) {
          if (!inList) {
            finalHtml += '<ul style="margin-left: 20px; margin-bottom: 12px;">';
            inList = true;
          }
          finalHtml += line;
        } else {
          if (inList) {
            finalHtml += '</ul>';
            inList = false;
          }
          finalHtml += line;
        }
      });
      if (inList) finalHtml += '</ul>';

      const htmlString = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333333; padding: 40px; }
          </style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px;">
            <h1 style="font-size: 28px; color: #1e3a8a; border: none; margin-bottom: 5px;">${title}</h1>
            <p style="color: #666666; font-style: italic;">Converted Chat Content</p>
          </div>
          ${finalHtml}
        </body>
        </html>
      `;

      const blob = new Blob([htmlString], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.doc`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const downloadMessageAsExcel = (content: string, title: string = 'AI Generated Data Sheet') => {
    simulateProgress("Structuring grid matrix equations to Excel Sheets...", 1500, () => {
      const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
      let headers: string[] = [];
      let rows: string[][] = [];

      const tableLines = lines.filter(l => l.startsWith('|') && l.endsWith('|'));
      if (tableLines.length >= 2) {
        headers = tableLines[0].split('|').map(s => s.trim()).filter(Boolean);
        const dataLines = tableLines.slice(2);
        rows = dataLines.map(line => line.split('|').map(s => s.trim()).filter(Boolean));
      } else {
        headers = ['Data Points', 'AI Analysis'];
        lines.forEach((l, idx) => {
          if (l.startsWith('- ') || l.startsWith('* ')) {
            rows.push([l.substring(2), `Item Reference #${idx + 1}`]);
          } else if (l.includes(':')) {
            const parts = l.split(':');
            rows.push([parts[0].trim(), parts.slice(1).join(':').trim()]);
          } else {
            rows.push([l, 'N/A']);
          }
        });
      }

      const tableRowsHtml = [
        `<tr>${headers.map(h => `<th style="background-color: #15803d; color: white; font-weight: bold; padding: 8px; border: 1px solid #cbd5e1;">${h}</th>`).join('')}</tr>`,
        ...rows.map(row => `<tr>${row.map(cell => `<td style="padding: 8px; border: 1px solid #cbd5e1;">${cell}</td>`).join('')}</tr>`)
      ].join('');

      const htmlString = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Chat Data Extract</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
        </head>
        <body>
          <h2 style="font-family: sans-serif; color: #15803d;">${title}</h2>
          <table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
            ${tableRowsHtml}
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([htmlString], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.xls`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const exportAsMarkdown = () => {
    if (!activeSession) return;
    simulateProgress("Formulating and compiling thread as Markdown...", 1500, () => {
      let markdown = `# Conversation: ${activeSession.title}\n`;
      markdown += `*Generated via Student AI Studio on ${new Date(activeSession.createdAt).toLocaleString()}*\n\n---\n\n`;

      activeSession.messages.forEach((msg) => {
        const senderName = msg.sender === 'user' ? 'STUDENT' : 'AI ASSISTANT';
        markdown += `### **[${senderName}]** *(${new Date(msg.timestamp).toLocaleTimeString()})*\n\n${msg.content}\n\n`;
        if (msg.generatedDoc) {
          markdown += `> **Generated ${msg.generatedDoc.docType.toUpperCase()} Document:** ${msg.generatedDoc.title}\n`;
          if (msg.generatedDoc.docType === 'word' && msg.generatedDoc.data?.sections) {
            msg.generatedDoc.data.sections.forEach((sec: any) => {
              markdown += `> #### ${sec.heading}\n`;
              if (sec.paragraphs) {
                sec.paragraphs.forEach((p: string) => {
                  markdown += `> ${p}\n`;
                });
              }
            });
          } else if (msg.generatedDoc.docType === 'excel' && msg.generatedDoc.data?.headers) {
            markdown += `> | ${msg.generatedDoc.data.headers.join(' | ')} |\n`;
            markdown += `> | ${msg.generatedDoc.data.headers.map(() => '---').join(' | ')} |\n`;
            if (msg.generatedDoc.data.rows) {
              msg.generatedDoc.data.rows.forEach((row: string[]) => {
                markdown += `> | ${row.join(' | ')} |\n`;
              });
            }
          }
          markdown += `\n`;
        }
        markdown += `---\n\n`;
      });

      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeSession.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_chat.md`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const exportAsJson = () => {
    if (!activeSession) return;
    simulateProgress("Packaging secure conversation state JSON...", 1200, () => {
      const jsonStr = JSON.stringify(activeSession, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeSession.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_chat.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Drag and drop file reader
  const handleIngestFile = (file: File) => {
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type.includes('pdf');
    const isImg = file.type.includes('image');
    const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type.includes('csv');
    const isTxt = file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.ppt');

    if (isCsv) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const rows = lines.map(line => line.split(','));
        const headers = rows[0] || ['Col 1', 'Col 2'];
        const dataRows = rows.slice(1);
        
        // Append a new chat message showing the imported CSV spreadsheet
        const importedMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: `📊 I have successfully imported your CSV spreadsheet file: **${file.name}**. You can now edit the cell values, add rows, or export/download the updated sheet!`,
          timestamp: new Date().toISOString(),
          generatedDoc: {
            docType: 'excel',
            title: file.name.replace('.csv', ''),
            data: {
              title: file.name.replace('.csv', ''),
              headers: headers,
              rows: dataRows
            }
          }
        };
        
        setSessions(prev => prev.map(s => {
          if (s.id === activeSession.id) {
            return { ...s, messages: [...s.messages, importedMessage] };
          }
          return s;
        }));
      };
      reader.readAsText(file);
      return;
    }

    if (isTxt) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const sections = text.split('\n\n').map((sec, idx) => {
          const lines = sec.trim().split('\n');
          const heading = lines[0] || `Section ${idx + 1}`;
          const paragraphs = lines.slice(1).filter(Boolean);
          return { heading, paragraphs, list: [] };
        });

        const importedMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: `📄 I have successfully imported your text document outline file: **${file.name}**. You can now view the formatted sections, edit the contents, and export/download as Word Doc!`,
          timestamp: new Date().toISOString(),
          generatedDoc: {
            docType: 'word',
            title: file.name.replace('.txt', ''),
            data: {
              title: file.name.replace('.txt', ''),
              subtitle: 'Imported Outline',
              sections: sections
            }
          }
        };

        setSessions(prev => prev.map(s => {
          if (s.id === activeSession.id) {
            return { ...s, messages: [...s.messages, importedMessage] };
          }
          return s;
        }));
      };
      reader.readAsText(file);
      return;
    }

    if (!isPdf && !isImg) {
      alert("Unsupported format. Please upload valid PDFs, CSVs, text outlines, or JPEG/PNG Images.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const resultString = e.target?.result as string;
      
      // Simulate/Generate readable transcript for full context querying
      let simulatedTranscript = '';
      if (isPdf) {
        simulatedTranscript = `[Document context extracted from PDF: ${file.name}]\nSyllabus standard 4.5 evaluates block substitution, prime generator matrices, and secure multi-factor session protocols. Midterm key standards dictate Rijndael S-Box lookup bounds must be verified against Galois Field GF(2^8) equations. This text serves as a core credential for crypto analysis assignments.`;
      } else {
        simulatedTranscript = `[Image OCR Text details parsed from ${file.name}]\nPhoto details indicate class whiteboard slide containing secure architecture patterns:\n- Client layer performs input filtering\n- Express router implements parameterized sanitizers\n- Database layer is defended by WAF firewalls.`;
      }

      // 1. Save into persistent Knowledge Base
      const kbEntry = {
        id: `kb-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: `Uploaded: ${file.name}`,
        content: simulatedTranscript
      };
      setKnowledgeBase(prev => [kbEntry, ...prev]);

      // 2. Add to active session attachment list
      const attachEntry = {
        id: `attach-${Date.now()}`,
        name: file.name,
        type: (isPdf ? 'pdf' : 'image') as any,
        textContext: simulatedTranscript,
        dataUrl: isImg ? resultString : undefined
      };
      setAttachedFiles(prev => [...prev, attachEntry]);
    };

    if (isImg) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => handleIngestFile(file as File));
    }
  };

  // Capture frame from active camera stream and send to the server
  const handleTriggerLensCapture = async (specificFilter?: 'ocr' | 'math' | 'code') => {
    const filterToUse = specificFilter || lensFilter;
    setLensScanning(true);
    setLensCapturedText('');
    setLensCapturedEditable('');

    try {
      let base64Image = '';

      // If camera is open and active, capture the actual frame!
      if (lensVideoRef.current && lensCameraStream) {
        const video = lensVideoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          base64Image = canvas.toDataURL('image/jpeg', 0.85);
        }
      }

      // Call our secure server endpoint
      const response = await fetch('/api/lens/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          filter: filterToUse
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setLensCapturedText(data.text);
      setLensCapturedEditable(data.text);
    } catch (err: any) {
      console.warn("Real-time OCR failed, using fallback:", err);
      let fallbackText = '';
      if (filterToUse === 'ocr') {
        fallbackText = `[OCR Extract - Fallback Note]\n"Symmetric encryption ciphers like AES operate on 128-bit blocks, processing them through multiple substitution and permutation rounds. Rijndael design uses state matrix multiplications for diffusion."`;
      } else if (filterToUse === 'math') {
        fallbackText = `[Math Formula - Fallback Note]\n"Equation 3.42: \\phi(N) = (p - 1)(q - 1).\nEuler's totient of the modulus N. GCD(e, \\phi(N)) = 1 is required to compute the private key exponent d."`;
      } else {
        fallbackText = `[Code Block - Fallback Note]\n\`\`\`typescript\n// Injected Route Sanitizer\napp.post('/api/validate', (req, res) => {\n  const sanitized = req.body.data.replace(/[^a-zA-Z0-9]/g, '');\n  res.json({ ok: true, sanitized });\n});\n\`\`\``;
      }
      setLensCapturedText(fallbackText);
      setLensCapturedEditable(fallbackText);
    } finally {
      setLensScanning(false);
    }
  };

  const handleLensScan = (mode: 'ocr' | 'math' | 'code') => {
    setLensFilter(mode);
    handleTriggerLensCapture(mode);
  };

  const handleApplyLensCapture = () => {
    setUserInput(prev => {
      const spacing = prev ? '\n\n' : '';
      return prev + spacing + lensCapturedEditable;
    });
    setLensOpen(false);
    setLensCapturedText('');
    setLensCapturedEditable('');
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput) return;

    let isCommandTrigger = false;
    let commandType: 'image' | 'word' | 'excel' | 'ppt' | null = null;
    let commandPrompt = trimmedInput;

    if (trimmedInput.startsWith('/image ')) {
      isCommandTrigger = true;
      commandType = 'image';
      commandPrompt = trimmedInput.substring(7).trim();
    } else if (trimmedInput.startsWith('/word ') || trimmedInput.startsWith('/doc ')) {
      isCommandTrigger = true;
      commandType = 'word';
      commandPrompt = trimmedInput.startsWith('/word ') ? trimmedInput.substring(6).trim() : trimmedInput.substring(5).trim();
    } else if (trimmedInput.startsWith('/excel ') || trimmedInput.startsWith('/sheet ')) {
      isCommandTrigger = true;
      commandType = 'excel';
      commandPrompt = trimmedInput.startsWith('/excel ') ? trimmedInput.substring(7).trim() : trimmedInput.substring(7).trim();
    } else if (trimmedInput.startsWith('/ppt ') || trimmedInput.startsWith('/slides ')) {
      isCommandTrigger = true;
      commandType = 'ppt';
      commandPrompt = trimmedInput.startsWith('/ppt ') ? trimmedInput.substring(5).trim() : trimmedInput.substring(8).trim();
    } else if (activeAIActionTab) {
      isCommandTrigger = true;
      commandType = activeAIActionTab;
      commandPrompt = trimmedInput;
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    };

    const assistantMsgId = `msg-${Date.now() + 1}`;
    
    // Optimistically update sessions with user message and placeholder assistant message
    const botMsgPlaceholder: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      content: isCommandTrigger 
        ? `Sovereign AI synthesizing ${commandType === 'image' ? 'graphics style' : 'MS ' + commandType + ' database structure'}...` 
        : (aiProvider === 'local_ollama' ? 'Connecting to local Ollama...' : 'Analyzing context...'),
      timestamp: new Date().toISOString()
    };

    const updatedSessions = sessions.map(s => {
      if (s.id === activeSession.id) {
        return { ...s, messages: [...s.messages, userMsg, botMsgPlaceholder] };
      }
      return s;
    });
    setSessions(updatedSessions);
    setUserInput('');
    setIsTyping(true);

    if (isCommandTrigger && commandType) {
      const taskName = commandType === 'image'
        ? 'Synthesizing Graphic Asset via Gemini Vision Model...'
        : `Structuring equations and generating formatted ${commandType === 'word' ? 'Word Document' : commandType === 'excel' ? 'Excel Spreadsheet' : 'PowerPoint Slide Deck'}...`;
      
      const progress = simulateProgress(taskName, 4000);

      try {
        if (commandType === 'image') {
          const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: commandPrompt,
              style: imageStyle,
              aspectRatio: imageRatio,
              referenceImage: attachedEditImage
            })
          });
          const res = await response.json();
          if (res.success) {
            progress.complete();
            setSessions(prev => prev.map(s => {
              if (s.id === activeSession.id) {
                return {
                  ...s,
                  messages: s.messages.map(m => {
                    if (m.id === assistantMsgId) {
                      return {
                        ...m,
                        content: `🎨 I have generated the following **${imageStyle}** visual asset for you based on prompt: "${commandPrompt}". You can view and download the result directly!`,
                        generatedImage: res.imageUrl
                      };
                    }
                    return m;
                  })
                };
              }
              return s;
            }));
            setAttachedEditImage(null);
            setActiveAIActionTab(null);
          } else {
            throw new Error(res.error || 'Failed to synthesize image.');
          }
        } else {
          // word, excel, ppt
          const response = await fetch('/api/generate-office-doc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              docType: commandType,
              prompt: commandPrompt
            })
          });
          const res = await response.json();
          if (res.success) {
            progress.complete();
            const displayType = commandType === 'word' ? 'Word Document' : commandType === 'excel' ? 'Excel Spreadsheet' : 'PowerPoint Slide Deck';
            setSessions(prev => prev.map(s => {
              if (s.id === activeSession.id) {
                return {
                  ...s,
                  messages: s.messages.map(m => {
                    if (m.id === assistantMsgId) {
                      return {
                        ...m,
                        content: `📄 Successfully structured and generated the interactive **${displayType}**: "${res.data.title || 'Untitled Outline'}". You can preview, edit content directly inline, and download/export the final file stream!`,
                        generatedDoc: {
                          docType: commandType!,
                          title: res.data.title || 'Untitled Document',
                          data: res.data
                        }
                      };
                    }
                    return m;
                  })
                };
              }
              return s;
            }));
            setActiveAIActionTab(null);
          } else {
            throw new Error(res.error || 'Failed to synthesize office document outline.');
          }
        }
      } catch (err: any) {
        progress.cancel();
        setSessions(prev => prev.map(s => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: s.messages.map(m => {
                if (m.id === assistantMsgId) {
                  return {
                    ...m,
                    content: `⚠️ Error synthesizing asset: ${err.message || err}. Reverting pipeline to secure local failover mode.`
                  };
                }
                return m;
              })
            };
          }
          return s;
        }));
      } finally {
        setIsTyping(false);
      }
      return; // end of handled send
    }

    const standardUpdatedSessions = sessions.map(s => {
      if (s.id === activeSession.id) {
        return { ...s, messages: [...s.messages, userMsg, botMsgPlaceholder] };
      }
      return s;
    });
    setSessions(standardUpdatedSessions);
    setUserInput('');
    setIsTyping(true);

    if (aiProvider === 'local_ollama') {
      try {
        const messagesHistory = [
          ...activeSession.messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          { role: 'user', content: userMsg.content }
        ];

        const response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelSelector || 'llama3',
            messages: messagesHistory,
            stream: true
          })
        });

        if (!response.ok) {
          throw new Error('Local Ollama server returned an error status.');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No readable streaming response body available.');

        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              if (json.message?.content) {
                fullText += json.message.content;
                setSessions(prev => prev.map(s => {
                  if (s.id === activeSession.id) {
                    return {
                      ...s,
                      messages: s.messages.map(m => {
                        if (m.id === assistantMsgId) {
                          return { ...m, content: fullText };
                        }
                        return m;
                      })
                    };
                  }
                  return s;
                }));
              }
            } catch (err) {
              console.warn("Partial stream line parse warning:", err);
            }
          }
        }

        if (buffer.trim()) {
          try {
            const json = JSON.parse(buffer);
            if (json.message?.content) {
              fullText += json.message.content;
              setSessions(prev => prev.map(s => {
                if (s.id === activeSession.id) {
                  return {
                    ...s,
                    messages: s.messages.map(m => {
                      if (m.id === assistantMsgId) {
                        return { ...m, content: fullText };
                      }
                      return m;
                    })
                  };
                }
                return s;
              }));
            }
          } catch {}
        }

        setLocalServerOnline(true);
      } catch (err) {
        console.error("Local connection failed, showing healing guide:", err);
        setLocalServerOnline(false);
        setShowCorsModal(true);

        setSessions(prev => prev.map(s => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: s.messages.map(m => {
                if (m.id === assistantMsgId) {
                  return {
                    ...m,
                    content: '⚠️ Failed to connect to Ollama. Make sure Ollama is running and CORS origin access is enabled in your terminal.\n\nClick the "LOCAL CONFIG WORKFLOW" button in the header bar or read the pop-up guide to copy the terminal command and fix this instantly!'
                  };
                }
                return m;
              })
            };
          }
          return s;
        }));
      } finally {
        setIsTyping(false);
      }
    } else {
      // Use proxy backend server
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: aiProvider,
            model: modelSelector,
            prompt: userMsg.content,
            systemInstruction: 'You are the Student AI Super Assistant. Give detailed, academically secure answers.'
          })
        });

        const data = await response.json();
        const botText = data.response || 'An error occurred during secure model execution.';

        setSessions(prev => prev.map(s => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: s.messages.map(m => {
                if (m.id === assistantMsgId) {
                  return { ...m, content: botText };
                }
                return m;
              })
            };
          }
          return s;
        }));
      } catch {
        setSessions(prev => prev.map(s => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: s.messages.map(m => {
                if (m.id === assistantMsgId) {
                  return {
                    ...m,
                    content: 'Error: Failed to reach backend model endpoint. Local switching failover active.'
                  };
                }
                return m;
              })
            };
          }
          return s;
        }));
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleCreateNewChat = () => {
    const newChat: ChatSession = {
      id: `session-${Date.now()}`,
      title: `New Session (${sessions.length + 1})`,
      provider: aiProvider,
      model: modelSelector,
      createdAt: new Date().toISOString(),
      messages: []
    };
    setSessions([newChat, ...sessions]);
    setActiveSessionId(newChat.id);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    if (updated.length > 0) {
      setSessions(updated);
      setActiveSessionId(updated[0].id);
    }
  };

  // Cosine Similarity Simulation for semantic Local RAG search
  const triggerSemanticSearch = () => {
    if (!ragQuery.trim()) return;
    const searchTerms = ragQuery.toLowerCase().split(' ');

    const hits = knowledgeBase.map(kb => {
      let matches = 0;
      searchTerms.forEach(term => {
        if (kb.content.toLowerCase().includes(term) || kb.title.toLowerCase().includes(term)) {
          matches++;
        }
      });
      // Calculate a pseudo cosine-similarity weight
      const score = Math.min((matches / searchTerms.length) * 100, 100);
      return { title: kb.title, content: kb.content, score: Math.round(score) };
    });

    setRagResults(hits.filter(h => h.score > 0).sort((a, b) => b.score - a.score));
  };

  const handleAppendKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKbTitle.trim() || !newKbContent.trim()) return;
    const newEntry = {
      id: `kb-${Date.now()}`,
      title: newKbTitle.trim(),
      content: newKbContent.trim()
    };
    setKnowledgeBase([newEntry, ...knowledgeBase]);
    setNewKbTitle('');
    setNewKbContent('');
  };

  // Prompt Generator Logic
  const generateWallpaperPrompt = () => {
    let details = '';
    if (wallpaperType === 'Cyberpunk') {
      details = 'vibrant neon holograms, hyper-detailed cyberpunk student workspace, computer dashboards displaying secure code trees, cinematic backlighting, high contrast, 8k resolution.';
    } else if (wallpaperType === 'Anime') {
      details = 'beautiful hand-drawn anime aesthetic, warm sunlight rays pouring through large library windows, books piled neatly, cozy scholarly atmosphere, high fidelity illustration.';
    } else if (wallpaperType === 'Nature') {
      details = 'minimalist lush alpine forest scenery, misty mountain backdrop, deep greens and morning sun rays, clean high fidelity photography, serene productivity atmosphere.';
    } else {
      details = 'abstract geometric nodes connecting together, glowing violet vector arrays on deep charcoal slate, high modern corporate tech brand identity poster.';
    }

    setWallpaperPromptResult(
      `Masterpiece Prompt [Aspect: ${wallpaperRatio}]: "${wallpaperType} theme, ${details}"`
    );
  };

  return (
    <div className="flex h-full bg-[#0B0B0C] text-[#F4F4F5] dark" id="ai-chat-root">
      {/* Sessions Left sidebar */}
      <div className={`bg-[#09090B] border-r border-[#1F1F23] flex flex-col shrink-0 hidden md:flex transition-all duration-300 ease-in-out ${
        isHistoryOpen ? 'w-64 p-4 opacity-100' : 'w-0 p-0 opacity-0 border-r-0 overflow-hidden'
      }`}>
        <div className="flex items-center justify-between mb-3 border-b border-[#1F1F23]/60 pb-2">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">History Log</span>
          <button 
            onClick={() => setIsHistoryOpen(false)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Minimize Chat History"
            id="minimize-chat-history-btn"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleCreateNewChat}
          className="w-full bg-[#1A1A1A] hover:bg-[#2A2A2E] text-[#FFD700] text-xs font-mono uppercase tracking-wider py-2.5 rounded-none flex items-center justify-center gap-1.5 cursor-pointer border border-[#FFD700]/30 transition-all shadow-[0_0_8px_rgba(255,215,0,0.1)] mb-4"
        >
          <Plus className="h-4 w-4" /> New AI Conversation
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 scrollbar-none">
          <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-2 px-2">CHATS</span>
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-serif transition cursor-pointer border-b border-[#1F1F23]/60 ${
                sess.id === activeSessionId
                  ? 'bg-zinc-900 text-[#FFD700] font-bold italic border-l-2 border-[#FFD700]'
                  : 'hover:bg-zinc-900/40 text-zinc-300'
              }`}
              onClick={() => setActiveSessionId(sess.id)}
            >
              <span className="truncate flex-1">{sess.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSession(sess.id);
                }}
                className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition ${sess.id === activeSessionId ? 'hover:text-rose-400 text-slate-400' : 'hover:text-rose-600 text-slate-500'}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat area and tools split panel */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Dynamic chat thread stage */}
        <div className="flex-1 flex flex-col h-full bg-[#0B0B0C] border-r border-[#1F1F23]">
          {/* Failover and Status Indicator Bar */}
          <div className="bg-[#0D0D0E] text-zinc-200 px-4 md:px-6 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-b border-[#1F1F23] shrink-0 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {!isHistoryOpen && (
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="p-1.5 rounded bg-[#1A1A1A] border border-[#1F1F23] text-zinc-400 hover:text-[#FFD700] hover:bg-zinc-850 transition flex items-center gap-1 cursor-pointer font-mono text-[9px] uppercase tracking-wider"
                  title="Expand Conversation History"
                  id="restore-chat-history-btn"
                >
                  <History className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span>History</span>
                </button>
              )}
              <div className="flex items-center gap-2">
                <Cpu className="text-zinc-400 h-5 w-5" />
                <div>
                  <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-wider block">AI Provider Switch</span>
                  <select
                    value={aiProvider}
                    onChange={(e) => {
                      const val = e.target.value as AIProvider;
                      setAiProvider(val);
                      if (val === 'local_ollama') {
                        setModelSelector('llama3');
                      } else {
                        setModelSelector('gemini-3.5-flash');
                      }
                    }}
                    className="bg-zinc-900 text-xs font-bold text-zinc-100 outline-none border border-[#1F1F23] rounded-none px-2 py-0.5 cursor-pointer"
                  >
                    <option value="local_ollama" className="bg-[#0B0B0C] text-zinc-100">Local Ollama (Offline Switch)</option>
                    <option value="gemini_backend" className="bg-[#0B0B0C] text-zinc-100">Gemini Cloud Server Proxy</option>
                    <option value="openai" className="bg-[#0B0B0C] text-zinc-100">vLLM / LM Studio / LocalAI</option>
                  </select>
                </div>
              </div>

              <div className="border-l border-zinc-800 h-6 hidden sm:block" />

              <div>
                <span className="text-[8px] uppercase font-bold text-[#FFD700] tracking-wider block">Local / Cloud Model Config</span>
                <select
                  value={modelSelector}
                  onChange={(e) => setModelSelector(e.target.value)}
                  className="bg-zinc-900 text-xs font-bold text-[#FFD700] outline-none border border-[#1F1F23] rounded-none px-2 py-0.5 cursor-pointer font-mono"
                >
                  {aiProvider === 'local_ollama' ? (
                    <>
                      <option value="llama3" className="bg-[#0B0B0C] text-[#FFD700]">llama3 (8B Weight)</option>
                      <option value="llama3:8b" className="bg-[#0B0B0C] text-[#FFD700]">llama3:8b</option>
                      <option value="phi3" className="bg-[#0B0B0C] text-[#FFD700]">phi3 (Low Spec Optimized)</option>
                      <option value="mistral" className="bg-[#0B0B0C] text-[#FFD700]">mistral (Fast Open Weights)</option>
                    </>
                  ) : (
                    <>
                      <option value="gemini-3.5-flash" className="bg-[#0B0B0C] text-zinc-100">gemini-3.5-flash</option>
                      <option value="gemini-2.5-flash" className="bg-[#0B0B0C] text-zinc-100">gemini-2.5-flash</option>
                      <option value="gemini-2.5-pro" className="bg-[#0B0B0C] text-zinc-100">gemini-2.5-pro</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-3">
              {/* Editorial Reader Mode Toggle Button */}
              <button
                type="button"
                onClick={() => setReaderMode(!readerMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase border border-[#1F1F23] transition-all cursor-pointer ${
                  readerMode
                    ? 'bg-zinc-900 text-[#FFD700] border-[#FFD700]/50'
                    : 'bg-[#141416] text-zinc-200 hover:bg-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{readerMode ? 'Reader: Academic' : 'Reader Mode'}</span>
              </button>

              {/* Export Conversation Dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase border border-[#1F1F23] bg-[#141416] text-zinc-200 hover:bg-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,0.3)] transition-all cursor-pointer"
                  title="Export this conversation thread"
                >
                  <Download className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span>Export Chat</span>
                </button>
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-[#0D0D0E] border border-[#1F1F23] py-1 shadow-2xl z-[100] min-w-[130px] rounded-none">
                  <button
                    onClick={exportAsMarkdown}
                    className="w-full text-left px-3 py-2 text-[9px] font-mono font-bold uppercase text-zinc-400 hover:text-[#FFD700] hover:bg-zinc-900/80 transition"
                  >
                    📝 Markdown (.md)
                  </button>
                  <button
                    onClick={exportAsJson}
                    className="w-full text-left px-3 py-2 text-[9px] font-mono font-bold uppercase text-zinc-400 hover:text-[#FFD700] hover:bg-zinc-900/80 transition"
                  >
                    🗂️ JSON Format (.json)
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCorsModal(true)}
                className="flex items-center gap-2 border-l border-zinc-800 pl-2.5 md:pl-3 cursor-pointer select-none text-left"
                title="Click to troubleshoot CORS / Ollama server connection parameters"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${localServerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                <span className="text-[10px] font-bold hidden sm:inline text-zinc-400 font-mono hover:text-white transition">
                  {localServerOnline ? '🔋 LOCAL PIPELINE (UNLIMITED)' : '⚡ CORS SETUP / REPAIR'}
                </span>
              </button>
            </div>
          </div>

          {/* Messages Thread list with Drag & Drop Wrapper */}
          <div 
            className={`flex-1 overflow-y-auto p-6 bg-[#0B0B0C] relative transition-all duration-200 ${
              isDragging ? 'bg-zinc-950 border-4 border-dashed border-[#FFD700]/30' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag & Drop Visual Overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                <Paperclip className="h-12 w-12 text-[#1A1A1A] animate-bounce mb-3" />
                <h3 className="font-serif font-black italic text-xl text-[#1A1A1A]">Drop PDFs or Images Here</h3>
                <p className="text-xs text-[#1A1A1A]/70 font-mono mt-2 uppercase tracking-wide">
                  Ingesting document for context-aware AI querying...
                </p>
              </div>
            )}

            {activeSession.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                <Sparkles className="text-[#1A1A1A]/80 h-8 w-8 mb-4" />
                <h3 className="font-serif font-black italic text-lg text-[#1A1A1A]">Welcome to Student AI</h3>
                <p className="text-xs text-[#1A1A1A]/60 mt-2 font-serif leading-relaxed">
                  Start an academic query. All input payloads are validated, parsed, and filtered server-side to guarantee integrity.
                </p>
                <div className="mt-6 border border-[#1A1A1A]/20 p-3 bg-white/50 text-left">
                  <p className="text-[10px] font-mono font-bold text-[#1A1A1A] uppercase mb-1">Drag & Drop Enabled:</p>
                  <p className="text-[9px] text-[#1A1A1A]/70 leading-relaxed font-sans">
                    Drop homework syllabus files or whiteboard photo snapshots directly into this chat thread to index them into your local RAG database.
                  </p>
                </div>
              </div>
            ) : readerMode ? (
              /* Beautiful Academic Editorial Reader Mode Container */
              <div className="max-w-2xl mx-auto bg-white border border-[#1A1A1A] p-8 md:p-12 shadow-[4px_4px_0px_rgba(26,26,26,0.15)] my-6 font-serif select-text animate-fade-in leading-relaxed">
                {/* Journal Title & Date Header Block */}
                <div className="text-center border-b-2 border-[#1A1A1A] pb-6 mb-8 select-none">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#1A1A1A]/50 uppercase block mb-1">
                    The Student Academic Journal
                  </span>
                  <h2 className="text-2xl md:text-3xl font-serif font-black italic text-[#1A1A1A] tracking-tight">
                    {activeSession.title}
                  </h2>
                  <div className="flex items-center justify-center gap-3.5 mt-3 text-[9px] font-mono text-[#1A1A1A]/60 uppercase tracking-widest">
                    <span>INDEX // {activeSession.id}</span>
                    <span>•</span>
                    <span>DATE // {new Date(activeSession.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Academic Content Block columns */}
                <div className="space-y-12 text-[#1A1A1A]/90 text-sm md:text-base leading-relaxed md:leading-loose text-justify">
                  {activeSession.messages.map((msg, idx) => (
                    <div key={msg.id} className="relative">
                      {msg.sender === 'user' ? (
                        /* Student query header */
                        <div className="border-l-4 border-[#1A1A1A] pl-4 my-6 bg-[#1A1A1A]/5 py-3">
                          <span className="text-[9px] font-mono font-bold uppercase text-[#1A1A1A]/40 tracking-wider block mb-1 select-none">
                            Academic Inquiry // Vol. {idx + 1}
                          </span>
                          <p className="font-serif font-bold italic text-[#1A1A1A] leading-relaxed">
                            "{msg.content}"
                          </p>
                        </div>
                      ) : (
                        /* System response layout with initial Drop Cap and high line-height margins */
                        <div className="space-y-3.5">
                          <span className="text-[9px] font-mono font-bold uppercase text-emerald-800 tracking-widest block select-none">
                            Editorial Analysis // Sect. {idx + 1}
                          </span>
                          <div className="first-letter:text-4xl first-letter:font-black first-letter:float-left first-letter:mr-2.5 first-letter:font-serif first-letter:leading-none whitespace-pre-line text-slate-800 font-serif leading-relaxed md:leading-loose tracking-wide">
                            {msg.content}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Editorial Seal Symbol & Footnotes */}
                <div className="mt-12 pt-8 border-t border-[#1A1A1A]/20 flex flex-col items-center text-center space-y-3 select-none">
                  <div className="h-8 w-8 rounded-full border border-[#1A1A1A] flex items-center justify-center font-mono text-xs font-bold bg-[#1A1A1A]/5">
                    Ω
                  </div>
                  <span className="text-[9px] font-mono text-[#1A1A1A]/40 uppercase tracking-widest">
                    End of Scholarly Transcript — Locally Verified & Formatted.
                  </span>
                </div>
              </div>
            ) : (
              /* Standard high-contrast chat bubble layout */
              <div className="space-y-4">
                {activeSession.messages.map((msg) => {
                  const htmlCode = msg.sender === 'assistant' ? extractHtmlCode(msg.content) : null;
                  return (
                    <div key={msg.id} className="space-y-2">
                      <div
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xl rounded-none p-4 text-xs leading-relaxed border shadow-[3px_3px_0px_rgba(0,0,0,0.3)] ${
                          msg.sender === 'user'
                            ? 'bg-zinc-900 text-zinc-100 border-[#1F1F23]'
                            : 'bg-[#141416] text-[#F3F4F6] border-[#FFD700]/25 shadow-[0_0_12px_rgba(255,215,0,0.05)]'
                        }`}>
                          <p className="font-mono uppercase tracking-wider text-[8px] opacity-60 mb-2">
                            {msg.sender === 'user' ? 'Student Entry' : 'Verified Response'}
                          </p>
                          <p className="whitespace-pre-line font-sans">{msg.content}</p>

                          {msg.sender === 'assistant' && !msg.generatedDoc && (
                            <div className="mt-3 pt-2 border-t border-[#1F1F23] flex gap-2 justify-end">
                              <button
                                onClick={() => downloadMessageAsWord(msg.content, `AI_Doc_${msg.id.substring(4, 10)}`)}
                                className="flex items-center gap-1 bg-[#0D0D0E] hover:bg-[#2b579a]/15 hover:text-[#a5b4fc] hover:border-[#2b579a]/40 border border-zinc-800/80 px-2 py-1 text-[9px] font-mono font-bold uppercase transition cursor-pointer"
                                title="Convert verified response to a formatted Word Document"
                              >
                                <FileText className="h-2.5 w-2.5 text-[#2b579a]" />
                                <span>Convert to Word</span>
                              </button>
                              <button
                                onClick={() => downloadMessageAsExcel(msg.content, `AI_Sheet_${msg.id.substring(4, 10)}`)}
                                className="flex items-center gap-1 bg-[#0D0D0E] hover:bg-[#217346]/15 hover:text-[#86efac] hover:border-[#217346]/40 border border-zinc-800/80 px-2 py-1 text-[9px] font-mono font-bold uppercase transition cursor-pointer"
                                title="Convert verified response list / table data to an Excel Sheet"
                              >
                                <FolderSync className="h-2.5 w-2.5 text-[#217346]" />
                                <span>Convert to Excel</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {msg.generatedImage && (
                        <div className="mt-2 bg-zinc-950 border border-zinc-800 p-3 max-w-xl shadow-md rounded-none mx-auto sm:mx-0">
                          <div className="relative group overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                            <img
                              src={msg.generatedImage}
                              alt="AI Generated Synthesis"
                              className="max-h-96 max-w-full object-contain transition-all duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = msg.generatedImage!;
                                  link.download = 'generated_asset.png';
                                  link.click();
                                }}
                                className="p-1.5 bg-black/80 hover:bg-[#FFD700]/90 hover:text-black text-white border border-zinc-800 transition rounded cursor-pointer"
                                title="Download Image"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                            <span>🎨 AI Graphics Generation Complete</span>
                            <button
                              onClick={() => {
                                setAttachedEditImage(msg.generatedImage!);
                                setActiveAIActionTab('image');
                                textareaRef.current?.focus();
                              }}
                              className="text-[#FFD700] hover:underline cursor-pointer"
                            >
                              ✏️ Edit Image (Use as Input)
                            </button>
                          </div>
                        </div>
                      )}

                      {msg.generatedDoc && (
                        <div className="px-2">
                          <OfficeDocumentCard
                            docType={msg.generatedDoc.docType}
                            title={msg.generatedDoc.title}
                            data={msg.generatedDoc.data}
                            onUpdate={(updatedData) => {
                              setSessions(prev => prev.map(s => {
                                if (s.id === activeSession.id) {
                                  return {
                                    ...s,
                                    messages: s.messages.map(m => {
                                      if (m.id === msg.id) {
                                        return {
                                          ...m,
                                          generatedDoc: {
                                            ...m.generatedDoc!,
                                            title: updatedData.title,
                                            data: updatedData
                                          }
                                        };
                                      }
                                      return m;
                                    })
                                  };
                                }
                                return s;
                              }));
                            }}
                            onPlaySlides={(pptData) => {
                              setFullscreenPresentation(pptData);
                              setFullscreenSlideIndex(0);
                            }}
                          />
                        </div>
                      )}

                      {htmlCode && (
                        <div className="px-2">
                          <HtmlPreviewPanel htmlCode={htmlCode} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {activeProgressTask && (
              <div className="p-4 bg-[#141416] border border-[#FFD700]/30 shadow-[0_0_15px_rgba(255,215,0,0.1)] rounded-none mt-4 animate-fade-in space-y-3 max-w-xl">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-[#FFD700] font-bold tracking-wider animate-pulse flex items-center gap-1.5 uppercase">
                    <span className="h-2 w-2 rounded-full bg-[#FFD700] animate-ping" />
                    {activeProgressTask}
                  </span>
                  <span className="text-zinc-400 font-bold">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-zinc-900 border border-zinc-800 h-2.5 overflow-hidden">
                  <div 
                    className="bg-[#FFD700] h-full transition-all duration-150 ease-out shadow-[0_0_8px_#FFD700]"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-[8px] font-mono text-zinc-500 uppercase leading-none">
                  SECURE CRYPTOGRAPHIC PIPELINE ACTIVE // DO NOT CLOSE TAB
                </p>
              </div>
            )}

            {isTyping && <p className="text-[10px] text-[#FFD700]/80 font-mono animate-pulse mt-4">Sovereign model executing credentials...</p>}
          </div>

          {/* Interactive Document Annotator split-screen editor */}
          {annotatingFile && (
            <div className="border-t border-[#1A1A1A] bg-zinc-50 p-4 animate-fade-in relative z-20">
              <div className="flex justify-between items-center border-b border-[#1A1A1A]/20 pb-2 mb-3">
                <span className="text-[10px] font-mono font-bold uppercase text-[#1A1A1A] flex items-center gap-1.5">
                  <Highlighter className="h-4 w-4 text-amber-600 animate-pulse" /> Document Highlight Annotator
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAnnotatingFile(null);
                    setActiveHighlight('');
                    setCustomAnnotationNote('');
                  }}
                  className="text-xs font-mono border border-[#1A1A1A] px-2 py-0.5 uppercase hover:bg-[#1A1A1A] hover:text-[#F9F8F6]"
                >
                  Close workspace
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document Paragraph Viewer */}
                <div className="bg-white border border-[#1A1A1A] p-3 h-48 overflow-y-auto">
                  <p className="text-[8px] font-mono font-bold text-[#1A1A1A]/40 uppercase mb-2">Document Context: {annotatingFile.name}</p>
                  <p className="text-xs text-[#1A1A1A]/90 font-serif leading-relaxed mb-4">
                    {annotatingFile.textContext}
                  </p>
                  <div className="border-t border-[#1A1A1A]/10 pt-2">
                    <p className="text-[8px] font-mono font-bold text-amber-800 uppercase mb-2">Interactive Quick-Highlight Paragraphs:</p>
                    <div className="space-y-2">
                      {[
                        `Rijndael S-Box lookup bounds must be verified against Galois Field GF(2^8) equations.`,
                        `Midterm standards dictate that the primary modulus is computed as N = p * q.`,
                        `Secure multi-factor session protocols require server-authoritative state checks.`
                      ].map((sentence, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => setActiveHighlight(sentence)}
                          className={`w-full text-left p-2 border text-[11px] font-serif transition-all ${
                            activeHighlight === sentence 
                              ? 'bg-amber-100 border-amber-600 text-amber-950 font-bold'
                              : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-[#1A1A1A]/80'
                          }`}
                        >
                          "{sentence}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Margin Annotation and Append Controls */}
                <div className="flex flex-col justify-between bg-[#F9F8F6] border border-[#1A1A1A] p-3 h-48">
                  <div className="space-y-2">
                    <label className="text-[8px] font-mono font-bold text-[#1A1A1A]/60 uppercase tracking-widest block">Active Selected Highlight:</label>
                    <div className="bg-white border border-[#1A1A1A] p-2 text-xs font-serif italic text-[#1A1A1A] max-h-16 overflow-y-auto min-h-[2.5rem]">
                      {activeHighlight ? `"${activeHighlight}"` : <span className="opacity-40">Click one of the paragraphs or select text to generate a highlight annotation.</span>}
                    </div>

                    <label className="text-[8px] font-mono font-bold text-[#1A1A1A]/60 uppercase tracking-widest block">Optional margin annotation note:</label>
                    <input 
                      type="text"
                      placeholder="e.g., Query the model why Galois Field GF(2^8) is used here..."
                      value={customAnnotationNote}
                      onChange={(e) => setCustomAnnotationNote(e.target.value)}
                      className="w-full bg-white border border-[#1A1A1A] px-2.5 py-1 text-xs font-mono outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!activeHighlight}
                    onClick={() => {
                      const appendText = `[Reference File: "${annotatingFile.name}" - Highlighted standard]: "${activeHighlight}" ${
                        customAnnotationNote ? `\n[Annotation Note]: "${customAnnotationNote}"` : ''
                      }`;
                      setUserInput(prev => prev ? `${prev}\n\n${appendText}` : appendText);
                      setAnnotatingFile(null);
                      setActiveHighlight('');
                      setCustomAnnotationNote('');
                    }}
                    className={`w-full text-[10px] font-mono py-2 uppercase border ${
                      activeHighlight 
                        ? 'bg-[#1A1A1A] text-[#F9F8F6] border-[#1A1A1A] hover:bg-opacity-90' 
                        : 'bg-zinc-200 text-zinc-400 border-zinc-200 cursor-not-allowed'
                    }`}
                  >
                    💬 Append Highlight Annotation to Prompt
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Lens Camera Scanner with real getUserMedia stream */}
          {lensOpen && (
            <div className="p-5 border-t border-[#1A1A1A] bg-white animate-fade-in space-y-4 shadow-[0_-4px_10px_rgba(26,26,26,0.05)]">
              <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                  <Scan className="h-4 w-4 text-emerald-800 animate-pulse" /> Intel-Lens Smart Document Camera
                </span>
                <button
                  type="button"
                  onClick={() => setLensOpen(false)}
                  className="text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[11px] text-[#1A1A1A]/70 font-serif leading-relaxed">
                Connect your physical workspace to the AI. Point the camera at worksheets, textbooks, or code to run local smart-OCR text extraction.
              </p>

              {/* Camera Connection Warning (e.g. if in Sandbox / Blocked iframe environment) */}
              {lensCameraError && (
                <div className="bg-amber-50 border border-amber-300 p-2.5 text-[10px] font-mono text-amber-900 leading-relaxed">
                  <span className="font-bold block uppercase">Hardware Notice:</span>
                  {lensCameraError}
                </div>
              )}

              {/* Filter selections */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ocr', name: 'Textbook OCR', desc: 'Scan reference notes' },
                  { id: 'math', name: 'Math Formula Solver', desc: 'Scan complex math' },
                  { id: 'code', name: 'Code OCR Extract', desc: 'Sanitize script block' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleLensScan(f.id as any)}
                    className={`p-2.5 border text-left transition rounded-none cursor-pointer ${
                      lensFilter === f.id
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-[#F9F8F6] border-[#1A1A1A]/20 hover:bg-[#1A1A1A]/5 text-[#1A1A1A]'
                    }`}
                  >
                    <p className="text-[10px] font-mono font-bold uppercase">{f.name}</p>
                    <p className="text-[8px] opacity-60 mt-0.5">{f.desc}</p>
                  </button>
                ))}
              </div>

              {/* Real Video Stream / Fallback Camera Viewport */}
              <div className="relative h-44 bg-black border border-[#1A1A1A] flex flex-col items-center justify-center overflow-hidden">
                {/* Ambient Grid overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 z-10" />
                
                {/* Visual camera brackets */}
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-emerald-500 z-10" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-emerald-500 z-10" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-emerald-500 z-10" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-emerald-500 z-10" />

                {/* Real Live Video HTML Element */}
                {lensOpen && !lensCameraError && (
                  <video 
                    ref={lensVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 w-full h-full object-cover z-0 ${lensScanning || lensCapturedText ? 'opacity-35' : 'opacity-100'}`}
                  />
                )}

                {lensScanning ? (
                  <div className="text-center space-y-2 relative z-10 animate-pulse bg-black/50 p-2.5">
                    <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-emerald-400 animate-spin mx-auto" />
                    <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                      Analyzing with Gemini AI...
                    </p>
                  </div>
                ) : lensCapturedText ? (
                  <div className="absolute inset-0 p-3 overflow-y-auto font-mono text-[10px] text-emerald-400 leading-relaxed text-justify bg-black/95 selection:bg-emerald-900 select-all whitespace-pre-wrap z-20">
                    {lensCapturedText}
                  </div>
                ) : (
                  <div className="text-center space-y-2 select-none relative z-10 bg-black/40 p-3">
                    <Camera className="h-6 w-6 text-emerald-500 mx-auto animate-pulse" />
                    <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                      {lensCameraStream ? "Live Workspace Camera Active" : "Camera Simulation Mode Active"}
                    </p>
                    <p className="text-[8px] text-slate-300 max-w-[200px] mx-auto">
                      Select any scan category above to capture and process your textbook notes, math formulas, or code blocks.
                    </p>
                  </div>
                )}

                {/* Laser scan line overlay */}
                {lensScanning && (
                  <div className="absolute w-full h-0.5 bg-emerald-500 shadow-[0_0_12px_#10b981] top-0 left-0 animate-bounce z-10" />
                )}
              </div>

              {/* Scanned Text Detail Editor */}
              {lensCapturedText && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center text-[9px] font-mono text-[#1A1A1A]/60">
                    <span>EDIT OR ADJUST EXTRACTED DETAILS:</span>
                    <span className="text-emerald-800 font-bold uppercase">OCR PARSED SUCCESS</span>
                  </div>
                  <textarea
                    rows={4}
                    value={lensCapturedEditable}
                    onChange={(e) => setLensCapturedEditable(e.target.value)}
                    className="w-full border border-[#1A1A1A] p-2.5 text-xs font-mono bg-[#F9F8F6] text-[#1A1A1A] outline-none rounded-none focus:bg-white leading-relaxed"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLensCapturedText('');
                        setLensCapturedEditable('');
                      }}
                      className="px-3.5 py-1.5 border border-[#1A1A1A] text-[10px] font-mono uppercase cursor-pointer hover:bg-slate-50"
                    >
                      Rescan
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyLensCapture}
                      className="px-4 py-1.5 bg-[#1A1A1A] text-[#F9F8F6] text-[10px] font-mono uppercase cursor-pointer hover:bg-opacity-90 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Apply details to prompt
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attached Files Tray (displayed just above input area) */}
          {attachedFiles.length > 0 && (
            <div className="px-4 py-2 border-t border-[#1A1A1A] bg-zinc-50 flex flex-wrap gap-2 animate-fade-in">
              {attachedFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center gap-2 border border-[#1A1A1A] bg-white px-2 py-1 shadow-[1px_1px_0px_rgba(26,26,26,0.15)] group relative"
                >
                  {file.type === 'image' && file.dataUrl ? (
                    <img 
                      src={file.dataUrl} 
                      alt="Thumbnail" 
                      className="h-6 w-6 object-cover border border-[#1A1A1A]" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <FileText className="h-4 w-4 text-[#1A1A1A]" />
                  )}
                  
                  <div className="text-left leading-tight">
                    <p className="text-[9px] font-mono font-bold text-[#1A1A1A] truncate max-w-[120px]">{file.name}</p>
                    <p className="text-[7px] font-mono uppercase text-[#1A1A1A]/50">{file.type}</p>
                  </div>

                  {/* Actions Panel */}
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      type="button"
                      onClick={() => setAnnotatingFile(file)}
                      className="text-[8px] font-mono bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 px-1 py-0.5 uppercase font-bold"
                      title="Highlight and annotate sections"
                    >
                      Annotate
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))}
                      className="text-[10px] text-rose-600 hover:text-rose-800 font-bold px-1"
                      title="Remove attachment"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SEARCH COMMAND CONTEXT BAR (UX REFACTOR) */}
          <div className="bg-[#0D0D0D]/95 backdrop-blur-sm border-t border-b border-[rgba(255,215,0,0.2)] py-2 px-4 flex items-center gap-3 overflow-x-auto scrollbar-none select-none z-30">
            <div className="flex items-center gap-2 shrink-0 border-r border-[rgba(255,215,0,0.15)] pr-3">
              <span className="h-2 w-2 rounded-full bg-[#FFD700] animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase">COMMAND DIRECTIVES:</span>
            </div>
            <div className="flex items-center gap-4 py-0.5 overflow-x-auto scrollbar-none">
              {chatCommands.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUserInput(item.cmd + ' ');
                      textareaRef.current?.focus();
                    }}
                    className="group flex items-center gap-2 shrink-0 px-2.5 py-1 bg-zinc-950/80 border border-[rgba(255,255,255,0.08)] hover:border-[#FFD700] transition-all duration-150 rounded-none cursor-pointer hover:shadow-[0_0_8px_rgba(255,215,0,0.2)]"
                  >
                    <IconComponent className={`h-3 w-3 transition-colors duration-150 ${item.isHighPriority ? 'text-[#FFD700] stroke-[#FFD700] fill-none' : 'text-white stroke-white fill-none'} group-hover:text-[#FFD700] group-hover:stroke-[#FFD700]`} />
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-mono font-bold text-white tracking-wider group-hover:text-[#FFD700] transition-colors duration-150 group-hover:drop-shadow-[0_0_4px_rgba(255,215,0,0.4)]">
                        {item.cmd}
                      </span>
                      <span className="text-[7.5px] font-mono text-zinc-400 group-hover:text-[#FFD700]/80 transition-colors duration-150">
                        {item.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Form input fields with Rich-Text Editor panel */}
          <div className="border-t border-[#1F1F23] bg-[#0D0D0E]">
            {/* AI Creation Studio Toolbar */}
            <div className="px-4 py-2 border-b border-[#1F1F23]/60 bg-[#0A0A0C] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mr-1">STUDIO:</span>
                
                <button
                  type="button"
                  onClick={() => setActiveAIActionTab(activeAIActionTab === 'image' ? null : 'image')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition border cursor-pointer ${
                    activeAIActionTab === 'image'
                      ? 'bg-[#ea580c]/15 text-[#ea580c] border-[#ea580c]/40'
                      : 'bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  <Wallpaper className="h-3 w-3 text-[#ea580c]" />
                  <span>Image Draw</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAIActionTab(activeAIActionTab === 'word' ? null : 'word')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition border cursor-pointer ${
                    activeAIActionTab === 'word'
                      ? 'bg-[#2b579a]/15 text-[#2b579a] border-[#2b579a]/40'
                      : 'bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  <FileText className="h-3 w-3 text-[#2b579a]" />
                  <span>Word Doc</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAIActionTab(activeAIActionTab === 'excel' ? null : 'excel')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition border cursor-pointer ${
                    activeAIActionTab === 'excel'
                      ? 'bg-[#217346]/15 text-[#217346] border-[#217346]/40'
                      : 'bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  <FolderSync className="h-3 w-3 text-[#217346]" />
                  <span>Excel Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAIActionTab(activeAIActionTab === 'ppt' ? null : 'ppt')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition border cursor-pointer ${
                    activeAIActionTab === 'ppt'
                      ? 'bg-[#d24726]/15 text-[#d24726] border-[#d24726]/40'
                      : 'bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  <Sparkles className="h-3 w-3 text-[#d24726]" />
                  <span>PPT Slides</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAIActionTab(activeAIActionTab === 'rag' ? null : 'rag')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition border cursor-pointer ${
                    activeAIActionTab === 'rag'
                      ? 'bg-purple-950/40 text-purple-400 border-purple-800/60'
                      : 'bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  <Network className="h-3 w-3 text-purple-400" />
                  <span>Semantic RAG</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAIActionTab(activeAIActionTab === 'wallpaper' ? null : 'wallpaper')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition border cursor-pointer ${
                    activeAIActionTab === 'wallpaper'
                      ? 'bg-amber-950/40 text-amber-400 border-amber-800/60'
                      : 'bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  <Wallpaper className="h-3 w-3 text-amber-400" />
                  <span>Wallpaper Gen</span>
                </button>
              </div>

              {/* Direct File Import Button */}
              <label className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase cursor-pointer bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#FFD700] hover:border-[#FFD700]/50 transition">
                <Download className="h-3 w-3 rotate-180 text-[#FFD700]" />
                <span>Import File</span>
                <input
                  type="file"
                  accept=".csv,.txt,.doc,.ppt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleIngestFile(file);
                  }}
                />
              </label>
            </div>

            {/* AI Creation Studio Parameter Drawers */}
            {activeAIActionTab && (
              <div className="p-4 bg-[#08080A] border-b border-[#1F1F23]/60 text-xs text-zinc-300 space-y-3 animate-fade-in text-left">
                {activeAIActionTab === 'image' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest pb-1 border-b border-zinc-900">
                      <span>🎨 Image Synthesis Parameters</span>
                      <span>Free styles included</span>
                    </div>

                    {/* Style badges selector */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-400 block">Render Style:</label>
                      <div className="flex flex-wrap gap-1">
                        {['Photorealistic', 'Anime', 'Cyberpunk', 'Watercolor', '3D Render', 'Sketch', 'Pixel Art'].map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => setImageStyle(style)}
                            className={`px-2 py-0.5 text-[9px] font-mono uppercase transition border cursor-pointer ${
                              imageStyle === style
                                ? 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/40 font-bold'
                                : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ratio badges selector */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-zinc-400 block">Aspect Ratio:</label>
                        <div className="flex flex-wrap gap-1">
                          {['1:1', '16:9', '9:16', '4:3', '3:4'].map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setImageRatio(ratio)}
                              className={`px-2 py-0.5 text-[9px] font-mono uppercase transition border cursor-pointer ${
                                imageRatio === ratio
                                  ? 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/40 font-bold'
                                  : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300'
                              }`}
                            >
                              {ratio}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reference Image Thumbnail and upload */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-zinc-400 block">Reference Input Image:</label>
                        {attachedEditImage ? (
                          <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-950 p-1 rounded">
                            <img
                              src={attachedEditImage}
                              alt="Ref preview"
                              className="h-8 w-8 object-cover rounded border border-zinc-800"
                              referrerPolicy="no-referrer"
                            />
                            <div className="text-left flex-1 min-w-0">
                              <span className="text-[8px] font-mono text-zinc-500 truncate block">Image Input Loaded</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAttachedEditImage(null)}
                              className="text-rose-500 hover:text-rose-400 font-bold px-1 text-xs cursor-pointer"
                              title="Clear input image reference"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-1 py-1 px-2 border border-dashed border-zinc-800 hover:border-zinc-600 bg-zinc-950 text-zinc-500 hover:text-zinc-300 font-mono text-[9px] uppercase cursor-pointer rounded transition">
                            <Download className="h-3 w-3 rotate-180" />
                            <span>Upload Input Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onload = (event) => setAttachedEditImage(event.target?.result as string);
                                  r.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeAIActionTab === 'word' && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-[#2b579a] uppercase tracking-wider pb-1 border-b border-zinc-900 mb-1">
                      📄 AI Microsoft Word Studio
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-serif italic">
                      Describe the essay, notes outline, syllabus, or review paper below. The system will synthesize a formatted document with headings, chapters, lists, and download payloads.
                    </p>
                  </div>
                )}

                {activeAIActionTab === 'excel' && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-[#217346] uppercase tracking-wider pb-1 border-b border-zinc-900 mb-1">
                      📊 AI Microsoft Excel Studio
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-serif italic">
                      Describe the data table or list below (e.g. 'grades spreadsheet for 10 students with weighted totals'). The AI will generate an interactive cell matrix grid.
                    </p>
                  </div>
                )}

                {activeAIActionTab === 'ppt' && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-[#d24726] uppercase tracking-wider pb-1 border-b border-zinc-900 mb-1">
                      📈 AI Microsoft PowerPoint Studio
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-serif italic">
                      Describe the slideshow presentation outline (e.g. '5 slides explaining cyber warfare basics'). The system will formulate individual slides and activate the slideshow projector.
                    </p>
                  </div>
                )}

                {activeAIActionTab === 'rag' && (
                  <div className="space-y-4">
                    <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider pb-1 border-b border-zinc-900 mb-1 flex justify-between items-center">
                      <span className="flex items-center gap-1"><Network className="h-3.5 w-3.5 text-purple-400" /> Semantic Local RAG Database</span>
                      <span className="text-[9px] lowercase opacity-60">locally indexes knowledge snippets</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left side: Query KB */}
                      <div className="bg-zinc-950/60 border border-zinc-900 p-3 space-y-2.5">
                        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Query Knowledge Base</span>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={ragQuery}
                            onChange={(e) => setRagQuery(e.target.value)}
                            className="flex-1 border border-zinc-800 bg-zinc-900 text-zinc-100 outline-none px-2.5 py-1 text-xs font-mono placeholder-zinc-600 focus:border-purple-800"
                            placeholder="Type semantic query..."
                          />
                          <button
                            type="button"
                            onClick={triggerSemanticSearch}
                            className="bg-purple-950/60 hover:bg-purple-900 text-purple-200 text-[10px] font-mono px-3 border border-purple-800/60 transition cursor-pointer"
                          >
                            Query
                          </button>
                        </div>

                        {/* RAG query hit matches */}
                        {ragResults.length > 0 ? (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin pr-1">
                            {ragResults.map((hit, idx) => (
                              <div key={idx} className="bg-zinc-900 p-2 border border-zinc-850 font-mono text-[9px] leading-relaxed">
                                <div className="flex justify-between items-center text-zinc-200 font-bold">
                                  <span>{hit.title}</span>
                                  <span className="text-emerald-400 bg-emerald-950/45 px-1 border border-emerald-800/40">Match: {hit.score}%</span>
                                </div>
                                <p className="text-zinc-400 mt-1 font-sans">{hit.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[9px] font-mono text-zinc-600 italic">No semantic queries executed or no matching hits found yet.</p>
                        )}
                      </div>

                      {/* Right side: Add KB Snippet */}
                      <div className="bg-zinc-950/60 border border-zinc-900 p-3">
                        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-2">Index Snippet Into DB</span>
                        <form onSubmit={(e) => { e.preventDefault(); handleAppendKnowledge(e); }} className="space-y-2">
                          <input
                            type="text"
                            required
                            value={newKbTitle}
                            onChange={(e) => setNewKbTitle(e.target.value)}
                            className="w-full border border-zinc-800 bg-zinc-900 text-zinc-100 outline-none px-2.5 py-1 text-xs font-mono placeholder-zinc-600 focus:border-purple-800"
                            placeholder="Snippet Title..."
                          />
                          <textarea
                            required
                            rows={2}
                            value={newKbContent}
                            onChange={(e) => setNewKbContent(e.target.value)}
                            className="w-full border border-zinc-800 bg-zinc-900 text-zinc-100 outline-none p-2 text-xs leading-relaxed font-sans placeholder-zinc-600 focus:border-purple-800 resize-none"
                            placeholder="Content snippet text..."
                          />
                          <button type="submit" className="w-full bg-purple-900/40 hover:bg-purple-950 text-purple-300 hover:text-white text-[10px] font-mono py-1.5 border border-purple-800/40 transition cursor-pointer">
                            Index Snippet Into DB
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {activeAIActionTab === 'wallpaper' && (
                  <div className="space-y-3">
                    <div className="text-[10px] font-mono text-amber-500 uppercase tracking-wider pb-1 border-b border-zinc-900 mb-1 flex justify-between items-center">
                      <span className="flex items-center gap-1"><Wallpaper className="h-3.5 w-3.5 text-amber-400" /> AI Wallpaper Prompt Synthesis Engine</span>
                      <span className="text-[9px] lowercase opacity-60">creates prompt variables</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3 bg-zinc-950/60 border border-zinc-900 p-3">
                        <div>
                          <label className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">Theme</label>
                          <select
                            value={wallpaperType}
                            onChange={(e) => setWallpaperType(e.target.value)}
                            className="w-full border border-zinc-800 bg-zinc-900 text-zinc-100 outline-none px-2 py-1.5 text-xs font-mono"
                          >
                            <option value="Cyberpunk" className="bg-[#0B0B0C] text-zinc-100">Cyberpunk student dashboard</option>
                            <option value="Anime" className="bg-[#0B0B0C] text-zinc-100">Anime library studying</option>
                            <option value="Nature" className="bg-[#0B0B0C] text-zinc-100">Nature minimalist scenery</option>
                            <option value="Abstract" className="bg-[#0B0B0C] text-zinc-100">Abstract vectors slate</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">Aspect Ratio</label>
                          <select
                            value={wallpaperRatio}
                            onChange={(e) => setWallpaperRatio(e.target.value)}
                            className="w-full border border-zinc-800 bg-zinc-900 text-zinc-100 outline-none px-2 py-1.5 text-xs font-mono"
                          >
                            <option value="Mobile (9:16)" className="bg-[#0B0B0C] text-zinc-100">Mobile (9:16)</option>
                            <option value="Desktop (16:9)" className="bg-[#0B0B0C] text-zinc-100">Desktop (16:9)</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={generateWallpaperPrompt}
                          className="w-full bg-amber-950/60 hover:bg-amber-900 text-amber-200 text-[10px] font-mono py-2 border border-amber-800/40 transition cursor-pointer"
                        >
                          Synthesize Prompt
                        </button>
                      </div>

                      <div className="bg-zinc-950/60 border border-zinc-900 p-3 flex flex-col justify-between">
                        <div>
                          <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Synthesized Output Prompt</span>
                          {wallpaperPromptResult ? (
                            <div className="bg-zinc-900/80 p-2.5 border border-zinc-850 font-mono text-[9px] text-[#FFD700] leading-relaxed select-all">
                              {wallpaperPromptResult}
                            </div>
                          ) : (
                            <p className="text-[9px] font-mono text-zinc-600 italic">Select parameters on the left and click "Synthesize Prompt" to view result.</p>
                          )}
                        </div>

                        {wallpaperPromptResult && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserInput(prev => prev ? `${prev}\n\n${wallpaperPromptResult}` : wallpaperPromptResult);
                              setActiveAIActionTab(null);
                            }}
                            className="w-full mt-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white text-[9px] font-mono py-1 border border-zinc-800 transition cursor-pointer"
                          >
                            Add to Chat input
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rich Text Editing Command Bar */}
            <div className="px-4 py-1.5 border-b border-[#1F1F23]/40 bg-[#0F0F11] flex items-center justify-between">
              <div className="flex items-center gap-1">
                {/* Formatter Buttons */}
                <button
                  type="button"
                  onClick={() => insertRichTextFormat('**', '**')}
                  className="p-1 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 rounded text-xs font-mono text-zinc-300 flex items-center"
                  title="Insert Bold Markdown (**bold**)"
                >
                  <Bold className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertRichTextFormat('*', '*')}
                  className="p-1 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 rounded text-xs font-mono text-zinc-300 flex items-center"
                  title="Insert Italic Markdown (*italic*)"
                >
                  <Italic className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertRichTextFormat('`', '`')}
                  className="p-1 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 rounded text-xs font-mono text-zinc-300 flex items-center"
                  title="Insert Code Tag (`code`)"
                >
                  <Code className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertRichTextFormat('> ')}
                  className="p-1 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 rounded text-xs font-mono text-zinc-300 flex items-center"
                  title="Insert Blockquote (> )"
                >
                  <Quote className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertRichTextFormat('==', '==')}
                  className="p-1 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 rounded text-xs font-mono text-zinc-300 flex items-center"
                  title="Highlight (==text==)"
                >
                  <Highlighter className="h-3 w-3" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="p-4 flex items-start gap-2 bg-[#0D0D0E]">
              {/* Toggle Lens Camera Button */}
              <button
                type="button"
                onClick={() => setLensOpen(!lensOpen)}
                className={`p-2.5 rounded-none border border-[#1F1F23] transition-all cursor-pointer ${
                  lensOpen ? 'bg-zinc-800 text-[#FFD700] border-[#FFD700]' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]'
                }`}
                title="Toggle Lens Camera Scanner"
              >
                <Camera className="h-4 w-4" />
              </button>

              {/* Rich Area Multi-line Input Field */}
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={2}
                className="flex-1 border border-zinc-800 bg-zinc-900 text-zinc-100 outline-none rounded-none px-4 py-2 text-xs font-mono resize-none focus:ring-1 focus:ring-zinc-700 leading-relaxed placeholder-zinc-500"
                placeholder="Type query or drag PDFs/whiteboard images here. Highlight attachments to add annotated references..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              
              <button type="submit" className="bg-[#1A1A1A] hover:bg-zinc-800 text-[#FFD700] p-3 rounded-none cursor-pointer border border-[#FFD700]/30 self-stretch flex items-center justify-center">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>


      </div>

      {/* High-Contrast, Beautiful Dark CORS Self-Healing Setup Modal */}
      {showCorsModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-[#09090B] border-2 border-[#FFD700] p-6 rounded-none shadow-[8px_8px_0px_rgba(255,215,0,0.15)] space-y-6 text-zinc-100 relative">
            <button
              onClick={() => setShowCorsModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white font-mono text-sm cursor-pointer border border-zinc-800 hover:border-zinc-500 w-6 h-6 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-[#1F1F23] pb-4">
              <ShieldAlert className="text-[#FFD700] h-6 w-6 animate-pulse" />
              <div>
                <h3 className="text-sm font-mono font-bold text-[#FFD700] uppercase tracking-wider">CORS Interconnect Self-Healing Guide</h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Ollama Localhost Sandbox Bridge</p>
              </div>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
              <p className="font-sans">
                Browsers natural security sandboxing prevents standard web apps from requesting resources directly on <code className="text-[#FFD700] bg-zinc-900 px-1 py-0.5 rounded font-mono">localhost</code>. To resolve this instantly, restart your local Ollama server with cross-origin access allowed:
              </p>

              <div className="space-y-4">
                {/* Mac / Linux Option */}
                <div className="bg-zinc-950 border border-zinc-850 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">🍎 MAC & 🐧 LINUX TERMINAL</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('OLLAMA_ORIGINS="*" ollama serve');
                        setCopiedCommand('mac');
                        setTimeout(() => setCopiedCommand(null), 2000);
                      }}
                      className="text-[9px] font-mono text-[#FFD700] uppercase border border-[#FFD700]/30 hover:bg-[#FFD700]/10 px-2 py-0.5 cursor-pointer transition-all"
                    >
                      {copiedCommand === 'mac' ? '✓ Copied!' : '📋 Copy Command'}
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono bg-black text-emerald-400 p-2.5 rounded-none overflow-x-auto select-all border border-zinc-900">
                    OLLAMA_ORIGINS="*" ollama serve
                  </pre>
                </div>

                {/* Windows Option */}
                <div className="bg-zinc-950 border border-zinc-850 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">🪟 WINDOWS (POWERSHELL)</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('$env:OLLAMA_ORIGINS="*"; ollama serve');
                        setCopiedCommand('windows');
                        setTimeout(() => setCopiedCommand(null), 2000);
                      }}
                      className="text-[9px] font-mono text-[#FFD700] uppercase border border-[#FFD700]/30 hover:bg-[#FFD700]/10 px-2 py-0.5 cursor-pointer transition-all"
                    >
                      {copiedCommand === 'windows' ? '✓ Copied!' : '📋 Copy Command'}
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono bg-black text-emerald-400 p-2.5 rounded-none overflow-x-auto select-all border border-zinc-900">
                    $env:OLLAMA_ORIGINS="*"; ollama serve
                  </pre>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-3 flex items-start gap-2 text-[10px] text-zinc-400 leading-normal font-mono">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>
                  Once executed, keep the terminal window open so Ollama can continue listening. Close this modal, and your prompts will stream instantly with zero rate limits!
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-[#1F1F23]">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(1000) });
                    if (res.ok) {
                      setLocalServerOnline(true);
                      setShowCorsModal(false);
                    } else {
                      alert("Ollama reached but returned an error. Ensure the service is loaded and running.");
                    }
                  } catch {
                    alert("Ollama remains unreachable. Make sure the terminal command was executed and is still active!");
                  }
                }}
                className="bg-[#FFD700] hover:bg-[#FFE55C] text-[#0B0B0C] text-[10px] font-mono font-bold uppercase tracking-wider py-2 px-4 cursor-pointer transition-all"
              >
                🔄 RE-TEST CONNECTION
              </button>

              <button
                onClick={() => setShowCorsModal(false)}
                className="border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-[10px] font-mono uppercase px-4 py-2 cursor-pointer transition-all"
              >
                Dismiss Setup Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Presentation Slideshow Modal */}
      {fullscreenPresentation && (
        <div className="fixed inset-0 bg-black z-[120] flex flex-col justify-between p-8 animate-fade-in text-white font-sans select-none text-left">
          {/* Header Controls */}
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs bg-[#ea580c] text-white px-2 py-0.5 rounded-sm font-mono font-bold">PPT</span>
              <span className="font-serif font-black italic text-sm">{fullscreenPresentation.title}</span>
            </div>
            <button
              onClick={() => setFullscreenPresentation(null)}
              className="px-3 py-1.5 border border-zinc-850 bg-zinc-900 hover:bg-zinc-800 rounded font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:text-white transition cursor-pointer"
            >
              Close Projector
            </button>
          </div>

          {/* Active slide body projector */}
          <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full text-center py-12 relative">
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-serif font-black italic text-[#ea580c] tracking-tight leading-tight">
                {fullscreenPresentation.slides[fullscreenSlideIndex]?.title}
              </h2>

              <ul className="space-y-4 max-w-2xl mx-auto pl-4 list-disc list-outside text-left text-zinc-200 text-lg md:text-xl">
                {fullscreenPresentation.slides[fullscreenSlideIndex]?.bullets?.map((b: string, bIdx: number) => (
                  <li key={bIdx} className="marker:text-[#ea580c] leading-relaxed">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Projector Controls */}
          <div className="flex justify-between items-center border-t border-zinc-900 pt-4 max-w-4xl mx-auto w-full">
            <button
              onClick={() => setFullscreenSlideIndex(prev => Math.max(0, prev - 1))}
              disabled={fullscreenSlideIndex === 0}
              className="flex items-center gap-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono uppercase tracking-wider rounded transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Previous Slide
            </button>

            <span className="text-xs font-mono text-zinc-500">
              Slide {fullscreenSlideIndex + 1} of {fullscreenPresentation.slides.length}
            </span>

            <button
              onClick={() => setFullscreenSlideIndex(prev => Math.min(fullscreenPresentation.slides.length - 1, prev + 1))}
              disabled={fullscreenSlideIndex === fullscreenPresentation.slides.length - 1}
              className="flex items-center gap-1 px-4 py-2 bg-[#ea580c] hover:bg-[#ea580c]/90 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono font-bold uppercase tracking-wider rounded transition cursor-pointer text-white"
            >
              Next Slide <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
