/* @ds-bundle: {"format":4,"namespace":"S1P","components":[{"name":"Button"},{"name":"Icon"},{"name":"Badge"},{"name":"NavBar"},{"name":"HeroSection"},{"name":"Illustration"},{"name":"AmountSelector"},{"name":"TextField"},{"name":"Select"},{"name":"Checkbox"},{"name":"ContributionSummary"},{"name":"Alert"},{"name":"ImpactStat"},{"name":"Timeline"},{"name":"GalleryGrid"},{"name":"Accordion"},{"name":"StoryQuote"},{"name":"EmptyState"},{"name":"Skeleton"},{"name":"Dialog"},{"name":"PublishStatus"},{"name":"AdminTable"}]} */
(function () {
  var R = window.React;
  var h = R.createElement;
  var ICONS = {"arrow-right": "<path d=\"M5 12h14M13 6l6 6-6 6\"/>", "arrow-left": "<path d=\"M19 12H5M11 6l-6 6 6 6\"/>", "chevron-down": "<path d=\"M6 9l6 6 6-6\"/>", "chevron-right": "<path d=\"M9 6l6 6-6 6\"/>", "check": "<path d=\"M5 12.5l4.5 4.5L19 7.5\"/>", "close": "<path d=\"M6 6l12 12M18 6L6 18\"/>", "menu": "<path d=\"M4 7h16M4 12h16M4 17h10\"/>", "plus": "<path d=\"M12 5v14M5 12h14\"/>", "minus": "<path d=\"M5 12h14\"/>", "info": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v6M12 7.5v.01\"/>", "alert-circle": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v6M12 16.5v.01\"/>", "alert-triangle": "<path d=\"M12 3.5L2.8 19.5h18.4z\"/><path d=\"M12 10v4.5M12 17v.01\"/>", "check-circle": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8 12.5l3 3 5-6\"/>", "give": "<path d=\"M3 15h3l4 3h5.5a1.5 1.5 0 000-3H12\"/><path d=\"M6 15v5H3\"/><path d=\"M14.5 15l4.5-2a1.6 1.6 0 012 2.3L15.5 20H10\"/><path d=\"M15 4.5a2.3 2.3 0 013.6 2.8L15 11l-3.6-3.7A2.3 2.3 0 0115 4.5z\"/>", "slice": "<path d=\"M12 3L20 18.5a14 14 0 01-16 0z\"/><path d=\"M5.6 15.4a11 11 0 0012.8 0\"/><circle cx=\"12\" cy=\"11\" r=\".9\"/><circle cx=\"10\" cy=\"15\" r=\".9\"/><circle cx=\"14\" cy=\"14.5\" r=\".9\"/>", "image": "<rect x=\"3\" y=\"4.5\" width=\"18\" height=\"15\" rx=\"3\"/><circle cx=\"9\" cy=\"10\" r=\"1.8\"/><path d=\"M21 16l-5-5-9 8.5\"/>", "upload": "<path d=\"M12 16V4M7 9l5-5 5 5M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3\"/>", "calendar": "<rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15\" rx=\"3\"/><path d=\"M3.5 10h17M8 3v4M16 3v4\"/>", "external": "<path d=\"M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4\"/>", "lock": "<rect x=\"4.5\" y=\"10.5\" width=\"15\" height=\"10\" rx=\"2.5\"/><path d=\"M8 10.5V7.5a4 4 0 018 0v3M12 14.5v2.5\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M16 16l4.5 4.5\"/>", "edit": "<path d=\"M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16z\"/><path d=\"M13.5 6.5l4 4\"/>", "trash": "<path d=\"M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5\"/>", "eye": "<path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "receipt": "<path d=\"M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5z\" transform=\"translate(0 0)\"/><path d=\"M9 8h6M9 12h6M9 16h3\"/>", "heart": "<path d=\"M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0112 7.3 4.3 4.3 0 0119.5 10c0 5.4-7.5 10-7.5 10z\"/>"};
  var B = '/_blob/';
  /* Raster scenes (S1P-ILL-001…012). src defaults to the design system's asset store; override per site with S1P.illustrationSources[name] = {src, mobile}. */
  var SCENES = {
    'hero-shared-table': { id: 'S1P-ILL-001', src: B + '61a42d8534e90fc1b51bca0600479b01', mobile: B + 'f895fce43b7cefb784ebdc5e424649ee', w: 1448, h: 1086, mw: 1254, mh: 1254, alt: 'Four people around a large pizza with one slice missing; one passes that slice to another while a child cheers.' },
    'contribution-pass-it-on': { id: 'S1P-ILL-003', src: B + '77672ac80ca7eb1c564da0f542af9543', w: 1499, h: 1049, alt: 'One person hands a wrapped parcel to another; a dotted arrow arcs between them.' },
    'impact-many-hands': { id: 'S1P-ILL-004', src: B + '1bf64ee84183a53017af0264ae20d84b', w: 1536, h: 1024, alt: 'People build a staircase of colourful blocks while a plant grows from the top block.' },
    'people-cast': { id: 'S1P-ILL-005', src: B + '3fbd7c0a4764e51d8a76e15d907826c3', w: 2103, h: 748, alt: 'Eight people stand in a friendly row, including a child and a wheelchair user.' },
    'set-aside-slice': { id: 'S1P-ILL-006', src: B + 'ed7c64cd118222c3b5f8a4276a948946', w: 1448, h: 1086, alt: 'A person sets one slice of pizza aside on its own plate in front of an empty chair.' },
    'welcome-to-the-table': { id: 'S1P-ILL-007', src: B + 'b17b6fe76c009c79d2fb8fddc6113681', w: 1448, h: 1086, alt: 'People at a shared table welcome a newcomer to join them.' },
    'success-celebrate': { id: 'S1P-ILL-008', src: B + '9f5cfe83756bd91dccf35b1f08d38214', w: 1402, h: 1122, alt: 'A person celebrating with both arms raised in front of a golden sun.' },
    'empty-plate': { id: 'S1P-ILL-009', src: B + 'f2a5c6671f627be91dca76075a66247e', w: 1448, h: 1086, alt: 'A person looks thoughtfully at an empty plate.' },
    'error-try-again': { id: 'S1P-ILL-010', src: B + 'e7d9d0e34bd4fb0cd5fe0acb23464b5d', w: 1448, h: 1086, alt: 'A parcel has tipped over and a slice slid out; a person points to a looping arrow, ready to try again.' },
    'looking-closely': { id: 'S1P-ILL-011', src: B + '5ccc3d0c59587bb21cb1656ece02bb5a', w: 1448, h: 1086, alt: 'A person looks through a magnifying glass at a row of picture cards.' },
    'wandering-slice': { id: 'S1P-ILL-012', src: B + '2af4927f2841a786d938acedfbeeca66', w: 1536, h: 1024, alt: 'A slice has wandered away from its pizza along a dotted path; a person points the way back.' }
  };
  var SOURCES = {};

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
    return out.join(' ');
  }
  function omit(o, keys) {
    var r = {};
    for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k];
    return r;
  }
  function reducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  var uid = 0;
  function useId(prefix) {
    var ref = R.useRef(null);
    if (ref.current === null) ref.current = (prefix || 's1p') + '-' + (++uid);
    return ref.current;
  }

  /* ---------------------------------------------------------------- Icon */
  function Icon(p) {
    var size = p.size || 20;
    var attrs = {
      viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor',
      strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className: cx('s1-icon', p.className),
      dangerouslySetInnerHTML: { __html: ICONS[p.name] || '' }
    };
    if (p.label) { attrs.role = 'img'; attrs['aria-label'] = p.label; } else { attrs['aria-hidden'] = 'true'; attrs.focusable = 'false'; }
    return h('svg', attrs);
  }

  /* ---------------------------------------------------------------- Button */
  function Spinner() {
    return h('span', { className: 's1-spinner', 'aria-hidden': 'true' });
  }
  function Button(p) {
    var variant = p.variant || 'primary', size = p.size || 'md';
    var state = p.loading ? 'loading' : p.success ? 'success' : null;
    var iconOnly = !p.children && p.icon;
    var rest = omit(p, ['variant', 'size', 'icon', 'iconEnd', 'loading', 'success', 'fullWidth', 'className', 'children', 'label', 'href', 'loadingText', 'successText']);
    var content = [];
    if (state === 'loading') content.push(h(Spinner, { key: 's' }));
    else if (state === 'success') content.push(h(Icon, { key: 'c', name: 'check', size: 20 }));
    else if (p.icon) content.push(h(Icon, { key: 'i', name: p.icon, size: size === 'lg' ? 22 : 20 }));
    if (!iconOnly) {
      var text = state === 'loading' ? (p.loadingText || p.children) : state === 'success' ? (p.successText || p.children) : p.children;
      content.push(h('span', { key: 't', className: 's1-btn-label' }, text));
    }
    if (p.iconEnd && !state) content.push(h(Icon, { key: 'e', name: p.iconEnd, size: 20, className: 's1-btn-end' }));
    var props = Object.assign({}, rest, {
      className: cx('s1-btn', 's1-btn--' + variant, 's1-btn--' + size, iconOnly && 's1-btn--icon', p.fullWidth && 's1-btn--full', state && 's1-btn--' + state, p.className),
      'aria-busy': state === 'loading' ? 'true' : undefined,
      'aria-label': iconOnly ? p.label : undefined
    });
    if (p.href) return h('a', Object.assign(props, { href: p.href }), content);
    if (!props.type) props.type = 'button';
    if (state === 'loading') props['aria-disabled'] = 'true';
    return h('button', props, content);
  }

  /* ---------------------------------------------------------------- Badge */
  function Badge(p) {
    return h('span', { className: cx('s1-badge', 's1-badge--' + (p.tone || 'neutral'), p.className) },
      p.icon ? h(Icon, { name: p.icon, size: 14 }) : null, p.children);
  }

  /* ---------------------------------------------------------------- Wordmark + NavBar */
  function Wordmark(p) {
    return h('a', { className: 's1-wordmark', href: p.href || '#', 'aria-label': 'Sacrifice One Pizza, home' },
      h('span', { className: 's1-wordmark-mark' }, 'S1P'),
      h('span', { className: 's1-wordmark-name' }, 'Sacrifice One Pizza'));
  }
  function NavBar(p) {
    var st = R.useState(false), open = st[0], setOpen = st[1];
    var id = useId('nav');
    var items = p.items || [];
    var links = items.map(function (it, i) {
      return h('li', { key: i }, h('a', { href: it.href || '#', className: 's1-nav-link', 'aria-current': it.current ? 'page' : undefined }, it.label));
    });
    return h('header', { className: cx('s1-nav', p.compact && 's1-nav--compact', open && 's1-nav--open', p.className) },
      h('div', { className: 's1-nav-bar' },
        h(Wordmark, { href: p.homeHref }),
        h('nav', { className: 's1-nav-links', 'aria-label': 'Main' }, h('ul', null, links)),
        h('div', { className: 's1-nav-actions' },
          h(Button, { variant: 'primary', size: 'sm', href: p.ctaHref || '#', className: 's1-nav-cta' }, p.ctaLabel || 'Contribute'),
          h('button', { type: 'button', className: 's1-nav-toggle', 'aria-expanded': open ? 'true' : 'false', 'aria-controls': id, onClick: function () { setOpen(!open); } },
            h(Icon, { name: open ? 'close' : 'menu', size: 24 }), h('span', { className: 's1-sr' }, open ? 'Close menu' : 'Open menu')))),
      h('div', { className: 's1-nav-sheet', id: id, hidden: !open },
        h('nav', { 'aria-label': 'Main' }, h('ul', null, links)),
        h(Button, { variant: 'primary', fullWidth: true, href: p.ctaHref || '#', size: 'lg' }, p.ctaLabel || 'Contribute')));
  }

  /* ---------------------------------------------------------------- Illustration */
  function Illustration(p) {
    var ref = R.useRef(null);
    var scene = SCENES[p.name];
    var over = SOURCES[p.name] || {};
    var animate = p.animate || 'auto';
    var st = R.useState(0), cls = st[0], setCls = st[1]; // 0 static, 1 armed, 2 in
    R.useEffect(function () {
      if (animate === 'off' || reducedMotion() || !scene) return;
      var el = ref.current;
      if (!('IntersectionObserver' in window)) return;
      setCls(1);
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { setCls(2); io.disconnect(); } });
      }, { threshold: 0.35 });
      io.observe(el);
      return function () { io.disconnect(); };
    }, [p.name, animate]);
    R.useEffect(function () { if (p.replayKey && animate !== 'off' && !reducedMotion()) { setCls(1); var t = setTimeout(function () { setCls(2); }, 60); return function () { clearTimeout(t); }; } }, [p.replayKey]);
    if (!scene) return null;
    var src = p.src || over.src || scene.src;
    var mobile = p.mobileSrc || over.mobile || scene.mobile;
    var img = h('img', {
      src: src, alt: p.decorative ? '' : (p.label || scene.alt), width: scene.w, height: scene.h,
      loading: p.priority ? 'eager' : 'lazy', decoding: 'async', fetchpriority: p.priority ? 'high' : undefined, draggable: false
    });
    var media = mobile ? h('picture', null, h('source', { media: '(max-width: 899px)', srcSet: mobile, width: scene.mw, height: scene.mh }), img) : img;
    return h('div', { ref: ref, className: cx('s1-illo', p.plate === false && 's1-illo--bare', cls === 1 && 'is-armed', cls === 2 && 'is-armed is-in', p.className), 'data-scene': scene.id }, media);
  }

  /* ---------------------------------------------------------------- HeroSection */
  function HeroSection(p) {
    return h('section', { className: cx('s1-hero', p.className), 'aria-labelledby': 'hero-title' },
      h('div', { className: 's1-hero-copy' },
        p.eyebrow ? h('p', { className: 'eyebrow s1-eyebrow' }, p.eyebrow) : null,
        h('h1', { id: 'hero-title', className: 'display-hero s1-hero-title' }, p.title),
        p.lead ? h('p', { className: 'body-lg s1-hero-lead' }, p.lead) : null,
        h('div', { className: 's1-hero-actions' },
          h(Button, { variant: 'primary', size: 'lg', href: p.primaryHref || '#', iconEnd: 'arrow-right', className: 's1-hero-cta' }, p.primaryLabel || 'Contribute'),
          p.secondaryLabel ? h(Button, { variant: 'secondary', size: 'lg', href: p.secondaryHref || '#' }, p.secondaryLabel) : null),
        p.note ? h('p', { className: 'caption s1-hero-note' }, p.note) : null),
      h('div', { className: 's1-hero-art' }, h(Illustration, { name: p.illustration || 'hero-shared-table', animate: p.animate, replayKey: p.replayKey, priority: true })));
  }

  /* ---------------------------------------------------------------- Forms */
  function FieldShell(p) {
    return h('div', { className: cx('s1-field', p.error && 's1-field--error', p.disabled && 's1-field--disabled', p.className) },
      h('label', { className: 's1-label', htmlFor: p.id },
        p.label, p.required ? h('span', { className: 's1-req' }, ' Required') : h('span', { className: 's1-opt' }, p.optional ? ' Optional' : '')),
      p.hint ? h('p', { className: 's1-hint', id: p.id + '-hint' }, p.hint) : null,
      p.children,
      h('div', { className: 's1-msg-slot', 'aria-live': 'polite' },
        p.error ? h('p', { className: 's1-msg s1-msg--error', id: p.id + '-err' }, h(Icon, { name: 'alert-circle', size: 18 }), h('span', null, p.error)) :
        p.success ? h('p', { className: 's1-msg s1-msg--success', id: p.id + '-ok' }, h(Icon, { name: 'check-circle', size: 18 }), h('span', null, p.success)) : null));
  }
  function describedBy(id, p) {
    var d = [];
    if (p.hint) d.push(id + '-hint');
    if (p.error) d.push(id + '-err');
    return d.length ? d.join(' ') : undefined;
  }
  function TextField(p) {
    var auto = useId('f'), id = p.id || auto;
    var rest = omit(p, ['label', 'hint', 'error', 'success', 'required', 'optional', 'multiline', 'prefix', 'className', 'id']);
    var input = h(p.multiline ? 'textarea' : 'input', Object.assign({ rows: p.multiline ? 4 : undefined }, rest, {
      id: id, className: cx('s1-input', p.multiline && 's1-input--area', p.prefix && 's1-input--prefixed'),
      'aria-invalid': p.error ? 'true' : undefined, 'aria-describedby': describedBy(id, p), required: p.required
    }));
    return h(FieldShell, Object.assign({}, p, { id: id }),
      p.prefix ? h('div', { className: 's1-affix' }, h('span', { className: 's1-prefix', 'aria-hidden': 'true' }, p.prefix), input) : input);
  }
  function Select(p) {
    var auto = useId('s'), id = p.id || auto;
    var rest = omit(p, ['label', 'hint', 'error', 'required', 'options', 'className', 'id', 'placeholder']);
    return h(FieldShell, Object.assign({}, p, { id: id }),
      h('div', { className: 's1-select-wrap' },
        h('select', Object.assign({}, rest, { id: id, className: 's1-input s1-select', 'aria-invalid': p.error ? 'true' : undefined, 'aria-describedby': describedBy(id, p), required: p.required }),
          p.placeholder ? h('option', { value: '' }, p.placeholder) : null,
          (p.options || []).map(function (o, i) { return h('option', { key: i, value: o.value }, o.label); })),
        h(Icon, { name: 'chevron-down', size: 20, className: 's1-select-chev' })));
  }
  function Checkbox(p) {
    var auto = useId('c'), id = p.id || auto;
    var rest = omit(p, ['label', 'hint', 'error', 'className', 'id']);
    return h('div', { className: cx('s1-check', p.error && 's1-check--error', p.className) },
      h('input', Object.assign({ type: 'checkbox' }, rest, { id: id, className: 's1-check-input', 'aria-invalid': p.error ? 'true' : undefined, 'aria-describedby': describedBy(id, p) })),
      h('label', { htmlFor: id, className: 's1-check-label' },
        h('span', { className: 's1-check-box', 'aria-hidden': 'true' }, h(Icon, { name: 'check', size: 16 })),
        h('span', null, p.label)),
      p.hint ? h('p', { className: 's1-hint s1-check-hint', id: id + '-hint' }, p.hint) : null,
      p.error ? h('p', { className: 's1-msg s1-msg--error s1-check-hint', id: id + '-err', 'aria-live': 'polite' }, h(Icon, { name: 'alert-circle', size: 18 }), h('span', null, p.error)) : null);
  }

  /* ---------------------------------------------------------------- AmountSelector */
  function AmountSelector(p) {
    var name = useId('amt');
    var cur = p.currency || '';
    var amounts = p.amounts || [];
    var ctrl = p.value !== undefined;
    var st = R.useState(p.defaultValue !== undefined ? p.defaultValue : null), inner = st[0], setInner = st[1];
    var val = ctrl ? p.value : inner;
    var isCustom = val === 'custom' || (val !== null && amounts.indexOf(val) < 0);
    var cst = R.useState(p.defaultCustom || ''), custom = cst[0], setCustom = cst[1];
    function pick(v) { if (!ctrl) setInner(v); if (p.onChange) p.onChange(v); }
    var errId = name + '-err';
    return h('fieldset', { className: cx('s1-amounts', p.error && 's1-amounts--error', p.className), 'aria-describedby': p.error ? errId : (p.hint ? name + '-hint' : undefined) },
      h('legend', { className: 'heading-3 s1-amounts-legend' }, p.label || 'Choose an amount'),
      p.hint ? h('p', { className: 's1-hint', id: name + '-hint' }, p.hint) : null,
      h('div', { className: 's1-amounts-grid' },
        amounts.map(function (a) {
          var sel = val === a;
          return h('label', { key: a, className: cx('s1-chip', sel && 's1-chip--on') },
            h('input', { type: 'radio', name: name, value: a, checked: sel, onChange: function () { pick(a); }, className: 's1-sr-input' }),
            h('span', { className: 's1-chip-face' },
              h('span', { className: 's1-chip-check', 'aria-hidden': 'true' }, h(Icon, { name: 'check', size: 16 })),
              h('span', { className: 's1-chip-amt' }, cur + (typeof a === 'number' ? a.toLocaleString(p.locale || 'en-IN') : a))));
        }),
        p.allowCustom !== false ? h('label', { className: cx('s1-chip', 's1-chip--other', isCustom && 's1-chip--on') },
          h('input', { type: 'radio', name: name, value: 'custom', checked: isCustom, onChange: function () { pick('custom'); }, className: 's1-sr-input' }),
          h('span', { className: 's1-chip-face' },
            h('span', { className: 's1-chip-check', 'aria-hidden': 'true' }, h(Icon, { name: 'check', size: 16 })),
            h('span', { className: 's1-chip-amt' }, p.otherLabel || 'Other amount'))) : null),
      isCustom ? h(TextField, {
        label: p.customLabel || 'Your amount', prefix: cur || undefined, inputMode: 'decimal', value: custom,
        onChange: function (e) { setCustom(e.target.value); if (p.onCustomChange) p.onCustomChange(e.target.value); },
        hint: p.customHint, className: 's1-amounts-custom', error: undefined
      }) : null,
      p.error ? h('p', { className: 's1-msg s1-msg--error', id: errId, 'aria-live': 'polite' }, h(Icon, { name: 'alert-circle', size: 18 }), h('span', null, p.error)) : null);
  }

  /* ---------------------------------------------------------------- ContributionSummary */
  function ContributionSummary(p) {
    return h('section', { className: cx('s1-summary', p.className), 'aria-label': p.title || 'Your contribution' },
      h('h3', { className: 'heading-3' }, p.title || 'Your contribution'),
      h('dl', { className: 's1-summary-rows' }, (p.rows || []).map(function (r, i) {
        return h('div', { key: i, className: 's1-summary-row' }, h('dt', null, r.label), h('dd', null, r.value));
      })),
      p.total ? h('div', { className: 's1-summary-total' }, h('span', null, p.totalLabel || 'Total'), h('strong', { className: 'figure-md' }, p.total)) : null,
      p.note ? h('p', { className: 's1-summary-note body-sm' }, h(Icon, { name: 'lock', size: 16 }), h('span', null, p.note)) : null);
  }

  /* ---------------------------------------------------------------- Alert */
  var TONE_ICON = { success: 'check-circle', warning: 'alert-triangle', error: 'alert-circle', info: 'info' };
  function Alert(p) {
    var tone = p.tone || 'info';
    return h('div', { className: cx('s1-alert', 's1-alert--' + tone, p.className), role: tone === 'error' ? 'alert' : 'status' },
      h(Icon, { name: TONE_ICON[tone], size: 22, className: 's1-alert-icon' }),
      h('div', { className: 's1-alert-body' },
        p.title ? h('p', { className: 's1-alert-title' }, p.title) : null,
        p.children ? h('div', { className: 'body-sm' }, p.children) : null,
        p.action ? h('div', { className: 's1-alert-action' }, p.action) : null),
      p.onDismiss ? h('button', { type: 'button', className: 's1-alert-x', onClick: p.onDismiss, 'aria-label': 'Dismiss' }, h(Icon, { name: 'close', size: 18 })) : null);
  }

  /* ---------------------------------------------------------------- ImpactStat */
  function ImpactStat(p) {
    var ref = R.useRef(null);
    var placeholder = p.status === 'placeholder';
    var target = typeof p.countTo === 'number' && !placeholder ? p.countTo : null;
    var st = R.useState(null), n = st[0], setN = st[1];
    R.useEffect(function () {
      if (target === null || reducedMotion() || p.animate === false || !('IntersectionObserver' in window)) return;
      var el = ref.current, raf, io;
      setN(0);
      io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        var t0 = performance.now(), dur = 1100;
        function step(t) {
          var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          setN(k >= 1 ? null : Math.round(target * e));
          if (k < 1) raf = requestAnimationFrame(step);
        }
        raf = requestAnimationFrame(step);
      }, { threshold: 0.5 });
      io.observe(el);
      return function () { io.disconnect(); cancelAnimationFrame(raf); };
    }, [target]);
    var shown = n === null ? p.value : n.toLocaleString(p.locale || 'en-IN');
    return h('figure', { ref: ref, className: cx('s1-stat', 's1-stat--' + (p.tone || 'tomato'), p.size === 'md' && 's1-stat--md', placeholder && 's1-stat--placeholder', p.className) },
      h('div', { className: 's1-stat-shape', 'aria-hidden': 'true' }),
      h('p', { className: cx(p.size === 'md' ? 'figure-md' : 'figure-xl', 's1-stat-figure') },
        h('span', { 'aria-hidden': 'true' }, shown),
        h('span', { className: 's1-sr' }, p.value + (p.rounded ? ' (rounded)' : ''))),
      h('figcaption', null,
        h('span', { className: 's1-stat-label' }, p.label),
        h('span', { className: 'caption s1-stat-meta' },
          [p.period, p.rounded ? 'Rounded' : (p.exact ? 'Exact' : null), p.source].filter(Boolean).join(' · ')),
        placeholder ? h(Badge, { tone: 'placeholder' }, 'Placeholder — needs verified figure') : null));
  }

  /* ---------------------------------------------------------------- Timeline */
  function Timeline(p) {
    return h('ol', { className: cx('s1-timeline', p.className) }, (p.items || []).map(function (it, i) {
      return h('li', { key: i, className: cx('s1-tl-item', it.current && 's1-tl-item--current') },
        h('span', { className: 's1-tl-marker', 'aria-hidden': 'true' }),
        h('p', { className: 'eyebrow s1-tl-date' }, it.date),
        h('h3', { className: 'heading-3' }, it.title),
        it.body ? h('p', { className: 'body-sm s1-muted' }, it.body) : null,
        it.placeholder ? h(Badge, { tone: 'placeholder' }, 'Placeholder') : null);
    }));
  }

  /* ---------------------------------------------------------------- Dialog */
  function Dialog(p) {
    var ref = R.useRef(null);
    var tid = useId('dlg');
    R.useEffect(function () {
      if (!p.open || p.inline) return;
      var prev = document.activeElement;
      var el = ref.current;
      var f = el && el.querySelector('button, [href], input, select, textarea');
      if (f) f.focus();
      function key(e) {
        if (e.key === 'Escape' && p.onClose) p.onClose();
        if (e.key === 'Tab' && el) {
          var fs = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (!fs.length) return;
          var first = fs[0], last = fs[fs.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
      document.addEventListener('keydown', key);
      return function () { document.removeEventListener('keydown', key); if (prev && prev.focus) prev.focus(); };
    }, [p.open]);
    if (!p.open) return null;
    return h('div', { className: cx('s1-dialog-scrim', p.inline && 's1-dialog-scrim--inline'), onClick: function (e) { if (e.target === e.currentTarget && p.onClose) p.onClose(); } },
      h('div', { ref: ref, className: cx('s1-dialog', p.wide && 's1-dialog--wide', p.className), role: p.tone === 'destructive' ? 'alertdialog' : 'dialog', 'aria-modal': 'true', 'aria-labelledby': tid },
        h('div', { className: 's1-dialog-head' },
          h('h2', { className: 'heading-2', id: tid }, p.title),
          p.onClose ? h(Button, { variant: 'tertiary', icon: 'close', label: 'Close', onClick: p.onClose, className: 's1-dialog-x' }) : null),
        h('div', { className: 's1-dialog-body' }, p.children),
        p.actions ? h('div', { className: 's1-dialog-actions' }, p.actions) : null));
  }

  /* ---------------------------------------------------------------- GalleryGrid */
  function PhotoPlaceholder(p) {
    return h('div', { className: 's1-photo-ph', role: 'img', 'aria-label': p.alt || 'Photo placeholder' },
      h(Icon, { name: 'image', size: 28 }), h('span', { className: 'caption' }, 'Approved photo'));
  }
  function GalleryGrid(p) {
    var items = p.items || [];
    var st = R.useState(-1), open = st[0], setOpen = st[1];
    var cur = items[open];
    function go(d) { setOpen((open + d + items.length) % items.length); }
    return h('div', { className: cx('s1-gallery-wrap', p.className) },
      h('ul', { className: 's1-gallery' }, items.map(function (it, i) {
        return h('li', { key: i, className: cx('s1-tile', (i % 6 === 0) && 's1-tile--feature', (i % 6 === 4) && 's1-tile--tall') },
          h('button', { type: 'button', className: 's1-tile-btn', onClick: function () { setOpen(i); }, 'aria-label': 'Open photo: ' + (it.alt || it.caption || ('photo ' + (i + 1))) },
            it.src ? h('img', { src: it.src, alt: '', loading: 'lazy', decoding: 'async' }) : h(PhotoPlaceholder, { alt: '' })),
          h('p', { className: 'caption s1-tile-cap' }, it.caption, it.date ? h('span', { className: 's1-muted' }, ' · ' + it.date) : null));
      })),
      h(Dialog, { open: open >= 0, onClose: function () { setOpen(-1); }, title: cur ? (cur.caption || 'Photo') : '', wide: true, inline: p.inlineLightbox,
        actions: items.length > 1 ? [
          h(Button, { key: 'p', variant: 'secondary', icon: 'arrow-left', onClick: function () { go(-1); } }, 'Previous'),
          h(Button, { key: 'n', variant: 'secondary', iconEnd: 'arrow-right', onClick: function () { go(1); } }, 'Next')] : null },
        cur ? h('figure', { className: 's1-lightbox' },
          cur.src ? h('img', { src: cur.src, alt: cur.alt || '' }) : h(PhotoPlaceholder, { alt: cur.alt }),
          h('figcaption', { className: 'body-sm s1-muted' }, (cur.alt || '') + (cur.date ? ' · ' + cur.date : ''), ' ', h('span', null, (open + 1) + ' of ' + items.length))) : null));
  }

  /* ---------------------------------------------------------------- Accordion */
  function Accordion(p) {
    return h('div', { className: cx('s1-accordion', p.className) }, (p.items || []).map(function (it, i) {
      return h('details', { key: i, className: 's1-acc-item', open: it.open },
        h('summary', { className: 's1-acc-q' }, h('span', { className: 'heading-3' }, it.q), h(Icon, { name: 'plus', size: 22, className: 's1-acc-icon' })),
        h('div', { className: 's1-acc-a body' }, it.a));
    }));
  }

  /* ---------------------------------------------------------------- StoryQuote */
  function StoryQuote(p) {
    return h('figure', { className: cx('s1-quote', p.className) },
      h('span', { className: 's1-quote-mark', 'aria-hidden': 'true' }, '“'),
      h('blockquote', { className: 'heading-2 s1-quote-text' }, p.quote),
      h('figcaption', { className: 's1-quote-by' },
        h('span', { className: 'label' }, p.attribution),
        p.role ? h('span', { className: 'caption s1-muted' }, p.role) : null,
        p.verified ? null : h(Badge, { tone: 'placeholder' }, 'Placeholder — use only a verified, consented quote')));
  }

  /* ---------------------------------------------------------------- EmptyState */
  function EmptyState(p) {
    return h('div', { className: cx('s1-empty', p.compact && 's1-empty--compact', p.className) },
      h(Illustration, { name: p.illustration || 'empty-plate', decorative: true, className: 's1-empty-art', animate: p.animate }),
      h('div', { className: 's1-empty-copy' },
        h('h3', { className: 'heading-3' }, p.title),
        p.body ? h('p', { className: 'body-sm s1-muted' }, p.body) : null,
        p.action ? h('div', { className: 's1-empty-action' }, p.action) : null));
  }

  /* ---------------------------------------------------------------- Skeleton */
  function Skeleton(p) {
    var lines = p.lines || 3;
    return h('div', { className: cx('s1-skel', p.className), 'aria-busy': 'true', 'aria-label': p.label || 'Loading' },
      p.media ? h('div', { className: 's1-skel-media' }) : null,
      Array.apply(null, Array(lines)).map(function (_, i) { return h('div', { key: i, className: 's1-skel-line', style: { width: i === lines - 1 ? '60%' : '100%' } }); }));
  }

  /* ---------------------------------------------------------------- PublishStatus */
  var PUB = {
    draft: ['edit', 'Draft'], saving: [null, 'Saving…'], saved: ['check', 'Saved'], pending: ['calendar', 'Scheduled'],
    published: ['check-circle', 'Published'], failed: ['alert-circle', 'Failed to publish']
  };
  function PublishStatus(p) {
    var s = PUB[p.state] || PUB.draft;
    return h('span', { className: cx('s1-pub', 's1-pub--' + p.state, p.className), role: 'status' },
      s[0] ? h(Icon, { name: s[0], size: 16 }) : h(Spinner), h('span', null, p.label || s[1]));
  }

  /* ---------------------------------------------------------------- AdminTable */
  function AdminTable(p) {
    var cols = p.columns || [];
    return h('div', { className: cx('s1-table-wrap', p.className), role: 'region', 'aria-label': p.caption, tabIndex: 0 },
      h('table', { className: 's1-table' },
        p.caption ? h('caption', { className: 's1-sr' }, p.caption) : null,
        h('thead', null, h('tr', null, cols.map(function (c, i) { return h('th', { key: i, scope: 'col', className: c.align === 'end' ? 's1-num' : undefined }, c.label); }))),
        h('tbody', null, (p.rows || []).map(function (r, i) {
          return h('tr', { key: i }, cols.map(function (c, j) {
            var v = r[c.key];
            return h(j === 0 ? 'th' : 'td', { key: j, scope: j === 0 ? 'row' : undefined, className: c.align === 'end' ? 's1-num' : undefined }, v);
          }));
        }))));
  }

  window.S1P = Object.assign(window.S1P || {}, {
    Button: Button, Icon: Icon, Badge: Badge, NavBar: NavBar, Wordmark: Wordmark, HeroSection: HeroSection, Illustration: Illustration,
    AmountSelector: AmountSelector, TextField: TextField, Select: Select, Checkbox: Checkbox, ContributionSummary: ContributionSummary,
    Alert: Alert, ImpactStat: ImpactStat, Timeline: Timeline, GalleryGrid: GalleryGrid, Accordion: Accordion, StoryQuote: StoryQuote,
    EmptyState: EmptyState, Skeleton: Skeleton, Dialog: Dialog, PublishStatus: PublishStatus, AdminTable: AdminTable,
    scenes: Object.keys(SCENES), illustrationSources: SOURCES, icons: Object.keys(ICONS)
  });
})();
