// components/projects/wizard/project/AddProjectWizard.jsx - Fixed file upload logic
import React, { useState, useEffect, useRef } from 'react';
import { useProjectWizard } from '../../../../hooks/useProjectWizard';
import { useProjectFormData } from '../../../../hooks/useProjectFormData';
import { usePhotoFormData } from '../../../../hooks/photoGallery/usePhotoFormData';
import { validateProjectForm } from '../../../../utils/projectValidation';
import { processAndUploadPhotos } from '../../../../services/photoService'; // ADD THIS IMPORT
import { auth } from '../../../../firebase'; // ADD THIS IMPORT
import ProjectWizardStepIndicator from './ProjectWizardStepIndicator';
import ProjectWizardNavigation from './ProjectWizardNavigation';
import ProjectDetailsForm from './ProjectDetailsForm';
import ProjectPaintsForm from './ProjectPaintsForm';
import ProjectReviewForm from './ProjectReviewForm';
import {
 ProjectPhotoSelectStep,
 ProjectPhotoCropStep,
 ProjectPhotoDetailsStep
} from './photoUploader';

const AddProjectWizard = ({
 onSubmit,
 onCancel,
 isLoading = false
}) => {
 const [errors, setErrors] = useState({});
 const [currentPhotoStep, setCurrentPhotoStep] = useState(0);
 const [isUploading, setIsUploading] = useState(false); // ADD THIS STATE
 const stepContentRef = useRef(null);

 // Project form data
 const {
   formData,
   updateField,
   updateManufacturer,
   updateGame,
   addPaints,
   removePaint,
   getProjectData,
   isRequiredFieldsValid
 } = useProjectFormData();

 // Photo form data (separate from project data)
 const {
   formData: photoFormData,
   addFiles,
   removeFile,
   updateFileMetadata,
   updateFileEditData,
   areAllFilesProcessed,
   getProcessingStats
 } = usePhotoFormData();

 // Main wizard steps
 const {
   WIZARD_STEPS,
   currentStep,
   canGoNext,
   canGoPrevious,
   goNext,
   goPrevious,
   goToStep,
   isStepCompleted,
   isStepActive,
   isStepAccessible,
   isLastStep,
   isFormReady
 } = useProjectWizard(formData);

 // Photo step configuration
 const PHOTO_STEPS = [
   { id: 'select', title: 'Select Photos', icon: '📷¹' },
   { id: 'crop', title: 'Edit Photos', icon: '📷²' },
   { id: 'details', title: 'Photo Details', icon: '📷³' }
 ];

 // Scroll to step content when step changes (not to very top)
 useEffect(() => {
   if (stepContentRef.current) {
     stepContentRef.current.scrollIntoView({
       behavior: 'smooth',
       block: 'start'
     });
   }
 }, [currentStep, currentPhotoStep]);

 // FIXED: Handle form submission with actual file uploads
 const handleSubmit = async () => {
   // Final validation
   const validation = validateProjectForm(formData);
   if (!validation.isValid) {
     setErrors(validation.errors);
     goToStep(0);
     return;
   }

   setErrors({});
   setIsUploading(true);

   try {
     const projectData = getProjectData();

     // STEP 1: Upload photos to Firebase Storage if any exist
     let uploadedPhotos = [];

     if (photoFormData.files && photoFormData.files.length > 0) {
       console.log('🔄 Starting photo uploads...');

       // Get current user info
       const userId = auth.currentUser?.uid;
       if (!userId) {
         throw new Error('User not authenticated');
       }

       // Generate a temporary project ID for photo organization
       const tempProjectId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

       // Process each file for upload
       const filesToUpload = photoFormData.files.map(file => {
         // Use cropped blob if available, otherwise original file
         if (file.editData?.croppedBlob && !file.editData?.skipEditing) {
           return file.editData.croppedBlob;
         }
         return file.originalFile;
       });

       // Upload all files to Firebase Storage
       const uploadResults = await processAndUploadPhotos(
         filesToUpload,
         userId,
         tempProjectId,
         'project'
       );

       // Check for upload failures
       const failedUploads = uploadResults.filter(result => !result.success);
       if (failedUploads.length > 0) {
         const errorMessage = failedUploads.map(result => result.error).join(', ');
         throw new Error(`Photo upload failed: ${errorMessage}`);
       }

       // STEP 2: Create photo objects with Firebase Storage URLs and metadata
       uploadedPhotos = uploadResults.map((uploadResult, index) => {
         const originalFile = photoFormData.files[index];

         return {
           url: uploadResult.downloadURL, // ✅ Firebase Storage URL (not blob URL!)
           title: originalFile.metadata?.title || '',
           description: originalFile.metadata?.description || '',
           originalFileName: originalFile.fileName,
           uploadedAt: new Date().toISOString(),
           wasEdited: originalFile.editData?.croppedBlob && !originalFile.editData?.skipEditing,
           aspectRatio: originalFile.editData?.aspectRatio || 'original',
           // Additional metadata from upload
           fileSize: uploadResult.metadata?.size,
           contentType: uploadResult.metadata?.contentType
         };
       });

       console.log('✅ Photos uploaded successfully:', uploadedPhotos.length);
     }

     // STEP 3: Add uploaded photos to project data
     projectData.uploadedPhotos = uploadedPhotos;

     // Set cover photo to first uploaded photo if available
     if (uploadedPhotos.length > 0) {
       projectData.coverPhotoURL = uploadedPhotos[0].url;
     }

     console.log('🛠 PROJECT DATA BEING CREATED:', {
       ...projectData,
       photoCount: uploadedPhotos.length,
       hasPhotos: uploadedPhotos.length > 0
     });

     // STEP 4: Create the project
     await onSubmit(projectData);

   } catch (error) {
     console.error('Error creating project:', error);
     setErrors({
       submit: error.message || 'Failed to create project. Please try again.'
     });
   } finally {
     setIsUploading(false);
   }
 };

 // Handle navigation
 const handleNext = () => {
   setErrors({});

   // Special handling for photo steps
   if (currentStep === 2) { // Photos step
     if (currentPhotoStep < PHOTO_STEPS.length - 1) {
       // Move to next photo substep
       if (currentPhotoStep === 1) {
         // Check if all photos are processed before leaving crop step
         if (!areAllFilesProcessed()) {
           setErrors({ photos: 'Please process all photos before continuing.' });
           return;
         }
       }
       setCurrentPhotoStep(currentPhotoStep + 1);
       return;
     }
   }

   // Move to next main step
   setCurrentPhotoStep(0);
   goNext();
 };

 const handlePrevious = () => {
   setErrors({});

   // Special handling for photo steps
   if (currentStep === 2 && currentPhotoStep > 0) {
     setCurrentPhotoStep(currentPhotoStep - 1);
     return;
   }

   setCurrentPhotoStep(0);
   goPrevious();
 };

 const handleStepClick = (stepIndex) => {
   setErrors({});
   setCurrentPhotoStep(0);
   goToStep(stepIndex);
 };

 // Handle field changes with error clearing
 const handleFieldChange = (field, value) => {
   updateField(field, value);
   if (errors[field]) {
     setErrors(prev => {
       const newErrors = { ...prev };
       delete newErrors[field];
       return newErrors;
     });
   }
 };

 // Photo handlers
 const handlePhotosSelected = (files) => {
   addFiles(files);
 };

 const handlePhotoRemoved = (fileId) => {
   removeFile(fileId);
 };

 const handlePhotoEdited = (fileId, editData) => {
   updateFileEditData(fileId, editData);
 };

 const handlePhotoMetadataUpdated = (fileId, metadata) => {
   updateFileMetadata(fileId, metadata);
 };

 const handleAllPhotosProcessed = () => {
   // Auto-advance to details step when all photos are processed
   setTimeout(() => setCurrentPhotoStep(2), 500);
 };

 // Render current step content
 const renderStepContent = () => {
   const stepId = WIZARD_STEPS[currentStep].id;

   switch (stepId) {
     case 'details':
       return (
         <ProjectDetailsForm
           formData={formData}
           onFieldChange={handleFieldChange}
           onManufacturerChange={updateManufacturer}
           onGameChange={updateGame}
           errors={errors}
           isLoading={isLoading || isUploading}
         />
       );

     case 'paints':
       return (
         <ProjectPaintsForm
           formData={formData}
           onPaintsAdded={addPaints}
           onPaintRemoved={removePaint}
           isLoading={isLoading || isUploading}
         />
       );

     case 'photos':
       return renderPhotoStep();

     case 'review':
       return (
         <ProjectReviewForm
           formData={formData}
           photoFormData={photoFormData}
           onEditStep={handleStepClick}
         />
       );

     default:
       return null;
   }
 };

 // Render photo substeps
 const renderPhotoStep = () => {
   switch (currentPhotoStep) {
     case 0:
       return (
         <ProjectPhotoSelectStep
           formData={photoFormData}
           onFilesSelected={handlePhotosSelected}
           onFileRemoved={handlePhotoRemoved}
           maxPhotos={50}
           isLoading={isLoading || isUploading}
           errors={errors}
         />
       );

     case 1:
       return (
         <ProjectPhotoCropStep
           formData={photoFormData}
           onFileEdited={handlePhotoEdited}
           onAllPhotosProcessed={handleAllPhotosProcessed}
         />
       );

     case 2:
       return (
         <ProjectPhotoDetailsStep
           formData={photoFormData}
           onMetadataUpdated={handlePhotoMetadataUpdated}
           isLoading={isLoading || isUploading}
           errors={errors}
         />
       );

     default:
       return null;
   }
 };

 // Check if next button should be disabled
 const isNextDisabled = () => {
   if (currentStep === 2) { // Photos step
     if (currentPhotoStep === 1) { // Crop step
       return !areAllFilesProcessed();
     }
   }
   return false;
 };

 return (
   <div className="space-y-6">
     {/* Progress Steps */}
     <ProjectWizardStepIndicator
       steps={WIZARD_STEPS}
       currentStep={currentStep}
       photoSteps={PHOTO_STEPS}
       currentPhotoStep={currentPhotoStep}
       isStepCompleted={isStepCompleted}
       isStepActive={isStepActive}
       isStepAccessible={isStepAccessible}
       onStepClick={handleStepClick}
     />

     {/* Step Content - Add ref here */}
     <div ref={stepContentRef} className="min-h-[500px]">
       {renderStepContent()}
     </div>

     {/* Upload Progress Display */}
     {isUploading && (
       <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
         <div className="text-blue-800 dark:text-blue-300 text-sm font-medium text-center">
           📤 Uploading photos and creating project...
         </div>
       </div>
     )}

     {/* Submit Error Display */}
     {errors.submit && (
       <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
         <div className="text-red-800 dark:text-red-300 text-sm font-medium">
           {errors.submit}
         </div>
       </div>
     )}

     {/* Navigation */}
     <ProjectWizardNavigation
       canGoPrevious={canGoPrevious() || (currentStep === 2 && currentPhotoStep > 0)}
       canGoNext={canGoNext() || (currentStep === 2 && currentPhotoStep < PHOTO_STEPS.length - 1)}
       isLastStep={isLastStep() && (currentStep !== 2 || currentPhotoStep === PHOTO_STEPS.length - 1)}
       isLoading={isLoading || isUploading}
       onPrevious={handlePrevious}
       onNext={handleNext}
       onCancel={onCancel}
       onSubmit={handleSubmit}
       isFormReady={isFormReady() && !isNextDisabled()}
       isNextDisabled={isNextDisabled()}
       currentStep={currentStep}
       currentPhotoStep={currentPhotoStep}
       photoSteps={PHOTO_STEPS}
     />
   </div>
 );
};

export default AddProjectWizard;