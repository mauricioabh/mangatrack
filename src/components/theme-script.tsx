import { THEME_COOKIE_NAME, THEME_STORAGE_KEY } from "@/lib/theme-preference";

/**
 * Runs before React hydrates so PWA cold start does not flash the wrong theme
 * while next-themes reads localStorage.
 */
export function ThemeScript() {
  const code = `
(function () {
  var storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
  var cookieName = ${JSON.stringify(THEME_COOKIE_NAME)};
  try {
    var match = document.cookie.match(new RegExp("(?:^|; )" + cookieName + "=([^;]*)"));
    var cookieTheme = match ? decodeURIComponent(match[1]) : null;
    var storedTheme = localStorage.getItem(storageKey);
    var theme = storedTheme || cookieTheme || "dark";
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
