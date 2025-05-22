import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{tsx,mdx}'],
  theme: {
    colors: {
      'white': '#ffffff',
      'black': '#000000',
      'off-white': '#FAFAFA',
      'off-black': '#2B2E33',
      'primary-4': '#F4ECE1',
      'primary-3': '#DACBB8',
      'primary-2': '#9F614C',
      'primary-1': '#85461E',
      'danger': '#B92C00',
    },
    fontFamily: {
      display: ['var(--font-tt-travels-next-trl)'],
    },
  },
};

export default config;
