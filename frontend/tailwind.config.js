// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Đảm bảo đường dẫn này đúng
  ],
  theme: {
    extend: {
      // 1. Mở rộng bảng màu của Tailwind
      colors: {
        // 2. Đặt tên semantic (dễ nhớ) và trỏ vào CSS Variable
        'primary': 'var(--color-primary)',
        'accent': 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'background': 'var(--color-background)',
        'surface': 'var(--color-surface)',
        
        // Màu text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-on-dark': 'var(--text-on-dark)',
        'text-accent': 'var(--text-accent)',
      }
    },
  },
  plugins: [],
}