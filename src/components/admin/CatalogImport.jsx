// components/admin/CatalogImport.jsx
import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertTriangle, Loader, Database } from 'lucide-react';
import { bulkAddCatalogPaints, getCatalogSummary } from '../../services/paintCatalogService';

const CatalogImport = () => {
  const [jsonData, setJsonData] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [preview, setPreview] = useState(null);
  const [summary, setSummary] = useState(null);

  // Load catalog summary on mount
  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const summaryData = await getCatalogSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading catalog summary:', error);
    }
  };

  const handleJsonInput = (e) => {
    const value = e.target.value;
    setJsonData(value);

    // Try to parse and preview the JSON
    if (value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          // Validate required fields
          const validPaints = parsed.filter(paint =>
            paint.brand && paint.type && paint.name
          );

          if (validPaints.length !== parsed.length) {
            setPreview({
              valid: false,
              error: `${parsed.length - validPaints.length} paints missing required fields (brand, type, name)`
            });
          } else {
            setPreview({
              valid: true,
              count: parsed.length,
              sample: parsed.slice(0, 3),
              brands: [...new Set(parsed.map(p => p.brand))],
              types: [...new Set(parsed.map(p => p.type))]
            });
          }
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
    setResults({ processed: 0, added: 0, skipped: 0, errors: [] });

    try {
      const paints = JSON.parse(jsonData);
      const result = await bulkAddCatalogPaints(paints);

      setResults({
        processed: paints.length,
        added: result.added,
        skipped: result.skipped,
        errors: result.errors
      });

      // Clear the JSON data after successful import
      if (result.added > 0) {
        setJsonData('');
        setPreview(null);
        await loadSummary(); // Refresh summary
      }

    } catch (error) {
      setResults({
        processed: 0,
        added: 0,
        skipped: 0,
        errors: [`Import failed: ${error.message}`]
      });
    }

    setImporting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Paint Catalog Management
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Manage the master paint catalog that users can browse and add from.
        </p>
      </div>

      {/* Current Catalog Summary */}
      {summary && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database size={16} className="text-gray-600 dark:text-gray-400" />
            <h4 className="font-medium text-gray-900 dark:text-white">Current Catalog</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{summary.total}</div>
              <div className="text-gray-600 dark:text-gray-400">Total Paints</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.brands}</div>
              <div className="text-gray-600 dark:text-gray-400">Brands</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.types}</div>
              <div className="text-gray-600 dark:text-gray-400">Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.airbrush}</div>
              <div className="text-gray-600 dark:text-gray-400">Airbrush</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.sprayPaint}</div>
              <div className="text-gray-600 dark:text-gray-400">Spray</div>
            </div>
          </div>
        </div>
      )}

      {/* JSON Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Paint Catalog Data (JSON)
        </label>
        <textarea
          value={jsonData}
          onChange={handleJsonInput}
          placeholder='[{"brand": "Citadel Colour", "type": "Base", "name": "Abaddon Black", "airbrush": true, "sprayPaint": false}, ...]'
          className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-mono"
          disabled={importing}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Required fields: brand, type, name. Optional: airbrush (boolean), sprayPaint (boolean)
        </p>
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
              <div className="text-sm text-green-700 dark:text-green-400 space-y-2">
                <div>
                  <p className="font-medium">Brands: {preview.brands.join(', ')}</p>
                  <p className="font-medium">Types: {preview.types.join(', ')}</p>
                </div>
                <div>
                  <p className="mb-1">Sample paints:</p>
                  <ul className="space-y-1">
                    {preview.sample.map((paint, index) => (
                      <li key={index} className="font-mono text-xs">
                        {paint.brand} {paint.type} - {paint.name}
                        {paint.airbrush && ' (Airbrush)'}
                        {paint.sprayPaint && ' (Spray)'}
                      </li>
                    ))}
                  </ul>
                </div>
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
            Importing to Catalog...
          </>
        ) : (
          <>
            <Upload size={20} />
            Import {preview?.count || 0} Paints to Catalog
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
                {results.added}
              </div>
              <div className="text-sm text-green-800 dark:text-green-300">Added</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {results.skipped}
              </div>
              <div className="text-sm text-yellow-800 dark:text-yellow-300">Skipped</div>
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

          {results.added > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <CheckCircle size={16} />
                <span className="font-medium">Import Complete!</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                Successfully imported {results.added} paints to the catalog.
                {results.skipped > 0 && ` Skipped ${results.skipped} duplicates.`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogImport;