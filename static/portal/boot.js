/**
 * Loads Slate JSX in dependency order inside one compile unit:
 * each module runs in an IIFE (no top-level const collisions), then one Babel.transform + one eval.
 * Fewer moving parts than seven separate evals; classic JSX runtime avoids react/jsx-runtime issues.
 */
(function slateBoot() {
  function showHtml(html) {
    var el = document.getElementById('root');
    if (el) el.innerHTML = html;
  }

  if (typeof Babel === 'undefined') {
    showHtml(
      '<p style="padding:24px;font-family:system-ui,sans-serif;max-width:42em;line-height:1.5"><strong>Babel did not load.</strong> The <code>vendor/</code> folder must include <code>babel.min.js</code> next to <code>index.html</code>.</p>' +
        '<p style="padding:0 24px;font-size:13px;color:#666">If you copied only some files, re-copy the whole project or run your server from the folder that contains <code>vendor/</code> and all <code>.jsx</code> files.</p>'
    );
    return;
  }
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    showHtml(
      '<p style="padding:24px;font-family:system-ui,sans-serif;max-width:42em"><strong>React did not load.</strong> Add <code>vendor/react.development.js</code> and <code>vendor/react-dom.development.js</code>.</p>'
    );
    return;
  }

  var modules = [
    'charts.jsx',
    'disclaimer-modal.jsx',
    'shell.jsx',
    'intake.jsx',
    'screens.jsx',
    'alts-structured.jsx',
    'book.jsx',
    'app-main.jsx',
  ];

  function reactPresets() {
    try {
      if (Babel.availablePresets && Babel.availablePresets.react) {
        return [[Babel.availablePresets.react, { runtime: 'classic' }]];
      }
    } catch (e) { /* ignore */ }
    return ['react'];
  }

  async function run() {
    var loadingTimer = window.setTimeout(function () {
      if (!window.__SLATE_BOOT_OK) {
        showHtml(
          '<p style="padding:24px;font-family:system-ui,sans-serif;color:#444">Loading</p>'
        );
      }
    }, 3000);
    try {
      var chunks = [];
      for (var i = 0; i < modules.length; i++) {
        var name = modules[i];
        var base =
          typeof window.__SLATE_PORTAL_ROOT__ === 'string' && window.__SLATE_PORTAL_ROOT__
            ? window.__SLATE_PORTAL_ROOT__
            : document.baseURI;
        var url = new URL(name, base).href;
        var res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(
            'Could not load ' +
              name +
              ' (HTTP ' +
              res.status +
              '). Serve this directory with a local server, e.g. <code>python3 -m http.server 8080</code> — do not open <code>index.html</code> as a <code>file://</code> URL.'
          );
        }
        var src = await res.text();
        chunks.push('\n;(function(__slateModule){\n' + src + '\n})(' + JSON.stringify(name) + ');\n');
      }
      var bundle = chunks.join('');
      var out = Babel.transform(bundle, {
        presets: reactPresets(),
        filename: 'slate-bundle.jsx',
      }).code;
      if (loadingTimer) {
        window.clearTimeout(loadingTimer);
        loadingTimer = null;
      }
      (0, eval)(out);
      window.__SLATE_BOOT_OK = true;
    } catch (err) {
      if (loadingTimer) {
        window.clearTimeout(loadingTimer);
        loadingTimer = null;
      }
      console.error('Slate boot error', err);
      showHtml(
        '<p style="padding:24px;font-family:system-ui,sans-serif;max-width:42em;line-height:1.5"><strong>Slate failed to load.</strong> ' +
          String(err && err.message ? err.message : err) +
          '</p><p style="padding:0 24px 24px;font-size:13px;color:#666">Open DevTools → Console for the stack trace. Typical fixes: run from the project folder with <code>python3 -m http.server</code>; confirm <code>vendor/</code> exists; hard-refresh (clear cache).</p>'
      );
    }
  }

  run();
})();
