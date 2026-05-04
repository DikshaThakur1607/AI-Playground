# 🚀 RoboYard

visit here: https://roboyard.vercel.app/

**RoboYard** (formerly *playground.ai*) is a highly interactive, browser-based machine learning sandbox. It allows users to train custom image classification models directly in their browser using their webcam, without writing a single line of code! 

Built with a playful "nature" theme and an emphasis on user experience, RoboYard runs entirely on the client side, meaning your data never leaves your computer.

## 💻 Tech Stack

This project was built using a modern, serverless frontend stack:

- **Framework:** [React 19](https://react.dev/) — utilized for building a modular component architecture with complex custom hooks.
- **Machine Learning Engine:** [TensorFlow.js (@tensorflow/tfjs)](https://www.tensorflow.org/js) — powers the in-browser model training and inference.
- **Base Model:** [MobileNet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) — optimized for low-latency, high-accuracy edge computing.
- **Build Tooling:** [Vite](https://vitejs.dev/) — ensures lightning-fast hot-module reloading and optimized production bundling.
- **Styling & Animations:** Pure CSS3 — utilizing custom variables, complex `@keyframes` (for the environment), and `backdrop-filter` for glassmorphism.
- **Particle System:** Native HTML5 `<canvas>` — for lightweight, zero-dependency confetti effects.
- **Deployment:** [Vercel](https://vercel.com/) — for high-availability edge hosting.

## 🛠️ Getting Started / How to Clone

Want to run RoboYard locally on your machine? Follow these simple steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed on your computer.

### Installation

1. **Clone the repository:**
   Open your terminal and run:
   ```bash
   git clone https://github.com/DikshaThakur1607/AI-Playground.git
   ```

2. **Navigate into the project folder:**
   ```bash
   cd AI-Playground
   ```

3. **Install the dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in your browser:**
   Once the server starts, it will give you a local URL (usually `http://localhost:5173/`). Open that in your browser to start playing!

---
*Created as a technical showcase for applied machine learning and modern web design.*
