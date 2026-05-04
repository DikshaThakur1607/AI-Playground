import { useRef, useState, useEffect, useCallback } from 'react';

const CLASS_COLORS = [
  '#f97316','#38bdf8','#34d399','#fbbf24',
  '#8b5cf6','#f472b6','#67e8f9','#a78bfa',
];

export default function PredictionPanel({ modelReady, classes, onPredict }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [active, setActive] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);
  const fpsCountRef = useRef(0);
  const fpsTimerRef = useRef(Date.now());

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 224, height: 224, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch (err) {
      setError('Camera denied: ' + err.message);
    }
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false); setPredictions([]);
  }, []);

  useEffect(() => {
    if (!active || !modelReady) return;
    const loop = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const results = onPredict(videoRef.current);
        if (results) setPredictions(results);
        fpsCountRef.current++;
        const now = Date.now();
        if (now - fpsTimerRef.current >= 1000) {
          setFps(fpsCountRef.current); fpsCountRef.current = 0; fpsTimerRef.current = now;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, modelReady, onPredict]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const top = predictions[0];
  const topColor = top
    ? CLASS_COLORS[classes.findIndex((c) => c.name === top.label) % CLASS_COLORS.length]
    : '#8b5cf6';

  return (
    <div className="panel prediction-panel">
      <div className="panel-header">
        <div className="panel-icon">🎯</div>
        <h2>Live Prediction</h2>
        {active && <span className="fps-badge">⚡ {fps} FPS</span>}
      </div>

      {/* Video */}
      <div className="prediction-video-wrapper">
        <video ref={videoRef} playsInline muted className="prediction-video" />
        {!active && (
          <div className="video-placeholder large">
            <span className="camera-icon">🎥</span>
            {!modelReady ? (
              <span>Train a model first 🤖</span>
            ) : (
              <span>Ready to predict! Hit start 👇</span>
            )}
          </div>
        )}

        {active && top && (
          <div className="prediction-overlay" style={{ borderColor: topColor }}>
            <span className="pred-label" style={{ color: topColor }}>
              {top.label}
            </span>
            <span className="pred-confidence">{top.confidence}%</span>
          </div>
        )}
      </div>

      {error && <p className="capture-error">⚠️ {error}</p>}

      {/* Controls */}
      <div className="prediction-controls">
        {!active ? (
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={startCamera} disabled={!modelReady}>
            {modelReady ? '▶ Start Predicting' : '🔒 Train First'}
          </button>
        ) : (
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={stopCamera}>
            ■ Stop Camera
          </button>
        )}
      </div>

      {/* Confidence bars */}
      {active && classes.length > 0 && (
        <div className="confidence-bars">
          {(predictions.length > 0
            ? predictions
            : classes.map((c) => ({ label: c.name, confidence: 0 }))
          ).map((p) => {
            const color = CLASS_COLORS[classes.findIndex((c) => c.name === p.label) % CLASS_COLORS.length] ?? '#8b5cf6';
            const isTop = predictions[0]?.label === p.label;
            return (
              <div key={p.label} className={`conf-bar-row ${isTop ? 'conf-bar-top' : ''}`}>
                <span className="conf-label" title={p.label}>{p.label}</span>
                <div className="conf-track">
                  <div className="conf-fill" style={{ width: `${p.confidence}%`, background: color }} />
                </div>
                <span className="conf-pct" style={{ color }}>{p.confidence}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
