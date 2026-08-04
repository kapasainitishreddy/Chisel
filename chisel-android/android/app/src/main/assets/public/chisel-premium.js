(function attachChiselPremium(root) {
  'use strict';

  const PRIMARY_ROUTES = ['home', 'analyze', 'groom', 'connect'];
  const ROUTE_LABELS = { home: 'Home', analyze: 'Scan', groom: 'Routine', connect: 'More' };
  const ROUTE_ICONS = { home: '◇', analyze: '◎', groom: '▣', connect: '•••' };
  const STORAGE_KEY = 'chisel:premium:v1';
  const $ = (selector, scope) => (scope || root.document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || root.document).querySelectorAll(selector));

  function safeRead() {
    try {
      const value = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || 'null');
      return value && typeof value === 'object' ? value : {};
    } catch (_) {
      return {};
    }
  }

  function safeWrite(patch) {
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...safeRead(), ...patch }));
    } catch (_) { /* local storage may be unavailable */ }
  }

  function routeTo(route) {
    const target = $(`[data-route="${route}"]`);
    if (target) target.click();
    else root.location.hash = route;
  }

  function clickWhenReady(id, attempts = 16) {
    const target = root.document.getElementById(id);
    if (target) {
      target.click();
      return;
    }
    if (attempts > 0) root.setTimeout(() => clickWhenReady(id, attempts - 1), 120);
  }

  function currentRoute() {
    const active = $('.screen.active[data-screen]');
    if (active) return active.dataset.screen;
    return String(root.location.hash || '#home').replace(/^#/, '') || 'home';
  }

  function setAnchorLabel(anchor, route, includeIcon) {
    const label = ROUTE_LABELS[route] || route;
    anchor.setAttribute('aria-label', label);
    if (includeIcon) {
      anchor.innerHTML = `<span class="chx-nav-icon" aria-hidden="true">${ROUTE_ICONS[route]}</span><span>${label}</span>`;
      return;
    }
    const icon = $('.ico', anchor);
    anchor.innerHTML = '';
    if (icon) anchor.appendChild(icon);
    anchor.appendChild(root.document.createTextNode(` ${label}`));
  }

  function simplifyMobileNavigation() {
    const tabs = root.document.getElementById('bottomTabs');
    if (!tabs || tabs.dataset.chxReady === 'true') return;
    tabs.dataset.chxReady = 'true';

    $$('a[data-route]', tabs).forEach((anchor) => {
      const route = anchor.dataset.route;
      if (!PRIMARY_ROUTES.includes(route)) anchor.remove();
    });

    const anchors = $$('a[data-route]', tabs);
    anchors.forEach((anchor) => setAnchorLabel(anchor, anchor.dataset.route, true));

    const rail = root.document.getElementById('navLinks');
    if (rail) {
      for (const route of PRIMARY_ROUTES) {
        const anchor = $(`a[data-route="${route}"]`, rail);
        if (anchor) setAnchorLabel(anchor, route, false);
      }
    }

    const pill = root.document.getElementById('tabPill');
    const syncPill = () => {
      const route = currentRoute();
      const index = PRIMARY_ROUTES.indexOf(route);
      const safeIndex = index < 0 ? 0 : index;
      anchors.forEach((anchor) => anchor.classList.toggle('active', anchor.dataset.route === route));
      if (pill) pill.style.transform = `translateX(${safeIndex * 100}%)`;
    };

    anchors.forEach((anchor) => anchor.addEventListener('click', () => root.setTimeout(syncPill, 0)));
    root.addEventListener('hashchange', () => root.setTimeout(syncPill, 0));

    const screens = root.document.getElementById('view');
    if (screens && root.MutationObserver) {
      new root.MutationObserver(syncPill).observe(screens, { subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    syncPill();
  }

  function trustMarkup(id) {
    return `<section id="${id}" class="chx-trust-strip" aria-label="Chisel trust principles">
      <div class="chx-trust-item"><i class="chx-trust-icon" aria-hidden="true">⌁</i><strong>On-device by default</strong><span>Your core scans and Precision photos stay on this phone.</span></div>
      <div class="chx-trust-item"><i class="chx-trust-icon" aria-hidden="true">±</i><strong>Confidence, not certainty</strong><span>Weak evidence is rejected instead of dressed up as a precise result.</span></div>
      <div class="chx-trust-item"><i class="chx-trust-icon" aria-hidden="true">◇</i><strong>No attractiveness rating</strong><span>Chisel tracks repeatable appearance signals and actions—not your worth.</span></div>
    </section>`;
  }

  function buildTrustStrip() {
    const home = $('[data-screen="home"]');
    const hero = $('.hero', home);
    if (home && hero && !root.document.getElementById('chxHomeTrust')) {
      hero.insertAdjacentHTML('afterend', trustMarkup('chxHomeTrust'));
    }

    const analyze = $('[data-screen="analyze"]');
    const lead = analyze ? $('.lede', analyze) : null;
    if (analyze && lead && !root.document.getElementById('chxScanTrust')) {
      lead.insertAdjacentHTML('afterend', trustMarkup('chxScanTrust'));
    }
  }

  function scanCount() {
    let count = 0;
    try {
      for (let i = 0; i < root.localStorage.length; i += 1) {
        const key = root.localStorage.key(i);
        if (!key || !/(^|:)(scans|precision:v2)$/i.test(key)) continue;
        const value = JSON.parse(root.localStorage.getItem(key) || 'null');
        if (Array.isArray(value)) count += value.length;
        else if (value && typeof value === 'object') {
          count += Array.isArray(value.faceScans) ? value.faceScans.length : 0;
          count += Array.isArray(value.bodyScans) ? value.bodyScans.length : 0;
        }
      }
    } catch (_) { /* use zero-state recommendation */ }
    return count;
  }

  function buildCommandCenter() {
    const home = $('[data-screen="home"]');
    const trust = root.document.getElementById('chxHomeTrust');
    if (!home || !trust || root.document.getElementById('chxCommand')) return;

    const hasBaseline = scanCount() > 0;
    const title = hasBaseline ? 'Repeat your baseline under matching conditions.' : 'Create your private baseline.';
    const copy = hasBaseline
      ? 'A comparable scan is more useful than a frequent scan. Match camera, distance, light and expression before judging change.'
      : 'Start with a guided deep scan. Chisel will explain capture quality, save the result locally and give you one practical next action.';

    trust.insertAdjacentHTML('afterend', `<section id="chxCommand" class="chx-command" aria-labelledby="chxCommandTitle">
      <div class="chx-command-copy">
        <span class="chx-command-label">Recommended next action</span>
        <h3 id="chxCommandTitle">${title}</h3>
        <p>${copy}</p>
      </div>
      <div class="chx-command-actions">
        <button id="chxStartScan" class="btn solid" type="button">Start guided scan</button>
        <button id="chxStartPrecision" class="btn" type="button">Open Precision Mode</button>
      </div>
    </section>`);

    root.document.getElementById('chxStartScan').addEventListener('click', () => routeTo('analyze'));
    root.document.getElementById('chxStartPrecision').addEventListener('click', () => clickWhenReady('chiselPrecisionLauncher'));
  }

  function setJourneyStage(index) {
    $$('.chx-stage').forEach((stage, stageIndex) => stage.classList.toggle('is-current', stageIndex === index));
  }

  function modeCard(id, badge, title, copy, leftMeta, rightMeta, recommended) {
    return `<button id="${id}" class="chx-mode-card${recommended ? ' is-recommended' : ''}" type="button">
      <span class="chx-mode-badge">${badge}</span>
      <strong>${title}</strong>
      <p>${copy}</p>
      <span class="chx-mode-meta"><span>${leftMeta}</span><span>${rightMeta}</span></span>
    </button>`;
  }

  function buildScanJourney() {
    const analyze = $('[data-screen="analyze"]');
    if (!analyze || root.document.getElementById('chxScanJourney')) return;

    const trust = root.document.getElementById('chxScanTrust');
    const card = $('.card', analyze);
    if (!trust || !card) return;

    trust.insertAdjacentHTML('afterend', `<section id="chxScanJourney" class="chx-scan-journey" aria-label="Scan journey">
      <div class="chx-stage is-current"><i class="chx-stage-index">1</i><strong>Prepare</strong><span>Clean lens, even front light, neutral expression and stable distance.</span></div>
      <div class="chx-stage"><i class="chx-stage-index">2</i><strong>Capture</strong><span>Choose the evidence depth that matches what you want to learn.</span></div>
      <div class="chx-stage"><i class="chx-stage-index">3</i><strong>Quality</strong><span>Chisel checks framing and consistency before accepting a result.</span></div>
      <div class="chx-stage"><i class="chx-stage-index">4</i><strong>Result</strong><span>Review confidence, trend compatibility and one next action.</span></div>
    </section>`);

    card.classList.add('chx-scan-card');
    const title = $('h3', card);
    const description = $('p.lede', card);
    if (title) title.textContent = 'Choose your scan depth.';
    if (description) description.textContent = 'Quick is for a fast check. Deep is the best default for routine tracking. Precision is for controlled comparisons with uncertainty ranges.';

    const firstRow = $('.btn-row', card);
    const modeGrid = root.document.createElement('div');
    modeGrid.className = 'chx-mode-grid';
    modeGrid.innerHTML = [
      modeCard('chxQuickMode', 'Fast check', 'Quick', 'A short multi-frame scan for immediate grooming guidance.', 'about 3 sec', '10-frame pool', false),
      modeCard('chxDeepMode', 'Recommended', 'Deep', 'A steadier baseline using more frames and stronger median pooling.', 'about 5 sec', '40-frame pool', true),
      modeCard('chxPrecisionMode', 'Strict protocol', 'Precision', 'Matched photo batches, quality gate, outlier rejection and confidence intervals.', '7–12 photos', '90+ gate', false)
    ].join('');
    if (firstRow) firstRow.insertAdjacentElement('beforebegin', modeGrid);
    else card.appendChild(modeGrid);

    const quick = root.document.getElementById('openAnalyze');
    const deep = root.document.getElementById('openDeep');
    if (quick) quick.hidden = true;
    if (deep) deep.hidden = true;

    root.document.getElementById('chxQuickMode').addEventListener('click', () => {
      setJourneyStage(1);
      if (quick) quick.click();
    });
    root.document.getElementById('chxDeepMode').addEventListener('click', () => {
      setJourneyStage(1);
      if (deep) deep.click();
    });
    root.document.getElementById('chxPrecisionMode').addEventListener('click', () => {
      setJourneyStage(1);
      clickWhenReady('chiselPrecisionLauncher');
    });

    const advancedIds = ['openTrain', 'hintAnalyze', 'openFuture', 'openExport'];
    const advanced = root.document.createElement('details');
    advanced.className = 'chx-advanced';
    advanced.innerHTML = '<summary>More scan tools</summary><div class="chx-advanced-tools"></div>';
    const tools = $('.chx-advanced-tools', advanced);
    advancedIds.forEach((id) => {
      const control = root.document.getElementById(id);
      if (control) tools.appendChild(control);
    });
    card.appendChild(advanced);

    $$('.btn-row', card).forEach((row) => {
      if (!$$('button:not([hidden])', row).length) row.hidden = true;
    });

    const history = root.document.getElementById('scanHistory');
    if (history && root.MutationObserver) {
      new root.MutationObserver(() => {
        if (history.children.length || history.textContent.trim()) setJourneyStage(3);
      }).observe(history, { childList: true, subtree: true, characterData: true });
    }
  }

  function buildConcierge() {
    if (root.document.getElementById('chxConcierge')) return;
    const state = safeRead();
    if (state.seenConcierge || scanCount() > 0) return;

    const shell = root.document.createElement('section');
    shell.id = 'chxConcierge';
    shell.className = 'chx-concierge';
    shell.setAttribute('role', 'dialog');
    shell.setAttribute('aria-modal', 'true');
    shell.setAttribute('aria-labelledby', 'chxConciergeTitle');
    shell.innerHTML = `<div class="chx-concierge-panel">
      <div class="chx-concierge-top">
        <div><span class="chx-concierge-kicker">Welcome to Chisel</span><h2 id="chxConciergeTitle">A private system for visible progress.</h2></div>
        <button class="chx-concierge-close" type="button" aria-label="Close introduction">×</button>
      </div>
      <p>Chisel works best when you repeat controlled scans and act on one recommendation at a time.</p>
      <div class="chx-concierge-steps">
        <div class="chx-concierge-step"><i>1</i><div><strong>Private by default</strong><span>Core analysis and Precision photos are processed on-device.</span></div></div>
        <div class="chx-concierge-step"><i>2</i><div><strong>Guided capture</strong><span>Clear preparation and quality feedback reduce misleading results.</span></div></div>
        <div class="chx-concierge-step"><i>3</i><div><strong>Progress with context</strong><span>Confidence ranges and compatible setups matter more than one flattering photo.</span></div></div>
      </div>
      <div class="chx-concierge-actions">
        <button id="chxConciergeStart" class="btn solid" type="button">Create my baseline</button>
        <button id="chxConciergeExplore" class="btn" type="button">Explore first</button>
      </div>
    </div>`;

    const dismiss = (start) => {
      safeWrite({ seenConcierge: true });
      shell.hidden = true;
      root.document.body.classList.remove('chx-concierge-open');
      if (start) routeTo('analyze');
    };

    root.document.body.appendChild(shell);
    root.document.body.classList.add('chx-concierge-open');
    $('.chx-concierge-close', shell).addEventListener('click', () => dismiss(false));
    root.document.getElementById('chxConciergeExplore').addEventListener('click', () => dismiss(false));
    root.document.getElementById('chxConciergeStart').addEventListener('click', () => dismiss(true));
    shell.addEventListener('click', (event) => { if (event.target === shell) dismiss(false); });
    root.document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !shell.hidden) dismiss(false);
    });
    root.document.getElementById('chxConciergeStart').focus();
  }

  function refineCopy() {
    root.document.body.classList.add('chx-premium');
    root.document.title = 'Chisel — Private Glow-Up Tracker';

    const bootTag = $('#boot .tag');
    if (bootTag) bootTag.textContent = 'Private · precise · yours';
    const railTag = $('nav.rail .logo small');
    if (railTag) railTag.textContent = 'Private · Precision';

    const home = $('[data-screen="home"]');
    const heroTitle = home ? $('h1.display', home) : null;
    const heroLead = home ? $('.hero .lede', home) : null;
    if (heroTitle) heroTitle.innerHTML = 'Measure what changes.<br><em>Improve with intention.</em>';
    if (heroLead) heroLead.textContent = 'A private glow-up tracker for face, skin, posture, body and grooming. Repeat controlled scans, understand confidence, and act on one practical recommendation at a time.';

    const start = home ? $('[data-go="analyze"]', home) : null;
    const affirm = home ? $('[data-go="affirm"]', home) : null;
    const meditate = home ? $('[data-go="meditate"]', home) : null;
    if (start) start.textContent = 'Start guided scan';
    if (affirm) affirm.textContent = 'Daily mindset';
    if (meditate) meditate.textContent = 'Visualize';

    $$('.eyebrow', home).forEach((label) => {
      if (!/lookmax score/i.test(label.textContent)) return;
      label.textContent = 'Tracking Index';
      const card = label.closest('.card');
      if (card && !$('.chx-index-note', card)) {
        card.insertAdjacentHTML('beforeend', '<p class="chx-index-note">A private consistency indicator—not an attractiveness rating or a measure of personal value.</p>');
      }
    });

    const analyze = $('[data-screen="analyze"]');
    if (analyze) {
      const eyebrow = $('.eyebrow', analyze);
      const heading = $('h2.section', analyze);
      const lead = $('.lede', analyze);
      if (eyebrow) eyebrow.textContent = 'Private appearance tracking';
      if (heading) heading.innerHTML = 'Measure carefully. <span class="gold">Change intentionally.</span>';
      if (lead) lead.innerHTML = 'On-device face, skin, hair and teeth analysis with repeatability guidance. Results are cosmetic estimates—not medical diagnosis or laboratory measurements—and weak evidence should be retried.';
    }
  }

  function enhanceDelayedModules() {
    const precision = root.document.getElementById('chiselPrecisionLauncher');
    if (precision && precision.dataset.chxReady !== 'true') {
      precision.dataset.chxReady = 'true';
      precision.setAttribute('aria-label', 'Open Precision Mode');
      const label = $('b', precision);
      if (label) label.textContent = 'Precision scan';
    }
    const labs = root.document.getElementById('chiselLabsLauncher');
    if (labs && labs.dataset.chxReady !== 'true') {
      labs.dataset.chxReady = 'true';
      labs.setAttribute('aria-label', 'Open Chisel Labs');
    }
  }

  function installInteractionFeedback() {
    root.document.addEventListener('pointerdown', (event) => {
      const control = event.target.closest('button, [role="button"]');
      if (control) control.classList.add('is-pressed');
    });
    const release = () => $$('.is-pressed').forEach((control) => control.classList.remove('is-pressed'));
    root.document.addEventListener('pointerup', release);
    root.document.addEventListener('pointercancel', release);

    if (root.MutationObserver) {
      new root.MutationObserver(enhanceDelayedModules).observe(root.document.body, { childList: true, subtree: true });
    }
    enhanceDelayedModules();
  }

  function boot() {
    if (!root.document || !root.document.body || root.__chiselPremiumBooted) return false;
    root.__chiselPremiumBooted = true;
    refineCopy();
    simplifyMobileNavigation();
    buildTrustStrip();
    buildCommandCenter();
    buildScanJourney();
    installInteractionFeedback();
    root.setTimeout(buildConcierge, 1300);
    return true;
  }

  function autoBoot() {
    const start = () => {
      try { boot(); }
      catch (error) {
        root.__chiselPremiumBooted = false;
        console.warn('[Chisel Premium] boot failed', error);
      }
    };
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start, { once: true });
    else root.setTimeout(start, 0);
  }

  root.ChiselPremium = {
    PRIMARY_ROUTES,
    simplifyMobileNavigation,
    buildTrustStrip,
    buildScanJourney,
    buildConcierge,
    boot,
    autoBoot
  };
  autoBoot();
})(typeof globalThis !== 'undefined' ? globalThis : this);
