import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        pretendard: ['Pretendard', 'system-ui', 'sans-serif'],
        poly: ['Poly', 'serif'],
      },
      spacing: {
        '2.5': '10px',
        '12.5': '50px',
        '35': '140px',
      },
      borderColor: {
        'black/8': 'rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
