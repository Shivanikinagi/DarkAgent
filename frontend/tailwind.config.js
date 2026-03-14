/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'vault-bg': '#1a1d23',
        'vault-text': '#f7f3e9',
        'vault-green': '#00ff88',
        'vault-blue': '#0ea5e9',
        'vault-slate': '#4a5568',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

