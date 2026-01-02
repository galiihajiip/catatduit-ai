import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16A085',
          light: '#1ABC9C',
        },
        accent: {
          blue: '#3498DB',
          orange: '#F39C12',
          red: '#E74C3C',
        },
        background: '#F7F9FB',
        card: '#FFFFFF',
        text: {
          primary: '#2C3E50',
          secondary: '#7F8C8D',
        },
        category: {
          food: '#E74C3C',
          transport: '#3498DB',
          bills: '#F39C12',
          household: '#9B59B6',
          shopping: '#1ABC9C',
          entertainment: '#E91E63',
          health: '#00BCD4',
          income: '#16A085',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
      },
      boxShadow: {
        'card': '0px 4px 12px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
export default config
