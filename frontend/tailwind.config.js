/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          bg: '#D4E5EC',          // Soft pastel sky-blue
          card: '#FFFFFF',        // Pure White
          border: '#BCCED7',      // Subtle border
          navy: '#0F172A',        // Dark Navy
          slate: '#1E293B',       // Dark Slate
          muted: '#64748B',       // Muted Slate
          blueborder: '#94A3B8',  // Border for secondary
          primary: '#2563EB',     // Rich Royal Blue
          secondary: '#E2E8F0',   // Soft Slate Blue
          mintbg: '#DCFCE7',      // Soft Mint Green
          emeraldtext: '#15803D', // Dark Emerald
          redbg: '#FEE2E2',       // Soft Light Red
          redtext: '#B91C1C',     // Dark Coral Red
          redborder: '#FCA5A5',   // Red Border
          emerald: '#10B981'      // Vibrant Emerald Green
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
