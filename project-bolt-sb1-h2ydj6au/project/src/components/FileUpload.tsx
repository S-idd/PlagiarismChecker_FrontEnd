import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SupportedLanguage, CodeFile } from '../types';
import { LANGUAGE_CONFIGS, validateFile, formatFileSize, getFileIcon } from '../utils/fileValidation';
import axios from 'axios';

interface FileWithPreview {
  file: File;
  preview: string;
}

interface FileUploadProps {
  onUploadSuccess: (files: CodeFile[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('JAVA');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value as SupportedLanguage);
    setFiles([]);
    clearMessages();
  };

  const validateFiles = useCallback((filesToValidate: File[]): string | null => {
    for (const file of filesToValidate) {
      const validationError = validateFile(file, selectedLanguage);
      if (validationError) {
        return validationError;
      }
    }
    return null;
  }, [selectedLanguage]);

  const handleFileSelection = useCallback((selectedFiles: File[]) => {
    clearMessages();

    const validFiles = selectedFiles.filter(file =>
      file instanceof File &&
      typeof file.name === 'string' &&
      file.name.trim() !== '' &&
      file.size > 0 &&
      !isNaN(file.size)
    );

    if (validFiles.length === 0) {
      setError('No valid files selected');
      return;
    }

    const validationError = validateFiles(validFiles);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newFiles: FileWithPreview[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [validateFiles]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFileSelection(selectedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file instanceof File &&
      typeof file.name === 'string' &&
      file.name.trim() !== '' &&
      file.size > 0
    );

    if (droppedFiles.length === 0) {
      setError('No valid files dropped');
      return;
    }

    handleFileSelection(droppedFiles);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
    clearMessages();
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    clearMessages();

    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f.file));
      formData.append('language', selectedLanguage);

      console.log('Uploading files:', files.map(f => `${f.file.name} (${f.file.size} bytes)`));
      const uploadUrl = (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) || 'http://localhost:8080/api/code-files/upload/batch';

      const response = await axios.post(uploadUrl, formData);

      if (response.status === 200) {
        setSuccess(response.data || `Successfully queued ${files.length} file(s) for upload`);
        onUploadSuccess([]);
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err: any) {
      const message = err.response?.data || (err instanceof Error ? err.message : 'An error occurred during upload');
      setError(message);
      console.error('Upload error:', message);

      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFiles([]);
    clearMessages();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentLanguageConfig = LANGUAGE_CONFIGS[selectedLanguage];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Code Files</h2>
        <p className="text-gray-600">Upload your code files for plagiarism analysis</p>
      </div>

      {/* Language Selection */}
      <div className="mb-6">
        <label htmlFor="language" className="block text-sm font-semibold text-gray-700 mb-2">
          Programming Language
        </label>
        <select
          id="language"
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
        >
          {Object.values(LANGUAGE_CONFIGS).map(config => (
            <option key={config.name} value={config.name}>
              {config.name} ({config.extensions.join(', ')})
            </option>
          ))}
        </select>
      </div>

      {/* File Upload Area */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Files
        </label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
            isDragOver
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={currentLanguageConfig.acceptString}
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="File upload input"
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop your {selectedLanguage} files here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse files
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Supported extensions: {currentLanguageConfig.extensions.join(', ')}</p>
            <p>Maximum file size: 10MB per file</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Selected Files</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((f, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(f.file.name || 'unnamed')}</span>
                  <div>
                    <p className="font-medium text-gray-900">{f.file.name || 'Unnamed File'}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(f.file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  aria-label={`Remove ${f.file.name || 'Unnamed File'}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
            files.length === 0 || isUploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 transform hover:scale-105'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="inline h-4 w-4 mr-2" />
              Upload Files ({files.length})
            </>
          )}
        </button>
        
        {files.length > 0 && (
          <button
            onClick={resetUpload}
            className="px-8 py-3 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700 transition-all duration-200"
          >
            Reset
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
            <p className="text-emerald-700 font-medium">{success}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
