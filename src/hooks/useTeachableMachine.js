import { useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

const MOBILENET_URL =
  'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';

const IMAGE_SIZE = 224;
const DEFAULT_LEARNING_RATE = 0.0001;
const BATCH_SIZE_FRACTION = 0.4;
const DEFAULT_EPOCHS = 50;
const DENSE_UNITS = 100;

function preprocessImage(imageSource) {
  return tf.tidy(() => {
    let img = tf.browser.fromPixels(imageSource);
    img = tf.image.resizeBilinear(img, [IMAGE_SIZE, IMAGE_SIZE]);
    img = img.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
    return img.expandDims(0);
  });
}

export function useTeachableMachine() {
  const mobilenetRef = useRef(null);
  const truncatedRef = useRef(null);
  const classifierRef = useRef(null);
  const embeddingsRef = useRef({}); // { classId: tf.Tensor[] }

  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLoss, setTrainingLoss] = useState(null);
  const [trainingAccuracy, setTrainingAccuracy] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const loadMobileNet = useCallback(async () => {
    if (mobilenetRef.current) return;
    try {
      setModelLoading(true);
      setLoadError(null);
      const mobilenet = await tf.loadLayersModel(MOBILENET_URL);
      const layer = mobilenet.getLayer('conv_pw_13_relu');
      const truncated = tf.model({
        inputs: mobilenet.inputs,
        outputs: layer.output,
      });
      mobilenetRef.current = mobilenet;
      truncatedRef.current = truncated;
      // Warm up
      tf.tidy(() => {
        const dummy = tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
        truncated.predict(dummy);
      });
      setModelLoaded(true);
    } catch (err) {
      setLoadError('Failed to load MobileNet: ' + err.message);
    } finally {
      setModelLoading(false);
    }
  }, []);

  const addSample = useCallback((classId, imageSource) => {
    if (!truncatedRef.current) return;
    const embedding = tf.tidy(() => {
      const img = preprocessImage(imageSource);
      return truncatedRef.current.predict(img);
    });
    if (!embeddingsRef.current[classId]) {
      embeddingsRef.current[classId] = [];
    }
    embeddingsRef.current[classId].push(embedding);
  }, []);

  const getSampleCounts = useCallback(() => {
    const counts = {};
    for (const [id, samples] of Object.entries(embeddingsRef.current)) {
      counts[id] = samples.length;
    }
    return counts;
  }, []);

  const clearSamples = useCallback((classId) => {
    if (embeddingsRef.current[classId]) {
      embeddingsRef.current[classId].forEach((t) => t.dispose());
      delete embeddingsRef.current[classId];
    }
  }, []);

  const trainModel = useCallback(async (classes, { epochs = DEFAULT_EPOCHS, learningRate = DEFAULT_LEARNING_RATE } = {}) => {
    const classIds = classes.map((c) => c.id);
    const numClasses = classIds.length;

    // Validate
    for (const id of classIds) {
      if (!embeddingsRef.current[id] || embeddingsRef.current[id].length === 0) {
        throw new Error('All classes must have at least 1 sample');
      }
    }

    setTraining(true);
    setTrainingProgress(0);
    setModelReady(false);

    // Dispose old classifier
    if (classifierRef.current) {
      classifierRef.current.dispose();
      classifierRef.current = null;
    }

    try {
      // Build xs and ys
      const allEmbeddings = [];
      const allLabels = [];

      classIds.forEach((id, labelIdx) => {
        const samples = embeddingsRef.current[id];
        samples.forEach((emb) => {
          allEmbeddings.push(emb);
          allLabels.push(labelIdx);
        });
      });

      const xs = tf.tidy(() => tf.concat(allEmbeddings, 0));
      const ys = tf.tidy(() => tf.oneHot(tf.tensor1d(allLabels, 'int32'), numClasses).toFloat());

      // Build classifier
      const inputShape = xs.shape.slice(1);
      const classifier = tf.sequential();
      classifier.add(tf.layers.flatten({ inputShape }));
      classifier.add(
        tf.layers.dense({
          units: DENSE_UNITS,
          activation: 'relu',
          kernelInitializer: 'varianceScaling',
          useBias: true,
        })
      );
      classifier.add(
        tf.layers.dense({
          units: numClasses,
          kernelInitializer: 'varianceScaling',
          useBias: false,
          activation: 'softmax',
        })
      );

      const optimizer = tf.train.adam(learningRate);
      classifier.compile({
        optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
      });

      const batchSize = Math.floor(xs.shape[0] * BATCH_SIZE_FRACTION);
      const safeBatch = Math.max(1, batchSize);

      await classifier.fit(xs, ys, {
        batchSize: safeBatch,
        epochs,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const pct = Math.round(((epoch + 1) / epochs) * 100);
            setTrainingProgress(pct);
            setTrainingLoss(logs.loss?.toFixed(4) ?? null);
            setTrainingAccuracy(logs.acc != null ? Math.round(logs.acc * 100) : null);
          },
        },
      });

      xs.dispose();
      ys.dispose();

      classifierRef.current = classifier;
      setModelReady(true);
    } finally {
      setTraining(false);
    }
  }, []);

  const exportModel = useCallback(async () => {
    if (!classifierRef.current) return;
    await classifierRef.current.save('downloads://playground-ai-model');
  }, []);

  const predict = useCallback((imageSource, classes) => {
    if (!truncatedRef.current || !classifierRef.current) return null;
    return tf.tidy(() => {
      const img = preprocessImage(imageSource);
      const embedding = truncatedRef.current.predict(img);
      const scores = classifierRef.current.predict(embedding);
      const data = scores.dataSync();
      const results = Array.from(data).map((confidence, i) => ({
        label: classes[i]?.name ?? `Class ${i + 1}`,
        confidence: Math.round(confidence * 100),
      }));
      results.sort((a, b) => b.confidence - a.confidence);
      return results;
    });
  }, []);

  return {
    modelLoaded,
    modelLoading,
    modelReady,
    training,
    trainingProgress,
    trainingLoss,
    trainingAccuracy,
    loadError,
    loadMobileNet,
    addSample,
    getSampleCounts,
    clearSamples,
    trainModel,
    predict,
    exportModel,
  };
}
