// components/projects/steps/sections/StepNotesSection.jsx
import React from 'react';
import NoteInput from '../../../shared/NoteInput';

const StepNotesSection = ({
  step,
  projectData,
  onNotesUpdated,
  maxNotes = 10
}) => {
  const stepNotes = step.notes || [];

  // Handle adding note to step
  const handleNoteAdded = async (noteData) => {
    try {
      const updatedNotes = [...stepNotes, noteData];
      await onNotesUpdated(updatedNotes);
    } catch (error) {
      console.error('Error adding note to step:', error);
      throw error;
    }
  };

  // Handle updating note
  const handleNoteUpdated = async (noteId, updates) => {
    try {
      const updatedNotes = stepNotes.map(note =>
        note.id === noteId ? { ...note, ...updates } : note
      );
      await onNotesUpdated(updatedNotes);
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  // Handle deleting note
  const handleNoteDeleted = async (noteId) => {
    try {
      const updatedNotes = stepNotes.filter(note => note.id !== noteId);
      await onNotesUpdated(updatedNotes);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  return (
    <div>
      <NoteInput
        notes={stepNotes}
        onNoteAdded={handleNoteAdded}
        onNoteUpdated={handleNoteUpdated}
        onNoteDeleted={handleNoteDeleted}
        maxNotes={maxNotes}
        placeholder="Add a note for this step..."
        showHeader={true}
        headerText="Step Notes"
        headerIcon="FileText"
        emptyStateText="No notes for this step yet"
        emptyStateSubtext="Add reminders, tips, or observations"
        collapseAfter={3}
        hideToggle={true}
      />
    </div>
  );
};

export default StepNotesSection;