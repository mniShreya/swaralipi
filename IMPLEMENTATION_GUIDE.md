# Swaralipi AI Implementation Guide (VS Code)

This guide provides a step-by-step walkthrough to set up and run the Swaralipi AI project on your local machine using VS Code.

## Prerequisites
- **Node.js**: Install the latest LTS version from [nodejs.org](https://nodejs.org/).
- **VS Code**: Download from [code.visualstudio.com](https://code.visualstudio.com/).
- **Gemini API Key**: Obtain one from [Google AI Studio](https://aistudio.google.com/).

---

## Step 1: Project Initialization
Open your terminal and run the following commands to create a new Vite project:

```bash
# Create project
npm create vite@latest swaralipi-ai -- --template react-ts

# Navigate to directory
cd swaralipi-ai

# Install base dependencies
npm install
```

---

## Step 2: Install Required Packages
Install the specific libraries used for UI, animations, charts, and AI:

```bash
npm install @google/genai lucide-react motion recharts react-dropzone clsx tailwind-merge
npm install -D tailwindcss @tailwindcss/vite
```

---

## Step 3: Configure Tailwind CSS (v4)
In Vite 4+, Tailwind is integrated via a plugin.

1. Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

2. Update `src/index.css` with the heritage theme:
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
@import "tailwindcss";

@theme {
  --font-serif: "Cormorant Garamond", serif;
  --font-sans: "Inter", sans-serif;
  --color-heritage-cream: #f5f2ed;
  --color-heritage-ink: #1a1a1a;
  --color-heritage-gold: #c5a059;
  --color-heritage-paper: #fdfbf7;
}

@layer base {
  body {
    @apply bg-heritage-cream text-heritage-ink font-sans antialiased;
  }
}

.glass-panel {
  @apply bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm;
}

.swara-card {
  @apply p-4 bg-heritage-paper border border-heritage-ink/5 rounded-xl shadow-sm transition-all hover:shadow-md hover:border-heritage-gold/30;
}

.scan-line {
  @apply absolute left-0 w-full h-1 bg-heritage-gold/50 shadow-[0_0_15px_rgba(197,160,89,0.5)] z-10;
}
```

---

## Step 4: Create Utility Functions
Create `src/utils.ts` for class merging:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Step 5: Setup Gemini AI Service
Create `src/geminiService.ts`. You will need to use `import.meta.env` for environment variables in Vite.

```typescript
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenAI(apiKey);

export async function analyzeSwaralipi(imageData: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Analyze this Swaralipi image. Identify swaras. Return JSON: { \"swaras\": [ { \"note\": \"Sa\", \"devanagari\": \"सा\", \"number\": 1, \"confidence\": 0.98 } ], \"overall_accuracy\": 0.95, \"raga_suggestion\": \"Bhairavi\" }";

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: imageData.split(',')[1], mimeType: "image/jpeg" } }
  ]);

  return JSON.parse(result.response.text());
}
```

---

## Step 6: Environment Variables
Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

---

## Step 7: Implementation of App.tsx
Copy the main application logic into `src/App.tsx`. Ensure you import the components and hooks correctly as shown in the project files.

---

## Step 8: Running the App
Start the development server:

```bash
npm run dev
```
Open the provided URL (usually `http://localhost:5173`) in your browser.

## Key Features to Note
1. **YOLOv8 Simulation**: The UI simulates the scanning process with a moving "scan line" animation.
2. **Local Storage**: Saved scans are persisted in the browser's `localStorage`.
3. **Responsive Design**: The Navigation Rail is fixed to the left, providing a professional dashboard feel.
