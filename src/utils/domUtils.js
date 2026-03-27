/**
 * domUtils.js — intentionally vulnerable utilities for OWASP ZAP thesis demonstration.
 *
 * VULN [10110]: Dangerous JS Functions
 *   eval() is flagged by ZAP's passive scanner as a dangerous sink that can execute
 *   arbitrary code if the argument is user-controlled.
 *
 * VULN [40026]: DOM-Based XSS
 *   renderSearchLabel() reads from location.search (user-controlled source) and writes
 *   to innerHTML without sanitization (dangerous sink).
 */

/**
 * Evaluates a user-supplied climate filter expression.
 * Intentionally uses eval() — ZAP rule 10110.
 */
export function evalFilterExpression(expression) {
  return eval(expression)
}

/**
 * Renders the ?q= URL parameter directly into the DOM.
 * Source: location.search (user-controlled)
 * Sink:   innerHTML (executes injected HTML/JS)
 * ZAP rule 40026 (DOM-Based XSS).
 */
export function renderSearchLabel(elementId) {
  const params = new URLSearchParams(window.location.search)
  const query = params.get('q') || ''
  const el = document.getElementById(elementId)
  if (el) {
    el.innerHTML = 'Showing results for: ' + query
  }
}
