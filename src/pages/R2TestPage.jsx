// pages/R2TestPage.jsx - Dedicated page for testing R2 bucket connectivity
import React, { useState, useRef } from 'react';
import { ArrowLeft, TestTube2, Upload, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { testR2Bucket, testFileUpload, runR2Diagnostics, getR2ConfigChecklist } from '../utils/r2BucketTest';

const R2TestPage = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentTest, setCurrentTest] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Run basic bucket tests
  const runBasicTests = async () => {
    setIsRunning(true);
    setCurrentTest('Running basic bucket tests...');
    setTestResults(null);

    try {
      const results = await testR2Bucket();
      setTestResults({ basic: results });
    } catch (error) {
      setTestResults({
        basic: {
          error: error.message,
          envVarsPresent: false,
          bucketExists: false,
          canWrite: false,
          canRead: false
        }
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  // Run file upload test
  const runFileUploadTest = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setIsRunning(true);
    setCurrentTest('Testing file upload...');

    try {
      const uploadResult = await testFileUpload(selectedFile);
      setTestResults(prev => ({
        ...prev,
        fileUpload: uploadResult
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        fileUpload: {
          success: false,
          error: error.message
        }
      }));
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  // Run comprehensive diagnostics
  const runFullDiagnostics = async () => {
    setIsRunning(true);
    setCurrentTest('Running comprehensive diagnostics...');
    setTestResults(null);

    try {
      const diagnostics = await runR2Diagnostics(selectedFile);
      setTestResults({ comprehensive: diagnostics });
    } catch (error) {
      setTestResults({
        comprehensive: {
          error: error.message
        }
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Status icon component
  const StatusIcon = ({ status }) => {
    switch (status) {
      case true:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case false:
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const configChecklist = getR2ConfigChecklist();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/community')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to Community
          </button>

          <div className="flex items-center gap-3 mb-2">
            <TestTube2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              R2 Bucket Test
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Test your Cloudflare R2 bucket configuration and upload functionality
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Test Controls
          </h2>

          {/* File Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Test File (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Upload size={16} className="inline mr-2" />
                Choose File
              </button>
              {selectedFile && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </div>
          </div>

          {/* Test Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runBasicTests}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running...' : 'Basic Tests'}
            </button>

            <button
              onClick={runFileUploadTest}
              disabled={isRunning || !selectedFile}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              File Upload Test
            </button>

            <button
              onClick={runFullDiagnostics}
              disabled={isRunning}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Full Diagnostics
            </button>
          </div>

          {/* Current Test Status */}
          {isRunning && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-800 dark:text-blue-300">{currentTest}</span>
              </div>
            </div>
          )}
        </div>

        {/* Configuration Checklist */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configuration Checklist
          </h2>

          <div className="space-y-3">
            {configChecklist.requirements.map((req, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1">
                  {req.status === 'optional' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <StatusIcon status={req.status} />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {req.item}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {req.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="space-y-6">

            {/* Basic Test Results */}
            {testResults.basic && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Test Results
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <StatusIcon status={testResults.basic.envVarsPresent} />
                    <span>Environment Variables Present</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusIcon status={testResults.basic.bucketExists} />
                    <span>Bucket Exists</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusIcon status={testResults.basic.canWrite} />
                    <span>Write Permissions</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusIcon status={testResults.basic.canRead} />
                    <span>Read Permissions</span>
                  </div>
                </div>

                {testResults.basic.error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="text-red-800 dark:text-red-300 font-medium">Error:</div>
                    <div className="text-red-700 dark:text-red-400 text-sm mt-1">
                      {testResults.basic.error}
                    </div>
                  </div>
                )}

                {testResults.basic.details && (
                  <div className="mt-4">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                        View Details
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded text-xs overflow-auto">
                        {JSON.stringify(testResults.basic.details, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )}

            {/* File Upload Test Results */}
            {testResults.fileUpload && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  File Upload Test Results
                </h3>

                <div className="flex items-center gap-3 mb-3">
                  <StatusIcon status={testResults.fileUpload.success} />
                  <span>File Upload {testResults.fileUpload.success ? 'Successful' : 'Failed'}</span>
                </div>

                {testResults.fileUpload.success ? (
                  <div className="space-y-2 text-sm">
                    <div><strong>File:</strong> {testResults.fileUpload.fileName}</div>
                    <div><strong>Size:</strong> {(testResults.fileUpload.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                    <div><strong>Key:</strong> {testResults.fileUpload.key}</div>
                    <div><strong>URL:</strong>
                      <a href={testResults.fileUpload.url} target="_blank" rel="noopener noreferrer"
                         className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                        {testResults.fileUpload.url}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="text-red-800 dark:text-red-300 font-medium">Upload Error:</div>
                    <div className="text-red-700 dark:text-red-400 text-sm mt-1">
                      {testResults.fileUpload.error}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comprehensive Diagnostics */}
            {testResults.comprehensive && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Comprehensive Diagnostics
                </h3>

                {testResults.comprehensive.recommendations && testResults.comprehensive.recommendations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {testResults.comprehensive.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    View Full Diagnostic Report
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(testResults.comprehensive, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}

        {/* Setup Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Setup Instructions
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Bucket Creation
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {configChecklist.setupInstructions.bucketCreation.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Token Setup
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {configChecklist.setupInstructions.tokenSetup.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default R2TestPage;