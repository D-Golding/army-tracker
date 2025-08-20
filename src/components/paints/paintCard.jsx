// components/PaintCard.jsx
import React, { useState } from 'react';
import { RotateCcw, Brush, Trash2, Minus, Heart, Check, Plus, MoreVertical, FolderPlus } from 'lucide-react';
import AddPaintToProjectModal from '../paints/AddPaintToProjectModal.jsx';
import PaintProjectsModal from '../paints/PaintProjectsModal.jsx';

const PaintCard = ({
 paint,
 onRefill,
 onReducePaint,
 onMoveToCollection,
 onMoveToWishlist,
 onMoveToListed,
 onDelete,
 onProjectsUpdated,
 // Bulk delete props
 bulkDeleteMode = false,
 isSelected = false,
 onToggleSelection
}) => {
 const [showDropdown, setShowDropdown] = useState(false);
 const [showAddToProjectModal, setShowAddToProjectModal] = useState(false);
 const [showProjectsModal, setShowProjectsModal] = useState(false);

 const getLevelColor = (level) => {
   if (level > 50) return 'progress-high';
   if (level > 25) return 'progress-medium';
   return 'progress-low';
 };

 // Handle project updates
 const handleProjectsUpdated = async (projectIds) => {
   if (onProjectsUpdated) {
     await onProjectsUpdated(paint.name, projectIds);
   }
 };

 // Handle "Add to project" button click
 const handleAddToProject = () => {
   setShowAddToProjectModal(true);
   setShowDropdown(false);
 };

 // Handle project list display
 const handleShowProjects = () => {
   setShowProjectsModal(true);
 };

 // Handle collection button click with toggle
 const handleCollectionToggle = () => {
   if (paint.status === 'collection') {
     // If already in collection, move to listed (reference only)
     onMoveToListed(paint.name);
   } else {
     // If not in collection, move to collection
     onMoveToCollection(paint.name);
   }
   setShowDropdown(false);
 };

 // Handle wishlist button click with toggle
 const handleWishlistToggle = () => {
   if (paint.status === 'wishlist') {
     // If already in wishlist, move to listed (reference only)
     onMoveToListed(paint.name);
   } else {
     // If not in wishlist, move to wishlist
     onMoveToWishlist(paint.name);
   }
   setShowDropdown(false);
 };

 const projectCount = paint.projects ? paint.projects.length : 0;

 return (
   <>
     <div className={`card-base transition-all h-full flex flex-col ${
       bulkDeleteMode && isSelected 
         ? 'border-red-500 dark:border-red-400 ring-2 ring-red-200 dark:ring-red-900/50' 
         : 'hover:shadow-lg'
     }`}>

       {/* Bulk Delete Checkbox - Only show in bulk delete mode */}
       {bulkDeleteMode && (
         <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-5 py-3 flex-shrink-0">
           <label className="flex items-center gap-3 cursor-pointer">
             <input
               type="checkbox"
               checked={isSelected}
               onChange={onToggleSelection}
               className="form-checkbox w-5 h-5 border-red-300 text-red-600 focus:ring-red-500"
             />
             <span className="text-sm font-medium text-red-800 dark:text-red-300">
               {isSelected ? 'Selected for deletion' : 'Select for deletion'}
             </span>
           </label>
         </div>
       )}

       {/* Paint Header */}
       <div className="card-padding flex-1 flex flex-col">
         <div className="flex justify-between items-start mb-3">
           <div className="flex-1 min-w-0">
             <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{paint.name}</h3>
             <p className="text-gray-600 dark:text-gray-400 text-sm">
               {paint.brand} • {paint.type}
               {paint.colour && ` • ${paint.colour}`}
             </p>
           </div>
           <div className="flex flex-col gap-1 items-end flex-shrink-0 ml-3">
             {paint.colour && (
               <span className="badge-tertiary">
                 {paint.colour}
               </span>
             )}
             {paint.airbrush && (
               <span className="badge-blue">
                 <Brush className="inline-block mr-1" size={10} />
                 Airbrush
               </span>
             )}
             {paint.sprayPaint && (
               <span className="badge-purple">
                 Spray
               </span>
             )}

             {/* Status Badges - Hide in bulk delete mode */}
             {!bulkDeleteMode && (
               <div className="flex gap-1">
                 <button
                   onClick={handleCollectionToggle}
                   className={`px-2 py-1 text-xs rounded-lg font-medium cursor-pointer transition-all hover:shadow-md flex items-center gap-1 ${
                     paint.status === 'collection'
                       ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-300' 
                       : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                   }`}
                   title={paint.status === 'collection' ? 'Remove from Collection' : 'Add to Collection'}
                 >
                   <Check size={10} />
                 </button>

                 <button
                   onClick={handleWishlistToggle}
                   className={`px-2 py-1 text-xs rounded-lg font-medium cursor-pointer transition-all hover:shadow-md flex items-center gap-1 ${
                     paint.status === 'wishlist'
                       ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 ring-2 ring-pink-300' 
                       : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                   }`}
                   title={paint.status === 'wishlist' ? 'Remove from Wishlist' : 'Add to Wishlist'}
                 >
                   <Heart size={10} />
                 </button>
               </div>
             )}
           </div>
         </div>

         {/* Project Usage Display */}
         {projectCount > 0 && (
           <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
             <div className="flex justify-between items-center">
               <div className="text-sm text-indigo-700 dark:text-indigo-300">
                 Used in: {projectCount} project{projectCount !== 1 ? 's' : ''}
               </div>
               {!bulkDeleteMode && (
                 <button
                   onClick={handleShowProjects}
                   className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
                 >
                   See all +
                 </button>
               )}
             </div>
           </div>
         )}

         {/* Level Progress with Controls - Only show for collection paints and not in bulk delete mode */}
         {paint.status === 'collection' && !bulkDeleteMode && (
           <div className="mb-4 flex-shrink-0">
             <div className="flex justify-between items-center mb-2">
               <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Level</span>
               <span className="text-sm font-bold text-gray-900 dark:text-white">{paint.level}%</span>
             </div>
             <div className="flex items-center gap-2">
               <button
                 onClick={() => onReducePaint(paint.name)}
                 className="px-2 py-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform flex-shrink-0"
                 title="Use Paint (-10%)"
               >
                 <Minus size={12} />
               </button>
               <div className="progress-bar">
                 <div
                   className={`progress-fill ${getLevelColor(paint.level)}`}
                   style={{ width: `${paint.level}%` }}
                 ></div>
               </div>
               <button
                 onClick={() => onRefill(paint.name)}
                 className="px-2 py-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform flex-shrink-0"
                 title="Refill to 100%"
               >
                 <RotateCcw size={12} />
               </button>
             </div>
           </div>
         )}

         {/* Wishlist message and actions - Hide in bulk delete mode */}
         {paint.status === 'wishlist' && !bulkDeleteMode && (
           <div className="mb-4 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800 flex-shrink-0">
             <div className="flex flex-col gap-3">
               <p className="text-sm text-pink-700 dark:text-pink-300 italic">
                 On your wishlist
               </p>
               <div className="flex gap-2 flex-wrap">
                 <button
                   onClick={() => onMoveToCollection(paint.name)}
                   className="btn-sm gradient-secondary text-white flex items-center gap-1"
                   title="Add to Collection"
                 >
                   <Plus size={12} />
                   Add to Collection
                 </button>
                 <button
                   onClick={() => onMoveToListed(paint.name)}
                   className="btn-sm gradient-tertiary text-white"
                   title="Remove from Wishlist"
                 >
                   Remove
                 </button>
               </div>
             </div>
           </div>
         )}

         {/* Listed message - Hide in bulk delete mode */}
         {paint.status === 'listed' && !bulkDeleteMode && (
           <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 flex-shrink-0">
             <p className="text-sm text-gray-600 dark:text-gray-400 italic">
               Paint reference - use the buttons above to add to collection or wishlist
             </p>
           </div>
         )}

         {/* Spacer to push action buttons to bottom */}
         <div className="flex-1"></div>

         {/* Action Buttons - Hide in bulk delete mode */}
         {!bulkDeleteMode && (
           <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
             {/* Add to Project Button - Always visible */}
             <button
               onClick={handleAddToProject}
               className="btn-primary btn-sm flex-1"
               title="Add to project"
             >
               Add to project +
             </button>

             {/* More actions dropdown */}
             <div className="relative">
               <button
                 onClick={() => setShowDropdown(!showDropdown)}
                 className="btn-sm gradient-tertiary text-white"
                 title="More actions"
               >
                 <MoreVertical size={14} />
               </button>

               {showDropdown && (
                 <div className="dropdown-menu right-0 bottom-full mb-2 min-w-48">
                   {/* Only show "Remove from Collection" for collection paints */}
                   {paint.status === 'collection' && (
                     <button
                       onClick={() => {
                         onMoveToListed(paint.name);
                         setShowDropdown(false);
                       }}
                       className="dropdown-item rounded-t-xl"
                     >
                       Remove from Collection
                     </button>
                   )}
                   <button
                     onClick={() => {
                       onDelete(paint.name);
                       setShowDropdown(false);
                     }}
                     className={`dropdown-item-danger ${
                       paint.status === 'collection' ? 'rounded-b-xl' : 'rounded-xl'
                     }`}
                   >
                     Delete
                   </button>
                 </div>
               )}

               {/* Backdrop to close dropdown */}
               {showDropdown && (
                 <div
                   className="dropdown-backdrop"
                   onClick={() => setShowDropdown(false)}
                 />
               )}
             </div>
           </div>
         )}
       </div>
     </div>

     {/* Add to Project Modal */}
     <AddPaintToProjectModal
       isOpen={showAddToProjectModal}
       onClose={() => setShowAddToProjectModal(false)}
       paintName={paint.name}
       currentProjects={paint.projects || []}
       onProjectsUpdated={handleProjectsUpdated}
     />

     {/* Project List Modal */}
     <PaintProjectsModal
       isOpen={showProjectsModal}
       onClose={() => setShowProjectsModal(false)}
       paintName={paint.name}
       projectIds={paint.projects || []}
     />
   </>
 );
};

export default PaintCard;