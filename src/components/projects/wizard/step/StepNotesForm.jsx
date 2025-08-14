// components/projects/wizard/StepNotesForm.jsx - Notes management
import React from 'react';
import { FileText } from 'lucide-react';
import NoteInput from '../../../shared/NoteInput';

const StepNotesForm = ({
  formData,
  onNoteAdded,
  onNoteUpdated,
  onNoteDeleted
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Step Notes
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add notes and reminders for this step (optional)
        </p>
      </div>

      <NoteInput
        notes={formData.notes}
        onNoteAdded={onNoteAdded}
        onNoteUpdated={onNoteUpdated}
        onNoteDeleted={onNoteDeleted}
        placeholder="Add a note for this step..."
        maxNotes={10}
      />

      {/* Skip option */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can always add notes later
        </p>
      </div>
    </div>
  );
};

export default StepNotesForm;