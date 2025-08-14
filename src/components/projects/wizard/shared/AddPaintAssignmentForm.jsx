// components/projects/wizard/AddPaintAssignmentForm.jsx - Paint assignment form
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const AddPaintAssignmentForm = ({
  availablePaints,
  onPaintAssigned,
  canAssign,
  remainingAssignments
}) => {
  const [selectedPaint, setSelectedPaint] = useState('');
  const [usage, setUsage] = useState('');
  const [technique, setTechnique] = useState('brush');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPaint) return;

    const paintData = availablePaints.find(p => p.paintId === selectedPaint);
    if (!paintData) return;

    const assignment = {
      paintId: paintData.paintId,
      paintName: paintData.paintName,
      brand: paintData.brand,
      type: paintData.type,
      usage: usage.trim(),
      technique: technique,
      assignedAt: new Date().toISOString()
    };

    onPaintAssigned(assignment);

    // Reset form
    setSelectedPaint('');
    setUsage('');
    setTechnique('brush');
  };

  if (!canAssign) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <p className="text-sm">Paint assignment limit reached</p>
        <p className="text-xs mt-1">Upgrade to assign more paints</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
        Add Paint Assignment
      </h4>

      {remainingAssignments !== null && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {remainingAssignments > 0 ? (
            <span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {remainingAssignments}
              </span> assignment{remainingAssignments !== 1 ? 's' : ''} remaining across all steps
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Assignment limit reached
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Paint *
          </label>
          <select
            value={selectedPaint}
            onChange={(e) => setSelectedPaint(e.target.value)}
            className="form-select text-sm"
            required
          >
            <option value="">Choose a paint...</option>
            {availablePaints.map((paint) => (
              <option key={paint.paintId} value={paint.paintId}>
                {paint.paintName} - {paint.brand}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Usage Notes
          </label>
          <input
            type="text"
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
            className="form-input text-sm"
            placeholder="e.g., For helmet and gun - thinned 2:1"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Technique
          </label>
          <select
            value={technique}
            onChange={(e) => setTechnique(e.target.value)}
            className="form-select text-sm"
          >
            <option value="brush">Brush</option>
            <option value="airbrush">Airbrush</option>
            <option value="drybrush">Dry Brush</option>
            <option value="wash">Wash</option>
            <option value="glaze">Glaze</option>
            <option value="stipple">Stipple</option>
            <option value="sponge">Sponge</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!selectedPaint}
          className="btn-primary btn-sm w-full"
        >
          <Plus size={14} />
          Add Paint Assignment
        </button>
      </form>
    </div>
  );
};

export default AddPaintAssignmentForm;