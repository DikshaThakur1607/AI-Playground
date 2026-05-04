import { useRef, useState, useCallback, useEffect } from 'react';

export default function WebcamCapture({
  onCapture,
  captureLabel = 'Hold to Record',
  compact = false,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const [active, setActive] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(false);

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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      clearInterval(captureIntervalRef.current);
    };
  }, [stopCamera]);

  const startCapture = useCallback(() => {
    if (!active || !videoRef.current) return;
    setCapturing(true);
    captureIntervalRef.current = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        onCapture(videoRef.current);
        setFrameCount((c) => c + 1);
        setFlash(true);
        setTimeout(() => setFlash(false), 80);
      }
    }, 100);
  }, [active, onCapture]);

  const stopCapture = useCallback(() => {
    clearInterval(captureIntervalRef.current);
    setCapturing(false);
  }, []);

  // ── Space bar shortcut ──
  useEffect(() => {
    if (!active) return;
    const onDown = (e) => {
      if (e.code === 'Space' && !e.repeat && !capturing) {
        e.preventDefault();
        startCapture();
      }
    };
    const onUp = (e) => {
      if (e.code === 'Space') stopCapture();
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [active, capturing, startCapture, stopCapture]);

  return (
    <div className={`webcam-capture ${compact ? 'compact' : ''}`}>
      <div className={`video-wrapper ${flash ? 'flash' : ''}`}>
        <video ref={videoRef} playsInline muted className="capture-video" />
        {!active && (
          <div className="video-placeholder">
            <span className="camera-icon">📷</span>
            <span>Camera Off</span>
          </div>
        )}
        {capturing && <div className="recording-dot" />}
      </div>

      {error && <p className="capture-error">⚠️ {error}</p>}

      <div className="capture-controls">
        {!active ? (
          <button className="btn btn-secondary" onClick={startCamera}>
            📷 Start Camera
          </button>
        ) : (
          <>
            <button
              className={`btn btn-capture ${capturing ? 'capturing' : ''}`}
              onMouseDown={startCapture}
              onMouseUp={stopCapture}
              onTouchStart={startCapture}
              onTouchEnd={stopCapture}
            >
              {capturing ? `● Recording… (${frameCount})` : captureLabel}
            </button>
            <button className="btn btn-ghost" onClick={stopCamera}>Stop</button>
          </>
        )}
      </div>

      {active && !capturing && (
        <p className="webcam-hint">Hold button or press <kbd>Space</kbd></p>
      )}
    </div>
  );
}
