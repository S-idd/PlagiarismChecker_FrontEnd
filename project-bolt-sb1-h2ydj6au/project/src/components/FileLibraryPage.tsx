import React, { useEffect, useState } from 'react';
import FileList from './FileList';
import { getAllFiles } from '../services/api';  // Make sure this calls your GET /files endpoint
import { CodeFile } from '../types';

const FileLibraryPage: React.FC = () => {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<CodeFile[]>([]);

  const fetchFiles = async () => {
    try {
      const fetchedFiles = await getAllFiles();
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    fetchFiles(); // fetch files when component mounts
  }, []);

  const handleFileSelect = (file: CodeFile) => {
    // Add or remove from selectedFiles
    setSelectedFiles(prev =>
      prev.some(f => f.id === file.id)
        ? prev.filter(f => f.id !== file.id)
        : [...prev, file]
    );
  };

  return (
    <div className="p-6">
      <FileList
        files={files}                  // THIS is what FileList uses
        onFileSelect={handleFileSelect}
        onRefresh={fetchFiles}         // called when clicking Refresh in FileList
        selectedFiles={selectedFiles}
      />
    </div>
  );
};

export default FileLibraryPage;
