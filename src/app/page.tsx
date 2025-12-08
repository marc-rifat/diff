'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Clipboard, ArrowRightLeft, Github, Columns, Rows, Check, Trash2, Code } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LANGUAGES = [
  { id: 'text', name: 'Plain Text' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'c', name: 'C' },
  { id: 'cpp', name: 'C++' },
  { id: 'csharp', name: 'C#' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
  { id: 'php', name: 'PHP' },
  { id: 'ruby', name: 'Ruby' },
  { id: 'swift', name: 'Swift' },
  { id: 'kotlin', name: 'Kotlin' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'json', name: 'JSON' },
  { id: 'xml', name: 'XML' },
  { id: 'yaml', name: 'YAML' },
  { id: 'markdown', name: 'Markdown' },
  { id: 'sql', name: 'SQL' },
  { id: 'shell', name: 'Shell Script' },
  { id: 'dockerfile', name: 'Dockerfile' },
];

const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': return 'javascript';
    case 'jsx': return 'javascript';
    case 'ts': return 'typescript';
    case 'tsx': return 'typescript';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'c': return 'c';
    case 'cpp': return 'cpp';
    case 'h': return 'cpp';
    case 'cs': return 'csharp';
    case 'go': return 'go';
    case 'rs': return 'rust';
    case 'php': return 'php';
    case 'rb': return 'ruby';
    case 'swift': return 'swift';
    case 'kt': return 'kotlin';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'json': return 'json';
    case 'xml': return 'xml';
    case 'yaml': return 'yaml';
    case 'yml': return 'yaml';
    case 'md': return 'markdown';
    case 'sql': return 'sql';
    case 'sh': return 'shell';
    case 'bash': return 'shell';
    default: 
        if (filename.toLowerCase() === 'dockerfile') return 'dockerfile';
        return 'text';
  }
};

export default function Home() {
  const [original, setOriginal] = useState<string>('');
  const [modified, setModified] = useState<string>('');
  const [originalName, setOriginalName] = useState<string>('Original');
  const [modifiedName, setModifiedName] = useState<string>('Modified');
  const [renderSideBySide, setRenderSideBySide] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('text');
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = React.useRef(0);

  useEffect(() => {
    const savedOriginal = localStorage.getItem('diff_original');
    const savedModified = localStorage.getItem('diff_modified');
    const savedOriginalName = localStorage.getItem('diff_originalName');
    const savedModifiedName = localStorage.getItem('diff_modifiedName');
    const savedRenderSideBySide = localStorage.getItem('diff_renderSideBySide');
    const savedLanguage = localStorage.getItem('diff_language');

    if (savedOriginal) setOriginal(savedOriginal);
    if (savedModified) setModified(savedModified);
    if (savedOriginalName) setOriginalName(savedOriginalName);
    if (savedModifiedName) setModifiedName(savedModifiedName);
    if (savedRenderSideBySide !== null) setRenderSideBySide(savedRenderSideBySide === 'true');
    if (savedLanguage) setLanguage(savedLanguage);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('diff_original', original);
    localStorage.setItem('diff_modified', modified);
    localStorage.setItem('diff_originalName', originalName);
    localStorage.setItem('diff_modifiedName', modifiedName);
    localStorage.setItem('diff_renderSideBySide', String(renderSideBySide));
    localStorage.setItem('diff_language', language);
  }, [original, modified, originalName, modifiedName, renderSideBySide, language, mounted]);

  const handleClear = () => {
    setOriginal('');
    setModified('');
    setOriginalName('Original');
    setModifiedName('Modified');
    setLanguage('text');
    
    localStorage.removeItem('diff_original');
    localStorage.removeItem('diff_modified');
    localStorage.removeItem('diff_originalName');
    localStorage.removeItem('diff_modifiedName');
    localStorage.removeItem('diff_language');
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
  }, []);

  const handleOverlayDrop = (e: React.DragEvent, side: 'original' | 'modified') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0], side);
    }
  };

  const handleFileUpload = (file: File, side: 'original' | 'modified') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const detectedLang = getLanguageFromFilename(file.name);
      
      if (detectedLang !== 'text') {
        setLanguage(detectedLang);
      }

      if (side === 'original') {
        setOriginal(text);
        setOriginalName(file.name);
      } else {
        setModified(text);
        setModifiedName(file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleEditorDidMount = (editor: any) => {
    const originalEditor = editor.getOriginalEditor();
    const modifiedEditor = editor.getModifiedEditor();

    originalEditor.onDidChangeModelContent(() => {
      setOriginal(originalEditor.getValue());
    });

    modifiedEditor.onDidChangeModelContent(() => {
      setModified(modifiedEditor.getValue());
    });
  };

  const handlePaste = async (side: 'original' | 'modified') => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
        alert("Clipboard access is not available in this environment. Please use Ctrl+V/Cmd+V to paste directly into the editor.");
        return;
    }
    try {
      const text = await navigator.clipboard.readText();
      if (side === 'original') {
        setOriginal(text);
        setOriginalName('Pasted Content');
      } else {
        setModified(text);
        setModifiedName('Pasted Content');
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const DropZone = ({ side, content, name }: { side: 'original' | 'modified', content: string, name: string }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0], side);
      }
    }, [side]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

    if (content) {
        return null; 
    }

    return (
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl transition-colors cursor-pointer h-full min-h-[400px]",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          "bg-card text-card-foreground"
        )}
      >
        <input {...getInputProps()} />
        <div className="p-4 rounded-full bg-secondary mb-4">
          <Upload className="w-8 h-8 text-secondary-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
            {side === 'original' ? 'Original File' : 'Modified File'}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-[200px] mb-6">
          Drag & drop a file here, or click to select
        </p>
        <div className="flex gap-2">
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    handlePaste(side);
                }}
                className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center gap-2"
            >
                <Clipboard className="w-4 h-4" />
                Paste
            </button>
        </div>
      </div>
    );
  };

  const hasContent = original || modified;
  const isIdentical = hasContent && original === modified;

  if (!mounted) return null;

  return (
    <main 
        className="min-h-screen bg-background text-foreground flex flex-col relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 flex bg-background/80 backdrop-blur-sm p-8 gap-8">
            <div 
                className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-primary rounded-xl bg-primary/10 text-primary transition-all hover:bg-primary/20 hover:scale-[1.01]"
                onDrop={(e) => handleOverlayDrop(e, 'original')}
                onDragOver={handleDragOver}
            >
                 <Upload className="w-16 h-16 mb-4" />
                <h3 className="text-3xl font-bold">Replace Original</h3>
            </div>
            <div 
                className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-primary rounded-xl bg-primary/10 text-primary transition-all hover:bg-primary/20 hover:scale-[1.01]"
                onDrop={(e) => handleOverlayDrop(e, 'modified')}
                onDragOver={handleDragOver}
            >
                 <Upload className="w-16 h-16 mb-4" />
                <h3 className="text-3xl font-bold">Replace Modified</h3>
            </div>
        </div>
      )}

      <header className="border-b border-border bg-card p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 font-bold text-xl">
            <ArrowRightLeft className="w-6 h-6 text-primary" />
            <span>Diff Viewer</span>
        </div>
        <div className="flex items-center gap-4">
            <button
                onClick={handleClear}
                className="p-2 rounded-md hover:bg-muted transition-colors text-destructive hover:text-destructive"
                title="Clear All"
            >
                <Trash2 className="w-5 h-5" />
            </button>
            <button
                onClick={() => setRenderSideBySide(!renderSideBySide)}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title={renderSideBySide ? "Switch to Inline View" : "Switch to Side-by-Side View"}
            >
                {renderSideBySide ? <Rows className="w-5 h-5" /> : <Columns className="w-5 h-5" />}
            </button>
            <a 
                href="https://github.com/misranrifat/diff" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-muted transition-colors"
            >
                <Github className="w-5 h-5" />
            </a>
        </div>
      </header>

      <div className="flex-1 p-4 flex flex-col h-[calc(100vh-65px)]">
        
        {hasContent && (
             <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Original</label>
                        <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md border border-border">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm truncate font-medium">{originalName}</span>
                            {original && (
                                <button onClick={() => { setOriginal(''); setOriginalName('Original'); }} className="ml-auto hover:text-destructive shrink-0">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <div className="flex items-center gap-1 border-l border-border pl-2 ml-2">
                                <label className="cursor-pointer p-1.5 rounded-md hover:bg-background hover:text-primary transition-colors" title="Upload File">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                handleFileUpload(e.target.files[0], 'original');
                                            }
                                        }}
                                    />
                                    <Upload className="w-4 h-4" />
                                </label>
                                <button 
                                    onClick={() => handlePaste('original')}
                                    className="p-1.5 rounded-md hover:bg-background hover:text-primary transition-colors"
                                    title="Paste Content"
                                >
                                    <Clipboard className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {isIdentical && (
                        <div className="flex flex-col items-center justify-end pb-1 animate-in fade-in zoom-in duration-300 shrink-0 mx-2">
                             <div className="flex items-center gap-1.5 text-green-600 bg-green-100/50 px-3 py-1.5 rounded-full border border-green-200 shadow-sm whitespace-nowrap">
                                <Check className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wide">Identical</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Modified</label>
                        <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md border border-border">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm truncate font-medium">{modifiedName}</span>
                            {modified && (
                                <button onClick={() => { setModified(''); setModifiedName('Modified'); }} className="ml-auto hover:text-destructive shrink-0">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <div className="flex items-center gap-1 border-l border-border pl-2 ml-2">
                                <label className="cursor-pointer p-1.5 rounded-md hover:bg-background hover:text-primary transition-colors" title="Upload File">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                handleFileUpload(e.target.files[0], 'modified');
                                            }
                                        }}
                                    />
                                    <Upload className="w-4 h-4" />
                                </label>
                                <button 
                                    onClick={() => handlePaste('modified')}
                                    className="p-1.5 rounded-md hover:bg-background hover:text-primary transition-colors"
                                    title="Paste Content"
                                >
                                    <Clipboard className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="flex-1 flex gap-4 min-h-0">
             {(!original || !modified) && !hasContent ? (
                <>
                    <div className="flex-1">
                        <DropZone side="original" content={original} name={originalName} />
                    </div>
                    <div className="flex-1">
                        <DropZone side="modified" content={modified} name={modifiedName} />
                    </div>
                </>
             ) : (
                <div className="flex-1 rounded-xl border border-border overflow-hidden bg-card shadow-sm relative group">
                    <DiffEditor
                        height="100%"
                        language={language}
                        original={original}
                        modified={modified}
                        theme="light"
                        onMount={handleEditorDidMount}
                        options={{
                            renderSideBySide,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 14,
                            wordWrap: 'on',
                            originalEditable: true, 
                            readOnly: false,
                            ignoreTrimWhitespace: false,       
                        }}
                    />
                </div>
             )}
        </div>
      </div>
    </main>
  );
}
