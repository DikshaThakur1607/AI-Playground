import { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import ClassCard from './components/ClassCard';
import TrainingPanel from './components/TrainingPanel';
import PredictionPanel from './components/PredictionPanel';
import VisualizationPanel from './components/VisualizationPanel';
import Confetti from './components/Confetti';
import { ToastProvider, useToast } from './components/Toast';
import { useTeachableMachine } from './hooks/useTeachableMachine';
import './App.css';

let classCounter = 0;
const makeId = () => `cls_${++classCounter}_${Date.now()}`;

const DEFAULT_CLASSES = [
  { id: makeId(), name: 'Class 1' },
  { id: makeId(), name: 'Class 2' },
];

function captureThumb(imageSource) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 60; canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (imageSource.tagName === 'VIDEO') {
      ctx.translate(60, 0); ctx.scale(-1, 1);
    }
    ctx.drawImage(imageSource, 0, 0, 60, 60);
    return canvas.toDataURL('image/jpeg', 0.65);
  } catch { return null; }
}

// Flower positions along the grass strip
const FLOWERS = [
  { left: '4%',  emoji: '🌻', delay: '0s'   },
  { left: '12%', emoji: '🌸', delay: '0.4s' },
  { left: '22%', emoji: '🌼', delay: '0.8s' },
  { left: '33%', emoji: '🌸', delay: '0.2s' },
  { left: '44%', emoji: '🌻', delay: '1s'   },
  { left: '54%', emoji: '🌼', delay: '0.6s' },
  { left: '64%', emoji: '🌸', delay: '0.3s' },
  { left: '74%', emoji: '🌻', delay: '0.9s' },
  { left: '84%', emoji: '🌼', delay: '0.5s' },
  { left: '93%', emoji: '🌸', delay: '0.7s' },
];

function AppInner() {
  const toast = useToast();
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [sampleCounts, setSampleCounts] = useState({});
  const [thumbnails, setThumbnails] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const prevModelReadyRef = useRef(false);

  const {
    modelLoaded, modelLoading, modelReady,
    training, trainingProgress, trainingLoss, trainingAccuracy,
    loadError, loadMobileNet, addSample, getSampleCounts,
    clearSamples, trainModel, predict, exportModel,
  } = useTeachableMachine();

  useEffect(() => { loadMobileNet(); }, [loadMobileNet]);

  useEffect(() => {
    if (modelReady && !prevModelReadyRef.current) {
      setShowConfetti(true);
      toast('🎉 Model trained successfully!', 'success', 4000);
      setTimeout(() => setShowConfetti(false), 4500);
    }
    prevModelReadyRef.current = modelReady;
  }, [modelReady, toast]);

  const refreshCounts = useCallback(() => {
    setSampleCounts({ ...getSampleCounts() });
  }, [getSampleCounts]);

  const handleAddSample = useCallback((classId, imageSource) => {
    addSample(classId, imageSource);
    const thumb = captureThumb(imageSource);
    if (thumb) setThumbnails((prev) => ({ ...prev, [classId]: [...(prev[classId] || []), thumb] }));
    refreshCounts();
  }, [addSample, refreshCounts]);

  const handleAddClass = () => {
    const id = makeId();
    setClasses((prev) => [...prev, { id, name: `Class ${prev.length + 1}` }]);
    toast('✨ New class added!', 'info', 2000);
  };

  const handleDeleteClass = (id) => {
    clearSamples(id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setThumbnails((prev) => { const n = { ...prev }; delete n[id]; return n; });
    refreshCounts();
    toast('🗑 Class deleted', 'warn', 2000);
  };

  const handleClearSamples = (id) => {
    clearSamples(id);
    setThumbnails((prev) => ({ ...prev, [id]: [] }));
    refreshCounts();
    toast('🗑 Samples cleared', 'warn', 2000);
  };

  const handleRenameClass = (id, newName) =>
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, name: newName } : c)));

  const handleTrain = async (config) => {
    try { await trainModel(classes, config); }
    catch (err) { toast('❌ ' + err.message, 'error', 5000); }
  };

  const handleExport = async () => {
    try { await exportModel(); toast('💾 Model exported! Check your downloads.', 'success', 4000); }
    catch (err) { toast('❌ Export failed: ' + err.message, 'error', 4000); }
  };

  const handlePredict = useCallback((videoEl) => predict(videoEl, classes), [predict, classes]);

  return (
    <div className="app">
      {/* Confetti burst */}
      <Confetti active={showConfetti} />

      {/* ── Nature background ── */}
      <div className="nature-bg" aria-hidden="true">
        {/* Spinning sun */}
        <div className="pg-sun">☀️</div>

        {/* Drifting clouds */}
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
        <div className="cloud cloud-4" />

        {/* Birds */}
        <div className="bird bird-1">🐦</div>
        <div className="bird bird-2">🐦</div>
        <div className="bird bird-3">🕊️</div>

        {/* Hot Air Balloons */}
        <div className="balloon balloon-1">🎈</div>
        <div className="balloon balloon-2">🎈</div>
      </div>

      {/* ── Grass strip at bottom ── */}
      <div className="grass-strip" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="grass-wave">
          <path d="M0,40 C180,0 360,80 540,40 C720,0 900,80 1080,40 C1260,0 1440,60 1440,40 L1440,80 L0,80 Z"
            fill="#66bb6a" />
          <path d="M0,55 C120,20 240,70 360,50 C480,30 600,75 720,55 C840,35 960,70 1080,55 C1200,40 1320,65 1440,55 L1440,80 L0,80 Z"
            fill="#388e3c" opacity="0.65" />
        </svg>
        <div className="grass-flowers">
          {FLOWERS.map((f, i) => (
            <span key={i} style={{ left: f.left, animationDelay: f.delay }}>{f.emoji}</span>
          ))}
        </div>
      </div>

      <Header modelLoaded={modelLoaded} modelLoading={modelLoading} modelReady={modelReady} />

      {loadError && (
        <div className="global-error">
          ⚠ {loadError} —{' '}
          <button className="link-btn" onClick={loadMobileNet}>Retry</button>
        </div>
      )}

      <main className="app-main">
        {/* ── Left: Data Collection ── */}
        <section className="section section-data">
          <div className="section-title-row">
            <h2 className="section-title">
              <span className="section-title-icon">📂</span>
              Data Collection
            </h2>
            <button className="btn-add-class" onClick={handleAddClass}>✨ Add Class</button>
          </div>

          <div className="class-grid">
            {classes.map((cls, i) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                index={i}
                sampleCount={sampleCounts[cls.id] ?? 0}
                thumbnails={thumbnails[cls.id] || []}
                onAddSample={handleAddSample}
                onDelete={handleDeleteClass}
                onRename={handleRenameClass}
                onClearSamples={handleClearSamples}
              />
            ))}
          </div>
        </section>

        {/* ── Right: Training + Prediction ── */}
        <section className="section section-right">
          <TrainingPanel
            classes={classes}
            sampleCounts={sampleCounts}
            training={training}
            trainingProgress={trainingProgress}
            trainingLoss={trainingLoss}
            trainingAccuracy={trainingAccuracy}
            modelReady={modelReady}
            onTrain={handleTrain}
            onExport={handleExport}
          />
          <PredictionPanel
            modelReady={modelReady}
            classes={classes}
            onPredict={handlePredict}
          />
          <VisualizationPanel
            classes={classes}
            sampleCounts={sampleCounts}
            trainingAccuracy={trainingAccuracy}
          />
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
