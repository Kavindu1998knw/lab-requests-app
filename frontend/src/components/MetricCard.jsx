import React from 'react';

export const MetricCard = ({ title, value, subtext, icon: Icon, accentColor, accentBg }) => {
  return (
    <div
      className="metric-card"
      style={{
        '--card-accent': accentColor,
        '--card-accent-bg': accentBg,
      }}
    >
      <div>
        <div className="metric-title">{title}</div>
        <div className="metric-value">{value}</div>
        {subtext && <div className="metric-subtext">{subtext}</div>}
      </div>
      {Icon && (
        <div className="metric-icon-box">
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};
