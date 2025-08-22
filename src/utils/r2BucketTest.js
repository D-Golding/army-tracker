// utils/r2BucketTest.js - Test R2 bucket connectivity and permissions
import { S3Client, PutObjectCommand, ListObjectsV2Command, HeadBucketCommand } from '@aws-sdk/client-s3';

// R2 Configuration
const R2_CONFIG = {
  region: 'auto',
  endpoint: `https://${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
  },
};

const r2Client = new S3Client(R2_CONFIG);

/**
 * Test R2 bucket connectivity and permissions
 * @returns {Promise<Object>} Test results
 */
export const testR2Bucket = async () => {
  const results = {
    envVarsPresent: false,
    bucketExists: false,
    canWrite: false,
    canRead: false,
    error: null,
    details: {}
  };

  console.log('🧪 Testing R2 bucket setup...');

  // 1. Check environment variables
  console.log('📋 Checking environment variables...');
  const accountId = import.meta.env.VITE_R2_ACCOUNT_ID;
  const accessKey = import.meta.env.VITE_R2_ACCESS_KEY_ID;
  const secretKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;

  results.details.envVars = {
    accountId: accountId ? `${accountId.substring(0, 8)}...` : 'MISSING',
    accessKey: accessKey ? `${accessKey.substring(0, 8)}...` : 'MISSING',
    secretKey: secretKey ? `${secretKey.substring(0, 8)}...` : 'MISSING'
  };

  if (!accountId || !accessKey || !secretKey) {
    results.error = 'Missing environment variables';
    console.error('❌ Missing environment variables');
    return results;
  }

  results.envVarsPresent = true;
  console.log('✅ Environment variables present');

  // 2. Test bucket existence
  console.log('🪣 Testing bucket existence...');
  try {
    const headCommand = new HeadBucketCommand({
      Bucket: 'newsfeed-photos'
    });

    await r2Client.send(headCommand);
    results.bucketExists = true;
    console.log('✅ Bucket exists and is accessible');
  } catch (error) {
    console.error('❌ Bucket test failed:', error.message);
    results.error = `Bucket error: ${error.message}`;
    results.details.bucketError = error;
    return results;
  }

  // 3. Test write permissions
  console.log('✏️ Testing write permissions...');
  try {
    const testKey = `test-${Date.now()}.txt`;
    const testData = new TextEncoder().encode('R2 write test');

    const putCommand = new PutObjectCommand({
      Bucket: 'newsfeed-photos',
      Key: testKey,
      Body: testData,
      ContentType: 'text/plain'
    });

    const putResult = await r2Client.send(putCommand);
    results.canWrite = true;
    results.details.writeTest = {
      key: testKey,
      etag: putResult.ETag
    };
    console.log('✅ Write test successful');

    // 4. Test read permissions (list objects)
    console.log('📖 Testing read permissions...');
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: 'newsfeed-photos',
        MaxKeys: 5
      });

      const listResult = await r2Client.send(listCommand);
      results.canRead = true;
      results.details.readTest = {
        objectCount: listResult.KeyCount,
        objects: listResult.Contents?.map(obj => ({
          key: obj.Key,
          size: obj.Size,
          lastModified: obj.LastModified
        })) || []
      };
      console.log('✅ Read test successful');
    } catch (error) {
      console.error('❌ Read test failed:', error.message);
      results.details.readError = error;
    }

  } catch (error) {
    console.error('❌ Write test failed:', error.message);
    results.error = `Write error: ${error.message}`;
    results.details.writeError = error;
    return results;
  }

  console.log('🎉 R2 bucket tests completed');
  return results;
};

/**
 * Test uploading a real file to R2
 * @param {File} file - File to test upload
 * @returns {Promise<Object>} Upload test result
 */
export const testFileUpload = async (file) => {
  console.log('📤 Testing real file upload...');

  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });

    const testKey = `upload-test-${Date.now()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: 'newsfeed-photos',
      Key: testKey,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type || 'application/octet-stream',
      Metadata: {
        'test-upload': 'true',
        'original-name': file.name,
        'file-size': file.size.toString()
      }
    });

    const result = await r2Client.send(command);

    // Construct public URL (you may need to adjust based on your R2 setup)
    const publicUrl = `https://pub-${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.dev/${testKey}`;

    console.log('✅ File upload test successful');
    return {
      success: true,
      key: testKey,
      url: publicUrl,
      etag: result.ETag,
      fileSize: file.size,
      fileName: file.name
    };

  } catch (error) {
    console.error('❌ File upload test failed:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

/**
 * Check R2 bucket configuration requirements
 * @returns {Object} Configuration checklist
 */
export const getR2ConfigChecklist = () => {
  return {
    requirements: [
      {
        item: 'R2 Bucket Created',
        description: 'newsfeed-photos bucket exists in Cloudflare R2',
        status: 'unknown'
      },
      {
        item: 'Public Access Configured',
        description: 'Bucket allows public read access for uploaded files',
        status: 'unknown'
      },
      {
        item: 'API Tokens',
        description: 'R2 API tokens have read/write permissions',
        status: 'unknown'
      },
      {
        item: 'CORS Policy',
        description: 'Bucket CORS allows uploads from your domain',
        status: 'unknown'
      },
      {
        item: 'Custom Domain',
        description: 'Optional: Custom domain for faster access',
        status: 'optional'
      }
    ],
    setupInstructions: {
      bucketCreation: [
        '1. Go to Cloudflare Dashboard > R2 Object Storage',
        '2. Create bucket named "newsfeed-photos"',
        '3. Set bucket to allow public read access',
        '4. Configure CORS to allow your domain'
      ],
      tokenSetup: [
        '1. Go to R2 API Tokens',
        '2. Create token with Edit permissions',
        '3. Scope to your bucket',
        '4. Add to environment variables'
      ]
    }
  };
};

/**
 * Run comprehensive R2 diagnostics
 * @param {File} [testFile] - Optional file to test upload
 * @returns {Promise<Object>} Full diagnostic results
 */
export const runR2Diagnostics = async (testFile = null) => {
  console.log('🔍 Running comprehensive R2 diagnostics...');

  const diagnostics = {
    timestamp: new Date().toISOString(),
    bucketTest: null,
    fileUploadTest: null,
    configChecklist: getR2ConfigChecklist(),
    recommendations: []
  };

  // Run bucket tests
  diagnostics.bucketTest = await testR2Bucket();

  // Run file upload test if file provided
  if (testFile) {
    diagnostics.fileUploadTest = await testFileUpload(testFile);
  }

  // Generate recommendations
  if (!diagnostics.bucketTest.envVarsPresent) {
    diagnostics.recommendations.push('Set up R2 environment variables in .env file');
  }

  if (!diagnostics.bucketTest.bucketExists) {
    diagnostics.recommendations.push('Create newsfeed-photos bucket in Cloudflare R2');
  }

  if (!diagnostics.bucketTest.canWrite) {
    diagnostics.recommendations.push('Check R2 API token permissions - needs write access');
  }

  if (!diagnostics.bucketTest.canRead) {
    diagnostics.recommendations.push('Check R2 API token permissions - needs read access');
  }

  if (diagnostics.fileUploadTest && !diagnostics.fileUploadTest.success) {
    diagnostics.recommendations.push('Check bucket CORS configuration and file upload settings');
  }

  console.log('📊 R2 diagnostics complete');
  return diagnostics;
};