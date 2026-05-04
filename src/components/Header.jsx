export default function Header({ modelLoaded, modelLoading, modelReady }) {
  return (
    <header className="app-header">
      <div className="header-logo">
        <div className="logo-bubble">🚀</div>
        <div className="logo-text">
          <h1>RoboYard</h1>
          <p>Train your own image classifier</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="header-steps">
        <div className={`step-item ${!modelReady ? 'active' : 'done'}`}>
          <span className="step-num">1</span>
          📸 Collect
        </div>
        <span className="step-arrow">→</span>
        <div className={`step-item ${modelLoading || (!modelReady && modelLoaded) ? 'active' : modelReady ? 'done' : ''}`}>
          <span className="step-num">2</span>
          ⚡ Train
        </div>
        <span className="step-arrow">→</span>
        <div className={`step-item ${modelReady ? 'active' : ''}`}>
          <span className="step-num">3</span>
          🎯 Predict
        </div>
      </div>

      <div className="header-status">
        {modelLoading && (
          <div className="status-badge loading">
            <span className="spinner" />
            Loading model…
          </div>
        )}
        {modelLoaded && !modelReady && !modelLoading && (
          <div className="status-badge ready">
            ✅ Base model ready
          </div>
        )}
        {modelReady && (
          <div className="status-badge trained">
            🏆 Model trained!
          </div>
        )}
      </div>
    </header>
  );
}
