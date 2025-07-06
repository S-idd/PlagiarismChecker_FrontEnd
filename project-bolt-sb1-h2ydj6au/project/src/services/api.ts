import { CodeFile, SupportedLanguage } from '../types';

// 🚨 Fetch all files from your Spring Boot API
export const getAllFiles = async (): Promise<CodeFile[]> => {
  const response = await fetch('/api/code-files/files');
  const text = await response.text(); // read as text first
  if (!response.ok) {
    console.error('Failed response:', text);
    throw new Error(`Failed to fetch files: ${response.statusText}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Response was not valid JSON:', text);
    throw new Error('Server returned invalid JSON');
  }
};


// 🚨 Upload a single file
export const uploadFile = async (file: File, language: SupportedLanguage): Promise<CodeFile> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  const response = await fetch('/api/code-files/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`Upload failed: ${errorMsg}`);
  }

  return response.json();
};

// 🚨 Upload multiple files
export const uploadBatchFiles = async (files: File[], language: SupportedLanguage): Promise<CodeFile[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('language', language);

  const response = await fetch('/api/code-files/upload/batch', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`Batch upload failed: ${errorMsg}`);
  }

  // Your batch endpoint currently returns a success message, not file details,
  // so you might want to refetch files after uploading:
  return getAllFiles();
};

// 🚨 Placeholder: compare two files (implement real endpoint on your backend)
export const compareFiles = async (fileId1: number, fileId2: number): Promise<number> => {
  const response = await fetch(`/api/code-files/compare?fileId1=${fileId1}&fileId2=${fileId2}`);
  if (!response.ok) throw new Error('Failed to compare files');
  return response.json();
};

// 🚨 Placeholder: compare one file against all others with pagination
export const compareAgainstAll = async (
  fileId: number,
  page: number = 0,
  size: number = 10,
  languageFilter?: string,
  minSimilarity?: number
): Promise<any> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  if (languageFilter) params.append('languageFilter', languageFilter);
  if (minSimilarity !== undefined) params.append('minSimilarity', minSimilarity.toString());

  const response = await fetch(`/api/code-files/compare-all/${fileId}?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to compare against all');
  return response.json();
};
