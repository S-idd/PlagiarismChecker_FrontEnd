import React, { useEffect, useState } from 'react';
import FileList from './FileList';
import { getAllFiles } from '../services/api';
import { CodeFile, FilesResponse } from '../types';

const FileLibraryPage: React.FC = () => {
  const [filesResponse, setFilesResponse] = useState<FilesResponse | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<CodeFile[]>([]);

  const fetchFiles = async () => {
    try {
      const fetchedResponse: FilesResponse = await getAllFiles();
      setFilesResponse(fetchedResponse); // ✅ store full response
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    fetchFiles(); // fetch files when component mounts
  }, []);

  const handleFileSelect = (file: CodeFile) => {
    setSelectedFiles(prev =>
      prev.some(f => f.id === file.id)
        ? prev.filter(f => f.id !== file.id)
        : [...prev, file]
    );
  };

  return (
    <div className="p-6">
      {filesResponse && (
        <FileList
          response={filesResponse}            // ✅ pass full response instead of files
          onFileSelect={handleFileSelect}
          onRefresh={fetchFiles}
          selectedFiles={selectedFiles}
          currentPage={filesResponse.page.number}
          onPageChange={() => {}}             // implement pagination logic here if needed
        />
      )}
    </div>
  );
};

export default FileLibraryPage;
