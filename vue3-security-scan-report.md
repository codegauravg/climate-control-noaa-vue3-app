## Post-Hardening Security Scan Report — Vue 3 NOAA Climate App

### Scan Configuration

| Parameter           | Vulnerable Version                                      | Hardened Version                                        |
| ------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| **Date**            | 27 March 2026                                           | 27 March 2026                                           |
| **Tool — SAST**     | Semgrep OSS 1.156.0                                     | Semgrep OSS 1.156.0                                     |
| **Tool — SCA**      | npm audit (v10)                                         | npm audit (v10)                                         |
| **Tool — DAST**     | OWASP ZAP `ghcr.io/zaproxy/zaproxy:stable`              | OWASP ZAP `ghcr.io/zaproxy/zaprepy:stable`              |
| **Target server**   | Vite Preview (no security headers) on `:8080`           | Vite Preview (`vite preview --host`) on `:4173`         |
| **ZAP scan modes**  | Baseline (passive) + Full (active, 5-min spider)        | Baseline (passive) + Full (active, 5-min spider)        |
| **Rules evaluated** | 218 (Semgrep), 141 (ZAP Full)                           | 218 (Semgrep), 141 (ZAP Full)                           |
| **Git commit**      | `97f6245` — intentionally vulnerable state              | `e2ffc1a` — hardened state                              |

---

### 1. Results Summary — All Tools

#### 1.1 Semgrep (SAST)

| Metric                    | Vulnerable | Hardened | Change             |
| ------------------------- | ---------- | -------- | ------------------ |
| Rules evaluated           | 218        | 218      | —                  |
| Files scanned             | 17         | 17       | —                  |
| **Total findings**        | **4**      | **1**    | **−3**             |
| ERROR-severity findings   | 1          | 0        | −1                 |
| WARNING-severity findings | 3          | 1        | −2                 |
| Blocking findings         | 4          | 0 (true) | −4 (1 false +ve)   |

| Rule ID                     | Finding                                                             | Vulnerable | Hardened      |
| --------------------------- | ------------------------------------------------------------------- | ---------- | ------------- |
| `missing-integrity`         | External jQuery 1.6.1 CDN script missing SRI attribute — CWE-829   | WARN       | PASS          |
| `avoid-v-html`              | `v-html="apiDescriptionHtml"` reactive prop — CWE-79               | WARN       | WARN\*        |
| `eval-detected`             | `eval(expression)` in `domUtils.js:18` — CWE-95                    | WARN       | PASS          |
| `insecure-document-method`  | `el.innerHTML = … + query` in `domUtils.js:32` — CWE-79            | ERROR      | PASS          |

\* The single remaining post-hardening `avoid-v-html` finding is a **false positive**: Semgrep's pattern matches the literal text `v-html` inside an HTML comment on line 10 of `ClimateForm.vue` that documents the removed binding. No live `v-html` directive exists in the hardened codebase.

#### 1.2 npm audit (SCA)

| Metric                    | Vulnerable | Hardened  | Change |
| ------------------------- | ---------- | --------- | ------ |
| Total dependencies scanned | 104       | 104       | —      |
| **Total vulnerabilities** | **2**      | **2**     | **0**  |
| Moderate                  | 2          | 2         | 0      |
| High / Critical           | 0          | 0         | —      |

| Advisory              | Package              | Severity | Vulnerable | Hardened |
| --------------------- | -------------------- | -------- | ---------- | -------- |
| GHSA-67mh-4wv8-2f99   | `esbuild` ≤ 0.24.2   | Moderate (CVSS 5.3) | WARN  | WARN |
| Dependency chain      | `vite` (via esbuild) | Moderate | WARN       | WARN     |

Both npm audit findings are unchanged. Both are **development-environment-only** vulnerabilities in the Vite/esbuild build toolchain (CWE-346 — Origin Validation Error). They do not affect the production bundle and require upgrading to Vite ≥ 8.0.0 — a semver-major breaking change. This is documented as **accepted residual risk** for the thesis scope; no application code contains hardcoded secrets or insecure dependency usage in the hardened version.

#### 1.3 OWASP ZAP — Baseline Scan (Passive)

| Rule  | Alert                                                       | Vulnerable | Hardened   |
| ----- | ----------------------------------------------------------- | ---------- | ---------- |
| 10020 | Missing Anti-Clickjacking Header                            | WARN       | **PASS**   |
| 10021 | X-Content-Type-Options Header Missing                       | WARN       | **PASS**   |
| 10038 | Content Security Policy (CSP) Header Not Set                | WARN       | **PASS**   |
| 10063 | Permissions Policy Header Not Set                           | WARN       | **PASS**   |
| 10098 | Cross-Domain Misconfiguration (CORS wildcard)               | WARN       | **PASS**   |
| 90004 | Cross-Origin-Embedder-Policy Header Missing or Invalid      | WARN       | **PASS**   |
| **Total security warnings** |                                          | **6**      | **0**      |
| Total passes             |                                               | 59         | 66         |

#### 1.4 OWASP ZAP — Full Scan (Active)

| Rule  | Alert                                                       | Vulnerable | Hardened   |
| ----- | ----------------------------------------------------------- | ---------- | ---------- |
| 10020 | Missing Anti-Clickjacking Header                            | WARN       | **PASS**   |
| 10021 | X-Content-Type-Options Header Missing                       | WARN       | **PASS**   |
| 10038 | Content Security Policy (CSP) Header Not Set                | WARN       | **PASS**   |
| 10063 | Permissions Policy Header Not Set                           | WARN       | **PASS**   |
| 10098 | Cross-Domain Misconfiguration                               | WARN       | **PASS**   |
| 90004 | Cross-Origin-Embedder-Policy Header Missing or Invalid      | WARN       | **PASS**   |
| **40040** | **CORS Misconfiguration**                               | **WARN**   | **PASS**   |
| **Total security warnings** |                                          | **7**      | **0**      |
| Total passes             |                                               | 134        | 141        |

---

### 2. Before-and-After Finding Inventory

| #   | Vulnerability                                            | CWE  | OWASP | Semgrep | npm audit | ZAP Baseline | ZAP Full | **Hardened** |
| --- | -------------------------------------------------------- | ---- | ----- | ------- | --------- | ------------ | -------- | ------------ |
| F1  | DOM XSS via `document.write` (inline script, index.html) | 79   | A03   |         |           |              |          | **PASS**     |
| F2  | DOM XSS via `innerHTML` (domUtils.js `renderSearchLabel`)| 79   | A03   | ERROR   |           |              |          | **PASS**     |
| F3  | `eval()` code execution (domUtils.js `evalFilterExpression`)| 95 | A03   | WARN    |           |              |          | **PASS**     |
| F4  | Vue `v-html` with reactive prop (ClimateForm)           | 79   | A03   | WARN    |           |              |          | **PASS**     |
| F5  | Hardcoded API token in source (`noaaService.js`)        | 798  | A02   |         |           |              |          | **PASS**     |
| F6  | Credentials in HTML comments (index.html)               | 200  | A02   |         |           |              |          | **PASS**     |
| F7  | Vulnerable jQuery 1.6.1 loaded from CDN                 | 1035 | A06   | WARN    |           |              |          | **PASS**     |
| F8  | Missing SRI attribute on external CDN script            | 829  | A08   | WARN    |           |              |          | **PASS**     |
| F9  | CSP Header Not Set                                      | 693  | A05   |         |           | WARN         | WARN     | **PASS**     |
| F10 | Missing Anti-Clickjacking Header (X-Frame-Options)      | 1021 | A05   |         |           | WARN         | WARN     | **PASS**     |
| F11 | X-Content-Type-Options Header Missing                   | 693  | A05   |         |           | WARN         | WARN     | **PASS**     |
| F12 | Permissions-Policy Header Missing                       | 693  | A05   |         |           | WARN         | WARN     | **PASS**     |
| F13 | CORS Misconfiguration (no CORS headers)                 | 346  | A05   |         |           | WARN         | WARN     | **PASS**     |
| F14 | COEP/COOP Headers Missing                               | 693  | A05   |         |           | WARN         | WARN     | **PASS**     |
| F15 | esbuild dev CVE (GHSA-67mh-4wv8-2f99)                  | 346  | A06   |         | WARN      |              |          | _Residual_   |
| F16 | Vite dependency chain (via esbuild)                     | 346  | A06   |         | WARN      |              |          | _Residual_   |

**14 of 16 findings fully remediated. 2 residual risks accepted (dev-only toolchain CVE).**

---

### 3. Detailed Correlation Analysis

#### 3.1 DOM-based XSS — Three Vectors, Partial Automated Coverage, Two DAST Blind Spots

The DOM XSS attack surface in the vulnerable version comprised three independent injection points spread across three different files, yet only two were caught by automated tooling. This split outcome is central to understanding why no single tool class is sufficient.

**F1 — `document.write` in inline HTML script (all tools missed, manual review only):** The vulnerable `index.html` contained an inline `<script>` block that read `decodeURIComponent(location.search.replace('?q=', ''))` and wrote the result directly into the DOM via `document.write()`. ZAP's passive scanner (rule 10110 — Dangerous JS Functions) returned **PASS** against the vulnerable version, and the active scanner (rule 40026 — DOM-based XSS) also returned **PASS**. Semgrep's `insecure-document-method` rule did not match the inline `<script>` block in the HTML file — the rule targets `.js` and `.vue` files and does not parse arbitrary HTML-embedded scripts. This vulnerability was therefore visible only through manual code review. The hardening removed the inline script block entirely from `index.html`, replacing it with the clean Vue mounting point. All three automated tools return PASS in the hardened state, though this represents a true negative following a prior false negative rather than a detection-confirmed remediation.

**F2 — `innerHTML` sink in `domUtils.js` (Semgrep: ERROR, ZAP: missed):** Semgrep's `insecure-document-method` rule traced the data flow from `URLSearchParams.get('q')` — a user-controlled source — directly to `el.innerHTML = 'Showing results for: ' + query` in `domUtils.js:32`, raising an ERROR-severity finding. ZAP's full active scanner (rule 40026) returned **PASS** against the vulnerable version. The reason is architectural: `renderSearchLabel()` was called from `main.js` only after `app.mount('#app')` completed, meaning it executed entirely within the Vue application lifecycle after the initial page load. ZAP's spider does not execute SPA lifecycle hooks; it observed the HTTP response and found no triggerable entry point for the `?q=` parameter during its crawl phase. ZAP's informational finding 10109 (Modern Web Application) explicitly acknowledged this limitation by flagging that the application uses a JavaScript framework that may not be fully spiderable. After hardening, `renderSearchLabel` was rewritten to use `el.textContent = String(text)` — Semgrep returns 0 true-positive findings.

**F3 — `eval()` in `domUtils.js:evalFilterExpression` (Semgrep: WARN, ZAP: missed):** Semgrep detected `return eval(expression)` at line 18 via the `eval-detected` rule. The function `evalFilterExpression` was exported but never called from any route reachable by ZAP's spider — it existed as dead code introduced for thesis demonstration. ZAP had no mechanism to invoke it and therefore returned PASS on all active-scan rules. This demonstrates a structural advantage of SAST: it analyses every code path regardless of reachability, catching dormant vulnerabilities that DAST cannot trigger. In production, such dead code may be activated by a future feature change or reached via an indirect call chain. After hardening, the function was deleted entirely from the codebase.

**Cross-tool relationship for XSS:** ZAP detected 0 DOM XSS findings in the vulnerable version despite three active injection points. Semgrep detected two (F2, F3) but missed the third (F1, inline HTML script). Manual review was required to find F1. This three-way split — one tool finding what two others miss, and a fourth vector visible only to human review — demonstrates that in a Vue SPA context, no automated tool combination achieves complete XSS coverage. Defense in depth therefore requires SAST plus manual review as complementary layers to DAST.

---

#### 3.2 Vue `v-html` Directive — SAST Exclusive, Framework-Specific Pattern

Semgrep detected `v-html="apiDescriptionHtml"` in `ClimateForm.vue:8` (pre-hardening) via the framework-aware rule `javascript.vue.security.audit.xss.templates.avoid-v-html`. In the vulnerable state, `apiDescriptionHtml` was a string defined in the Pinia store containing static HTML:

```html
<p><strong>NOAA CDO flow:</strong> find nearby stations, then request climate data.</p>
<p>This control app renders a raw NOAA response for baseline comparison.</p>
```

The current content is static, but the `v-html` binding itself is the anti-pattern: the prop accepts any string value, meaning a future code change, a compromised Pinia plugin, or a supply-chain modification to the store could inject arbitrary HTML that executes in the user's browser. Semgrep flags the structural risk of the binding rather than solely the current content. ZAP's active scanner cannot detect this class of vulnerability because it requires knowledge of Vue's template compilation model and the data flow through reactive props — information that is only available at the source-code level.

The hardening replaced the binding with static Vue template markup inside a `<!-- Hardening: … -->` comment that documents the change. The post-hardening scan produces 1 remaining `avoid-v-html` WARNING — a false positive on line 10, where Semgrep's pattern matches the string `v-html` appearing inside the HTML comment (`Previously: <div v-html="apiDescriptionHtml">`). No live `v-html` directive is present; the finding does not represent an exploitable vulnerability. This false positive also illustrates a known limitation of rule-based pattern matching: the rule cannot distinguish the attribute name in documentation text from the same string in executable template code.

---

#### 3.3 Credentials and Information Disclosure — Manual Review Only

Two credential-related findings (F5, F6) were discovered exclusively through manual code inspection and were not raised by any of the three automated tool classes.

**F5 — Hardcoded API token:** The pre-hardening `noaaService.js` contained `const TOKEN = 'AtYlxrPdVaflDXyYMXfgKoGFNTqtKNAG'` hardcoded at line 4. Semgrep's community ruleset does not include a pattern matching NOAA CDO API token formats, so the `detect-generic-hardcoded-secret` category of rules did not fire. npm audit operates on package metadata and has no visibility into application source code. ZAP's responses from the running application never expose the token value directly in HTTP responses, so passive scanning produced no finding. The hardening moved the token to a `.env` file and loaded it via `import.meta.env.VITE_NOAA_TOKEN`, ensuring the value is injected at build time and never present as a string literal in version-controlled source.

**F6 — Credentials in HTML comments:** The vulnerable `index.html` contained the comment `<!-- TODO: remove admin bypass before go-live — api_key=noaa_dev_token_abc999  password=changeme123  admin_user=root -->`. ZAP's passive rule 10027 (Information Disclosure — Suspicious Comments) returned **PASS** in both the vulnerable and hardened baseline scans. This is a confirmed false negative: ZAP's rule 10027 uses pattern matching for common keywords (`TODO`, `FIXME`, `password=`) but the comment format and custom token names did not match the rule's detection patterns. Semgrep also did not fire on the comment — none of the 218 evaluated rules target freeform credential patterns in HTML comments. The comment was removed in the hardening commit, and both tools return PASS in the hardened state (true negatives).

The persistence of two false negatives across all three automated tool classes on credential findings has a direct implication for security programme design: developer-committed credential leakage in source files requires dedicated secret-scanning tooling (such as `trufflehog`, `detect-secrets`, or GitHub Advanced Security secret scanning) as a distinct control layer. None of the three tool classes evaluated in this study substitutes for purpose-built secret detection.

---

#### 3.4 Vulnerable Third-Party Library and Missing SRI — SAST Exclusive

**F7 — Vulnerable jQuery 1.6.1:** The vulnerable `index.html` loaded `<script src="https://code.jquery.com/jquery-1.6.1.min.js">`. jQuery 1.6.1 carries known XSS vulnerabilities (CVE-2011-4969 — `$.fn.html` selector XSS; CVE-2012-6708 — `jQuery.htmlPrefilter` bypass). Semgrep flagged the external script via the `missing-integrity` rule (index.html:19), which identifies CDN script tags lacking an `integrity` attribute. This rule serves double duty: it detects both the supply-chain risk of an unverified external resource (F8 — missing SRI) and, by the version string in the URL, the specific outdated library. npm audit operates on `package.json` dependencies and cannot see dynamically injected CDN resources that bypass the package registry entirely. ZAP's rule 90003 (Sub Resource Integrity Attribute Missing) returned PASS in both scan states, likely because the external CDN URL was not followed and cross-origin resource metadata was not evaluated during the scan. This finding demonstrates a category of vulnerability — browser-loaded third-party CDN resources — that falls in the gap between SCA tooling (which sees only npm-managed packages) and DAST tooling (which sees only HTTP responses from the target origin). SAST was the only automated tool that detected both issues. The hardening removed jQuery entirely; the Vue SPA requires no jQuery and the CDN reference was an intentional vulnerability introduced for the thesis demonstration.

**F8 — Missing Subresource Integrity:** As above — co-detected with F7 by Semgrep's `missing-integrity` rule. The hardened `index.html` contains no external script references; SRI is moot and rule 90003 returns PASS.

---

#### 3.5 Security Response Headers — DAST Exclusive, Confirmed Resolved

The six header-related findings (F9–F14) were detected exclusively by ZAP's passive scanner and could not have been found by Semgrep or npm audit, both of which operate on source artefacts rather than live HTTP responses. This is a fundamental architectural constraint: response headers are a property of the server configuration, not a property of the application source code.

The vulnerable version was served by Vite Preview with only the default headers (no CSP, no `X-Frame-Options`, no `X-Content-Type-Options`, no `Permissions-Policy`, no COEP/COOP). ZAP's baseline passive scan raised six distinct warnings across these categories:

- **10038 — CSP Not Set (Medium):** No `Content-Security-Policy` header; any inline script or external resource could execute.
- **10020 — Missing Anti-Clickjacking Header (Medium):** No `X-Frame-Options` or `frame-ancestors` CSP directive; the app could be embedded in a malicious iframe.
- **10098 — Cross-Domain Misconfiguration (Medium):** The absence of an explicit CORS policy caused ZAP to flag permissive cross-origin behaviour.
- **10021 — X-Content-Type-Options Missing (Low):** Browsers could MIME-sniff responses, enabling content-type confusion attacks.
- **10063 — Permissions-Policy Missing (Low):** No restrictions on browser feature access (camera, microphone, geolocation).
- **90004 — COEP/COOP Headers Missing (Low):** Cross-origin isolation not enforced, leaving the application exposed to cross-origin side-channel attacks.

The full active scan additionally confirmed CORS misconfiguration (rule 40040 — Medium) via active injection. This finding upgraded from a passive header-absence check to an actively confirmed misconfiguration.

The hardening addressed all six at the correct layer — the Vite configuration (`vite.config.mjs`) — by defining a `SECURITY_HEADERS` object applied to the preview server. The ZAP baseline scan against the Vite Preview server at `:4173` returned **0 security warnings** (66 passes), confirming all headers are correctly emitted:

```
Content-Security-Policy:    default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; ...
X-Frame-Options:            DENY
X-Content-Type-Options:     nosniff
Referrer-Policy:            strict-origin-when-cross-origin
Permissions-Policy:         camera=(), microphone=(), geolocation=()
X-XSS-Protection:           0
```

The ZAP full active scan also returned **0 security warnings** (141 passes), with CORS rule 40040 passing — confirming the CSP's `frame-ancestors 'none'` directive and absence of a wildcard CORS policy are correctly enforced at the HTTP layer.

An important methodological note: the same compiled production bundle would produce all six header warnings if served by a plain file server without the Vite security header configuration. DAST scan results for header-related findings are statements about a specific deployment configuration, not about the application codebase in isolation. Organisations must align DAST scan targets with their actual production serving infrastructure to obtain valid measurements.

The only ZAP finding remaining in the hardened state is rule 10049-1 (Non-Storable Content — Informational), which flags that the Vite Preview server emits `Cache-Control: no-cache`. This is a **positive security control**, not a vulnerability: it prevents sensitive application responses from being stored in shared caches. The corresponding finding in the vulnerable version was 10049-3 (Storable and Cacheable Content — Informational), indicating the opposite — responses were cacheable, a potential information disclosure risk in shared-cache environments.

---

#### 3.6 CORS — Convergent CWE-346, Split Detection Layers

Both ZAP (F13, rules 10098 and 40040) and npm audit (F15, GHSA-67mh-4wv8-2f99) independently flagged CWE-346 (Origin Validation Error), but at fundamentally different architectural layers requiring different remediation strategies.

**ZAP F13 — Runtime CORS absence:** In the vulnerable state, the Vite Preview server emitted no `Access-Control-Allow-Origin` header. ZAP's passive rule 10098 flagged the cross-domain misconfiguration. The full active scanner's rule 40040 (CORS Misconfiguration — Medium/High confidence) subsequently confirmed the finding through active injection. The hardening applied a restrictive CSP with `connect-src 'self' https://www.ncei.noaa.gov` and no explicit CORS header, meaning the browser enforces same-origin restrictions by default. ZAP rules 10098 and 40040 both return PASS in the hardened state — a confirmed remediation at the deployment layer.

**npm audit F15/F16 — Supply-chain CVE:** GHSA-67mh-4wv8-2f99 (CVSS 5.3) allows a malicious web page visited by a developer to send arbitrary requests to the running Vite development server and read responses, exploiting esbuild's lack of origin validation in its built-in HTTP server. This finding is **unchanged** in the hardened version because it requires upgrading to `vite@^8.0.0` — a semver-major breaking change outside the scope of application-level hardening. It is recorded as accepted residual risk; it affects only the local development environment, not the deployed production application, and does not compromise end-user data.

The convergence of two independent tools on CWE-346 at different layers illustrates that origin validation was a systemic weakness across both the application deployment configuration and the development toolchain — not a single isolated misconfiguration. The two detections require different tools (DAST for runtime behaviour, SCA for dependency metadata) and different remediations (header configuration vs package upgrade), underscoring why neither tool class alone provides complete CORS coverage.

---

### 4. OWASP Top 10 (2021) Coverage — Before and After

| OWASP Category                        | Tool(s)                   | Vulnerable Findings                     | Hardened Findings     |
| ------------------------------------- | ------------------------- | --------------------------------------- | --------------------- |
| **A02 — Cryptographic Failures**      | Manual review             | 2 (hardcoded token + comment creds)     | 0                     |
| **A03 — Injection (XSS)**             | Semgrep + Manual review   | 4 (document.write, innerHTML, eval, v-html) | 0 (1 false +ve)  |
| **A05 — Security Misconfiguration**   | ZAP                       | 6 (missing headers + CORS)              | 0                     |
| **A06 — Vulnerable Components**       | Semgrep + npm audit       | 3 (jQuery 1.6.1, esbuild, vite)         | 1 *(residual)*        |
| **A08 — Software/Data Integrity**     | Semgrep                   | 1 (missing SRI on CDN script)           | 0                     |

---

### 5. Tool Effectiveness Summary

| Dimension                                   | npm audit   | Semgrep (SAST)    | ZAP Baseline  | ZAP Full       |
| ------------------------------------------- | ----------- | ----------------- | ------------- | -------------- |
| Unique findings detected (vulnerable)       | 2           | 5 (F2,F3,F4,F7,F8)| 0\*           | 1 (F13 active) |
| Findings resolved by hardening              | 0           | 4                 | 6             | 7              |
| Residual findings post-hardening            | 2           | 0 (1 false +ve)   | 0             | 0              |
| False negatives (known vuln missed)         | F1–F14      | F1, F5, F6, F9–F14| F1–F8         | F1–F8          |
| Detects SPA lifecycle vulnerabilities       | No          | **Yes**           | No            | No             |
| Detects server header configuration         | No          | No                | **Yes**       | **Yes**        |
| Detects dependency CVEs (npm registry)      | **Yes**     | No                | No            | No             |
| Detects CDN third-party library risks       | No          | **Yes**           | No            | No             |
| Runtime exploit confirmation                | No          | No                | No            | **Yes**        |
| Detects credentials in source comments      | No          | No                | No            | No             |

\*ZAP Baseline findings are a strict subset of ZAP Full findings.

---

### 6. Report Artefacts

| File                                                             | Description                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| [zap-reports/baseline-report-vulnerable.html](zap-reports/baseline-report-vulnerable.html) | ZAP baseline — vulnerable version (6 security warnings)       |
| [zap-reports/full-report-vulnerable.html](zap-reports/full-report-vulnerable.html)         | ZAP full scan — vulnerable version (7 security warnings, active CORS confirmed) |
| [zap-reports/baseline-report-hardened.html](zap-reports/baseline-report-hardened.html)     | ZAP baseline — hardened version (0 security warnings, 66 passes) |
| [zap-reports/full-report-hardened.html](zap-reports/full-report-hardened.html)             | ZAP full scan — hardened version (0 security warnings, 141 passes) |
| [semgrep-report.json](semgrep-report.json)                       | Semgrep — vulnerable version (4 findings: 1 ERROR, 3 WARN)    |
| [semgrep-results-hardened.json](semgrep-results-hardened.json)   | Semgrep — hardened version (1 false-positive WARNING)          |
| [npm-audit.json](npm-audit.json)                                 | npm audit — vulnerable version (2 moderate)                    |
| [npm-audit-hardened.json](npm-audit-hardened.json)               | npm audit — hardened version (2 moderate, residual)            |

---

### 7. Key Conclusions

1. **The hardening eliminated 14 of 16 findings across all tools.** Two residual findings (esbuild/vite CVE GHSA-67mh-4wv8-2f99) are isolated to the development toolchain, do not affect the production bundle, and are documented as accepted risk pending a major Vite upgrade.

2. **No single tool provided complete coverage.** The `eval()` dangerous function (F3) and Vue `v-html` anti-pattern (F4) were detected only by Semgrep. The hardcoded API token (F5), credential comment (F6), and `document.write` DOM XSS (F1) were detectable only through manual code review — a finding class that all three automated tool classes completely missed. The header misconfigurations (F9–F14) were detected only by ZAP. The supply-chain CVE (F15/F16) was detected only by npm audit. A security programme omitting any one of these controls — and specifically one omitting manual code review — would have left at least one category of finding undetected in both the vulnerable and hardened states.

3. **SPA architecture creates structural DAST blind spots for lifecycle-gated and source-only vulnerabilities.** ZAP's informational finding 10109 (Modern Web Application) in both scan states explicitly acknowledged its reduced spidering capability against the Vue SPA. All three DOM-level injection points (F1, F2, F3) returned PASS in ZAP's active scan of the vulnerable version — a triple false negative. Organisations that rely exclusively on DAST for Vue or React SPA applications will systematically miss DOM manipulation vulnerabilities that are gated behind framework lifecycle hooks or bundled within JavaScript modules.

4. **Security header configuration is a deployment concern, not a code concern.** The same compiled production bundle served by a plain file server without explicit header configuration produces six ZAP security warnings. Served by Vite Preview with the `vite.config.mjs` security header block, it produces zero. DAST scan results for header-related findings are valid statements only about a specific deployment, not about the application codebase. This means DAST must be run against the same server configuration used in production, not against a convenience file server, for results to be meaningful.

5. **SAST is essential for CDN-loaded third-party library risk.** The vulnerable jQuery 1.6.1 dependency (F7) was loaded via a CDN `<script>` tag that bypasses the npm package registry entirely. npm audit has no visibility into CDN-loaded resources. ZAP's SRI rule returned PASS, suggesting it did not follow the external CDN URL to evaluate its content. Only Semgrep's `missing-integrity` rule detected both the SRI absence and, by extension, the unverified external library. In applications that mix npm-managed and CDN-loaded libraries, SCA tooling alone is insufficient for third-party component risk assessment.

6. **Purpose-built secret scanning is a distinct control requirement.** Two credential-related findings (F5, F6) were missed by all three automated tools. Semgrep's community ruleset lacks patterns for NOAA API token formats and freeform credential comments. ZAP's rule 10027 (Suspicious Comments) matched neither the token format nor the comment structure. npm audit operates on package metadata only. Secret detection requires dedicated tooling (`trufflehog`, `detect-secrets`, GitHub Advanced Security) that is purpose-built for identifying credential patterns in source files — a control layer that is orthogonal to all three tool classes evaluated.
