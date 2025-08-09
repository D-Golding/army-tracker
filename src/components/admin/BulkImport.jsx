// components/admin/BulkImport.jsx
import React, { useState } from 'react';
import { Upload, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { newPaint } from '../../services/paintService';

const BulkImport = () => {
  const [jsonData, setJsonData] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleJsonInput = (e) => {
    const value = e.target.value;
    setJsonData(value);

    // Try to parse and preview the JSON
    if (value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setPreview({
            valid: true,
            count: parsed.length,
            sample: parsed.slice(0, 3)
          });
        } else {
          setPreview({
            valid: false,
            error: 'JSON must be an array of paint objects'
          });
        }
      } catch (error) {
        setPreview({
          valid: false,
          error: 'Invalid JSON format'
        });
      }
    } else {
      setPreview(null);
    }
  };

  const handleImport = async () => {
    if (!preview?.valid) return;

    setImporting(true);
    setResults({ processed: 0, successful: 0, failed: 0, errors: [] });

    try {
      const paints = JSON.parse(jsonData);
      let successful = 0;
      let failed = 0;
      const errors = [];

      for (let i = 0; i < paints.length; i++) {
        const paint = paints[i];

        try {
          await newPaint(
            paint.brand,
            paint.airbrush,
            paint.type,
            paint.name,
            paint.status,
            paint.level,
            paint.photoURL,
            paint.sprayPaint
          );
          successful++;
        } catch (error) {
          failed++;
          errors.push(`Paint ${i + 1} (${paint.name}): ${error.message}`);
        }

        // Update progress
        setResults({
          processed: i + 1,
          successful,
          failed,
          errors: [...errors]
        });

        // Small delay to prevent overwhelming Firestore
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Clear the JSON data after successful import
      if (successful > 0) {
        setJsonData('');
        setPreview(null);
      }

    } catch (error) {
      setResults({
        processed: 0,
        successful: 0,
        failed: 1,
        errors: [`Import failed: ${error.message}`]
      });
    }

    setImporting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Bulk Paint Import
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Paste your JSON array of paint objects below to import them all at once.
        </p>
      </div>

      {/* JSON Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Paint Data (JSON)
        </label>
        <textarea
          value={jsonData}
          onChange={handleJsonInput}
          placeholder='[{"brand": "Citadel Colour", "type": "Base", "name": "Abaddon Black", "status": "collection", "level": 100, "airbrush": false, "sprayPaint": false, "photoURL": null}, ...]'
          className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-mono"
          disabled={importing}
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className={`p-4 rounded-xl border ${
          preview.valid 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          {preview.valid ? (
            <div>
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300 mb-2">
                <CheckCircle size={16} />
                <span className="font-medium">Valid JSON - {preview.count} paints found</span>
              </div>
              <div className="text-sm text-green-700 dark:text-green-400">
                <p className="mb-2">Sample paints:</p>
                <ul className="space-y-1">
                  {preview.sample.map((paint, index) => (
                    <li key={index} className="font-mono text-xs">
                      {paint.brand} - {paint.name} ({paint.status})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
              <AlertTriangle size={16} />
              <span className="font-medium">{preview.error}</span>
            </div>
          )}
        </div>
      )}

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={!preview?.valid || importing}
        className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl disabled:opacity-50 hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        {importing ? (
          <>
            <Loader className="animate-spin" size={20} />
            Importing...
          </>
        ) : (
          <>
            <Upload size={20} />
            Import {preview?.count || 0} Paints
          </>
        )}
      </button>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {results.processed}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300">Processed</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {results.successful}
              </div>
              <div className="text-sm text-green-800 dark:text-green-300">Successful</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {results.failed}
              </div>
              <div className="text-sm text-red-800 dark:text-red-300">Failed</div>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Errors:</h4>
              <div className="max-h-32 overflow-y-auto">
                {results.errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-700 dark:text-red-300">
                    • {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {results.successful > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <CheckCircle size={16} />
                <span className="font-medium">Import Complete!</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                Successfully imported {results.successful} paints to your collection.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkImport;