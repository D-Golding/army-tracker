// components/newsfeed/create/PostPrivacyStep.jsx - Step 3 with functional copyright checkbox
import React from 'react';
import { Globe, Users, Lock, Info, Shield } from 'lucide-react';

const PostPrivacyStep = ({ formData, onPostDataUpdated }) => {
 const visibilityOptions = [
   {
     value: 'public',
     label: 'Public',
     description: 'Anyone can see this post',
     icon: Globe,
     color: 'text-green-600 dark:text-green-400'
   },
   {
     value: 'friends',
     label: 'Friends Only',
     description: 'Only your friends can see this post',
     icon: Users,
     color: 'text-blue-600 dark:text-blue-400'
   },
   {
     value: 'private',
     label: 'Private',
     description: 'Only you can see this post',
     icon: Lock,
     color: 'text-gray-600 dark:text-gray-400'
   }
 ];

 const currentVisibility = formData.visibility || 'public';

 const handleVisibilityChange = (visibility) => {
   onPostDataUpdated({ visibility });
 };

 const handleCopyrightChange = (checked) => {
   onPostDataUpdated({ copyrightAccepted: checked });
 };

 return (
   <div className="space-y-8">
     {/* Copyright Declaration */}
     <div className="card-base card-padding border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
       <div className="flex items-start gap-3">
         <input
           type="checkbox"
           id="copyright-checkbox"
           checked={formData.copyrightAccepted || false}
           onChange={(e) => handleCopyrightChange(e.target.checked)}
           className="form-checkbox mt-1 flex-shrink-0"
         />
         <label htmlFor="copyright-checkbox" className="text-sm cursor-pointer text-amber-800 dark:text-amber-300">
           By uploading, you confirm that you own the copyright to these images or have permission to share them, and that they do not infringe on any trademarks, logos, or third-party rights.
         </label>
       </div>
     </div>

     {/* Visibility Settings */}
     <div>
       <label className="form-label flex items-center gap-2">
         <Globe size={16} />
         Who can see this post?
       </label>

       <div className="space-y-3">
         {visibilityOptions.map((option) => {
           const IconComponent = option.icon;
           const isSelected = currentVisibility === option.value;

           return (
             <label
               key={option.value}
               className={`card-base card-padding cursor-pointer transition-all border-2 ${
                 isSelected
                   ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                   : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
               }`}
             >
               <div className="flex items-start gap-3">
                 <input
                   type="radio"
                   name="visibility"
                   value={option.value}
                   checked={isSelected}
                   onChange={(e) => handleVisibilityChange(e.target.value)}
                   className="form-radio mt-1"
                 />

                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                     <IconComponent size={18} className={option.color} />
                     <span className="font-medium text-gray-900 dark:text-white">
                       {option.label}
                     </span>
                   </div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">
                     {option.description}
                   </p>
                 </div>
               </div>
             </label>
           );
         })}
       </div>

       {/* Visibility Info */}
       <div className="card-base card-padding border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 mt-4">
         <div className="flex items-start gap-2">
           <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
           <div className="text-sm">
             <p className="text-blue-800 dark:text-blue-300 font-medium mb-1">
               Privacy Note
             </p>
             <p className="text-blue-700 dark:text-blue-400">
               {currentVisibility === 'public' && "Public posts can be seen by anyone in the community and may appear in discovery feeds."}
               {currentVisibility === 'friends' && "Friends-only posts are visible to people you've connected with and will appear in their feeds."}
               {currentVisibility === 'private' && "Private posts are only visible to you and won't appear in any feeds except your own profile."}
             </p>
           </div>
         </div>
       </div>
     </div>

     {/* Post Summary */}
     <div className="card-base card-padding bg-gray-50 dark:bg-gray-700">
       <h4 className="font-medium text-gray-900 dark:text-white mb-3">
         Post Summary
       </h4>
       <div className="space-y-2 text-sm">
         <div className="flex justify-between">
           <span className="text-gray-600 dark:text-gray-400">Photos:</span>
           <span className="text-gray-900 dark:text-white font-medium">
             {formData.files?.length || 0} selected
           </span>
         </div>
         <div className="flex justify-between">
           <span className="text-gray-600 dark:text-gray-400">Caption:</span>
           <span className="text-gray-900 dark:text-white font-medium">
             {formData.caption?.trim() ? `${formData.caption.length} characters` : 'Not added'}
           </span>
         </div>
         <div className="flex justify-between">
           <span className="text-gray-600 dark:text-gray-400">Tags:</span>
           <span className="text-gray-900 dark:text-white font-medium">
             {formData.tags?.length || 0} tag{(formData.tags?.length || 0) !== 1 ? 's' : ''}
           </span>
         </div>
         <div className="flex justify-between">
           <span className="text-gray-600 dark:text-gray-400">Visibility:</span>
           <span className="text-gray-900 dark:text-white font-medium">
             {visibilityOptions.find(opt => opt.value === currentVisibility)?.label}
           </span>
         </div>
       </div>
     </div>

     {/* Ready to Share */}
     <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
       <div className="text-emerald-600 dark:text-emerald-400 font-medium mb-2 flex items-center justify-center gap-2">
         <Shield size={16} />
         Ready to share your post!
       </div>
       <p className="text-sm text-gray-500 dark:text-gray-400">
         Click "Share Post" to upload and share your {formData.files?.length || 0} photo{(formData.files?.length || 0) !== 1 ? 's' : ''} with the community
       </p>
     </div>
   </div>
 );
};

export default PostPrivacyStep;