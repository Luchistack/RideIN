/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand (deep teal — trust, movement)
        brand: '#1F4E43',
        'brand-deep': '#163B33',
        'brand-tint': '#DCE7E1',
        'brand-light': '#5CB69A',
        'brand-tint-dark': '#1E2E28',

        // Accent (warm ochre — ratings, tips, highlights)
        accent: '#C7862E',
        'accent-deep': '#9C6620',
        'accent-tint': '#F0DCB8',
        'accent-light': '#E0A552',
        'accent-tint-dark': '#33291A',

        // Ink (text)
        ink: '#1B211D',
        'ink-soft': '#4B564F',
        'ink-faint': '#7A8479',
        'ink-dark': '#E9E7DD',
        'ink-soft-dark': '#ADB6AA',
        'ink-faint-dark': '#7C877E',

        // Surfaces
        paper: '#EFF1EA',
        'paper-dark': '#121613',
        surface: '#FFFFFF',
        'surface-dark': '#1B211D',
        'surface-2': '#E7E9E0',
        'surface-2-dark': '#232B25',

        // Lines / status
        line: '#DAD9CE',
        'line-dark': '#2B322C',
        good: '#2F7D5E',
        'good-dark': '#5CB69A',
        danger: '#B3452C',
        'danger-dark': '#D97A5F',

        // Map background (estate road illustration)
        map: '#DCE7DE',
        'map-dark': '#1A231D',
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Work Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(27,33,29,0.06), 0 8px 24px rgba(27,33,29,0.08)',
      },
      keyframes: {
        // A continuous 360° turntable spin around the vertical axis — used
        // by the decorative homepage phone showcase (AnimatedPhoneShowcase),
        // never on anything interactive.
        spinY: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        spinY: 'spinY 14s linear infinite',
        floatY: 'floatY 4.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
