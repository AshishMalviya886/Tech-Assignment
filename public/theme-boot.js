/**
 * Early theme bootstrap — prevents flash of wrong theme before React mounts.
 * Keep in sync with ThemeContext STORAGE_KEY.
 */
(function () {
  try {
    var key = 'rentverse-theme';
    var saved = localStorage.getItem(key);
    var dark =
      saved === 'dark' ||
      (saved !== 'light' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
