/**
 * Opt-in page counts (audit PROD-14): Vercel Web Analytics, which is cookieless and served from this
 * site, loads only after the visitor accepts the org's banner (consent.js). It never loads on a fork
 * or locally: consent.js is dropped from a fork's build and does nothing off the public hosts, so
 * window.AILConsent never exists there.
 *
 * Every URL is cut to its path before it is sent. The Spectrum page keeps a reader's own numbers
 * (bankroll, stake, edge) in its query string, and those must never leave the browser.
 * Withdrawing consent stops sending at once, without a reload.
 */
(function () {
  'use strict';
  var consent = window.AILConsent;
  if (!consent) return;
  /** Path only: the Spectrum page keeps a reader's numbers in its query string. */
  function clean(event) {
    if (!consent.granted()) return null;
    var url = new URL(event.url, location.href);
    return Object.assign({}, event, { url: url.origin + url.pathname });
  }

  consent.whenGranted(function () {
    if (window.va) return;
    window.va = function () { (window.vaq = window.vaq || []).push(arguments); };
    window.va('beforeSend', clean);
    var s = document.createElement('script');
    s.src = '/_vercel/insights/script.js';
    s.defer = true;
    document.head.appendChild(s);
  });
})();

/** A step worth counting that has no page of its own, sent as a view of `path`. A no-op without consent. */
function countStep(path) {
  if (window.va) window.va('pageview', { route: path, path: path });
}
