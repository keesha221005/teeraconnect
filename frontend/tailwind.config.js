/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          bg: '#F5F7FA',       // Very light, clean soft background
          card: '#FFFFFF',     // Clean white card background
          teal: '#0D9488',     // Soft vibrant ocean teal
          lightTeal: '#E6F4F1',// Very light soft teal for chips/accents
          sandy: '#E8A33D',    // Sandy accent for warnings/caution
          red: '#E5484D',      // Soft red for danger/storm alerts
          dark: '#1C1917',     // High contrast text
          muted: '#57534E'     // Muted grey for supporting text
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
