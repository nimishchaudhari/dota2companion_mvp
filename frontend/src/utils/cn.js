// frontend/src/utils/cn.js
// Simple className utility for combining Tailwind classes
// This replaces the need for clsx or classnames library

export function cn(...classes) {
  return classes
    .flat()
    .filter(Boolean)
    .join(' ');
}