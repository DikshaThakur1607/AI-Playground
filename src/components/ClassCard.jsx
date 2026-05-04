import { useState, useRef, useCallback } from 'react';
import WebcamCapture from './WebcamCapture';

const CLASS_CONFIGS = [
  { emoji: '🔴', bg: 'linear-gradient(135deg,#f97316,#ef4444)', shadow: '#b91c1c' },
  { emoji: '🔵', bg: 'linear-gradient(135deg,#38bdf8,#6366f1)', shadow: '#3730a3' },
  { emoji: '🟢', bg: 'linear-gradient(135deg,#34d399,#84cc16)', shadow: '#166534' },
  { emoji: '🟡', bg: 'linear-gradient(135deg,#fbbf24,#f97316)', shadow: '#92400e' },
  { emoji: '🟣', bg: 'linear-gradient(135deg,#c084fc,#8b5cf6)', shadow: '#5b21b6' },
  { emoji: '🩷', bg: 'linear-gradient(135deg,#f472b6,#fb7185)', shadow: '#9d174d' },
  { emoji: '🩵', bg: 'linear-gradient(135deg,#67e8f9,#38bdf8)', shadow: '#0e7490' },
  { emoji: '🟤', bg: 'linear-gradient(135deg,#a78bfa,#f97316)', shadow: '#7c3aed' },
];

export const CLASS_COLORS = [
  '#f97316','#38bdf8','#34d399','#fbbf24',
  '#8b5cf6','#f472b6','#67e8f9','#a78bfa',
];

export default function ClassCard({
  cls, index, onAddSample, onDelete, onRename,
  sampleCount, thumbnails = [], onClearSamples,
}) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(cls.name);
  const [tab, setTab] = useState('webcam');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const config = CLASS_CONFIGS[index % CLASS_CONFIGS.length];

  const handleRename = () => {
    if (nameInput.trim()) onRename(cls.id, nameInput.trim());
    setEditing(false);
  };

  const processFiles = useCallback(async (files) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    for (const file of imageFiles) {
      await new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => { onAddSample(cls.id, img); URL.revokeObjectURL(url); resolve(); };
        img.src = url;
      });
    }
  }, [cls.id, onAddSample]);

  const handleFileUpload = useCallback(async (e) => {
    await processFiles(e.target.files);
    e.target.value = '';
  }, [processFiles]);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragOver(false);
    await processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  return (
    <div className="class-card">
      {/* Colored header */}
      <div className="class-card-top" style={{ background: config.bg }}>
        <div className="class-emoji-badge">{config.emoji}</div>

        {editing ? (
          <input
            className="class-name-input"
            value={nameInput}
            autoFocus
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            maxLength={20}
          />
        ) : (
          <h3 className="class-name" onClick={() => setEditing(true)} title="Click to rename">
            {cls.name} ✏️
          </h3>
        )}

        <div className="class-sample-badge">🖼 {sampleCount}</div>
        <button className="btn-icon" onClick={() => onClearSamples(cls.id)} title="Clear samples">🗑</button>
        <button className="btn-icon delete" onClick={() => onDelete(cls.id)} title="Delete class">✕</button>
      </div>

      {/* Body */}
      <div className="class-card-body">
        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'webcam' ? 'active' : ''}`} onClick={() => setTab('webcam')}>
            📷 Webcam
          </button>
          <button className={`tab-btn ${tab === 'upload' ? 'active' : ''}`} onClick={() => setTab('upload')}>
            📁 Upload
          </button>
        </div>

        {tab === 'webcam' ? (
          <WebcamCapture
            onCapture={(video) => onAddSample(cls.id, video)}
            captureLabel="Hold to Record"
            compact
          />
        ) : (
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <span className="upload-icon">{dragOver ? '📂' : '🖼️'}</span>
            <p>{dragOver ? 'Drop images here!' : 'Click or drag images here'}</p>
            <span className="upload-hint">JPG, PNG, GIF supported</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* Thumbnail strip */}
        {thumbnails.length > 0 && (
          <div className="thumb-strip">
            {thumbnails.slice(-12).map((src, i) => (
              <img key={i} src={src} alt="" className="thumb-img" />
            ))}
            {thumbnails.length > 12 && (
              <div className="thumb-more">+{thumbnails.length - 12}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
