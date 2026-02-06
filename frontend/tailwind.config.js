/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border, 214 32% 91%))',
        background: 'hsl(var(--background, 0 0% 100%))',
        foreground: 'hsl(var(--foreground, 222 47% 11%))',
        // Acoustic Brand Colors - NO GRADIENTS
        primary: {
          DEFAULT: '#F07E22', // Acoustic Orange
          50: '#FEF3E7',
          100: '#FDE7CF',
          200: '#FBCF9F',
          300: '#F9B76F',
          400: '#F79F3F',
          500: '#F07E22', // Main
          600: '#D96A0F',
          700: '#B4560C',
          800: '#8F420A',
          900: '#6A2E07',
        },
        secondary: {
          DEFAULT: '#3F3091', // Acoustic Deep Purple
          50: '#F0EDF9',
          100: '#E1DBF3',
          200: '#C3B7E7',
          300: '#A593DB',
          400: '#876FCF',
          500: '#3F3091', // Main
          600: '#35287A',
          700: '#2B2063',
          800: '#21184C',
          900: '#171035',
        },
        // Neutrals
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
