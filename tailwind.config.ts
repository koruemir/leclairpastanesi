import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './public/**/*.{ts,tsx,js,jsx,html}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        base: {
          background: '#f7f3ed',
          surface: '#fffaf4',
          muted: '#efebe2',
          text: '#211d19',
          accent: '#2f6c52',
        },
      },
      boxShadow: {
        soft: '0 10px 30px -20px rgba(30, 21, 14, 0.35)',
      },
      borderRadius: {
        lg: '0.9rem',
      },
    },
  },
  plugins: [],
};

export default config;
