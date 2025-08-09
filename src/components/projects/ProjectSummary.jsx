// components/projects/ProjectSummary.jsx - Clickable Summary Cards
import React from 'react';

const ProjectSummary = ({ summary, onFilterClick }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <button
        onClick={() => onFilterClick('all')}
        className="summary-card-blue transition-all hover:shadow-lg active:scale-95 text-left"
      >
        <div className="summary-value-blue">{summary.total}</div>
        <div className="summary-label">Total</div>
      </button>

      <button
        onClick={() => onFilterClick('upcoming')}
        className="summary-card-amber transition-all hover:shadow-lg active:scale-95 text-left"
      >
        <div className="summary-value-amber">{summary.upcoming}</div>
        <div className="summary-label">Upcoming</div>
      </button>

      <button
        onClick={() => onFilterClick('started')}
        className="summary-card-purple transition-all hover:shadow-lg active:scale-95 text-left"
      >
        <div className="summary-value-purple">{summary.started}</div>
        <div className="summary-label">Started</div>
      </button>

      <button
        onClick={() => onFilterClick('completed')}
        className="summary-card-emerald transition-all hover:shadow-lg active:scale-95 text-left"
      >
        <div className="summary-value-emerald">{summary.completed}</div>
        <div className="summary-label">Completed</div>
      </button>
    </div>
  );
};

export default ProjectSummary;