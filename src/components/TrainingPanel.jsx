import { useState } from 'react';

export default function TrainingPanel({
  classes, sampleCounts, training, trainingProgress,
  trainingLoss, trainingAccuracy, modelReady,
  onTrain, onExport,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [epochs, setEpochs] = useState(50);
  const [learningRate, setLearningRate] = useState(0.0001);
  const [exporting, setExporting] = useState(false);

  const totalSamples = Object.values(sampleCounts).reduce((a, b) => a + b, 0);
  const hasEnoughClasses = classes.length >= 2;
  const allClassesHaveSamples = classes.every((c) => (sampleCounts[c.id] ?? 0) > 0);
  const canTrain = hasEnoughClasses && allClassesHaveSamples && !training;

  const handleExport = async () => {
    setExporting(true);
    try { await onExport(); } finally { setExporting(false); }
  };

  const lrOptions = [
    { label: '0.00001 (slow)', value: 0.00001 },
    { label: '0.0001 (default)', value: 0.0001 },
    { label: '0.001 (fast)', value: 0.001 },
  ];

  return (
    <div className="panel training-panel">
      <div className="panel-header">
        <div className="panel-icon">⚡</div>
        <h2>Training</h2>
      </div>

      {/* Stats */}
      <div className="training-stats">
        <div className="stat-item">
          <span className="stat-value">{classes.length}</span>
          <span className="stat-label">Classes</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{totalSamples}</span>
          <span className="stat-label">Samples</span>
        </div>
        {trainingAccuracy !== null && (
          <div className="stat-item accent">
            <span className="stat-value">{trainingAccuracy}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        )}
      </div>

      {/* Hints */}
      {!hasEnoughClasses && (
        <p className="hint warn">⚠️ Add at least 2 classes to train</p>
      )}
      {hasEnoughClasses && !allClassesHaveSamples && (
        <p className="hint warn">⚠️ Each class needs at least 1 sample</p>
      )}

      {/* Train button */}
      <button
        className={`btn btn-primary btn-train ${training ? 'loading' : ''}`}
        onClick={() => onTrain({ epochs, learningRate })}
        disabled={!canTrain}
      >
        {training ? (
          <><span className="spinner" /> Training… {trainingProgress}%</>
        ) : modelReady ? (
          '🔁 Retrain Model'
        ) : (
          '🚀 Train Model'
        )}
      </button>

      {/* Candy-stripe progress */}
      {(training || modelReady) && (
        <div className="progress-bar-wrapper">
          <div
            className="progress-bar-fill"
            style={{ width: `${training ? trainingProgress : 100}%` }}
          />
          <span className="progress-label">
            {training
              ? `🎯 Epoch ${Math.round((trainingProgress / 100) * epochs)} / ${epochs}`
              : '🎉 Training complete!'}
          </span>
        </div>
      )}

      {training && trainingLoss && (
        <p className="loss-display">Loss: {trainingLoss}</p>
      )}

      {/* Advanced settings */}
      <button
        className="advanced-toggle"
        onClick={() => setShowAdvanced((v) => !v)}
      >
        {showAdvanced ? '▲' : '▼'} Advanced Settings
      </button>

      {showAdvanced && (
        <div className="advanced-panel">
          <div className="adv-row">
            <label className="adv-label">
              Epochs <span className="adv-val">{epochs}</span>
            </label>
            <input
              type="range" min={10} max={200} step={10}
              value={epochs}
              onChange={(e) => setEpochs(Number(e.target.value))}
              className="adv-slider"
            />
            <div className="adv-range-labels"><span>10</span><span>200</span></div>
          </div>

          <div className="adv-row">
            <label className="adv-label">Learning Rate</label>
            <div className="lr-options">
              {lrOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`lr-btn ${learningRate === opt.value ? 'active' : ''}`}
                  onClick={() => setLearningRate(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export */}
      {modelReady && (
        <button
          className="btn btn-secondary"
          onClick={handleExport}
          disabled={exporting}
          style={{ marginTop: 4 }}
        >
          {exporting ? <><span className="spinner" /> Exporting…</> : '💾 Export Model'}
        </button>
      )}
    </div>
  );
}
