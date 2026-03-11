/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1976D2',
          dark: '#1565C0',
          light: '#BBDEFB',
          container: '#E3F2FD',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          variant: '#F5F5F5',
        },
        background: '#FAFAFA',
        'on-primary': '#FFFFFF',
        'on-surface': '#212121',
        'on-surface-variant': '#757575',
        outline: { DEFAULT: '#E0E0E0', variant: '#BDBDBD' },
        error: { DEFAULT: '#D32F2F', container: '#FFEBEE' },
        warning: { DEFAULT: '#F57C00', container: '#FFF3E0' },
        success: { DEFAULT: '#388E3C', container: '#E8F5E9' },
        info: { DEFAULT: '#0288D1', container: '#E1F5FE' },
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
