export function detectBrowser() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'chrome';
  if (/OPR\//.test(ua) || /Opera/.test(ua)) return 'chrome';
  if (/Chrome/.test(ua)) return 'chrome';
  if (/Firefox/.test(ua)) return 'firefox';
  if (/Safari/.test(ua)) return 'safari';
  return 'chrome';
}

export function isBrowserSupported(game, currentBrowser) {
  const browser = currentBrowser || detectBrowser();
  return !game.browsers || game.browsers.includes(browser);
}
