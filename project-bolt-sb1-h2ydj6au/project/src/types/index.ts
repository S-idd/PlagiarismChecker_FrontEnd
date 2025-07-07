export interface CodeFile {
  id: number;
  fileName: string;
  content: string;
  language: string;
  createdAt: string;
  trigram_vector: Record<string, number>;
}

export interface SimilarityResult {
  fileId: number;
  fileName: string;
  language: string;
  similarity: number;
}

export interface BatchCompareRequest {
  targetFileId: number;
  fileIds: number[];
  languageFilter?: string;
  minSimilarity?: number;
}

export interface UploadResponse {
  success: boolean;
  files?: CodeFile[];
  message?: string;
}

export interface FileWithPreview extends File {
  preview?: string;
}

export type SupportedLanguage = 'JAVA' | 'PYTHON' | 'CPP' | 'GO' | 'RUBY' | 'ADA' | 'JAVASCRIPT' | 'TYPESCRIPT';

export interface LanguageConfig {
  name: SupportedLanguage;
  extensions: string[];
  acceptString: string;
  color: string;
}

export interface PaginationParams {
  page: number;
  size: number;
  languageFilter?: string;
  minSimilarity?: number;
}

export interface PageInfo {
  number: number;          // Current page number (0-based)
  size: number;            // Number of items per page
  totalElements: number;   // Total items in the collection
  totalPages: number;      // Total pages available
}


export interface FilesResponse {
  content: CodeFile[];
  page: PageInfo;
}
