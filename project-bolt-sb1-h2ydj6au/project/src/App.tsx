import React, { useState, useEffect } from 'react';
import { Shield, FileText, GitCompare, Upload as UploadIcon } from 'lucide-react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import ComparisonPanel from './components/ComparisonPanel';
import { CodeFile } from './types';
import { getAllFiles } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'files' | 'compare'>('upload');
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<CodeFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const allFiles = await getAllFiles();
      setFiles(allFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (uploadedFiles: CodeFile[]) => {
    setFiles(prev => [...uploadedFiles, ...prev]);
    setActiveTab('files');
  };

  const handleFileSelect = (file: CodeFile) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(selected => selected.id === file.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
  };

  const tabs = [
    { id: 'upload', label: 'Upload Files', icon: UploadIcon },
    { id: 'files', label: 'File Library', icon: FileText },
    { id: 'compare', label: 'Compare Files', icon: GitCompare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-emerald-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Plagiarism Checker</h1>
                <p className="text-sm text-gray-500">Code similarity analysis system</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {files.length} files • {selectedFiles.length} selected
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        )}

        {activeTab === 'files' && (
          <FileList
            files={files}
            onFileSelect={handleFileSelect}
            onRefresh={loadFiles}
            selectedFiles={selectedFiles}
          />
        )}

        {activeTab === 'compare' && (
          <ComparisonPanel
            selectedFiles={selectedFiles}
            onClearSelection={handleClearSelection}
          />
        )}

        {isLoading && activeTab === 'files' && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600">Loading files...</span>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Plagiarism Checker System - Advanced code similarity detection</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;