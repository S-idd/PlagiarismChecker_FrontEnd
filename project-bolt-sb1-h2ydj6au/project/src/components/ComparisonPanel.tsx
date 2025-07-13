import React, { useState } from 'react';
import { GitCompare, Loader2, AlertCircle, CheckCircle, Users, Target } from 'lucide-react';
import { CodeFile, SimilarityResult, BatchCompareRequest } from '../types';
import {  compareAgainstAll, compareBatch, compareFiles } from '../services/api';
import { getSimilarityColor, getSimilarityLabel, getFileIcon } from '../utils/fileValidation';

interface ComparisonPanelProps {
  selectedFiles: CodeFile[];
  onClearSelection: () => void;
}

const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ selectedFiles, onClearSelection }) => {
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<SimilarityResult[]>([]);
  const [pairwiseResult, setPairwiseResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comparisonType, setComparisonType] = useState<'pairwise' | 'against-all' | 'batch'>('pairwise');
  const [minSimilarity, setMinSimilarity] = useState<number>(1);
  const [languageFilter, setLanguageFilter] = useState<string>('');

  const clearResults = () => {
    setComparisonResults([]);
    setPairwiseResult(null);
    setError(null);
  };

  const handlePairwiseComparison = async () => {
    if (selectedFiles.length !== 2) return;

    setIsComparing(true);
    setError(null);
    clearResults();

    try {
      const similarity = await compareFiles(selectedFiles[0].id, selectedFiles[1].id);
      setPairwiseResult(similarity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare files');
    } finally {
      setIsComparing(false);
    }
  };

  const handleCompareAgainstAll = async () => {
    if (selectedFiles.length !== 1) return;

    setIsComparing(true);
    setError(null);
    clearResults();

    try {
      // Adjusted to match the expected API signature: (fileId: number, page: number, size: number, languageFilter?: string, minSimilarity?: number)
      const page = 0;
      const size =1000000; // Large enough to fetch all results
      // Use languageFilter and minSimilarity only if they are set
      const response = await compareAgainstAll(
        selectedFiles[0].id,
        page,
        size,
        languageFilter || undefined,
        minSimilarity || undefined
      );
      setComparisonResults(response.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare against all files');
    } finally {
      setIsComparing(false);
    }
  };

  const handleBatchComparison = async () => {
    if (selectedFiles.length < 2) return;

    setIsComparing(true);
    setError(null);
    clearResults();

    try {
      const targetFile = selectedFiles[0];
      const otherFileIds = selectedFiles.slice(1).map(file => file.id);

      const response = await compareBatch(
        targetFile.id,
        otherFileIds,
        languageFilter || undefined,
        minSimilarity || undefined
      );
      setComparisonResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform batch comparison');
    } finally {
      setIsComparing(false);
    }
  };                                    

  const handleCompare = () => {
    switch (comparisonType) {
      case 'pairwise':
        handlePairwiseComparison();
        break;
      case 'against-all':
        handleCompareAgainstAll();
        break;
      case 'batch':
        handleBatchComparison();
        break;
    }
  };

  const canCompare = () => {
    switch (comparisonType) {
      case 'pairwise':
        return selectedFiles.length === 2;
      case 'against-all':
        return selectedFiles.length === 1;
      case 'batch':
        return selectedFiles.length >= 2;
      default:
        return false;
    }
  };

  const getComparisonDescription = () => {
    switch (comparisonType) {
      case 'pairwise':
        return 'Compare two selected files directly';
      case 'against-all':
        return 'Compare one file against all files in the database';
      case 'batch':
        return 'Compare the first selected file against all other selected files';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Plagiarism Analysis</h2>
        <p className="text-gray-600">Compare files to detect similarities</p>
      </div>

      {/* Selected Files */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Selected Files ({selectedFiles.length})
        </h3>
        {selectedFiles.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Target className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500">Select files from the library to start comparison</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getFileIcon(file.fileName)}</span>
                  <div>
                    <p className="font-medium text-gray-900">{file.fileName}</p>
                    <p className="text-sm text-gray-500">ID: {file.id} • {file.language}</p>
                  </div>
                </div>
                {index === 0 && selectedFiles.length > 1 && (
                  <span className="px-2 py-1 bg-emerald-600 text-white text-xs rounded-full">
                    Target
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {selectedFiles.length > 0 && (
          <button
            onClick={onClearSelection}
            className="mt-3 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Comparison Type Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Comparison Type</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              value="pairwise"
              checked={comparisonType === 'pairwise'}
              onChange={(e) => setComparisonType(e.target.value as any)}
              className="mr-3"
            />
            <div>
              <span className="font-medium">Pairwise Comparison</span>
              <p className="text-sm text-gray-500">Compare exactly two files (requires 2 selected files)</p>
            </div>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="against-all"
              checked={comparisonType === 'against-all'}
              onChange={(e) => setComparisonType(e.target.value as any)}
              className="mr-3"
            />
            <div>
              <span className="font-medium">Compare Against All</span>
              <p className="text-sm text-gray-500">Compare one file against all files in database (requires 1 selected file)</p>
            </div>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="batch"
              checked={comparisonType === 'batch'}
              onChange={(e) => setComparisonType(e.target.value as any)}
              className="mr-3"
            />
            <div>
              <span className="font-medium">Batch Comparison</span>
              <p className="text-sm text-gray-500">Compare first file against other selected files (requires 2+ selected files)</p>
            </div>
          </label>
        </div>
      </div>

      {/* Filters */}
      {(comparisonType === 'against-all' || comparisonType === 'batch') && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language Filter (optional)
            </label>
            <input
              type="text"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              placeholder="e.g., JAVA, PYTHON"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Similarity (%)
            </label>
            <input
              type="number"
              value={minSimilarity}
              onChange={(e) => setMinSimilarity(Number(e.target.value))}
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Compare Button */}
      <div className="mb-6">
        <button
          onClick={handleCompare}
          disabled={!canCompare() || isComparing}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            canCompare() && !isComparing
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isComparing ? (
            <>
              <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <GitCompare className="inline h-4 w-4 mr-2" />
              Start Analysis
            </>
          )}
        </button>
        <p className="text-sm text-gray-500 mt-2 text-center">
          {getComparisonDescription()}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Pairwise Result */}
      {pairwiseResult !== null && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Similarity Result</h3>
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold ${getSimilarityColor(pairwiseResult)}`}>
              {pairwiseResult.toFixed(2)}%
            </div>
            <p className="text-gray-600 mt-2">{getSimilarityLabel(pairwiseResult)} Similarity</p>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {comparisonResults.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Comparison Results ({comparisonResults.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comparisonResults.map((result) => (
              <div key={result.fileId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getFileIcon(result.fileName)}</span>
                  <div>
                    <p className="font-medium text-gray-900">{result.fileName}</p>
                    <p className="text-sm text-gray-500">ID: {result.fileId} • {result.language}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSimilarityColor(result.similarity)}`}>
                    {result.similarity.toFixed(2)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{getSimilarityLabel(result.similarity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {comparisonResults.length === 0 && (pairwiseResult === null) && !error && !isComparing && selectedFiles.length > 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <CheckCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500">Ready to analyze. Click "Start Analysis" to begin.</p>
        </div>
      )}
    </div>
  );
};

export default ComparisonPanel;