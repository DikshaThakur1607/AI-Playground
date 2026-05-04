const CLASS_COLORS = [
  '#f97316','#38bdf8','#34d399','#fbbf24',
  '#8b5cf6','#f472b6','#67e8f9','#a78bfa',
];

export default function VisualizationPanel({ classes, sampleCounts, trainingAccuracy }) {
  const maxCount = Math.max(...Object.values(sampleCounts), 1);
  const total = Object.values(sampleCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="panel viz-panel">
      <div className="panel-header">
        <div className="panel-icon">📊</div>
        <h2>Dataset Overview</h2>
      </div>

      {classes.length === 0 ? (
        <p className="hint">Add classes to see your dataset here 🗂️</p>
      ) : (
        <>
          <div className="viz-bars">
            {classes.map((cls, i) => {
              const count = sampleCounts[cls.id] ?? 0;
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              const color = CLASS_COLORS[i % CLASS_COLORS.length];
              return (
                <div key={cls.id} className="viz-bar-row">
                  <div className="viz-bar-label">
                    <span className="viz-dot" style={{ background: color }} />
                    <span>{cls.name}</span>
                  </div>
                  <div className="viz-track">
                    <div className="viz-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="viz-count">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="viz-footer">
            <div className="viz-stat">
              <span className="viz-stat-val">📸 {total}</span>
              <span className="viz-stat-lbl">Total samples</span>
            </div>
            <div className="viz-stat">
              <span className="viz-stat-val">🏷 {classes.length}</span>
              <span className="viz-stat-lbl">Classes</span>
            </div>
            {trainingAccuracy !== null && (
              <div className="viz-stat accent">
                <span className="viz-stat-val">🎯 {trainingAccuracy}%</span>
                <span className="viz-stat-lbl">Accuracy</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
