import { SupportedLanguage, LanguageConfig } from '../types';

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  JAVA: {
    name: 'JAVA',
    extensions: ['.java'],
    acceptString: '.java',
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  PYTHON: {
    name: 'PYTHON',
    extensions: ['.py'],
    acceptString: '.py',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  CPP: {
    name: 'CPP',
    extensions: ['.cpp', '.c', '.h', '.hpp'],
    acceptString: '.cpp,.c,.h,.hpp',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  GO: {
    name: 'GO',
    extensions: ['.go'],
    acceptString: '.go',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200'
  },
  RUBY: {
    name: 'RUBY',
    extensions: ['.rb'],
    acceptString: '.rb',
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  ADA: {
    name: 'ADA',
    extensions: ['.ada', '.adb', '.ads'],
    acceptString: '.ada,.adb,.ads',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  JAVASCRIPT: {
    name: 'JAVASCRIPT',
    extensions: ['.js'],
    acceptString: '.js',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  TYPESCRIPT: {
    name: 'TYPESCRIPT',
    extensions: ['.ts'],
    acceptString: '.ts',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  }
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const validateFile = (file: File, language: SupportedLanguage): string | null => {
  if (!file.name || typeof file.name !== 'string') {
    return `File is missing a valid name`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File "${file.name}" exceeds the maximum size of 10MB`;
  }
  if (isNaN(file.size) || file.size === 0) {
    return `File "${file.name}" has an invalid or empty size`;
  }
  const config = LANGUAGE_CONFIGS[language];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!config.extensions.includes(fileExtension)) {
    return `File "${file.name}" has an invalid extension for ${language}. Expected: ${config.extensions.join(', ')}`;
  }
  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (isNaN(bytes) || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileName?: string): string => {
  if (!fileName || typeof fileName !== 'string') {
    return '📄';
  }
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  const iconMap: Record<string, string> = {
    '.java': '☕',
    '.py': '🐍',
    '.cpp': '⚡',
    '.c': '⚡',
    '.h': '📄',
    '.hpp': '📄',
    '.go': '🐹',
    '.rb': '💎',
    '.ada': '🏛️',
    '.adb': '🏛️',
    '.ads': '🏛️',
    '.js': '🟨',
    '.ts': '🔷'
  };
  return iconMap[extension] || '📄';
};

export const getSimilarityColor = (similarity: number): string => {
  if (similarity >= 80) return 'text-red-600 bg-red-50';
  if (similarity >= 60) return 'text-orange-600 bg-orange-50';
  if (similarity >= 40) return 'text-yellow-600 bg-yellow-50';
  if (similarity >= 20) return 'text-blue-600 bg-blue-50';
  return 'text-green-600 bg-green-50';
};

export const getSimilarityLabel = (similarity: number): string => {
  if (similarity >= 80) return 'Very High';
  if (similarity >= 60) return 'High';
  if (similarity >= 40) return 'Medium';
  if (similarity >= 20) return 'Low';
  return 'Very Low';
};