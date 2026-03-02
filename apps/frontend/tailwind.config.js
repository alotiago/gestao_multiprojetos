/** @type {import('tailwindcss').Config} */
const path = require('path');

module.exports = {
  content: [
    path.join(__dirname, './src/pages/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, './src/components/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, './src/app/**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    extend: {
      colors: {
        // HW1 Brand Colors
        'hw1-navy':     '#050439',
        'hw1-blue':     '#1E16A0',
        'hw1-purple':   '#35277D',
        'hw1-pink':     '#E52287',
        'hw1-teal':     '#00B3AD',
        'hw1-hot-pink': '#F70085',
        'hw1-cyan':     '#00DDD5',
        'hw1-teal-green':'#009792',
        'hw1-black':    '#0D0E0E',
        'hw1-white':    '#FFFFFF',
        // Semantic aliases
        primary:   '#1E16A0',
        secondary: '#00B3AD',
        accent:    '#E52287',
        dark:      '#050439',
      },
      fontFamily: {
        heading:   ['var(--font-montserrat)', 'sans-serif'],
        body:      ['var(--font-open-sans)', 'sans-serif'],
        secondary: ['var(--font-cabin)', 'sans-serif'],
      },
      backgroundImage: {
        'hw1-gradient': 'linear-gradient(135deg, #050439 0%, #1E16A0 50%, #35277D 100%)',
        'hw1-accent':   'linear-gradient(90deg, #E52287 0%, #F70085 100%)',
        'hw1-teal-grad':'linear-gradient(90deg, #00B3AD 0%, #00DDD5 100%)',
      },
      boxShadow: {
        'hw1': '0 4px 24px rgba(30, 22, 160, 0.15)',
        'hw1-lg': '0 8px 40px rgba(5, 4, 57, 0.25)',
      },
    },
  },
  plugins: [],
};
