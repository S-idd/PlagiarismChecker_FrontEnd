import { useState, useEffect } from 'react';
import { Shield, FileText, GitCompare, Upload as UploadIcon } from 'lucide-react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import ComparisonPanel from './components/ComparisonPanel';
import { FilesResponse, CodeFile } from './types';
import { getAllFiles } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'files' | 'compare'>('upload');
  const [filesResponse, setFilesResponse] = useState<FilesResponse | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<CodeFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load page 0 on first render
    loadFiles(0);
  }, []);

  const loadFiles = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await getAllFiles(page);
      setFilesResponse(response);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    // reload current page from server after upload
    if (filesResponse?.page?.number !== undefined) {
      loadFiles(filesResponse.page.number);
    } else {
      loadFiles(0);
    }
    setActiveTab('files');
  };

  const handleFileSelect = (file: CodeFile) => {
    setSelectedFiles(prev =>
      prev.some(f => f.id === file.id)
        ? prev.filter(f => f.id !== file.id)
        : [...prev, file]
    );
  };

  const handleClearSelection = () => setSelectedFiles([]);

  const handlePageChange = (newPage: number) => {
    loadFiles(newPage); // directly load requested page
  };

  const tabs = [
    { id: 'upload', label: 'Upload Files', icon: UploadIcon },
    { id: 'files', label: 'File Library', icon: FileText },
    { id: 'compare', label: 'Compare Files', icon: GitCompare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-emerald-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Plagiarism Checker</h1>
              <p className="text-sm text-gray-500">Code similarity analysis system</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {filesResponse?.page?.totalElements ?? 0} files • {selectedFiles.length} selected
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8">
          {tabs.map(tab => {
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
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && <FileUpload onUploadSuccess={handleUploadSuccess} />}
        {activeTab === 'files' && filesResponse && (
          <FileList
            response={filesResponse}
            onFileSelect={handleFileSelect}
            onRefresh={() => loadFiles(filesResponse.page.number)}
            selectedFiles={selectedFiles}
            onPageChange={handlePageChange} currentPage={0}          />
        )}
        {activeTab === 'compare' && (
          <ComparisonPanel selectedFiles={selectedFiles} onClearSelection={handleClearSelection} />
        )}
        {isLoading && activeTab === 'files' && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600">Loading files...</span>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          <p>Plagiarism Checker System - Advanced code similarity detection</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
