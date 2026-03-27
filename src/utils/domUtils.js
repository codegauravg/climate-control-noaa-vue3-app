/**
 * domUtils.js — safe DOM utilities (hardened version).
 *
 * All functions use textContent or createElement — never innerHTML,
 * document.write, or eval — to eliminate DOM-based XSS attack surfaces.
 */

/**
 * Safely sets the text content of a DOM element.
 * Uses textContent so no HTML is parsed; any injected markup is rendered
 * as literal text rather than executed.
 *
 * @param {string} elementId
 * @param {string} text
 */
export function setElementText(elementId, text) {
  const el = document.getElementById(elementId)
  if (el) {
    el.textContent = String(text)
  }
}
