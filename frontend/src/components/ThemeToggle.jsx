import { useEffect, useState } from 'react';

const STORAGE_KEY = 'aegora-theme';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const initial = saved || 'light';
      setTheme(initial);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(initial);
    } catch {}
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(next);
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="px-3 py-2 rounded-md text-sm font-medium transition-colors border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}


