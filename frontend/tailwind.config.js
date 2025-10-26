module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'terminal-green': '#00ff00',
        'terminal-red': '#ff0000',
        'terminal-blue': '#0099ff',
        'terminal-yellow': '#ffff00',
      },
      fontFamily: {
        'press-start': ['"Press Start 2P"', 'monospace'],
        'vt323': ['"VT323"', 'monospace'],
      },
    },
  },
  plugins: [],
};
