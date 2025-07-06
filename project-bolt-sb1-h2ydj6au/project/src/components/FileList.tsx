import React, { useState } from 'react';
import { FileText, Search, RefreshCw, Calendar, Code } from 'lucide-react';
import { CodeFile, SupportedLanguage } from '../types';
import { LANGUAGE_CONFIGS, getFileIcon } from '../utils/fileValidation';

interface FileListProps {
  files: CodeFile[];
  onFileSelect: (file: CodeFile) => void;
  onRefresh: () => void;
  selectedFiles: CodeFile[];
}

const FileList: React.FC<FileListProps> = ({ files, onFileSelect, onRefresh, selectedFiles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'language'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);

  const filteredFiles = files
    .filter(file => 
      file && 
      file.fileName &&
      typeof file.fileName === 'string' &&
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (languageFilter === '' || file.language === languageFilter)
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.fileName || '').localeCompare(b.fileName || '');
          break;
        case 'date':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'language':
          comparison = (a.language || '').localeCompare(b.language || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefresh();
    } finally {
      setIsLoading(false);
    }
  };

  const isFileSelected = (file: CodeFile) => selectedFiles.some(selected => selected.id === file.id);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">File Library</h2>
          <p className="text-gray-600">{files.length} files available for analysis</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">All Languages</option>
          {Object.values(LANGUAGE_CONFIGS).map(config => (
            <option key={config.name} value={config.name}>
              {config.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'language')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="language">Sort by Language</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* File Grid */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-500">
            {searchTerm || languageFilter ? 'Try adjusting your search criteria' : 'Upload some files to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => onFileSelect(file)}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                isFileSelected(file)
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.fileName || 'unnamed')}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{file.fileName || 'Unnamed file'}</h3>
                    <p className="text-sm text-gray-500">ID: {file.id}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${LANGUAGE_CONFIGS[file.language as SupportedLanguage]?.color || 'bg-gray-100 text-gray-700'}`}>
                  {file.language}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(file.createdAt || new Date().toISOString())}
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2" />
                  {Object.keys(file.trigram_vector || {}).length} trigrams
                </div>
              </div>

              {isFileSelected(file) && (
                <div className="mt-3 flex items-center text-emerald-600">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;
