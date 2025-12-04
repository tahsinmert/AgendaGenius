import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, FileCode, Trash2 } from 'lucide-react';
import { FileData } from '../types';

interface FileUploadProps {
  onFilesSelected: (files: FileData[]) => void;
  files: FileData[];
  onRemoveFile: (id: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, files, onRemoveFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      processFiles(Array.from(event.target.files));
    }
  }, []);

  const processFiles = (fileList: File[]) => {
    const newFiles: FileData[] = [];
    let processedCount = 0;

    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        newFiles.push({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: file.type,
          content: content,
          size: file.size
        });
        processedCount++;
        if (processedCount === fileList.length) {
          onFilesSelected(newFiles);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="w-4 h-4 text-purple-500" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    return <FileCode className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]' 
            : 'border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/30 hover:border-zinc-400 dark:hover:border-zinc-500'
          }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          accept=".pdf,.txt,.md,.json,.doc,.docx,.png,.jpg,.jpeg"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center space-y-3 text-center pointer-events-none">
          <div className={`p-4 rounded-full shadow-sm transition-transform duration-300 ${isDragging ? 'scale-110 bg-blue-100 dark:bg-blue-900' : 'bg-white dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700'}`}>
            <Upload className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-zinc-600 dark:text-zinc-400'}`} />
          </div>
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              {isDragging ? 'Drop files now' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">PDF, Text, Images (max 10MB)</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Attached Files ({files.length})</h3>
              <button 
                onClick={() => files.forEach(f => onRemoveFile(f.id))}
                className="text-xs text-red-500 hover:text-red-600 flex items-center space-x-1"
              >
                <span>Clear all</span>
              </button>
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {files.map(file => (
                    <li key={file.id} className="group flex items-center justify-between p-2.5 bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-100 dark:border-zinc-700">
                                {getFileIcon(file.type)}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">{file.name}</span>
                                <span className="text-[10px] text-zinc-400">{(file.size / 1024).toFixed(0)} KB</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => onRemoveFile(file.id)}
                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;