import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

/**
 * LinkedIn-style light/dark toggle — icon button that flips theme.
 */
function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors
        border-secondary-200 text-secondary-600 hover:bg-secondary-100
        dark:border-secondary-600 dark:text-secondary-200 dark:hover:bg-secondary-800
        ${className}`}
    >
      {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}

export default ThemeToggle;
