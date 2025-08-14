// components/projects/wizard/PaintAssignmentCard.jsx - Individual paint assignment display
import React, { useState } from 'react';
import { Edit2, X, Check } from 'lucide-react';

const PaintAssignmentCard = ({ assignment, onRemove, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    usage: assignment.usage || '',
    technique: assignment.technique || 'brush'
  });

  const handleSave = () => {
    onUpdate(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      usage: assignment.usage || '',
      technique: assignment.technique || 'brush'
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm">
            {assignment.paintName}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {assignment.brand} • {assignment.type}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Edit assignment"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            title="Remove assignment"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editForm.usage}
            onChange={(e) => setEditForm({ ...editForm, usage: e.target.value })}
            className="form-input text-xs"
            placeholder="Usage notes"
          />
          <select
            value={editForm.technique}
            onChange={(e) => setEditForm({ ...editForm, technique: e.target.value })}
            className="form-select text-xs"
          >
            <option value="brush">Brush</option>
            <option value="airbrush">Airbrush</option>
            <option value="drybrush">Dry Brush</option>
            <option value="wash">Wash</option>
            <option value="glaze">Glaze</option>
            <option value="stipple">Stipple</option>
            <option value="sponge">Sponge</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary btn-sm flex-1">
              <Check size={12} />
              Save
            </button>
            <button onClick={handleCancel} className="btn-tertiary btn-sm flex-1">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {assignment.usage && (
            <div className="text-xs text-gray-700 dark:text-gray-300">
              {assignment.usage}
            </div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Technique: {assignment.technique || 'brush'}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaintAssignmentCard;