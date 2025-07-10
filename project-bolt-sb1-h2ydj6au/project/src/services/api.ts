import { CodeFile, SupportedLanguage, FilesResponse, SimilarityResult, BatchCompareRequest } from '../types';

// ✅ Fetch paginated files from your Spring Boot API
export const getAllFiles = async (page: number = 0, size: number = 30): Promise<FilesResponse> => {
  const response = await fetch(`/api/code-files/files?page=${page}&size=${size}`);
  const text = await response.text(); // read as text first
  if (!response.ok) {
    console.error('Failed response:', text);
    throw new Error(`Failed to fetch files: ${response.statusText}`);
  }
  try {
    const parsed: FilesResponse = JSON.parse(text);
    if (!parsed.content || !parsed.page) {
      console.error('Response missing required fields:', parsed);
      throw new Error('Server returned malformed response');
    }
    return parsed;
  } catch (e) {
    console.error('Response was not valid JSON:', text);
    throw new Error('Server returned invalid JSON');
  }
};
// export const getAllFiles = async (page: number = 0, size: number = 30): Promise<FilesResponse> => {
//   const response = await fetch(`/api/code-files/files?page=${page}&size=${size}`, {
//     headers: { 'Content-Type': 'application/json' },
//   });
//   const text = await response.text();
//   console.log('Raw response:', text); // Add for debugging
//   if (!response.ok) {
//     console.error('Failed response:', text);
//     throw new Error(`Failed to fetch files: ${response.statusText}`);
//   }
//   try {
//     const parsed: FilesResponse = JSON.parse(text);
//     if (!parsed.content || !parsed.page) {
//       console.error('Response missing required fields:', parsed);
//       throw new Error('Server returned malformed response');
//     }
//     return parsed;
//   } catch (e) {
//     console.error('Response was not valid JSON:', text);
//     throw new Error('Server returned invalid JSON');
//   }
// };
// ✅ Upload a single file
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

// ✅ Upload multiple files
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

  // 🔥 Your backend probably returns a success message without the new files,
  // so re-fetch files to get updated list:
  const updatedResponse = await getAllFiles();
  return updatedResponse.content;
};

// ✅ Compare two files (implement real endpoint on your backend)
export const compareFiles = async (fileId1: number, fileId2: number): Promise<number> => {
  const response = await fetch(`/api/code-files/compare?fileId1=${fileId1}&fileId2=${fileId2}`);
  if (!response.ok) throw new Error('Failed to compare files');
  return response.json();
};

// ✅ Compare one file against all others with pagination
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

export const compareBatch = async (
  baseFileId: number,
  targetFileIds: number[],
  languageFilter?: string,
  minSimilarity?: number
): Promise<SimilarityResult[]> => {
  const requestBody: any = {
    targetFileId: baseFileId,
    fileIds: targetFileIds,
  };

  if (languageFilter !== undefined && languageFilter !== '') {
    requestBody.languageFilter = languageFilter;
  }

  if (minSimilarity !== undefined && minSimilarity !== null) {
    requestBody.minSimilarity = minSimilarity;
  }

  const response = await fetch('/api/code-files/compare/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to compare batch: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Invalid response format: Expected an array of SimilarityResult');
  }

  return data;
};
