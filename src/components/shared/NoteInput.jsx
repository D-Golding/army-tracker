// components/shared/NoteInput.jsx
import React, { useState } from 'react';
import { Plus, FileText, Edit2, Trash2, Check, X } from 'lucide-react';

const NoteInput = ({
  notes = [],
  onNoteAdded,
  onNoteUpdated,
  onNoteDeleted,
  maxNotes = 10,
  placeholder = "Add a note...",
  className = '',
  collapseAfter = null,
  hideToggle = false
}) => {
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllNotes, setShowAllNotes] = useState(false);

  // Handle adding new note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsAdding(true);
    try {
      const noteData = {
        id: `note_${Date.now()}`,
        content: newNote.trim(),
        createdAt: new Date().toISOString()
      };

      await onNoteAdded(noteData);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsAdding(false);
    }
  };

  // Handle starting edit
  const startEdit = (note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  // Handle saving edit
  const saveEdit = async (noteId) => {
    if (!editContent.trim()) return;

    try {
      await onNoteUpdated(noteId, { content: editContent.trim() });
      setEditingNote(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  // Handle canceling edit
  const cancelEdit = () => {
    setEditingNote(null);
    setEditContent('');
  };

  // Handle deleting note
  const handleDeleteNote = async (noteId) => {
    try {
      await onNoteDeleted(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const canAddMore = notes.length < maxNotes;

  // Get notes to display (collapse functionality)
  const displayNotes = collapseAfter && showAllNotes === false
    ? notes.slice(0, collapseAfter)
    : notes;
  const hasMoreNotes = collapseAfter && notes.length > collapseAfter;

  return (
    <div className={`space-y-3 ${className}`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
          <FileText size={14} className="mr-1" />
          Notes ({notes.length})
        </h4>

        {maxNotes > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {canAddMore ? (
              <span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {maxNotes - notes.length}
                </span> remaining
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Note limit reached
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legacy Collapsible Toggle - only show if hideToggle is false */}
      {!hideToggle && notes.length > 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          {isExpanded ? (
            <>
              Close
              <span className="ml-2 text-lg">-</span>
            </>
          ) : (
            <>
              See all Notes
              <span className="ml-2 text-lg">+</span>
            </>
          )}
        </button>
      )}

      {/* Add New Note - always visible when can add more */}
      {canAddMore && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder={placeholder}
              className="form-input flex-1"
              disabled={isAdding}
              onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || isAdding}
              className="btn-primary btn-sm"
            >
              {isAdding ? (
                <div className="loading-spinner"></div>
              ) : (
                <Plus size={14} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <FileText className="mx-auto mb-2 text-gray-400" size={24} />
          <p className="text-sm">No notes added yet</p>
          {canAddMore && (
            <p className="text-xs mt-1">Add your first note above</p>
          )}
        </div>
      ) : (hideToggle || isExpanded) ? (
        <div className="space-y-2">
          {displayNotes.map((note) => (
            <div
              key={note.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
            >
              {editingNote === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="form-textarea text-sm w-full"
                    rows="2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(note.id)}
                      disabled={!editContent.trim()}
                      className="btn-primary btn-sm flex-1"
                    >
                      <Check size={12} />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn-tertiary btn-sm flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 mr-2">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(note)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Edit note"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete note"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {note.createdAt && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(note.createdAt).toLocaleDateString()} at{' '}
                      {new Date(note.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* See All / Show Less Button - New collapse functionality */}
          {hasMoreNotes && (
            <button
              onClick={() => setShowAllNotes(!showAllNotes)}
              className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
            >
              {showAllNotes ? (
                <>Show Less</>
              ) : (
                <>See All ({notes.length - collapseAfter} more)</>
              )}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default NoteInput;