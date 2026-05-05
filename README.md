<div align="center">
  <h1>🚀 RoboYard</h1>
  <p><strong>A high-performance, client-side machine learning sandbox utilizing Transfer Learning and WebGL acceleration.</strong></p>
  
  [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://roboyard.vercel.app/)
  [![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22-orange?style=for-the-badge&logo=tensorflow)](https://www.tensorflow.org/js)
  [![Vite](https://img.shields.io/badge/Vite-8.0-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)

  <h3>🌐 <a href="https://roboyard.vercel.app/">Try the Live Demo Here</a></h3>

  <p>
    <a href="#-architecture--technical-overview">Architecture</a> •
    <a href="#-core-features">Features</a> •
    <a href="#-machine-learning-pipeline">ML Pipeline</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a>
  </p>
</div>

---

## 🌟 Architecture & Technical Overview

**RoboYard** (formerly *playground.ai*) is an advanced, fully interactive machine learning environment engineered to run entirely on the client side. By leveraging WebGL-accelerated tensor operations via TensorFlow.js, RoboYard empowers users to perform real-time data collection, feature extraction, and neural network fine-tuning without the latency or privacy concerns of server-based processing.

The system utilizes **Transfer Learning** on a pre-trained MobileNet backbone, freezing the deep convolutional layers to extract highly semantic embeddings, and dynamically building a dense multi-layer perceptron (MLP) classification head directly in the browser. 

This ensures that your data remains securely on your local machine—zero server-side processing, maximum performance, and strict data privacy.

---

## 🧠 Machine Learning Pipeline

Under the hood, RoboYard implements a robust, memory-efficient deep learning pipeline:

1. **Feature Extraction (MobileNet Backbone):**
   - The system loads the foundational `MobileNet v1 (0.25, 224)` model and truncates it at the `conv_pw_13_relu` layer. 
   - Webcam inputs are dynamically resized (224x224), normalized, and fed into this truncated model to yield high-dimensional feature embeddings.
   - We utilize `tf.tidy()` heavily to aggressively manage WebGL memory and automatically clean up intermediate tensors during real-time extraction, preventing memory leaks in long-running sessions.

2. **Dynamic Classification Head:**
   - Once samples are collected, the system constructs a sequential feed-forward neural network (`tf.sequential`) on the fly.
   - **Architecture:** A `flatten` layer, followed by a `dense` layer with 100 units (ReLU activation, Variance Scaling initializer), and concluding with a `softmax` output layer matching the number of user-defined classes.
   - **Optimization:** The model compiles with the **Adam Optimizer** (learning rate: `0.0001`), utilizing **Categorical Crossentropy** for loss calculation.

3. **In-Browser Training & Inference:**
   - Training runs dynamically across epochs (default `50`), yielding real-time metric callbacks for Loss and Accuracy tracking on the frontend.
   - Post-training inference runs at 60+ FPS, calculating the confidence vectors across classes for live real-time visual feedback.

---

## ✨ Core Features

- 📸 **Live Data Collection:** Asynchronous rendering of HTML5 `<video>` streams hooked directly into TF.js tensors for immediate sample harvesting.
- ⚡ **WebGL-Accelerated Edge Computing:** Capitalizes on the user's GPU hardware to drastically reduce computation time for feature extraction and training.
- 📊 **Real-time Metric Tracking:** Built-in panels visualizing Training Loss gradients, Accuracy, and per-class confidence vectors during inference.
- 🎨 **Glassmorphic UI/UX:** A robust, responsive, nature-themed design system constructed with raw CSS3 variables, `backdrop-filter`, and complex `@keyframes` animations.
- 💾 **Model Serialization & Export:** Serializes the trained weights and topology to local storage, allowing seamless JSON exports for external inference engines.

---

## 💻 Tech Stack

RoboYard is built upon a modern, highly optimized serverless frontend stack:

| Component | Technology | Technical Purpose |
| :--- | :--- | :--- |
| **Frontend Runtime** | [React 19.2](https://react.dev/) | Utilizes concurrent features and complex custom hooks (`useTeachableMachine`, `useWebcam`) for decoupled UI/Logic architecture. |
| **ML Engine** | [TensorFlow.js 4.22](https://www.tensorflow.org/js) | Handles all hardware-accelerated tensor math, model topology definition, and backpropagation. |
| **Base Weights** | [MobileNet v1](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) | Efficient, low-latency pre-trained CNN optimized specifically for edge computing environments. |
| **Build Pipeline** | [Vite 8.0](https://vitejs.dev/) | Rollup-backed build tool delivering lightning-fast Hot Module Replacement (HMR) and minified production bundles. |
| **Styling & Effects** | CSS3 & HTML5 `<canvas>` | Zero-dependency implementation of dynamic visual environments and particle systems (confetti). |

---

## 🚀 Getting Started

Deploy and run the sandbox locally for development and modification.

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DikshaThakur1607/AI-Playground.git
   ```

2. **Navigate to the workspace:**
   ```bash
   cd AI-Playground
   ```

3. **Install module dependencies:**
   ```bash
   npm install
   ```

4. **Initialize the local development server:**
   ```bash
   npm run dev
   ```

5. **Launch the application:**
   The Vite dev server will initialize. Open the provided `localhost` port (typically `http://localhost:5173/`) in your browser.

---

## 🏗️ Project Architecture

```text
src/
├── components/          # Stateless & Stateful presentation components
│   ├── ClassCard.jsx    # Handles individual class sampling & state
│   ├── TrainingPanel.jsx# Model training configuration & metric rendering
│   └── PredictionPanel.jsx # Real-time inference visualizer
├── hooks/               # Core application business logic
│   ├── useTeachableMachine.js # TF.js lifecycle, model compiling, and tensor management
│   └── useWebcam.js     # Hardware interaction and stream management
├── App.jsx              # Main UI controller and dependency injection
└── index.css            # Global CSS variables and animation definitions
```

---

<div align="center">
  <p><em>Engineered as a technical showcase for applied machine learning, edge computing, and modern web architecture.</em></p>
  <p>🌻</p>
</div>
