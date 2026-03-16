'use strict';

/* ═══════════════════════════════════════════════════════════════
   Fringe Over 6ft — Frontend v2.8.0
   ═══════════════════════════════════════════════════════════════ */

var ICON_FALLBACKS = {
    'icon_logo':            '🪑',
    'icon_chair_0':         '✖',
    'icon_chair_1':         '🪑',
    'icon_chair_2':         '🪑',
    'icon_chair_3':         '🪑',
    'icon_chair_4':         '🪑',
    'icon_chair_5':         '🪑',
    'icon_vice':            '🗜️',
    'icon_armchair':        '🪑',
    'icon_trophy':          '🏆',
    'icon_medal_gold':      '🥇',
    'icon_medal_silver':    '🥈',
    'icon_medal_bronze':    '🥉',
    'icon_skull':           '💀',
    'icon_crossbones':      '☠️',
    'icon_bone':            '🦴',
    'icon_cat_construction':'🏗️',
    'icon_cat_ruler':       '📏',
    'icon_cat_sardine':     '🥫',
    'icon_cat_warning':     '⚠️',
    'icon_cat_circus':      '🎪',
    'icon_cat_dice':        '🎲',
    'icon_cat_building':    '🏛️',
    'icon_cat_bear':        '🐻',
    'icon_cat_diamond':     '💎',
    'icon_cat_star':        '⭐',
    'icon_cat_firstclass':  '✈️',
    'icon_cat_fire':        '🔥',
    'icon_ticket':          '📸',
    'icon_height':          '📏',
    'icon_map':             '📍',
    'icon_star_verified':   '✅',
    'icon_pending':         '⏳',
    'icon_shame':           '💀',
    'icon_fame':            '🏆',
    'icon_stats':           '📊',
    'icon_review':          '✍️',
    'icon_zero':            '✖',
    'icon_fringe':          '🎭',
    'icon_intl':            '🎼',
    'icon_both':            '🎭',
    'icon_settings':        '⚙️',
    'icon_admin':           '🛡',
    'icon_user':            '👤',
    'icon_users':           '👥',
    'icon_myreviews':       '📋',
    'icon_flag':            '🚩',
    'icon_delete':          '🗑',
    'icon_edit':            '✏️',
    'icon_comments':        '💬',
    'icon_celebrate':       '🎉',
    'icon_warning':         '⚠️',
    'icon_close':           '✕',
    'icon_hotel':           '🏨',
    'icon_shows':           '🎟️',
    'icon_explore':         '🗺️',
    'icon_press':           '📰',
    'icon_email':           '📧',
    'icon_money':           '💰',
    'icon_measure':         '📐',
    'icon_scotland':        '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'icon_bed':             '🛏️',
    'icon_clock':           '🕐',
    'icon_calendar':        '📅'
};

var AWARD_ICON_MAP = {
    '🗜️': 'icon_vice',
    '🏗️': 'icon_cat_construction',
    '📏': 'icon_cat_ruler',
    '🥫': 'icon_cat_sardine',
    '⚠️': 'icon_cat_warning',
    '🎪': 'icon_cat_circus',
    '🎲': 'icon_cat_dice',
    '🏆': 'icon_trophy',
    '🏛️': 'icon_cat_building',
    '🐻': 'icon_cat_bear',
    '💎': 'icon_cat_diamond',
    '⭐': 'icon_cat_star',
    '✈️': 'icon_cat_firstclass',
    '🔥': 'icon_cat_fire'
};

var AWARD_ART = {
    'vice-overall':  'award_vice_overall',
    'vice-large':    'award_vice_large',
    'vice-mid':      'award_vice_mid',
    'vice-intimate': 'award_vice_intimate',
    'vice-indie':    'award_vice_indie',
    'vice-operator': 'award_vice_operator',
    'vice-marmite':  'award_vice_marmite',
    'gold-overall':  'award_gold_overall',
    'gold-large':    'award_gold_large',
    'gold-mid':      'award_gold_mid',
    'gold-intimate': 'award_gold_intimate',
    'gold-indie':    'award_gold_indie',
    'gold-operator': 'award_gold_operator',
    'gold-peoples':  'award_gold_peoples'
};

var ICON_CACHE = {};
var IMG_BASE = '/img/';


/* ───────────────────────────────────────────────────────────────
   Icon helper functions
   ─────────────────────────────────────────────────────────────── */

function checkIcon(iconId, callback) {
    if (ICON_CACHE[iconId] !== undefined) {
        if (callback) callback(ICON_CACHE[iconId]);
        return;
    }
    var img = new Image();
    img.onload = function () { ICON_CACHE[iconId] = img.src; if (callback) callback(img.src); };
    img.onerror = function () {
        var img2 = new Image();
        img2.onload = function () { ICON_CACHE[iconId] = img2.src; if (callback) callback(img2.src); };
        img2.onerror = function () { ICON_CACHE[iconId] = null; if (callback) callback(null); };
        img2.src = IMG_BASE + iconId + '.png';
    };
    img.src = IMG_BASE + iconId + '.webp';
}

function initIcons() {
    document.querySelectorAll('.si-wrap[data-icon]').forEach(function (wrap) {
        activateIconWrap(wrap, wrap.dataset.icon);
    });
}

function activateIconWrap(wrap, iconId) {
    if (!iconId) return;
    checkIcon(iconId, function (src) {
        if (src) {
            var imgEl = wrap.querySelector('.si-img');
            if (imgEl) {
                imgEl.src = src;
                imgEl.alt = iconId;
                imgEl.style.display = '';
                wrap.classList.add('loaded');
                var emojiEl = wrap.querySelector('.si-emoji');
                if (emojiEl) emojiEl.style.display = 'none';
            }
        }
    });
}

function mkIcon(iconId, emoji, w, h) {
    if (!w) w = 16;
    if (!h) h = w;
    var fb = emoji || ICON_FALLBACKS[iconId] || '';
    return '<span class="si-wrap" style="width:' + w + 'px;height:' + h + 'px" data-icon="' + iconId + '">' +
        '<img class="si-img" src="" alt=""><span class="si-emoji">' + fb + '</span></span>';
}

function initDynamicIcons(container) {
    var wraps = (container || document).querySelectorAll('.si-wrap[data-icon]:not(.loaded)');
    wraps.forEach(function (wrap) {
        var iconId = wrap.dataset.icon;
        if (ICON_CACHE[iconId]) {
            var imgEl = wrap.querySelector('.si-img');
            if (imgEl) {
                imgEl.src = ICON_CACHE[iconId];
                imgEl.alt = iconId;
                imgEl.style.display = '';
                wrap.classList.add('loaded');
                var emojiEl = wrap.querySelector('.si-emoji');
                if (emojiEl) emojiEl.style.display = 'none';
            }
        } else if (ICON_CACHE[iconId] === undefined) {
            activateIconWrap(wrap, iconId);
        }
    });
}

function applyArtImage(artId, containerEl, imgSelector, hasImgClass) {
    if (!containerEl) return;
    checkIcon(artId, function (src) {
        if (src) {
            var imgEl = containerEl.querySelector(imgSelector);
            if (imgEl) {
                imgEl.src = src;
                imgEl.style.display = '';
                containerEl.classList.add(hasImgClass || 'has-img');
            }
        }
    });
}


/* ═══════════════════════════════════════════════════════════════
   CHAIR RATING SYSTEM
   ═══════════════════════════════════════════════════════════════ */

function mkChair(level, w, h) {
    if (!w) w = 18;
    if (!h) h = w;
    return mkIcon('icon_chair_' + level, ICON_FALLBACKS['icon_chair_' + level] || '🪑', w, h);
}

function mkChairRating(rating, w, h) {
    if (!w) w = 18;
    if (!h) h = w;
    if (rating == null) return '';
    var r = Math.round(rating);
    if (r === 0) return mkIcon('icon_chair_0', '✖', w, h);
    var html = '';
    for (var i = 0; i < r; i++) html += mkIcon('icon_chair_' + r, ICON_FALLBACKS['icon_chair_' + r] || '🪑', w, h);
    return html;
}

function mkChairInline(rating, w) {
    if (!w) w = 14;
    if (rating == null) return '';
    var r = Math.round(rating);
    if (r === 0) return mkIcon('icon_chair_0', '✖', w, w);
    var html = '';
    for (var i = 0; i < r; i++) html += mkIcon('icon_chair_' + r, ICON_FALLBACKS['icon_chair_' + r] || '🪑', w, w);
    return html;
}

function resolveAwardIcon(emoji) { return AWARD_ICON_MAP[emoji] || null; }

function mkAwardCatIcon(emoji, w, h) {
    var iconId = resolveAwardIcon(emoji);
    if (iconId) return mkIcon(iconId, emoji, w || 16, h || w || 16);
    return '<span class="si-emoji">' + emoji + '</span>';
}


/* ═══════════════════════════════════════════════════════════════
   APPLICATION STATE
   ═══════════════════════════════════════════════════════════════ */

var S = {
    user: null, view: 'home', vid: null, sid: null, awId: null,
    fest: 'all', grp: 'all', leg: null, sd: null,
    revs: [], ri: 0, rt: null, tickers: [],
    statsSection: 'overview', statsCache: null,
    awardCats: null, awVi: 0, awGi: 0, awT: null, awPaused: false, awdsTab: 'vice',
    _skipPush: false, ticketFile: null,
    reportTab: 'best', opReportTab: 'best',
    admSection: 'dashboard', admRevPage: 0, admRevFilter: 'all', admRevTotal: 0,
    admUserPage: 0, admUserTotal: 0, admUserQ: '', editingUserId: null,
    userActivity: null, activityLoaded: false,
    myRevPage: 0, myRevTotal: 0, myRevs: []
};


/* ═══════════════════════════════════════════════════════════════
   CONSTANTS & UTILITIES
   ═══════════════════════════════════════════════════════════════ */

var SIGMA = 15;
var AW_SHOW = 4;
var AW_CYCLE_MS = 9000;
var AW_FADE_MS = 650;

var LD = ["Can't sit", 'Agonising', 'Cramped', 'Bearable', 'Comfortable', 'Luxurious'];

var FB = {
    intl:   ['intl',   'icon_intl'],
    fringe: ['fringe', 'icon_fringe'],
    both:   ['both',   'icon_both']
};

var GL = {
    pleasance: 'Pleasance', assembly: 'Assembly', underbelly: 'Underbelly',
    gilded: 'Gilded Balloon', theSpace: 'theSpace', laughing: 'LH / JtT',
    pbh: 'PBH Free Fringe', monkey: 'Monkey Barrel', stand: 'The Stand',
    zoo: 'ZOO', other: 'Independent', intl: "Int'l Festival"
};

function gauss(a, b) { return Math.exp(-0.5 * ((a - b) / SIGMA) * ((a - b) / SIGMA)); }
function $(id) { return document.getElementById(id); }

function esc(s) {
    return String(s != null ? s : '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function cm2fi(cm) { return { ft: Math.floor(cm / 2.54 / 12), in: Math.round(cm / 2.54 % 12) }; }
function fi2cm(f, i) { return ((+f * 12) + (+i || 0)) * 2.54; }
function fh(cm) { var h = cm2fi(cm); return h.ft + "'" + h.in + '" / ' + Math.round(cm) + 'cm'; }

function api(u, o) {
    if (!o) o = {};
    return fetch(u, Object.assign({ headers: { 'Content-Type': 'application/json' } }, o))
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw Object.assign({ status: r.status }, d); return d; }); });
}


/* ───────────────────────────────────────────────────────────────
   Rating Display Functions
   ─────────────────────────────────────────────────────────────── */

function legs(v, desc) {
    if (v == null) return '<span class="nr">No ratings</span>';
    var f = Math.round(v);
    var h = '<div class="legs">';
    if (!f) {
        h += '<span class="z">' + mkIcon('icon_chair_0', '✖', 18, 18) + ' Zero</span>';
    } else {
        for (var i = 0; i < f; i++) h += '<span class="l">' + mkIcon('icon_chair_' + f, ICON_FALLBACKS['icon_chair_' + f] || '🪑', 18, 18) + '</span>';
        for (var j = f; j < 5; j++) h += '<span class="l e">' + mkIcon('icon_chair_' + f, ICON_FALLBACKS['icon_chair_' + f] || '🪑', 18, 18) + '</span>';
    }
    if (desc) h += '<span class="s" style="font-style:italic">' + LD[f] + '</span>';
    h += '<span class="s">' + v.toFixed(1) + '</span></div>';
    return h;
}

function legsI(v) {
    if (v == null) return '';
    var f = Math.round(v);
    return f ? mkChairInline(f) : mkIcon('icon_chair_0', '✖', 14, 14);
}

function legsS(r) {
    if (!r && r !== 0) return mkIcon('icon_chair_0', '✖', 16, 16);
    if (r === 0) return mkIcon('icon_chair_0', '✖', 16, 16);
    return mkChairRating(r, 16, 16);
}


/* ───────────────────────────────────────────────────────────────
   UI Helpers
   ─────────────────────────────────────────────────────────────── */

function toast(m, t) {
    if (!t) t = 'ok';
    var w = $('tw');
    var e = document.createElement('div');
    e.className = 't ' + t;
    e.textContent = m;
    w.appendChild(e);
    setTimeout(function () {
        e.style.animation = 'tOut .2s ease forwards';
        setTimeout(function () { e.remove(); }, 210);
    }, 2800);
}

function pws(p) {
    var s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
}

function upwb(p, id) {
    var b = $(id); if (!b) return;
    var s = pws(p);
    b.style.width = (s / 5 * 100) + '%';
    b.style.background = p.length ? ['#8b1a1a','#c05020','#c09020','#8aaa30','#4a7c59'][Math.max(0,s-1)] : 'transparent';
}

function festBadge(festival) {
    var fb = FB[festival];
    if (!fb) return '<span class="badge">' + esc(festival) + '</span>';
    var iconId = fb[1];
    var label = festival === 'intl' ? "Int'l" : festival === 'fringe' ? 'Fringe' : 'Both';
    return '<span class="badge ' + fb[0] + '">' + mkIcon(iconId, ICON_FALLBACKS[iconId], 12, 12) + ' ' + label + '</span>';
}


/* ───────────────────────────────────────────────────────────────
   Edinburgh Promo Bottom Half
   ─────────────────────────────────────────────────────────────── */

function mkCtaEdinburghPromo() {
    return '<div class="cta-bottom-half">' +
        '<div class="cta-ed-label">Plan your visit</div>' +
        '<div class="cta-ed-img-wrap" id="ctaEdImgWrap">' +
            '<img class="cta-ed-site-img" src="" alt="Edinburgh">' +
            '<span class="cta-ed-ph">' + mkIcon('icon_scotland', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 28, 28) + '</span>' +
        '</div>' +
        '<div class="cta-ed-text-block">' +
            '<div class="cta-ed-title">Visit Edinburgh</div>' +
            '<div class="cta-ed-desc">Hotels, travel &amp; city guides — sorted before August.</div>' +
        '</div>' +
        '<a href="#" onclick="return false" class="cta-ed-link">' +
            mkIcon('icon_hotel', '🏨', 12, 12) + ' Explore Edinburgh Deals →' +
        '</a>' +
        '<div class="cta-ed-disclaim">Affiliate link · helps keep this site free</div>' +
    '</div>';
}


/* ───────────────────────────────────────────────────────────────
   Promo Panel Builders
   ─────────────────────────────────────────────────────────────── */

function mkCard(iconId, iconEmoji, title, desc, cta, hdr) {
    return '<div class="pn-w">' +
        '<div class="pn-hd">' + (hdr || 'These links help keep this site free ' + mkIcon('icon_logo', '🪑', 14, 14)) + '</div>' +
        '<div class="pn-c">' +
            '<div class="pn-i"><span class="pn-ic">' + mkIcon(iconId, iconEmoji, 32, 32) + '</span><span class="pn-il">Image Placeholder</span></div>' +
            '<div class="pn-b">' +
                '<div class="pn-t">' + esc(title) + '</div>' +
                '<div class="pn-d">' + esc(desc) + '</div>' +
                '<div class="pn-a" style="margin-top:.4rem"><a href="#" onclick="return false">' + esc(cta) + ' →</a></div>' +
            '</div>' +
        '</div></div>';
}

function mkStrip(iconId, iconEmoji, title, desc, cta, hdr) {
    return '<div class="pn-w">' +
        '<div class="pn-hd">' + (hdr || 'Using these links helps keep Fringe Over 6ft free — thank you ' + mkIcon('icon_logo', '🪑', 14, 14)) + '</div>' +
        '<div class="pn-lb">' +
            '<div class="pn-li"><span class="pn-ic">' + mkIcon(iconId, iconEmoji, 26, 26) + '</span><span class="pn-il">Image Placeholder</span></div>' +
            '<div class="pn-lbd">' +
                '<div style="flex:1;min-width:0"><div class="pn-lt">' + esc(title) + '</div><div class="pn-ld">' + esc(desc) + '</div></div>' +
                '<div class="pn-la"><a href="#" onclick="return false">' + esc(cta) + ' →</a></div>' +
            '</div>' +
        '</div></div>';
}


/* ═══════════════════════════════════════════════════════════════
   HISTORY / ROUTING
   ═══════════════════════════════════════════════════════════════ */

function buildHistoryState() {
    return { view: S.view, vid: S.vid, sid: S.sid, awId: S.awId, awdsTab: S.awdsTab };
}

function pushHistory() {
    if (S._skipPush) return;
    var hash = '#home';
    if (S.view === 'home') hash = '#home';
    else if (S.view === 'venue') hash = '#venue/' + S.vid;
    else if (S.view === 'stage') hash = '#stage/' + S.vid + '/' + S.sid;
    else if (S.view === 'awards') hash = '#awards/' + S.awdsTab;
    else if (S.view === 'award') hash = '#award/' + S.awId;
    else hash = '#' + S.view;
    history.pushState(buildHistoryState(), '', hash);
}

window.addEventListener('popstate', function (e) {
    var st = e.state;
    if (!st) { nav('home'); return; }
    S._skipPush = true;
    if (st.awdsTab) S.awdsTab = st.awdsTab;
    nav(st.view, st.vid, st.sid, st.awId);
    S._skipPush = false;
});


/* ═══════════════════════════════════════════════════════════════
   PRESS RELEASES
   ═══════════════════════════════════════════════════════════════ */

var PRESS_RELEASES = [
    {
        date: '2025-01-15',
        kicker: 'Awards Announcement',
        title: 'Fringe Over 6ft Announces 2025 Kneecap in a Vice Awards Categories',
        excerpt: 'Seven categories of shame, seven of glory.',
        body: '<p><strong>Edinburgh, 15 January 2025</strong> — The fourteen awards will be determined entirely by height-weighted community reviews.</p>'
    },
    {
        date: '2024-08-28',
        kicker: 'Season Wrap',
        title: '2024 Festival Season: What 18 Pairs of Knees Told Us',
        excerpt: 'Early data suggests a correlation between "converted church" and "physiotherapy appointment".',
        body: '<p><strong>Edinburgh, 28 August 2024</strong> — Purpose-built theatre stalls significantly outperform temporary seating.</p>'
    }
];


/* ═══════════════════════════════════════════════════════════════
   AWARDS
   ═══════════════════════════════════════════════════════════════ */

function loadAwards() {
    return api('/api/awards').then(function (data) {
        S.awardCats = data.categories;

        var fame = data.categories
            .filter(function (c) { return c.type === 'gold' && c.contenders[0] && c.contenders[0].reviewed; })
            .map(function (c) { return Object.assign({ category: c.short || c.name, icon: c.icon }, c.contenders[0]); });

        var shame = data.categories
            .filter(function (c) { return c.type === 'vice' && c.contenders[0] && c.contenders[0].reviewed; })
            .map(function (c) { return Object.assign({ category: c.short || c.name, icon: c.icon }, c.contenders[0]); });

        if (fame.length || shame.length) {
            mkTkr('ftk', fame, 'fame');
            mkTkr('stk', shame, 'shame');
            showTicker(S.view === 'home');
        }

        renderAwardsHome();
        startAwardsTimer();

        if (S.view === 'awards') renderAwardsPage();
        if (S.view === 'award' && S.awId) loadAward(S.awId);
    }).catch(function (e) { console.warn('Awards:', e); });
}

function showTicker(show) {
    var el = $('ticker');
    if (show && S.awardCats) {
        el.classList.remove('hidden');
        document.body.classList.add('has-ticker');
    } else {
        el.classList.add('hidden');
        document.body.classList.remove('has-ticker');
    }
}

function leadHTML(c) {
    if (!c) return '<div class="aw-tile-lead empty">No venues yet</div>';
    if (!c.reviewed) return '<div class="aw-tile-lead"><span class="aw-tile-nr">Awaiting reviews</span></div>';
    return '<div class="aw-tile-lead">Leading: <b>' + esc(c.name) + '</b> · ' + c.avg_rating.toFixed(1) + '</div>';
}

function tileInner(c) {
    var lead = null;
    for (var i = 0; i < c.contenders.length; i++) { if (c.contenders[i].reviewed) { lead = c.contenders[i]; break; } }
    var artId = AWARD_ART[c.id] || null;
    var imgHtml = artId ? '<img class="tile-site-img" src="" alt="' + esc(c.name) + '" data-art="' + artId + '" style="display:none">' : '';
    var catIconHtml = mkAwardCatIcon(c.icon, 28, 28);
    return '<div class="aw-tile-img" id="tile-img-' + esc(c.id) + '">' + imgHtml + '<span class="ph-ic">' + catIconHtml + '</span><span class="ph-lb">Art · 4:3</span></div>' +
        '<div class="aw-tile-body"><div class="aw-tile-name">' + esc(c.name) + '</div><div class="aw-tile-tag">' + esc(c.tagline) + '</div>' + leadHTML(lead) + '<div class="aw-tile-cta">View contenders →</div></div>';
}

function renderStripTiles(trackEl, cats, startIdx, fading) {
    var n = Math.min(AW_SHOW, cats.length);
    var html = '';
    for (var i = 0; i < n; i++) {
        var c = cats[(startIdx + i) % cats.length];
        html += '<div class="aw-tile ' + c.type + (fading ? ' out' : '') + '" data-nav="award" data-award="' + c.id + '">' + tileInner(c) + '</div>';
    }
    trackEl.innerHTML = html;
    trackEl.querySelectorAll('.tile-site-img[data-art]').forEach(function (imgEl) {
        applyArtImage(imgEl.dataset.art, imgEl.closest('.aw-tile-img'), '.tile-site-img', 'has-img');
    });
    initDynamicIcons(trackEl);
}

function renderAwardsHome(fading) {
    if (!S.awardCats) return;
    var vice = S.awardCats.filter(function (c) { return c.type === 'vice'; });
    var gold = S.awardCats.filter(function (c) { return c.type === 'gold'; });
    renderStripTiles($('awViceTrack'), vice, S.awVi, fading);
    renderStripTiles($('awGoldTrack'), gold, S.awGi, fading);
    var vl = $('awViceLabel');
    if (vl) vl.textContent = vice.length > AW_SHOW ? AW_SHOW + ' of ' + vice.length + ' · cycling' : vice.length + ' categories';
    var gl = $('awGoldLabel');
    if (gl) gl.textContent = gold.length > AW_SHOW ? AW_SHOW + ' of ' + gold.length + ' · cycling' : gold.length + ' categories';
    $('awardsOuter').classList.remove('hidden');
}

function cycleAwardsHome() {
    if (S.view !== 'home' || S.awPaused || !S.awardCats) return;
    var vice = S.awardCats.filter(function (c) { return c.type === 'vice'; });
    var gold = S.awardCats.filter(function (c) { return c.type === 'gold'; });
    if (vice.length <= AW_SHOW && gold.length <= AW_SHOW) return;
    $('awViceTrack').querySelectorAll('.aw-tile').forEach(function (e) { e.classList.add('out'); });
    $('awGoldTrack').querySelectorAll('.aw-tile').forEach(function (e) { e.classList.add('out'); });
    setTimeout(function () {
        if (vice.length > AW_SHOW) S.awVi = (S.awVi + 1) % vice.length;
        if (gold.length > AW_SHOW) S.awGi = (S.awGi + 1) % gold.length;
        renderAwardsHome(true);
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                $('awViceTrack').querySelectorAll('.aw-tile').forEach(function (e) { e.classList.remove('out'); });
                $('awGoldTrack').querySelectorAll('.aw-tile').forEach(function (e) { e.classList.remove('out'); });
            });
        });
    }, AW_FADE_MS);
}

function startAwardsTimer() {
    if (S.awT) clearInterval(S.awT);
    S.awT = setInterval(cycleAwardsHome, AW_CYCLE_MS);
}

function renderAwardsPage() {
    if (!S.awardCats) { $('awdsList').innerHTML = '<div class="no-rv">Loading…</div>'; return; }

    document.querySelectorAll('.awds-tab').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === S.awdsTab); });

    var cats = S.awardCats.filter(function (c) { return c.type === S.awdsTab; });
    var isVice = S.awdsTab === 'vice';
    var trophyIcons = isVice ? ['icon_skull','icon_crossbones','icon_bone'] : ['icon_medal_gold','icon_medal_silver','icon_medal_bronze'];
    var trophyEmoji = isVice ? ['💀','☠️','🦴'] : ['🥇','🥈','🥉'];
    var seriesLabel = isVice
        ? mkIcon('icon_vice', '🗜️', 14, 14) + ' Kneecap in a Vice'
        : mkIcon('icon_armchair', '🪑', 14, 14) + ' Golden Armchair';

    function rowHTML(c, i, catId, isUnrev) {
        var clickable = c.venue_id && c.stage_id && !isUnrev;
        var navAttr = clickable ? 'data-nav="stage" data-vid="' + c.venue_id + '" data-sid="' + c.stage_id + '"' : '';
        var rank = isUnrev ? '<span class="awds-rank-n">—</span>'
            : i < 3 ? '<span>' + mkIcon(trophyIcons[i], trophyEmoji[i], 20, 20) + '</span>'
                    : '<span class="awds-rank-n">' + (i + 1) + '</span>';
        var lg = c.avg_rating != null ? Math.round(c.avg_rating) : null;
        var legStr = lg != null ? mkChairInline(lg) : '';
        var scoreV = c.avg_rating != null ? c.avg_rating.toFixed(2) : null;
        var extra = c.variance != null && catId === 'vice-marmite' ? '<div class="awds-row-extra">σ² ' + c.variance.toFixed(2) + '</div>' : '';
        return '<div class="awds-row ' + (!isUnrev && i === 0 ? 'r1 ' : '') + (clickable ? 'clickable ' : '') + (isUnrev ? 'unreviewed' : '') + '" ' + navAttr + '>' +
            '<div class="awds-rank">' + rank + '</div>' +
            '<div class="awds-row-info"><div class="awds-row-name">' + esc(c.name) + '</div>' +
                '<div class="awds-row-sub">' + esc(c.sub) + (c.cnt > 0 ? ' · ' + c.cnt + ' review' + (c.cnt !== 1 ? 's' : '') : '') + (isUnrev ? ' · <em>no reviews yet</em>' : '') + '</div></div>' +
            '<div class="awds-row-score">' + (!isUnrev
                ? '<div class="awds-row-legs">' + legStr + '</div><div class="awds-row-v">' + scoreV + '</div>' + extra
                : '<div class="awds-row-v nr">—</div>') + '</div></div>';
    }

    $('awdsList').innerHTML = cats.map(function (cat) {
        var reviewed = cat.contenders.filter(function (c) { return c.reviewed; });
        var unreviewed = cat.contenders.filter(function (c) { return !c.reviewed; });
        var top5 = reviewed.slice(0, 5);
        var restReviewed = reviewed.slice(5);
        var hasMore = restReviewed.length > 0 || unreviewed.length > 0;
        var totalShown = reviewed.length + unreviewed.length;
        var artId = AWARD_ART[cat.id] || null;
        var artImgHtml = artId ? '<img class="art-site-img" src="" alt="' + esc(cat.name) + '" data-art="' + artId + '" style="display:none">' : '';
        var catIconHtml = mkAwardCatIcon(cat.icon, 40, 40);

        var html = '<article class="awds-card ' + cat.type + '" data-cat="' + cat.id + '">' +
            '<div class="awds-head">' +
                '<div class="awds-art" id="awds-art-' + esc(cat.id) + '">' + artImgHtml + '<span class="ph-ic">' + catIconHtml + '</span><span class="ph-lb">4:3</span></div>' +
                '<div class="awds-head-body"><div class="awds-series">' + seriesLabel + '</div><h2 class="awds-name">' + esc(cat.name) + '</h2><div class="awds-tagline">' + esc(cat.tagline) + '</div><div class="awds-quip">' + esc(cat.quip) + '</div></div>' +
            '</div>';

        if (!reviewed.length && !unreviewed.length) {
            html += '<div class="awds-empty">No venues in this category yet.</div>';
        } else {
            html += '<div class="awds-rows">' + top5.map(function (c, i) { return rowHTML(c, i, cat.id, false); }).join('') + '</div>';
            if (hasMore) {
                html += '<div class="awds-more">';
                if (restReviewed.length) html += '<div class="awds-rows">' + restReviewed.map(function (c, i) { return rowHTML(c, i + 5, cat.id, false); }).join('') + '</div>';
                if (unreviewed.length) {
                    html += '<div class="awds-unreviewed-section"><div class="awds-unreviewed-label">Awaiting Reviews (' + unreviewed.length + ')</div>' +
                        '<div class="awds-rows">' + unreviewed.map(function (c, i) { return rowHTML(c, i, cat.id, true); }).join('') + '</div></div>';
                }
                html += '</div>';
            }
        }
        if (hasMore) html += '<button class="awds-expand" data-toggle="' + cat.id + '"><span class="lbl">Show all ' + totalShown + '</span><span class="chev">▾</span></button>';
        html += '</article>';
        return html;
    }).join('');

    var container = $('awdsList');
    container.querySelectorAll('.art-site-img[data-art]').forEach(function (imgEl) {
        applyArtImage(imgEl.dataset.art, imgEl.closest('.awds-art'), '.art-site-img', 'has-img');
    });
    initDynamicIcons(container);

    $('awdsList').querySelectorAll('.awds-expand').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var card = btn.closest('.awds-card');
            var open = card.classList.toggle('expanded');
            var total = card.querySelectorAll('.awds-row').length;
            btn.querySelector('.lbl').textContent = open ? 'Show top 5 only' : 'Show all ' + total;
        });
    });
}

function loadAward(catId) {
    if (!S.awardCats) {
        ['awpHero','awpShd','awpOthers','awpUnreviewed'].forEach(function (id) { $(id).innerHTML = ''; });
        $('awpList').innerHTML = '<div class="no-rv">Loading…</div>';
        return;
    }

    var cat = null;
    for (var i = 0; i < S.awardCats.length; i++) { if (S.awardCats[i].id === catId) { cat = S.awardCats[i]; break; } }
    if (!cat) { nav('awards'); return; }

    var isVice = cat.type === 'vice';
    var seriesLabel = isVice
        ? mkIcon('icon_vice', '🗜️', 14, 14) + ' Kneecap in a Vice Awards'
        : mkIcon('icon_armchair', '🪑', 14, 14) + ' Golden Armchair Awards';

    var artId = AWARD_ART[catId] || null;
    var artImgHtml = artId ? '<img class="awp-site-img" src="" alt="' + esc(cat.name) + '" data-art="' + artId + '" style="display:none">' : '';
    var catIconHtml = mkAwardCatIcon(cat.icon, 64, 64);

    $('awpHero').innerHTML = '<div class="awp-hero ' + cat.type + '">' +
        '<div class="awp-art" id="awp-art-main">' + artImgHtml + '<span class="ph-ic">' + catIconHtml + '</span><span class="ph-lb">Cover · 4:3</span></div>' +
        '<div class="awp-body"><div class="awp-series">' + seriesLabel + '</div><h1 class="awp-title">' + esc(cat.name) + '</h1><div class="awp-tag">' + esc(cat.tagline) + '</div><div class="awp-quip">' + esc(cat.quip) + '</div></div>' +
    '</div>';

    if (artId) applyArtImage(artId, $('awp-art-main'), '.awp-site-img', 'has-img');
    initDynamicIcons($('awpHero'));

    var reviewed = cat.contenders.filter(function (c) { return c.reviewed; });
    var unreviewed = cat.contenders.filter(function (c) { return !c.reviewed; });

    $('awpShd').innerHTML = '<div class="awp-shd ' + cat.type + '"><h2 class="awp-sht">Current Rankings</h2><span class="shc">' + reviewed.length + ' reviewed · ' + unreviewed.length + ' awaiting · Updated live</span></div>';

    var trophyIcons = isVice ? ['icon_skull','icon_crossbones','icon_bone'] : ['icon_medal_gold','icon_medal_silver','icon_medal_bronze'];
    var trophyEmoji = isVice ? ['💀','☠️','🦴'] : ['🥇','🥈','🥉'];

    $('awpList').innerHTML = !reviewed.length ? '<div class="no-rv">No reviewed venues yet.</div>'
        : reviewed.map(function (c, i) {
            var clickable = c.venue_id && c.stage_id;
            var navAttr = clickable ? 'data-nav="stage" data-vid="' + c.venue_id + '" data-sid="' + c.stage_id + '"' : '';
            var rank = i < 3 ? mkIcon(trophyIcons[i], trophyEmoji[i], 24, 24) : '<span class="awp-rank-n">' + (i + 1) + '</span>';
            var legStr = c.avg_rating != null ? mkChairInline(Math.round(c.avg_rating)) : '';
            var extra = (c.variance != null && cat.id === 'vice-marmite') ? '<div class="awp-score-extra">σ² ' + c.variance.toFixed(2) + '</div>' : '';
            return '<div class="awp-row ' + cat.type + ' ' + (i === 0 ? 'r1 ' : '') + (clickable ? 'clickable' : '') + '" ' + navAttr + '>' +
                '<div class="awp-rank">' + rank + '</div>' +
                '<div class="awp-info"><div class="awp-name">' + esc(c.name) + '</div><div class="awp-sub">' + esc(c.sub) + '</div><div class="awp-det">' + esc(c.detail) + ' · ' + c.cnt + ' review' + (c.cnt !== 1 ? 's' : '') + '</div></div>' +
                '<div class="awp-score"><div class="awp-score-legs">' + legStr + '</div><div class="awp-score-v">' + c.avg_rating.toFixed(2) + '/5</div>' + extra + '</div></div>';
        }).join('');

    initDynamicIcons($('awpList'));

    $('awpUnreviewed').innerHTML = !unreviewed.length ? '' :
        '<div class="awp-unreviewed-section"><div class="awp-unreviewed-label">Awaiting Reviews — ' + unreviewed.length + ' eligible venue' + (unreviewed.length !== 1 ? 's' : '') + '</div>' +
        '<div class="awp-list" style="margin-top:.5rem">' +
            unreviewed.map(function (c) {
                var clickable = c.venue_id && c.stage_id;
                var navAttr = clickable ? 'data-nav="stage" data-vid="' + c.venue_id + '" data-sid="' + c.stage_id + '"' : '';
                return '<div class="awp-row unreviewed ' + (clickable ? 'clickable' : '') + '" ' + navAttr + '>' +
                    '<div class="awp-rank"><span class="awp-rank-n">—</span></div>' +
                    '<div class="awp-info"><div class="awp-name">' + esc(c.name) + '</div><div class="awp-sub">' + esc(c.sub) + '</div><div class="awp-det">' + esc(c.detail) + ' · no reviews yet</div></div>' +
                    '<div class="awp-score"><div class="awp-score-v nr">Awaiting reviews</div></div></div>';
            }).join('') +
        '</div></div>';

    var siblings = S.awardCats.filter(function (c) { return c.type === cat.type && c.id !== catId; });
    $('awpOthers').innerHTML = '<div class="awp-others-h">More ' + (isVice ? 'Kneecap in a Vice' : 'Golden Armchair') + ' categories</div>' +
        '<div class="awp-others-grid">' +
            siblings.map(function (s) { return '<span class="awp-other ' + s.type + '" data-nav="award" data-award="' + s.id + '">' + mkAwardCatIcon(s.icon, 14, 14) + ' ' + esc(s.name) + '</span>'; }).join('') +
            '<span class="awp-other" data-nav="awards" data-tab="' + cat.type + '">← All awards</span>' +
        '</div>';

    initDynamicIcons($('awpOthers'));
    bc([{ l: 'All Venues', v: 'home' }, { l: 'Awards', v: 'awards' }, { l: cat.name, a: true }]);
}


/* ═══════════════════════════════════════════════════════════════
   PRESS
   ═══════════════════════════════════════════════════════════════ */

function renderPress() {
    var el = $('prsList');
    if (!PRESS_RELEASES.length) { el.innerHTML = '<div class="prs-empty">No press releases yet.</div>'; return; }
    var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    el.innerHTML = PRESS_RELEASES.map(function (p) {
        var d = new Date(p.date);
        return '<article class="prs-item">' +
            '<div class="prs-head">' +
                '<div class="prs-date"><div class="prs-date-d">' + d.getDate() + '</div><div class="prs-date-m">' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + '</div></div>' +
                '<div class="prs-head-body"><div class="prs-kicker">' + esc(p.kicker) + '</div><div class="prs-title">' + esc(p.title) + '</div><div class="prs-excerpt">' + esc(p.excerpt) + '</div></div>' +
                '<div class="prs-chev">▸</div>' +
            '</div>' +
            '<div class="prs-body"><div class="prs-body-inner">' + p.body + '</div></div>' +
        '</article>';
    }).join('');
    el.querySelectorAll('.prs-head').forEach(function (h) {
        h.addEventListener('click', function () { h.closest('.prs-item').classList.toggle('open'); });
    });
}


/* ═══════════════════════════════════════════════════════════════
   TICKER
   ═══════════════════════════════════════════════════════════════ */

function Ticker(el, speed) {
    this.el = el; this.spd = speed || 0.4; this.pos = 0; this.paused = false; this.running = true;
    var self = this;
    el.addEventListener('mouseenter', function () { self.paused = true; });
    el.addEventListener('mouseleave', function () { self.paused = false; });
    el.addEventListener('touchstart', function () { self.paused = true; }, { passive: true });
    el.addEventListener('touchend', function () { setTimeout(function () { self.paused = false; }, 100); }, { passive: true });
    this.tick();
}

Ticker.prototype.tick = function () {
    if (!this.running) return;
    if (!this.paused) {
        this.pos -= this.spd;
        var hw = this.el.scrollWidth / 2;
        if (hw > 0 && Math.abs(this.pos) >= hw) this.pos = 0;
        this.el.style.transform = 'translateX(' + this.pos + 'px)';
    }
    var self = this;
    requestAnimationFrame(function () { self.tick(); });
};

Ticker.prototype.stop = function () { this.running = false; };

function mkTkr(id, items, type) {
    var el = $(id);
    if (!items.length) return;
    var h = items.map(function (i) { return tiHTML(i, type); }).join('');
    el.innerHTML = h + h;
    initDynamicIcons(el);
    S.tickers.push(new Ticker(el, items.length > 5 ? 0.5 : 0.3));
}

function tiHTML(i, type) {
    var c = type === 'fame' ? 'fame' : 'shame';
    var nv = (i.venue_id && i.stage_id) ? 'data-nav="stage" data-vid="' + i.venue_id + '" data-sid="' + i.stage_id + '"' : '';
    var catIconHtml = mkAwardCatIcon(i.icon || '', 12, 12);
    var scoreHtml = legsI(i.avg_rating);
    return '<div class="ticker-item" ' + nv + '>' +
        '<span class="ti-cat">' + catIconHtml + ' ' + esc(i.category) + '</span>' +
        '<span class="ti-dot">·</span>' +
        '<span class="ti-name">' + esc(i.name) + '</span>' +
        '<span class="ti-dot">·</span>' +
        '<span class="ti-sub">' + esc(i.sub) + '</span>' +
        '<span class="ti-dot">·</span>' +
        '<span class="ti-score ' + c + '">' + scoreHtml + ' ' + (i.avg_rating != null ? i.avg_rating.toFixed(1) : '') + '</span>' +
    '</div>';
}


/* ═══════════════════════════════════════════════════════════════
   RECENT REVIEWS
   ═══════════════════════════════════════════════════════════════ */

function loadRecent() {
    return api('/api/recent-reviews').then(function (r) {
        S.revs = r;
        if (!r.length) return;
        S.ri = 0;
        renderRec();
        if (S.view === 'home') $('hero').classList.remove('hidden');
        startRecTimer();
    }).catch(function (e) { console.warn('Rec:', e); });
}

function renderRec(fading) {
    var el = $('recList');
    var r = S.revs;
    if (!r.length) return;
    var per = 4;
    var items = [];
    for (var i = 0; i < per && i < r.length; i++) items.push(r[(S.ri + i) % r.length]);

    el.innerHTML = items.map(function (v) {
        var verified = v.ticket_status === 'approved';
        var verifiedBadge = verified ? '<span class="ri-verified">' + mkIcon('icon_star_verified', '✅', 12, 12) + ' Verified</span>' : '';
        return '<div class="ri' + (fading ? ' out' : '') + '" data-nav="stage" data-vid="' + v.venue_id + '" data-sid="' + v.stage_id + '">' +
            '<div class="ri-top"><span class="ri-who">' + esc(v.display_name) + verifiedBadge + '</span><span class="ri-legs">' + legsS(v.rating) + '</span></div>' +
            '<div class="ri-where">' + mkIcon('icon_map', '📍', 12, 12) + ' ' + esc(v.stage_name) + ' @ ' + esc(v.venue_name) + '</div>' +
            (v.comment ? '<div class="ri-comment">"' + esc(v.comment) + '"</div>' : '') +
            '<div class="ri-date">' + (v.year || '') + ' · ' + (v.created_at || '').slice(0, 10) + '</div>' +
        '</div>';
    }).join('');

    initDynamicIcons(el);
    var pg = $('recPg');
    if (pg && r.length > per) pg.textContent = Math.floor(S.ri / per + 1) + '/' + Math.ceil(r.length / per);
}

function cycleRec() {
    document.querySelectorAll('#recList .ri').forEach(function (e) { e.classList.add('out'); });
    setTimeout(function () {
        S.ri = (S.ri + 4) % Math.max(S.revs.length, 1);
        renderRec(true);
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                document.querySelectorAll('#recList .ri').forEach(function (e) { e.classList.remove('out'); });
            });
        });
    }, 460);
}

function startRecTimer() {
    if (S.rt) clearInterval(S.rt);
    S.rt = setInterval(cycleRec, 5500);
}


/* ═══════════════════════════════════════════════════════════════
   HERO CTA PANEL
   ═══════════════════════════════════════════════════════════════ */

function loadUserActivity() {
    if (!S.user) return;
    api('/api/user/activity').then(function (d) {
        S.userActivity = d; S.activityLoaded = true; renderHeroCta();
    }).catch(function (e) {
        console.warn('Activity:', e); S.activityLoaded = true; renderHeroCta();
    });
}

function scrollToVenueGrid() {
    nav('home');
    setTimeout(function () {
        var grid = $('vGrid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
}

function _applyCtaEdArt() {
    var imgWrap = $('ctaEdImgWrap');
    if (imgWrap) applyArtImage('promo_edinburgh', imgWrap, '.cta-ed-site-img', 'has-img');
}

function renderHeroCta() {
    var el = $('heroCta');
    if (!el) return;

    /* ── Signed out ──────────────────────────────────────────── */
    if (!S.user) {
        el.innerHTML =
            '<div class="cta-top-half">' +
                '<div class="cta-signed-out">' +
                    '<div class="cta-so-icon">' + mkIcon('icon_logo', '🪑', 42, 42) + '</div>' +
                    '<div class="cta-so-head">Your reviews<br>decide who wins.</div>' +
                    '<div class="cta-so-sub">Every rating you submit <strong>directly determines</strong> the award winners. No judges, no panels — just honest knees.</div>' +
                    '<div class="cta-so-quip"><s>Plastic tat</s> <em style="color:var(--gold);font-style:normal;font-weight:700">prestigious trophies</em> at season end ' + mkIcon('icon_trophy', '🏆', 13, 13) + '</div>' +
                    '<button class="cta-so-btn" id="heroCtaSignUp">Sign Up &amp; Review →</button>' +
                    '<button class="cta-so-login-btn" id="heroCtaLogin">Already have an account? Sign In</button>' +
                    '<div class="cta-so-hint">Free · takes 30 seconds</div>' +
                    '<div class="cta-so-verify">' + mkIcon('icon_ticket', '📸', 13, 13) + '<span>Upload a ticket stub for <b>5× vote weight</b></span></div>' +
                '</div>' +
            '</div>' +
            mkCtaEdinburghPromo();

        initDynamicIcons(el);
        _applyCtaEdArt();

        var signBtn = $('heroCtaSignUp');
        if (signBtn) signBtn.addEventListener('click', function () { openAuth('reg'); });
        var loginBtn = $('heroCtaLogin');
        if (loginBtn) loginBtn.addEventListener('click', function () { openAuth('login'); });
        return;
    }

    /* ── Loading ─────────────────────────────────────────────── */
    if (!S.activityLoaded) {
        el.innerHTML =
            '<div class="cta-top-half">' +
                '<div class="cta-loading">' +
                    '<div class="cta-loading-spinner"></div>' +
                    '<span>Loading…</span>' +
                '</div>' +
            '</div>' +
            mkCtaEdinburghPromo();
        initDynamicIcons(el);
        _applyCtaEdArt();
        return;
    }

    /* ── Signed in ───────────────────────────────────────────── */
    var act = S.userActivity;
    var reviewCount     = act ? act.reviewCount     : 0;
    var lastReview      = act ? act.lastReview      : null;
    var pendingTickets  = act ? act.pendingTickets  : 0;
    var approvedTickets = act ? act.approvedTickets : 0;
    var noTicketRevs    = act ? act.noTicketReviews : [];

    var inner = '<div class="cta-signed-in">';

    /* greeting row */
    inner +=
        '<div class="cta-si-top">' +
            '<div class="cta-si-avatar">' + mkIcon('icon_logo', '🪑', 13, 13) + '</div>' +
            '<div><div class="cta-si-greeting">Welcome back</div><div class="cta-si-name">' + esc(S.user.display_name) + '</div></div>' +
        '</div>';

    /* stats row */
    inner +=
        '<div class="cta-si-stats">' +
            '<div class="cta-si-stat"><div class="cta-si-stat-v">' + reviewCount + '</div><div class="cta-si-stat-l">Reviews</div></div>' +
            '<div class="cta-si-stat"><div class="cta-si-stat-v" style="color:' + (approvedTickets > 0 ? 'var(--grn)' : 'var(--gold)') + '">' + approvedTickets + '</div><div class="cta-si-stat-l">Verified</div></div>' +
        '</div>';

    /* last review card — rating + date on right */
    if (lastReview) {
        var tsIcon = lastReview.ticket_status === 'approved' ? mkIcon('icon_star_verified', '✅', 10, 10)
            : lastReview.ticket_status === 'pending' ? mkIcon('icon_pending', '⏳', 10, 10) : '';
        inner +=
            '<div class="cta-si-card" data-vid="' + lastReview.venue_id + '" data-sid="' + lastReview.stage_id + '" id="ctaLastReview">' +
                '<div class="cta-si-card-label">Last review</div>' +
                '<div class="cta-si-card-row">' +
                    '<div class="cta-si-card-main">' +
                        '<div class="cta-si-card-title">' + esc(lastReview.stage_name) + ' ' + tsIcon + '</div>' +
                        '<div class="cta-si-card-sub">' + esc(lastReview.venue_name) + '</div>' +
                    '</div>' +
                    '<div class="cta-si-card-aside">' +
                        '<div class="cta-si-card-rating">' + legsS(lastReview.rating) + '</div>' +
                        '<div class="cta-si-card-date">' + (lastReview.created_at || '').slice(0, 10) + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    } else {
        inner +=
            '<div class="cta-si-card" style="text-align:center;cursor:default">' +
                '<div class="cta-si-card-label">No reviews yet</div>' +
                '<div style="font-size:.65rem;color:var(--t2);margin-top:.1rem">Pick a venue below to get started!</div>' +
            '</div>';
    }

    /* boost panel — compact horizontal layout */
    if (noTicketRevs && noTicketRevs.length > 0) {
        var tbRev = noTicketRevs[0];
        inner +=
            '<div class="cta-si-boost" id="ctaTicketBoost">' +
                '<div class="cta-si-boost-inner">' +
                    '<div class="cta-si-boost-text">' +
                        '<div class="cta-si-boost-label">' + mkIcon('icon_ticket', '📸', 11, 11) + 'Boost vote to 5×</div>' +
                        '<div class="cta-si-boost-stage">' + esc(tbRev.stage_name) + '</div>' +
                    '</div>' +
                    '<div class="cta-si-boost-action">' +
                        '<input type="file" id="ctaTicketInput" accept="image/*" style="display:none">' +
                        '<label class="cta-si-boost-btn" for="ctaTicketInput">' + mkIcon('icon_ticket', '📸', 11, 11) + 'Upload</label>' +
                    '</div>' +
                '</div>' +
                '<div id="ctaTicketStatus"></div>' +
            '</div>';
    }

    if (pendingTickets > 0) {
        inner += '<div class="cta-si-pending">' + mkIcon('icon_pending', '⏳', 12, 12) + ' ' + pendingTickets + ' ticket' + (pendingTickets !== 1 ? 's' : '') + ' pending review</div>';
    }

    if (!S.user.height_cm) {
        inner += '<div class="cta-si-height-tip">' + mkIcon('icon_height', '📏', 12, 12) + ' <a id="ctaSetHt" style="color:var(--gold);text-decoration:underline;cursor:pointer">Set your height</a> for personalised scores</div>';
    }

    inner +=
        '<div class="cta-si-actions">' +
            '<button class="cta-si-action primary" id="ctaMyRevsBtn">My Reviews →</button>' +
            '<button class="cta-si-action secondary" id="ctaBrowseBtn">Browse All Venues</button>' +
        '</div>';

    inner += '</div>';

    el.innerHTML = '<div class="cta-top-half">' + inner + '</div>' + mkCtaEdinburghPromo();
    initDynamicIcons(el);
    _applyCtaEdArt();

    var lrEl = $('ctaLastReview');
    if (lrEl && lastReview) lrEl.addEventListener('click', function () { nav('stage', lrEl.dataset.vid, lrEl.dataset.sid); });

    var ctaTI = $('ctaTicketInput');
    if (ctaTI && noTicketRevs && noTicketRevs.length > 0) {
        var tbRevId = noTicketRevs[0].id;
        ctaTI.addEventListener('change', function (e) {
            var f = e.target.files[0];
            if (!f) return;
            if (f.size > 5 * 1024 * 1024) { toast('Image too large (max 5MB)', 'err'); return; }
            var statusEl = $('ctaTicketStatus');
            if (statusEl) statusEl.innerHTML = '<span style="font-size:.6rem;color:var(--gold)">Uploading…</span>';
            var fd = new FormData();
            fd.append('ticket', f);
            fetch('/api/reviews/' + tbRevId + '/ticket', { method: 'POST', body: fd })
                .then(function (r) { return r.json(); })
                .then(function (d) {
                    if (d.ok) { toast('Ticket uploaded! Pending verification'); S.activityLoaded = false; loadUserActivity(); }
                    else { toast(d.error || 'Upload failed', 'err'); if (statusEl) statusEl.innerHTML = '<span style="font-size:.6rem;color:#e88">Failed: ' + (d.error || 'unknown') + '</span>'; }
                })
                .catch(function () { toast('Upload failed', 'err'); if (statusEl) statusEl.innerHTML = '<span style="font-size:.6rem;color:#e88">Upload failed</span>'; });
        });
    }

    var myRevBtn = $('ctaMyRevsBtn');
    if (myRevBtn) myRevBtn.addEventListener('click', function () { nav('myreviews'); });
    var browseBtn = $('ctaBrowseBtn');
    if (browseBtn) browseBtn.addEventListener('click', function () { scrollToVenueGrid(); });
    var ctaSetHt = $('ctaSetHt');
    if (ctaSetHt) ctaSetHt.addEventListener('click', openPrefs);
}


/* ═══════════════════════════════════════════════════════════════
   MY REVIEWS
   ═══════════════════════════════════════════════════════════════ */

function loadMyReviews() {
    var el = $('myRevContent');
    if (!S.user) { el.innerHTML = '<div class="no-rv">Sign in to view your reviews.</div>'; return; }
    el.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--t3)">Loading…</div>';
    api('/api/user/my-reviews?limit=50&offset=' + (S.myRevPage * 50))
        .then(function (d) { S.myRevTotal = d.total; S.myRevs = d.reviews; renderMyReviews(d); })
        .catch(function () { el.innerHTML = '<div class="no-rv">Failed to load your reviews.</div>'; });
}

function renderMyReviews(d) {
    var el = $('myRevContent');
    var revs = d.reviews || [];

    var pgHtml = '';
    if (d.total > 50) {
        pgHtml = '<div class="my-rev-pg">' +
            (S.myRevPage > 0 ? '<button class="btn" id="myRevPrev">← Prev</button>' : '') +
            '<span style="font-size:.68rem;color:var(--t3)">Page ' + (S.myRevPage + 1) + ' of ' + Math.ceil(d.total / 50) + '</span>' +
            ((S.myRevPage + 1) * 50 < d.total ? '<button class="btn" id="myRevNext">Next →</button>' : '') +
            '</div>';
    }

    if (!revs.length) {
        el.innerHTML = '<div class="my-rev-hero"><div class="my-rev-hero-t">Your Reviews</div><div class="my-rev-hero-s">You haven\'t reviewed any venues yet.</div></div>' +
            '<div class="no-rv">Pick a venue from the <a id="myRevGoHome" style="color:var(--gold);cursor:pointer;font-weight:700">home page</a> to get started!</div>';
        var gh = $('myRevGoHome');
        if (gh) gh.addEventListener('click', function () { nav('home'); });
        return;
    }

    var statsHtml = '<div class="my-rev-stats">' +
        '<div class="my-rev-stat"><div class="my-rev-stat-v">' + d.total + '</div><div class="my-rev-stat-l">Total Reviews</div></div>' +
        '<div class="my-rev-stat"><div class="my-rev-stat-v">' + d.verifiedCount + '</div><div class="my-rev-stat-l">' + mkIcon('icon_star_verified', '✅', 12, 12) + ' Verified</div></div>' +
        '<div class="my-rev-stat"><div class="my-rev-stat-v">' + d.pendingCount + '</div><div class="my-rev-stat-l">' + mkIcon('icon_pending', '⏳', 12, 12) + ' Pending</div></div>' +
        (d.avgRating != null ? '<div class="my-rev-stat"><div class="my-rev-stat-v">' + d.avgRating.toFixed(1) + '</div><div class="my-rev-stat-l">Avg Rating</div></div>' : '') +
        '</div>';

    var revsHtml = revs.map(function (r) {
        var rChairs = legsS(r.rating);
        var tsBadge = '';
        if (r.ticket_status === 'approved') tsBadge = '<span class="my-rev-ts approved">' + mkIcon('icon_star_verified', '✅', 12, 12) + ' Verified — 5× weight</span>';
        else if (r.ticket_status === 'pending') tsBadge = '<span class="my-rev-ts pending">' + mkIcon('icon_pending', '⏳', 12, 12) + ' Ticket pending review</span>';
        else if (r.ticket_status === 'rejected') tsBadge = '<span class="my-rev-ts rejected">' + mkIcon('icon_close', '✕', 12, 12) + ' Ticket rejected</span>';
        var uploadHtml = '';
        if (!r.ticket_status || r.ticket_status === 'rejected') {
            uploadHtml = '<div class="my-rev-upload" data-rid="' + r.id + '">' +
                '<input type="file" id="mrt-' + r.id + '" accept="image/*" style="display:none">' +
                '<label class="my-rev-upload-btn" for="mrt-' + r.id + '">' + mkIcon('icon_ticket', '📸', 14, 14) + ' ' + (r.ticket_status === 'rejected' ? 'Re-upload Ticket' : 'Upload Ticket for 5×') + '</label>' +
                '<div class="my-rev-upload-hint">Verified = <b>5× vote weight</b></div>' +
                '<div id="mrts-' + r.id + '"></div></div>';
        }
        return '<div class="my-rev-card" data-rid="' + r.id + '" data-vid="' + r.venue_id + '" data-sid="' + r.stage_id + '">' +
            '<div class="my-rev-card-top">' +
                '<div class="my-rev-card-info">' +
                    '<div class="my-rev-card-stage">' + esc(r.stage_name) + '</div>' +
                    '<div class="my-rev-card-venue">' + esc(r.venue_name) + '</div>' +
                    '<div class="my-rev-card-meta">' + (r.year || '') + ' · ' + (r.created_at || '').slice(0, 10) + '</div>' +
                '</div>' +
                '<div class="my-rev-card-right">' +
                    '<div class="my-rev-legs">' + rChairs + '</div>' +
                '</div>' +
            '</div>' +
            (r.comment ? '<div class="my-rev-comment">"' + esc(r.comment) + '"</div>' : '') +
            tsBadge + uploadHtml +
        '</div>';
    }).join('');

    el.innerHTML =
        '<div class="my-rev-hero">' +
            '<div class="my-rev-hero-t">Your Reviews</div>' +
            '<div class="my-rev-hero-s">' + d.total + ' review' + (d.total !== 1 ? 's' : '') + ' · click any card to view the stage</div>' +
        '</div>' +
        statsHtml + pgHtml +
        '<div class="my-rev-list">' + revsHtml + '</div>' +
        pgHtml;

    initDynamicIcons(el);

    el.querySelectorAll('.my-rev-card').forEach(function (card) {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.my-rev-upload')) return;
            nav('stage', card.dataset.vid, card.dataset.sid);
        });
    });

    el.querySelectorAll('.my-rev-upload').forEach(function (uploadDiv) {
        var rid = uploadDiv.dataset.rid;
        var inp = document.getElementById('mrt-' + rid);
        var statusEl = document.getElementById('mrts-' + rid);
        if (!inp) return;
        inp.addEventListener('change', function (e) {
            var f = e.target.files[0];
            if (!f) return;
            if (f.size > 5 * 1024 * 1024) { toast('Image too large (max 5MB)', 'err'); return; }
            if (statusEl) statusEl.innerHTML = '<span style="font-size:.6rem;color:var(--gold)">Uploading…</span>';
            var lbl = uploadDiv.querySelector('.my-rev-upload-btn');
            if (lbl) { lbl.style.opacity = '.5'; lbl.style.pointerEvents = 'none'; }
            var fd = new FormData();
            fd.append('ticket', f);
            fetch('/api/reviews/' + rid + '/ticket', { method: 'POST', body: fd })
                .then(function (r) { return r.json(); })
                .then(function (d) {
                    if (d.ok) {
                        toast('Ticket uploaded! Pending verification');
                        if (statusEl) statusEl.innerHTML = '<span style="font-size:.6rem;color:var(--gold)">' + mkIcon('icon_pending', '⏳', 10, 10) + ' Pending verification</span>';
                        if (lbl) lbl.style.display = 'none';
                        setTimeout(function () { loadMyReviews(); }, 800);
                    } else {
                        toast(d.error || 'Upload failed', 'err');
                        if (statusEl) statusEl.innerHTML = '<span style="font-size:.6rem;color:#e88">Failed: ' + (d.error || 'unknown') + '</span>';
                        if (lbl) { lbl.style.opacity = '1'; lbl.style.pointerEvents = ''; }
                    }
                })
                .catch(function () {
                    toast('Upload failed', 'err');
                    if (statusEl) statusEl.innerHTML = '<span style="font-size:.6rem;color:#e88">Upload failed</span>';
                    if (lbl) { lbl.style.opacity = '1'; lbl.style.pointerEvents = ''; }
                });
        });
    });

    var prev = $('myRevPrev'), next = $('myRevNext');
    if (prev) prev.addEventListener('click', function () { S.myRevPage--; loadMyReviews(); });
    if (next) next.addEventListener('click', function () { S.myRevPage++; loadMyReviews(); });
}


/* ═══════════════════════════════════════════════════════════════
   VENUE / OPERATOR REPORTS
   ═══════════════════════════════════════════════════════════════ */

function loadVenueReport() {
    var el = $('venueReportContent');
    el.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--t3)">Loading…</div>';
    api('/api/venue-report').then(function (d) { renderVenueReport(d); }).catch(function () { el.innerHTML = '<div class="no-rv">Failed to load.</div>'; });
}

function renderVenueReport(d) {
    var el = $('venueReportContent');
    var tab = S.reportTab;
    var list = tab === 'best' ? (d.best || []) : (d.worst || []);
    var tBIcons = ['icon_medal_gold','icon_medal_silver','icon_medal_bronze'];
    var tBEmoji = ['🥇','🥈','🥉'];
    var tWIcons = ['icon_skull','icon_crossbones','icon_bone'];
    var tWEmoji = ['💀','☠️','🦴'];

    el.innerHTML = '<div class="report-hero"><div class="report-hero-t">' + mkIcon('icon_stats', '📊', 18, 18) + ' Venue Report</div><div class="report-hero-s">Stages ranked by average review score.</div></div>' +
        '<div class="report-tabs"><button class="report-tab ' + (tab === 'best' ? 'active' : '') + '" data-rtab="best">' + mkIcon('icon_trophy', '🏆', 14, 14) + ' Best</button><button class="report-tab ' + (tab === 'worst' ? 'active' : '') + '" data-rtab="worst">' + mkIcon('icon_skull', '💀', 14, 14) + ' Worst</button></div>' +
        '<div class="report-grid">' +
            list.map(function (v) {
                var isBest = tab === 'best';
                var stages = v.stages || [];
                return '<div class="report-card ' + (isBest ? 'best' : 'worst') + '">' +
                    '<div class="report-card-head"><span class="report-card-ic">' + mkIcon(isBest ? 'icon_trophy' : 'icon_shame', isBest ? '🏆' : '💀', 24, 24) + '</span>' +
                    '<div><div class="report-card-t ' + (isBest ? 'best' : 'worst') + '">' + esc(v.venue_name) + '</div><div style="font-size:.6rem;color:var(--t3)">' + esc(v.group_name) + ' · ' + v.cnt + ' reviews · Avg: ' + v.avg_rating.toFixed(2) + '</div></div></div>' +
                    '<div class="report-card-rows">' +
                        stages.slice(0, 5).map(function (s, i) {
                            var ri = isBest ? tBIcons : tWIcons, re = isBest ? tBEmoji : tWEmoji;
                            var rank = i < 3 ? mkIcon(ri[i], re[i], 18, 18) : '<span>' + (i + 1) + '</span>';
                            return '<div class="report-row" data-nav="stage" data-vid="' + s.venue_id + '" data-sid="' + s.stage_id + '">' +
                                '<div class="report-row-rank">' + rank + '</div>' +
                                '<div class="report-row-info"><div class="report-row-name">' + esc(s.stage_name) + '</div><div class="report-row-sub">' + s.cnt + ' reviews</div></div>' +
                                '<div class="report-row-score ' + (isBest ? 'best' : 'worst') + '">' + s.avg_rating.toFixed(2) + '</div></div>';
                        }).join('') +
                    '</div></div>';
            }).join('') +
        '</div>' +
        mkStrip('icon_hotel', '🏨', 'Plan your Festival stay', 'Compare Edinburgh hotels.', 'Search Stays');

    initDynamicIcons(el);
    el.querySelectorAll('.report-tab').forEach(function (btn) {
        btn.addEventListener('click', function () { S.reportTab = btn.dataset.rtab; renderVenueReport(d); });
    });
}

function loadOperatorReport() {
    var el = $('operatorReportContent');
    el.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--t3)">Loading…</div>';
    api('/api/operator-report').then(function (d) { renderOperatorReport(d); }).catch(function () { el.innerHTML = '<div class="no-rv">Failed to load.</div>'; });
}

function renderOperatorReport(d) {
    var el = $('operatorReportContent');
    var tab = S.opReportTab;
    var groups = d.groups || [];
    var sorted = tab === 'best'
        ? groups.slice().sort(function (a, b) { return b.avg_rating - a.avg_rating; })
        : groups.slice().sort(function (a, b) { return a.avg_rating - b.avg_rating; });
    var tBIcons = ['icon_medal_gold','icon_medal_silver','icon_medal_bronze'];
    var tBEmoji = ['🥇','🥈','🥉'];
    var tWIcons = ['icon_skull','icon_crossbones','icon_bone'];
    var tWEmoji = ['💀','☠️','🦴'];

    el.innerHTML = '<div class="report-hero"><div class="report-hero-t">' + mkIcon('icon_stats', '📊', 18, 18) + ' Operator Report</div><div class="report-hero-s">How do venue operators compare?</div></div>' +
        '<div class="report-tabs"><button class="report-tab ' + (tab === 'best' ? 'active' : '') + '" data-optab="best">' + mkIcon('icon_trophy', '🏆', 14, 14) + ' Best</button><button class="report-tab ' + (tab === 'worst' ? 'active' : '') + '" data-optab="worst">' + mkIcon('icon_skull', '💀', 14, 14) + ' Worst</button></div>' +
        sorted.filter(function (g) { return g.cnt > 0; }).map(function (g, gi) {
            var isBest = tab === 'best';
            var ri = isBest ? tBIcons : tWIcons, re = isBest ? tBEmoji : tWEmoji;
            var rank = gi < 3 ? mkIcon(ri[gi], re[gi], 18, 18) : '<span style="font-size:.7rem;font-weight:800;color:var(--t3)">' + (gi + 1) + '</span>';
            var stages = isBest ? (g.bestStages || []) : (g.worstStages || []);
            return '<div class="report-card ' + (isBest ? 'best' : 'worst') + '">' +
                '<div class="report-card-head"><div class="report-row-rank">' + rank + '</div>' +
                '<div><div class="report-card-t ' + (isBest ? 'best' : 'worst') + '">' + esc(g.group_name) + '</div><div style="font-size:.6rem;color:var(--t3)">' + g.stage_cnt + ' spaces · ' + g.cnt + ' reviews · Avg: ' + g.avg_rating.toFixed(2) + '</div></div></div>' +
                '<div class="report-card-rows">' +
                    stages.slice(0, 3).map(function (s) {
                        return '<div class="report-row" data-nav="stage" data-vid="' + s.venue_id + '" data-sid="' + s.stage_id + '">' +
                            '<div class="report-row-info"><div class="report-row-name">' + esc(s.stage_name) + '</div><div class="report-row-sub">' + esc(s.venue_name) + ' · ' + s.cnt + ' reviews</div></div>' +
                            '<div class="report-row-score ' + (isBest ? 'best' : 'worst') + '">' + s.avg_rating.toFixed(2) + '</div></div>';
                    }).join('') +
                '</div></div>';
        }).join('') +
        mkCard('icon_fringe', '🎭', 'Edinburgh Festival tickets', 'Compare shows.', 'Find Shows');

    initDynamicIcons(el);
    el.querySelectorAll('.report-tab').forEach(function (btn) {
        btn.addEventListener('click', function () { S.opReportTab = btn.dataset.optab; renderOperatorReport(d); });
    });
}


/* ═══════════════════════════════════════════════════════════════
   ADMIN
   ═══════════════════════════════════════════════════════════════ */

function loadAdminSection(section) {
    S.admSection = section;
    document.querySelectorAll('.adm-section').forEach(function (s) { s.classList.remove('active'); });
    document.querySelectorAll('.adm-nav-item').forEach(function (i) { i.classList.toggle('active', i.dataset.adm === section); });
    var el = $('adm-' + section);
    if (el) el.classList.add('active');
    if (section === 'dashboard') loadAdmDashboard();
    else if (section === 'tickets') loadAdmTickets();
    else if (section === 'reviews') loadAdmReviews();
    else if (section === 'users') loadAdmUsers();
}

function loadAdmDashboard() {
    api('/api/admin/summary').then(function (d) {
        $('admKpis').innerHTML =
            '<div class="adm-kpi"><div class="adm-kpi-v">' + d.totalUsers + '</div><div class="adm-kpi-l">Users</div></div>' +
            '<div class="adm-kpi"><div class="adm-kpi-v">' + d.totalReviews + '</div><div class="adm-kpi-l">Reviews</div></div>' +
            '<div class="adm-kpi warn"><div class="adm-kpi-v">' + d.pendingTickets + '</div><div class="adm-kpi-l">Pending Tickets</div></div>' +
            '<div class="adm-kpi"><div class="adm-kpi-v">' + d.approvedTickets + '</div><div class="adm-kpi-l">Verified (5×)</div></div>' +
            '<div class="adm-kpi warn"><div class="adm-kpi-v">' + d.flaggedReviews + '</div><div class="adm-kpi-l">Flagged</div></div>' +
            '<div class="adm-kpi warn"><div class="adm-kpi-v">' + d.bannedUsers + '</div><div class="adm-kpi-l">Banned</div></div>' +
            '<div class="adm-kpi"><div class="adm-kpi-v">' + d.adminUsers + '</div><div class="adm-kpi-l">Admins</div></div>';
        $('admInsight').innerHTML = '<strong>Quick summary:</strong> ' + d.pendingTickets + ' ticket' + (d.pendingTickets !== 1 ? 's' : '') + ' pending' +
            (d.pendingTickets > 0 ? ' — <a href="/admin.html">Review in Admin Panel →</a>' : '. ') +
            ' · <a href="/admin.html">Open full admin panel →</a>';
        var badge = $('admTicketBadge');
        if (badge) badge.textContent = d.pendingTickets;
    }).catch(function (e) { console.error(e); });
}

function loadAdmTickets() {
    var el = $('admTicketQueue');
    el.innerHTML = '<div class="no-rv">Loading…</div>';
    api('/api/admin/tickets/pending').then(function (d) {
        $('admTicketCount').textContent = d.tickets.length + ' ticket' + (d.tickets.length !== 1 ? 's' : '') + ' awaiting review';
        if (!d.tickets.length) { el.innerHTML = '<div class="no-rv">' + mkIcon('icon_celebrate', '🎉', 18, 18) + ' All caught up — no pending tickets.</div>'; return; }
        el.innerHTML = d.tickets.map(function (t) {
            return '<div class="ticket-card" data-rid="' + t.id + '">' +
                '<div class="ticket-card-img"><img src="/api/admin/ticket/' + esc(t.ticket_photo) + '" alt="Ticket" loading="lazy"></div>' +
                '<div class="ticket-card-body">' +
                    '<div class="ticket-card-meta">' + esc(t.display_name) + ' <span style="font-weight:400;color:var(--t3)">(@' + esc(t.username) + ')</span></div>' +
                    '<div class="ticket-card-sub">' + mkIcon('icon_map', '📍', 12, 12) + ' ' + esc(t.stage_name) + ' @ ' + esc(t.venue_name) + '</div>' +
                    '<div class="ticket-card-rating">' + legsS(t.rating) + ' ' + (t.year || '') + '</div>' +
                    (t.comment ? '<div class="ticket-card-comment">"' + esc(t.comment) + '"</div>' : '') +
                    '<div class="ticket-card-sub">' + (t.created_at || '').slice(0, 10) + '</div>' +
                    '<div class="ticket-card-actions">' +
                        '<button class="tc-approve" data-rid="' + t.id + '" data-action="approve">' + mkIcon('icon_star_verified', '✅', 12, 12) + ' Approve (5×)</button>' +
                        '<button class="tc-reject" data-rid="' + t.id + '" data-action="reject">' + mkIcon('icon_close', '✕', 12, 12) + ' Reject &amp; Delete</button>' +
                    '</div>' +
                '</div></div>';
        }).join('');
        initDynamicIcons(el);
        el.querySelectorAll('[data-action]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var rid = btn.dataset.rid, action = btn.dataset.action;
                btn.disabled = true; btn.textContent = '…';
                api('/api/admin/ticket/' + rid, { method: 'PUT', body: JSON.stringify({ action: action }) })
                    .then(function () { toast(action === 'approve' ? 'Ticket approved' : 'Ticket rejected & deleted'); loadAdmTickets(); loadAdmDashboard(); })
                    .catch(function (e) { toast(e.error || 'Failed', 'err'); btn.disabled = false; });
            });
        });
    }).catch(function () { el.innerHTML = '<div class="no-rv">Failed to load.</div>'; });
}

var ADM_REV_LIMIT = 50;

function loadAdmReviews() {
    var tbody = $('admRevBody');
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--t3);padding:1.5rem">Loading…</td></tr>';
    api('/api/admin/reviews?limit=' + ADM_REV_LIMIT + '&offset=' + (S.admRevPage * ADM_REV_LIMIT) + '&filter=' + S.admRevFilter)
        .then(function (d) {
            S.admRevTotal = d.total;
            $('admRevCount').textContent = d.total + ' review' + (d.total !== 1 ? 's' : '');
            $('admRevPageInfo').textContent = 'Page ' + (S.admRevPage + 1) + ' of ' + Math.max(1, Math.ceil(d.total / ADM_REV_LIMIT)) + ' · ' + d.total + ' total';
            $('admRevPrev').disabled = S.admRevPage === 0;
            $('admRevNext').disabled = (S.admRevPage + 1) * ADM_REV_LIMIT >= d.total;
            tbody.innerHTML = d.reviews.map(function (r) {
                var ts = r.ticket_status;
                var tsTag = ts ? '<span class="tag ' + ts + '">' + ts + '</span>' : '<span style="color:var(--t3);font-size:.6rem">none</span>';
                var flagTag = r.flagged ? '<span class="tag flagged">flagged</span>' : '';
                return '<tr><td>' + r.id + '</td>' +
                    '<td><b>' + esc(r.display_name) + '</b><br><span style="font-size:.62rem;color:var(--t3)">@' + esc(r.username) + '</span></td>' +
                    '<td class="link" data-nav="stage" data-vid="' + r.venue_id + '" data-sid="' + r.stage_id + '">' + esc(r.stage_name) + '<br><span style="font-size:.62rem;color:var(--t3)">' + esc(r.venue_name) + '</span></td>' +
                    '<td>' + legsS(r.rating) + '</td>' +
                    '<td style="max-width:200px;font-size:.66rem;color:var(--t2)">' + (r.comment ? '"' + esc(r.comment.slice(0, 80)) + (r.comment.length > 80 ? '…' : '') + '"' : '') + '</td>' +
                    '<td>' + tsTag + flagTag + '</td>' +
                    '<td style="font-size:.62rem">' + (r.created_at || '').slice(0, 10) + '</td>' +
                    '<td><div class="adm-action-btns"><button class="adm-btn danger" data-del-rev="' + r.id + '">' + mkIcon('icon_delete', '🗑', 12, 12) + '</button>' +
                    (r.flagged ? '<button class="adm-btn" data-unflag-rev="' + r.id + '">✓</button>' : '<button class="adm-btn warn" data-flag-rev="' + r.id + '">' + mkIcon('icon_flag', '🚩', 12, 12) + '</button>') +
                    '</div></td></tr>';
            }).join('');
            initDynamicIcons(tbody);
            tbody.querySelectorAll('[data-del-rev]').forEach(function (b) {
                b.addEventListener('click', function () {
                    if (!confirm('Delete this review?')) return;
                    api('/api/admin/review/' + b.dataset.delRev, { method: 'DELETE' }).then(function () { toast('Deleted'); loadAdmReviews(); }).catch(function (e) { toast(e.error || 'Failed', 'err'); });
                });
            });
            tbody.querySelectorAll('[data-flag-rev]').forEach(function (b) {
                b.addEventListener('click', function () {
                    api('/api/admin/review/' + b.dataset.flagRev + '/flag', { method: 'PUT', body: JSON.stringify({ flagged: true }) }).then(function () { toast('Flagged'); loadAdmReviews(); }).catch(function (e) { toast(e.error || 'Failed', 'err'); });
                });
            });
            tbody.querySelectorAll('[data-unflag-rev]').forEach(function (b) {
                b.addEventListener('click', function () {
                    api('/api/admin/review/' + b.dataset.unflagRev + '/flag', { method: 'PUT', body: JSON.stringify({ flagged: false }) }).then(function () { toast('Unflagged'); loadAdmReviews(); }).catch(function (e) { toast(e.error || 'Failed', 'err'); });
                });
            });
        })
        .catch(function () { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--t3)">Failed.</td></tr>'; });
}

var ADM_USER_LIMIT = 50;

function loadAdmUsers() {
    var tbody = $('admUserBody');
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--t3);padding:1.5rem">Loading…</td></tr>';
    var url = '/api/admin/users?limit=' + ADM_USER_LIMIT + '&offset=' + (S.admUserPage * ADM_USER_LIMIT);
    if (S.admUserQ) url += '&q=' + encodeURIComponent(S.admUserQ);
    api(url).then(function (d) {
        S.admUserTotal = d.total;
        $('admUserCount').textContent = d.total + ' user' + (d.total !== 1 ? 's' : '');
        $('admUserPageInfo').textContent = 'Page ' + (S.admUserPage + 1) + ' of ' + Math.max(1, Math.ceil(d.total / ADM_USER_LIMIT)) + ' · ' + d.total + ' total';
        $('admUserPrev').disabled = S.admUserPage === 0;
        $('admUserNext').disabled = (S.admUserPage + 1) * ADM_USER_LIMIT >= d.total;
        tbody.innerHTML = d.users.map(function (u) {
            var tags = [];
            if (u.is_admin) tags.push('<span class="tag admin">admin</span>');
            if (u.banned) tags.push('<span class="tag banned">banned</span>');
            var tagStr = tags.join(' ') || '<span style="color:var(--t3);font-size:.62rem">active</span>';
            var userData = JSON.stringify({ id: u.id, username: u.username, display_name: u.display_name, height_cm: u.height_cm, is_admin: u.is_admin, banned: u.banned, ban_reason: u.ban_reason }).replace(/'/g, '&#39;');
            return '<tr><td>' + u.id + '</td><td><b>' + esc(u.username) + '</b></td><td>' + esc(u.display_name) + '</td>' +
                '<td style="font-size:.66rem">' + esc(u.email) + '</td><td style="font-size:.66rem">' + (u.height_cm ? fh(u.height_cm) : '—') + '</td>' +
                '<td>' + u.review_count + '</td><td>' + tagStr + '</td><td style="font-size:.62rem">' + (u.created_at || '').slice(0, 10) + '</td>' +
                '<td><div class="adm-action-btns"><button class="adm-btn warn" data-edit-user=\'' + userData + '\'>' + mkIcon('icon_edit', '✏️', 12, 12) + '</button></div></td></tr>';
        }).join('');
        initDynamicIcons(tbody);
        tbody.querySelectorAll('[data-edit-user]').forEach(function (b) {
            b.addEventListener('click', function () { try { openEditUser(JSON.parse(b.dataset.editUser)); } catch (e) { console.error(e); } });
        });
    }).catch(function () { tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--t3)">Failed.</td></tr>'; });
}

function openEditUser(u) {
    S.editingUserId = u.id;
    $('editUserSub').textContent = 'Editing: @' + u.username + ' (ID ' + u.id + ')';
    $('editUserErr').classList.remove('show'); $('editUserOk').classList.remove('show');
    $('editUserFields').innerHTML =
        '<div class="adm-edit-row"><div class="adm-edit-lbl">Display Name</div><input class="adm-edit-input" id="euDN" value="' + esc(u.display_name || '') + '" maxlength="40"></div>' +
        '<div class="adm-edit-row"><div class="adm-edit-lbl">Height (cm)</div><input class="adm-edit-input" id="euHt" type="number" value="' + (u.height_cm || '') + '" min="90" max="250" placeholder="90–250"></div>' +
        '<div class="adm-edit-row"><div class="adm-edit-lbl">Admin</div><label class="tog"><input type="checkbox" id="euAdmin" ' + (u.is_admin ? 'checked' : '') + '><span class="tog-sl"></span></label></div>' +
        '<div class="adm-edit-row"><div class="adm-edit-lbl">Banned</div><label class="tog"><input type="checkbox" id="euBanned" ' + (u.banned ? 'checked' : '') + '><span class="tog-sl"></span></label></div>' +
        '<div class="adm-edit-row"><div class="adm-edit-lbl">Ban Reason</div><input class="adm-edit-input" id="euBanReason" value="' + esc(u.ban_reason || '') + '" placeholder="Optional" maxlength="200"></div>';
    $('editUserOv').classList.add('open');
}

function saveEditUser() {
    var uid = S.editingUserId; if (!uid) return;
    var body = { display_name: $('euDN').value.trim(), height_cm: $('euHt').value || null, is_admin: $('euAdmin').checked, banned: $('euBanned').checked, ban_reason: $('euBanReason').value.trim() || null };
    var b = $('editUserSv'); b.disabled = true; b.textContent = 'Saving…';
    api('/api/admin/user/' + uid, { method: 'PUT', body: JSON.stringify(body) })
        .then(function () { $('editUserOk').textContent = 'Saved!'; $('editUserOk').classList.add('show'); toast('User updated'); loadAdmUsers(); })
        .catch(function (e) { $('editUserErr').textContent = e.error || 'Failed'; $('editUserErr').classList.add('show'); })
        .then(function () { b.disabled = false; b.textContent = 'Save Changes'; });
}


/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════ */

function nav(v, vid, sid, extra) {
    document.querySelectorAll('.view').forEach(function (x) { x.classList.remove('active'); });
    S.view = v; S.vid = vid || null; S.sid = sid || null;

    var home = v === 'home';
    showTicker(home);
    $('awardsOuter').classList.toggle('hidden', !home || !S.awardCats);
    $('hero').classList.toggle('hidden', !home || !S.revs.length);

    if (v === 'home') { $('v-home').classList.add('active'); loadVenues(); bc([{ l: 'All Venues', a: true }]); }
    else if (v === 'venue') { $('v-venue').classList.add('active'); loadVenue(vid); }
    else if (v === 'stage') { $('v-stage').classList.add('active'); loadStage(sid, vid); S.leg = null; S.ticketFile = null; }
    else if (v === 'awards') { if (extra === 'vice' || extra === 'gold') S.awdsTab = extra; $('v-awards').classList.add('active'); renderAwardsPage(); bc([{ l: 'All Venues', v: 'home' }, { l: 'Awards', a: true }]); }
    else if (v === 'award') { S.awId = extra || S.awId; $('v-award').classList.add('active'); loadAward(S.awId); }
    else if (v === 'venueReport') { $('v-venueReport').classList.add('active'); loadVenueReport(); bc([{ l: 'All Venues', v: 'home' }, { l: 'Venue Reports', a: true }]); }
    else if (v === 'operatorReport') { $('v-operatorReport').classList.add('active'); loadOperatorReport(); bc([{ l: 'All Venues', v: 'home' }, { l: 'Operator Reports', a: true }]); }
    else if (v === 'myreviews') { $('v-myreviews').classList.add('active'); loadMyReviews(); bc([{ l: 'All Venues', v: 'home' }, { l: 'My Reviews', a: true }]); }
    else if (v === 'admin') { if (!S.user || !S.user.is_admin) { nav('home'); return; } $('v-admin').classList.add('active'); loadAdminSection(S.admSection); bc([{ l: 'All Venues', v: 'home' }, { l: 'Admin', a: true }]); }
    else if (v === 'press') { $('v-press').classList.add('active'); renderPress(); bc([{ l: 'All Venues', v: 'home' }, { l: 'Press', a: true }]); }
    else if (v === 'about') { $('v-about').classList.add('active'); bc([{ l: 'All Venues', v: 'home' }, { l: 'About', a: true }]); }
    else if (v === 'stats') { $('v-stats').classList.add('active'); loadStats(); bc([{ l: 'All Venues', v: 'home' }, { l: 'Statistics', a: true }]); }

    pushHistory();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bc(items) {
    var el = $('bcI'); el.innerHTML = '';
    items.forEach(function (i, n) {
        if (n) { var s = document.createElement('span'); s.className = 'bc-sep'; s.textContent = '›'; el.appendChild(s); }
        var e = document.createElement('span');
        e.className = 'bc-i' + (i.a ? ' act' : '');
        e.textContent = i.l;
        if (!i.a) e.addEventListener('click', function () { nav(i.v, i.vi, i.si); });
        el.appendChild(e);
    });
}


/* ═══════════════════════════════════════════════════════════════
   VENUES
   ═══════════════════════════════════════════════════════════════ */

function loadVenues() {
    var params = new URLSearchParams();
    if (S.fest !== 'all') params.set('fest', S.fest);
    if (S.grp !== 'all') params.set('group', S.grp);
    api('/api/venues?' + params.toString()).then(function (vs) {
        $('gFilt').style.display = S.fest === 'intl' ? 'none' : 'flex';
        $('vCnt').textContent = vs.length + ' venue' + (vs.length !== 1 ? 's' : '');
        var g = $('vGrid');
        if (!vs.length) { g.innerHTML = '<div class="no-rv" style="grid-column:1/-1">No venues match.</div>'; return; }
        g.innerHTML = vs.map(function (v) {
            return '<div class="vcard" data-nav="venue" data-vid="' + v.id + '">' +
                '<div class="vc-h"><div class="vc-n">' + esc(v.name) + '</div>' + festBadge(v.festival) + '</div>' +
                '<div class="vc-loc">' + mkIcon('icon_map', '📍', 12, 12) + ' ' + esc(v.area) + ' · <span>' + (GL[v.grp] || v.grp) + '</span></div>' +
                '<div class="vc-ft"><span class="vc-meta">' + v.stageCount + ' space' + (v.stageCount !== 1 ? 's' : '') + ' · ' + v.reviewCount + ' review' + (v.reviewCount !== 1 ? 's' : '') + '</span>' +
                (v.score != null ? legs(v.score) : '<span class="nr">No ratings</span>') + '</div></div>';
        }).join('');
        initDynamicIcons(g);
    }).catch(function (e) { console.error(e); });
}

function loadVenue(vid) {
    api('/api/venues/' + vid).then(function (v) {
        $('vhT').textContent = v.name;
        $('vhA').innerHTML = mkIcon('icon_map', '📍', 12, 12) + ' ' + esc(v.address);
        $('vhB').outerHTML = festBadge(v.festival);
        $('vhR').innerHTML = v.score != null ? legs(v.score) : '<span class="nr">No ratings</span>';
        $('vhD').textContent = v.score != null ? LD[Math.round(v.score)] + (v.weighted ? ' · height-adjusted' : '') : '';
        $('vhSC').textContent = v.stages.length + ' space' + (v.stages.length !== 1 ? 's' : '');
        var ps = $('pvSub'); if (ps) ps.textContent = 'Hotels near ' + v.name + ' (' + v.area + ')';
        var promoEl = $('venuePromoImg'); if (promoEl) applyArtImage('promo_hotel', promoEl, '.promo-site-img', 'has-img');
        $('sGrid').innerHTML = v.stages.map(function (s) {
            return '<div class="scard" data-nav="stage" data-vid="' + vid + '" data-sid="' + s.id + '">' +
                '<div class="sc-n">' + esc(s.name) + '</div>' +
                '<div class="sc-c">~' + s.capacity + ' seats' + (s.notes ? ' · ' + esc(s.notes) : '') + '</div>' +
                (s.score != null ? legs(s.score) : '<span class="nr">No ratings</span>') +
                '<div class="sc-f"><span class="sc-cnt">' + s.reviewCount + ' review' + (s.reviewCount !== 1 ? 's' : '') + '</span>' +
                (s.weighted ? '<span style="font-size:.6rem;color:var(--gold);font-weight:700">adjusted</span>' : '') + '</div></div>';
        }).join('');
        initDynamicIcons($('sGrid'));
        bc([{ l: 'All Venues', v: 'home' }, { l: v.name, a: true }]);
    }).catch(function (e) { console.error(e); toast('Load failed', 'err'); });
}

function loadStage(sid, vid) {
    api('/api/stages/' + sid).then(function (d) {
        S.sd = d;
        $('stV').textContent = d.venue_name;
        $('stT').textContent = d.name;
        $('stC').textContent = '~' + d.capacity + ' seats' + (d.notes ? ' · ' + d.notes : '');
        $('stA').innerHTML = d.adjScore != null ? legs(d.adjScore) : '<span class="nr">—</span>';
        $('stR').innerHTML = d.rawScore != null ? legs(d.rawScore) : '<span class="nr">—</span>';
        $('stN').textContent = d.reviewCount;
        renderRevs(d.reviews, d.userCm);
        drawCurve(d.reviews, d.userCm);
        renderForm(sid, d);
        var stagePromo = $('stagePromoImg'); if (stagePromo) applyArtImage('promo_ticket', stagePromo, '.promo-site-img', 'has-img');
        var stagePromo2 = $('stagePromoImg2'); if (stagePromo2) applyArtImage('promo_map', stagePromo2, '.promo-site-img', 'has-img');
        initDynamicIcons(document.getElementById('v-stage'));
        bc([{ l: 'All Venues', v: 'home' }, { l: d.venue_name, v: 'venue', vi: d.venue_id }, { l: d.name, a: true }]);
        /* load events for this stage */
        renderEvents(sid);
    }).catch(function (e) { console.error(e); toast('Load failed', 'err'); });
}


/* ───────────────────────────────────────────────────────────────
   Reviews List
   ─────────────────────────────────────────────────────────────── */

function renderRevs(revs, uc) {
    var el = $('rvList');
    if (!revs.length) { el.innerHTML = '<div class="no-rv">No reviews yet. Be the first!</div>'; return; }

    var ww = revs.map(function (r) {
        return Object.assign({}, r, { w: (uc && r.height_cm) ? gauss(r.height_cm, uc) : 1 });
    }).sort(function (a, b) { return b.w - a.w; });

    var mx = 0;
    for (var i = 0; i < ww.length; i++) { if (ww[i].w > mx) mx = ww[i].w; }

    el.innerHTML = ww.map(function (r) {
        var h = r.height_cm ? cm2fi(r.height_cm) : null;
        var p = Math.round((mx > 0 ? r.w / mx : 1) * 100);
        var hl = uc && r.height_cm && Math.abs(r.height_cm - uc) < 5;
        var ts = r.ticket_status;
        var tsBadge = ts === 'approved'
            ? '<div class="rvc-verified-badge">' + mkIcon('icon_star_verified', '✅', 11, 11) + ' Ticket verified · 5× weight</div>'
            : ts === 'pending' ? '<div class="rvc-pending-badge">' + mkIcon('icon_pending', '⏳', 11, 11) + ' Ticket pending · 1× until approved</div>' : '';
        var ratingHtml = r.rating === 0
            ? '<span style="font-size:.68rem;color:var(--red);font-weight:800">' + mkIcon('icon_chair_0', '✖', 16, 16) + ' Zero</span>'
            : '<div class="legs">' + mkChairRating(r.rating, 16, 16) + '</div>';
        return '<div class="rvc ' + (hl ? 'hl' : '') + '">' +
            '<div class="rvc-h"><div class="rvc-w"><span class="rvc-n">' + esc(r.display_name) + '</span>' +
                (h ? '<span class="rvc-ht">' + mkIcon('icon_height', '📏', 12, 12) + ' ' + h.ft + "'" + h.in + '" (' + Math.round(r.height_cm) + 'cm)</span>' : '') +
            '</div><div>' + ratingHtml + '<div class="rvc-d">' + (r.year || '') + ' · ' + (r.created_at || '').slice(0, 10) + '</div></div></div>' +
            (r.comment ? '<div class="rvc-cmt">"' + esc(r.comment) + '"</div>' : '') +
            tsBadge +
            (uc ? '<div class="rvc-rel"><span>Relevance:</span><div class="wbar"><div class="wbar-f" style="width:' + p + '%"></div></div><span>' + p + '%</span></div>' : '') +
        '</div>';
    }).join('');

    initDynamicIcons(el);
}


/* ───────────────────────────────────────────────────────────────
   Review Form
   ─────────────────────────────────────────────────────────────── */

function renderForm(sid, d) {
    var el = $('rvForm');

    if (!S.user) {
        el.innerHTML = '<div class="lg"><a id="aFF">Sign in or register</a> to leave a review.</div>';
        var aff = $('aFF'); if (aff) aff.addEventListener('click', function () { openAuth('login'); });
        return;
    }

    if (d.hasReviewed) {
        var userReview = null;
        for (var i = 0; i < d.reviews.length; i++) { if (d.reviews[i].user_id === S.user.id) { userReview = d.reviews[i]; break; } }

        var ticketUploadHtml = '';
        if (userReview && !userReview.ticket_status) {
            ticketUploadHtml = '<div class="pnl" style="margin-top:.75rem">' +
                '<div class="pnl-h" style="font-size:.72rem">' + mkIcon('icon_ticket', '📸', 14, 14) + ' Boost your vote to 5×</div>' +
                '<div style="font-size:.68rem;color:var(--t3);margin-bottom:.5rem">Upload your ticket stub to get your review verified and counted at 5× weight.</div>' +
                '<div class="ticket-upload-area" id="stageTicketArea"><input type="file" id="stageTicketFile" accept="image/*" style="display:none">' +
                '<label class="ticket-upload-label" for="stageTicketFile">' + mkIcon('icon_ticket', '📸', 22, 22) + 'Upload Ticket Stub</label>' +
                '<div class="ticket-upload-hint">Verified = <b>5× vote weight</b> · max 5MB</div>' +
                '<div id="stageTicketPreview"></div><div id="stageTicketStatus"></div></div></div>';
        } else if (userReview && userReview.ticket_status === 'rejected') {
            ticketUploadHtml = '<div class="pnl" style="margin-top:.75rem">' +
                '<div class="pnl-h" style="font-size:.72rem;color:var(--vice-l)">' + mkIcon('icon_close', '✕', 14, 14) + ' Ticket Rejected</div>' +
                '<div style="font-size:.68rem;color:var(--t3);margin-bottom:.5rem">Your ticket was rejected. You can upload a new one.</div>' +
                '<div class="ticket-upload-area" id="stageTicketArea"><input type="file" id="stageTicketFile" accept="image/*" style="display:none">' +
                '<label class="ticket-upload-label" for="stageTicketFile">' + mkIcon('icon_ticket', '📸', 22, 22) + 'Re-upload Ticket</label>' +
                '<div class="ticket-upload-hint">Verified = <b>5× vote weight</b> · max 5MB</div>' +
                '<div id="stageTicketPreview"></div><div id="stageTicketStatus"></div></div></div>';
        }

        el.innerHTML = '<div class="ib">' + mkIcon('icon_star_verified', '✅', 14, 14) + ' Already reviewed. Thanks, ' + esc(S.user.display_name) + '!</div>' + ticketUploadHtml;
        initDynamicIcons(el);

        var stf = $('stageTicketFile');
        if (stf && userReview) {
            $('stageTicketArea').addEventListener('click', function (e) {
                if (e.target === e.currentTarget || e.target.classList.contains('ticket-upload-label') || e.target.closest('.ticket-upload-label')) stf.click();
            });
            stf.addEventListener('change', function (e) {
                var f = e.target.files[0]; if (!f) return;
                if (f.size > 5 * 1024 * 1024) { toast('Image too large (max 5MB)', 'err'); return; }
                var prev = $('stageTicketPreview'); if (prev) prev.innerHTML = '<img class="ticket-upload-preview" src="' + URL.createObjectURL(f) + '" alt="Preview">';
                var statusEl = $('stageTicketStatus'); if (statusEl) statusEl.innerHTML = '<div style="font-size:.62rem;color:var(--gold);margin-top:.3rem">Uploading…</div>';
                var lbl = $('stageTicketArea').querySelector('.ticket-upload-label'); if (lbl) { lbl.style.opacity = '.5'; lbl.style.pointerEvents = 'none'; }
                var fd = new FormData(); fd.append('ticket', f);
                fetch('/api/reviews/' + userReview.id + '/ticket', { method: 'POST', body: fd })
                    .then(function (r) { return r.json(); })
                    .then(function (d) {
                        if (d.ok) {
                            toast('Ticket uploaded! Pending verification');
                            if (statusEl) statusEl.innerHTML = '<div style="font-size:.62rem;color:var(--gold);margin-top:.3rem">' + mkIcon('icon_pending', '⏳', 10, 10) + ' Pending admin verification</div>';
                            if (lbl) lbl.style.display = 'none';
                            loadStage(sid, vid);
                        } else {
                            toast(d.error || 'Upload failed', 'err');
                            if (statusEl) statusEl.innerHTML = '<div style="font-size:.62rem;color:#e88;margin-top:.3rem">Failed: ' + (d.error || 'unknown') + '</div>';
                            if (lbl) { lbl.style.opacity = '1'; lbl.style.pointerEvents = ''; }
                        }
                    })
                    .catch(function () {
                        toast('Upload failed', 'err');
                        if (statusEl) statusEl.innerHTML = '<div style="font-size:.62rem;color:#e88;margin-top:.3rem">Upload failed</div>';
                        if (lbl) { lbl.style.opacity = '1'; lbl.style.pointerEvents = ''; }
                    });
            });
        }
        return;
    }

    var uc = S.user.height_cm;
    var hn = uc
        ? '<div class="ib">Height: <strong>' + fh(uc) + '</strong> <a id="chHt">Change</a></div>'
        : '<div class="ib"><a id="setHt">Set height</a> for weighted ratings.</div>';

    el.innerHTML = hn +
        '<form id="rvF" novalidate>' +
            '<div class="fg"><label class="fl">Rating <span class="rq">*</span></label>' +
                '<div class="ls" id="lS">' +
                    '<button type="button" class="lb z" data-v="0">' + mkIcon('icon_chair_0', '✖', 20, 20) + '</button>' +
                    '<button type="button" class="lb" data-v="1">' + mkChair(1, 20, 20) + '</button>' +
                    '<button type="button" class="lb" data-v="2">' + mkChair(2, 16, 16) + mkChair(2, 16, 16) + '</button>' +
                    '<button type="button" class="lb" data-v="3">' + mkChair(3, 14, 14) + mkChair(3, 14, 14) + mkChair(3, 14, 14) + '</button>' +
                    '<button type="button" class="lb" data-v="4">' + mkChair(4, 12, 12) + mkChair(4, 12, 12) + mkChair(4, 12, 12) + mkChair(4, 12, 12) + '</button>' +
                    '<button type="button" class="lb" data-v="5">' + mkChair(5, 11, 11) + mkChair(5, 11, 11) + mkChair(5, 11, 11) + mkChair(5, 11, 11) + mkChair(5, 11, 11) + '</button>' +
                '</div><div class="lhint" id="lH">Select a rating</div></div>' +
            '<div class="fg"><label class="fl">Year</label>' +
                '<select class="fs" id="rvY"><option>2025</option><option>2024</option><option>2023</option><option>2022</option><option>2019</option></select></div>' +
            '<div class="fg"><label class="fl">Comments</label><textarea class="ft2" id="rvC" maxlength="256" placeholder="Row tips, seat type…"></textarea></div>' +
            '<div class="fg"><label class="fl">' + mkIcon('icon_ticket', '📸', 14, 14) + ' Ticket Stub (optional)</label>' +
                '<div class="ticket-upload-area" id="ticketArea"><input type="file" id="ticketFile" accept="image/*" style="display:none">' +
                '<label class="ticket-upload-label" for="ticketFile">' + mkIcon('icon_ticket', '📸', 22, 22) + 'Upload a photo of your ticket</label>' +
                '<div class="ticket-upload-hint">Verified = <b>5× vote weight</b><br>Reviewed by our team · jpg/png · max 5MB</div>' +
                '<div id="ticketPreview"></div></div></div>' +
            '<button type="submit" class="sbtn" id="rvSubmit">Submit Review ' + mkIcon('icon_logo', '🪑', 16, 16) + '</button>' +
        '</form>';

    initDynamicIcons(el);

    el.querySelectorAll('.lb').forEach(function (b) {
        b.addEventListener('click', function () {
            S.leg = +b.dataset.v;
            el.querySelectorAll('.lb').forEach(function (x) { x.classList.remove('sel'); });
            b.classList.add('sel');
            $('lH').textContent = [mkIcon('icon_chair_0','✖',12,12) + " Can't physically sit",'1/5 — Agonising','2/5 — Cramped','3/5 — Bearable','4/5 — Comfortable','5/5 — Luxurious'][S.leg];
        });
    });

    $('ticketFile').addEventListener('change', function (e) {
        var f = e.target.files[0];
        if (f) {
            if (f.size > 5 * 1024 * 1024) { toast('Image too large (max 5MB)', 'err'); e.target.value = ''; S.ticketFile = null; $('ticketArea').classList.remove('has-file'); $('ticketPreview').innerHTML = ''; return; }
            S.ticketFile = f; $('ticketArea').classList.add('has-file'); $('ticketPreview').innerHTML = '<img class="ticket-upload-preview" src="' + URL.createObjectURL(f) + '" alt="Preview">';
        } else { S.ticketFile = null; $('ticketArea').classList.remove('has-file'); $('ticketPreview').innerHTML = ''; }
    });

    $('rvF').addEventListener('submit', function (e) {
        e.preventDefault();
        if (S.leg == null) { toast('Select a rating', 'err'); return; }
        if (!S.user.height_cm) { toast('Set height first', 'err'); openPrefs(); return; }
        var btn = $('rvSubmit'); btn.disabled = true; btn.textContent = 'Submitting…';
        api('/api/reviews', { method: 'POST', body: JSON.stringify({ stage_id: String(sid), rating: S.leg, year: $('rvY').value, comment: $('rvC').value.trim() }) })
            .then(function (result) {
                if (S.ticketFile && result.reviewId) {
                    btn.textContent = 'Uploading ticket…';
                    var fd = new FormData(); fd.append('ticket', S.ticketFile);
                    return fetch('/api/reviews/' + result.reviewId + '/ticket', { method: 'POST', body: fd })
                        .then(function (tr) { return tr.json().then(function (td) { toast(tr.ok && td.ticketStatus === 'pending' ? 'Review submitted! Ticket pending verification' : 'Review submitted! (Ticket upload issue: ' + (td.error || 'unknown') + ')'); }); })
                        .catch(function () { toast('Review submitted! (Ticket upload failed)'); });
                } else { toast('Review submitted!'); }
            })
            .then(function () {
                S.ticketFile = null; S.leg = null;
                loadStage(sid, S.vid); loadAwards(); loadRecent();
                if (S.user) { S.activityLoaded = false; loadUserActivity(); }
            })
            .catch(function (err) {
                console.error('Submit error:', err);
                toast(err.error || 'Submission failed — please try again', 'err');
                btn.disabled = false; btn.textContent = 'Submit Review';
            });
    });

    var chHt = $('chHt'); if (chHt) chHt.addEventListener('click', openPrefs);
    var setHt = $('setHt'); if (setHt) setHt.addEventListener('click', openPrefs);
}


/* ───────────────────────────────────────────────────────────────
   Bell Curve Canvas
   ─────────────────────────────────────────────────────────────── */

function drawCurve(revs, uc) {
    var cv = $('bellCurveCanvas');
    var cx = cv.getContext('2d');
    var W = cv.offsetWidth || 900, H = cv.offsetHeight || 120;
    cv.width = W; cv.height = H; cx.clearRect(0, 0, W, H);
    var mn = 150, mx = 220, rg = mx - mn;
    function xF(h) { return ((h - mn) / rg) * (W - 70) + 35; }
    var tp = 18, dH = H - 26 - tp;
    cx.strokeStyle = 'rgba(90,58,40,.4)'; cx.lineWidth = 1;
    cx.beginPath(); cx.moveTo(35, H - 26); cx.lineTo(W - 35, H - 26); cx.stroke();
    cx.fillStyle = 'rgba(138,112,96,.55)'; cx.font = '8px sans-serif'; cx.textAlign = 'center';
    [155,165,175,183,190,200,210].forEach(function (h) { cx.fillText(String(h), xF(h), H - 12); });
    var x6 = xF(182.88);
    cx.strokeStyle = 'rgba(212,175,55,.15)'; cx.setLineDash([2,2]);
    cx.beginPath(); cx.moveTo(x6, H - 26); cx.lineTo(x6, 6); cx.stroke();
    cx.setLineDash([]); cx.fillStyle = 'rgba(212,175,55,.4)'; cx.font = '7px sans-serif';
    cx.fillText("6'0\"", x6, H - 1);
    if (!revs.length) { cx.fillStyle = 'rgba(138,112,96,.4)'; cx.font = '11px sans-serif'; cx.fillText('No reviews yet', W / 2, H / 2); return; }
    var R = 180;
    cx.beginPath();
    for (var i = 0; i <= R; i++) {
        var h = mn + (i / R) * rg, ws = 0, rs = 0;
        revs.forEach(function (r) { if (!r.height_cm) return; var w = gauss(r.height_cm, h); ws += w; rs += w * r.rating; });
        var d = Math.min(ws / (revs.length * 0.3), 1);
        var y = H - 26 - d * dH * ((ws > 0 ? rs / ws : 0) / 5);
        if (!i) cx.moveTo(xF(h), H - 26); cx.lineTo(xF(h), y);
    }
    cx.lineTo(xF(mx), H - 26); cx.closePath(); cx.fillStyle = 'rgba(212,175,55,.08)'; cx.fill();
    if (uc) {
        cx.beginPath();
        for (var j = 0; j <= R; j++) {
            var h2 = mn + (j / R) * rg, ws2 = 0, rs2 = 0;
            revs.forEach(function (r) { if (!r.height_cm) return; var w = gauss(r.height_cm, h2) * gauss(r.height_cm, uc); ws2 += w; rs2 += w * r.rating; });
            var d2 = Math.min(ws2 / (revs.length * 0.3), 1);
            var y2 = H - 26 - d2 * dH * ((ws2 > 0 ? rs2 / ws2 : 0) / 5);
            if (!j) cx.moveTo(xF(h2), y2); else cx.lineTo(xF(h2), y2);
        }
        cx.strokeStyle = 'rgba(212,175,55,.75)'; cx.lineWidth = 1.5; cx.stroke();
    }
    revs.forEach(function (r) {
        if (!r.height_cm) return;
        var x = xF(r.height_cm), y = H - 26 - (r.rating / 5) * dH;
        var w = uc ? gauss(r.height_cm, uc) : 1;
        cx.beginPath(); cx.arc(x, y, 2.5 + w * 2.5, 0, Math.PI * 2);
        cx.fillStyle = 'rgba(212,175,55,' + (0.25 + w * 0.7) + ')'; cx.fill();
    });
    if (uc && uc >= mn && uc <= mx) {
        var xu = xF(uc);
        cx.strokeStyle = '#c06060'; cx.lineWidth = 1.5; cx.setLineDash([3,3]);
        cx.beginPath(); cx.moveTo(xu, tp); cx.lineTo(xu, H - 26); cx.stroke();
        cx.setLineDash([]); cx.fillStyle = '#c06060'; cx.beginPath(); cx.arc(xu, tp + 3, 3, 0, Math.PI * 2); cx.fill();
        var hu = cm2fi(uc);
        cx.font = 'bold 7px sans-serif'; cx.textAlign = xu > W / 2 ? 'right' : 'left';
        cx.fillText('You ' + hu.ft + "'" + hu.in + '"', xu + (xu > W / 2 ? -6 : 6), tp + 13);
    }
}


/* ═══════════════════════════════════════════════════════════════
   EVENTS / SHOWS ON STAGE PAGE
   ═══════════════════════════════════════════════════════════════ */

function renderEvents(sid) {
    var el = $('stEvents');
    if (!el) return;

    /* show a loading placeholder immediately */
    el.innerHTML =
        '<div class="ev-section">' +
            '<div class="ev-hd">' +
                mkIcon('icon_shows', '🎟️', 16, 16) +
                '<span class="ev-hd-title">Shows at this space</span>' +
            '</div>' +
            '<div class="ev-coming-soon" style="opacity:.5">' +
                mkIcon('icon_calendar', '📅', 14, 14) +
                ' Loading programme…' +
            '</div>' +
        '</div>';
    initDynamicIcons(el);

    api('/api/stages/' + sid + '/events').then(function (d) {
        var events = d.events || [];

        /* ── No events ── */
        if (!events.length) {
            el.innerHTML =
                '<div class="ev-section">' +
                    '<div class="ev-hd">' +
                        mkIcon('icon_shows', '🎟️', 16, 16) +
                        '<span class="ev-hd-title">Shows at this space</span>' +
                    '</div>' +
                    '<div class="ev-coming-soon">' +
                        mkIcon('icon_calendar', '📅', 14, 14) +
                        ' 2025 programme not yet announced — check back soon' +
                    '</div>' +
                '</div>';
            initDynamicIcons(el);
            return;
        }

        /* ── Build cards ── */
        var html =
            '<div class="ev-section">' +
                '<div class="ev-hd">' +
                    mkIcon('icon_shows', '🎟️', 16, 16) +
                    '<span class="ev-hd-title">Shows at this space</span>' +
                    '<span class="ev-hd-cnt">' + events.length + ' show' + (events.length !== 1 ? 's' : '') + '</span>' +
                '</div>' +
                '<div class="ev-note">' +
                    mkIcon('icon_shows', '🎟️', 11, 11) +
                    ' Know the seating before you book — then pick your show with confidence.' +
                '</div>' +
                '<div class="ev-grid">';

        html += events.map(function (ev) {
            var festClass = ev.festival || 'fringe';
            var festLabel = ev.festival === 'intl' ? "Int'l" : ev.festival === 'both' ? 'Both' : 'Fringe';
            var festIconId = ev.festival === 'intl' ? 'icon_intl' : 'icon_fringe';
            var festEmoji  = ev.festival === 'intl' ? '🎼' : '🎭';

            /* time string */
            var timeStr = '';
            if (ev.time_start) {
                timeStr = ev.time_start;
                if (ev.time_end) timeStr += '–' + ev.time_end;
            }

            /* date string — strip year, just show MM-DD */
            var dateStr = '';
            if (ev.date_start) {
                var parts = ev.date_start.split('-'); /* YYYY-MM-DD */
                dateStr = parts[2] + '/' + parts[1];
                if (ev.date_end && ev.date_end !== ev.date_start) {
                    var ep = ev.date_end.split('-');
                    dateStr += ' – ' + ep[2] + '/' + ep[1];
                }
            }

            return '<div class="ev-card">' +
                '<div class="ev-card-body">' +
                    /* top row: info + festival badge */
                    '<div class="ev-card-top">' +
                        '<div class="ev-card-info">' +
                            '<div class="ev-card-title">' + esc(ev.title) + '</div>' +
                            (ev.artist ? '<div class="ev-card-artist">' + esc(ev.artist) + '</div>' : '') +
                            (ev.genre  ? '<div class="ev-card-genre">'  + mkIcon('icon_shows', '🎟️', 10, 10) + ' ' + esc(ev.genre) + '</div>' : '') +
                        '</div>' +
                        '<span class="ev-card-badge ' + festClass + '">' +
                            mkIcon(festIconId, festEmoji, 10, 10) + ' ' + festLabel +
                        '</span>' +
                    '</div>' +
                    /* description */
                    (ev.description ? '<div class="ev-card-desc">' + esc(ev.description) + '</div>' : '') +
                    /* meta row */
                    '<div class="ev-card-meta">' +
                        (timeStr ? '<span class="ev-card-meta-item ev-card-times">' + mkIcon('icon_clock', '🕐', 11, 11) + ' ' + esc(timeStr) + '</span>' : '') +
                        (dateStr ? '<span class="ev-card-meta-item ev-card-dates">' + mkIcon('icon_calendar', '📅', 11, 11) + ' ' + esc(dateStr) + '</span>' : '') +
                        (ev.price_text ? '<span class="ev-card-meta-item ev-card-price">' + mkIcon('icon_money', '💰', 11, 11) + ' ' + esc(ev.price_text) + '</span>' : '') +
                    '</div>' +
                    /* ticket link */
                    (ev.url ? '<div class="ev-card-link"><a href="' + esc(ev.url) + '" target="_blank" rel="noopener">' + mkIcon('icon_shows', '🎟️', 11, 11) + ' Book tickets →</a></div>' : '') +
                '</div>' +
            '</div>';
        }).join('');

        html += '</div></div>';

        el.innerHTML = html;
        initDynamicIcons(el);

    }).catch(function () {
        el.innerHTML =
            '<div class="ev-section">' +
                '<div class="ev-hd">' +
                    mkIcon('icon_shows', '🎟️', 16, 16) +
                    '<span class="ev-hd-title">Shows at this space</span>' +
                '</div>' +
                '<div class="ev-coming-soon">' +
                    mkIcon('icon_calendar', '📅', 14, 14) +
                    ' Programme information unavailable' +
                '</div>' +
            '</div>';
        initDynamicIcons(el);
    });
}


/* ═══════════════════════════════════════════════════════════════
   STATISTICS
   ═══════════════════════════════════════════════════════════════ */

function loadStats() {
    var el = $('statsContent');
    el.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--t3)">Loading…</div>';
    api('/api/stats').then(function (d) { S.statsCache = d; renderStatsSection(d, S.statsSection); })
        .catch(function () { el.innerHTML = '<div class="no-rv">Failed to load.</div>'; });
}

function renderStatsSection(d, section) {
    var el = $('statsContent');
    document.querySelectorAll('.sn-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.s === section); });
    if (section === 'overview') el.innerHTML = rSO(d);
    else if (section === 'height') el.innerHTML = rSH(d);
    else if (section === 'venue') el.innerHTML = rSV(d);
    else if (section === 'area') el.innerHTML = rSA(d);
    else if (section === 'trends') el.innerHTML = rST(d);
    initDynamicIcons(el);
}

function pct(v, mx) { return mx > 0 ? Math.round(v / mx * 100) : 0; }

function starBar(avg) {
    var p = Math.round(avg / 5 * 100);
    return '<div class="bar-track" style="width:80px;display:inline-block;vertical-align:middle"><div class="bar-fill" style="width:' + p + '%"></div></div> <span style="color:var(--gold);font-weight:800;font-size:.72rem">' + avg.toFixed(2) + '</span>';
}

function distLabel(rating) {
    if (rating === 0) return mkIcon('icon_chair_0', '✖', 14, 14);
    return mkChairRating(rating, 14, 14);
}

function rSO(d) {
    var o = d.overview, dist = d.ratingDist, mx = 1;
    for (var i = 0; i < dist.length; i++) { if (dist[i].count > mx) mx = dist[i].count; }
    return '<div class="insight-box">Average legroom: <strong>' + (o.avgRating != null ? o.avgRating.toFixed(2) : '—') + '/5</strong> (' + (o.avgRating != null ? LD[Math.round(o.avgRating)] : '—') + ').' + (o.approvedTickets ? ' <strong>' + o.approvedTickets + ' verified</strong> reviews (5×).' : '') + '</div>' +
        '<div class="stat-kpi-row"><div class="kpi"><div class="kpi-v">' + o.totalReviews + '</div><div class="kpi-l">Reviews</div></div><div class="kpi"><div class="kpi-v">' + o.totalVenues + '</div><div class="kpi-l">Venues</div></div><div class="kpi"><div class="kpi-v">' + o.reviewedStages + '</div><div class="kpi-l">Reviewed</div></div><div class="kpi"><div class="kpi-v">' + o.totalUsers + '</div><div class="kpi-l">Reviewers</div></div><div class="kpi"><div class="kpi-v">' + (o.avgRating != null ? o.avgRating.toFixed(2) : '—') + '</div><div class="kpi-l">Avg</div></div><div class="kpi"><div class="kpi-v" style="color:#e08080">' + o.zeroCount + '</div><div class="kpi-l">Zeros ' + mkIcon('icon_chair_0', '✖', 12, 12) + '</div></div></div>' +
        '<div class="stats-grid"><div class="chart-wrap"><div class="chart-wrap-t">Rating Distribution</div><div class="bar-chart">' +
            dist.map(function (r) { return '<div class="bar-row"><div class="bar-label">' + distLabel(r.rating) + '</div><div class="bar-track"><div class="bar-fill ' + (r.rating === 0 ? 'red' : '') + '" style="width:' + Math.round(r.count / mx * 100) + '%"></div></div><div class="bar-val">' + r.count + '</div></div>'; }).join('') +
        '</div></div><div class="chart-wrap"><div class="chart-wrap-t">Top Groups</div><div class="bar-chart">' +
            d.ratingByGroup.slice(0, 5).map(function (g) { return '<div class="bar-row"><div class="bar-label">' + esc(g.group_name) + '</div><div class="bar-track"><div class="bar-fill" style="width:' + pct(g.avg_rating, 5) + '%"></div></div><div class="bar-val">' + g.avg_rating.toFixed(2) + '</div></div>'; }).join('') +
        '</div></div></div>' +
        '<div class="chart-wrap"><div class="chart-wrap-t">Most Reviewed</div><table class="tbl"><thead><tr><th>#</th><th>Space</th><th>Venue</th><th>N</th><th>Avg</th></tr></thead><tbody>' +
            d.mostReviewed.map(function (r, i) { return '<tr><td style="color:var(--t3)">' + (i + 1) + '</td><td class="link" data-nav="stage" data-vid="' + r.venue_id + '" data-sid="' + r.stage_id + '"><b>' + esc(r.stage_name) + '</b></td><td>' + esc(r.venue_name) + '</td><td>' + r.cnt + '</td><td>' + starBar(r.avg_rating) + '</td></tr>'; }).join('') +
        '</tbody></table></div>' +
        mkStrip('icon_hotel', '🏨', 'Plan your Festival stay', 'Compare Edinburgh hotels.', 'Search Stays');
}

function rSH(d) {
    var rbh = d.ratingByHeight.filter(function (r) { return r.height_bucket >= 150 && r.height_bucket <= 220; });
    var hd = d.heightDist.filter(function (r) { return r.bucket >= 150 && r.bucket <= 220; });
    var mx = 1, mxC = 1;
    for (var i = 0; i < rbh.length; i++) { if (rbh[i].avg_rating > mx) mx = rbh[i].avg_rating; }
    for (var j = 0; j < hd.length; j++) { if (hd[j].count > mxC) mxC = hd[j].count; }
    return '<div class="insight-box"></div><div class="stats-grid"><div class="chart-wrap"><div class="chart-wrap-t">Avg by Height</div><div class="bar-chart">' +
        rbh.map(function (r) { var clr = r.avg_rating >= 3.5 ? 'var(--grn)' : r.avg_rating >= 2 ? 'var(--gold)' : '#a05030'; return '<div class="bar-row"><div class="bar-label sm">' + r.height_bucket + 'cm</div><div class="bar-track"><div class="bar-fill" style="width:' + pct(r.avg_rating, mx) + '%;background:' + clr + '"></div></div><div class="bar-val">' + r.avg_rating.toFixed(2) + '</div></div>'; }).join('') +
        '</div></div><div class="chart-wrap"><div class="chart-wrap-t">Height Distribution</div><div class="bar-chart">' +
        hd.map(function (r) { return '<div class="bar-row"><div class="bar-label sm">' + r.bucket + 'cm</div><div class="bar-track"><div class="bar-fill" style="width:' + pct(r.count, mxC) + '%;background:rgba(212,175,55,.5)"></div></div><div class="bar-val">' + r.count + '</div></div>'; }).join('') +
        '</div></div></div><div class="chart-wrap"><div class="chart-wrap-t">By Capacity</div><table class="tbl"><thead><tr><th>Size</th><th>Avg</th><th>N</th></tr></thead><tbody>' +
        d.ratingByCapacity.map(function (r) { return '<tr><td><b>' + esc(r.bracket) + '</b></td><td>' + starBar(r.avg_rating) + '</td><td>' + r.cnt + '</td></tr>'; }).join('') +
        '</tbody></table></div>' + mkCard('icon_shows', '🎟️', 'Book festival shows', 'Search Edinburgh Fringe events.', 'Find Shows');
}

function rSV(d) {
    var festNames = { fringe: mkIcon('icon_fringe','🎭',12,12) + ' Fringe', intl: mkIcon('icon_intl','🎼',12,12) + " Int'l", both: mkIcon('icon_both','🎭',12,12) + ' Both' };
    return '<div class="chart-wrap"><div class="chart-wrap-t">By Operator</div><table class="tbl"><thead><tr><th>Group</th><th>Spaces</th><th>N</th><th>Avg</th></tr></thead><tbody>' +
        d.ratingByGroup.map(function (g) { return '<tr><td><b>' + esc(g.group_name) + '</b></td><td>' + g.stage_cnt + '</td><td>' + g.cnt + '</td><td>' + starBar(g.avg_rating) + '</td></tr>'; }).join('') +
        '</tbody></table></div><div class="stats-grid"><div class="chart-wrap"><div class="chart-wrap-t">By Festival</div><table class="tbl"><thead><tr><th>Type</th><th>N</th><th>Avg</th></tr></thead><tbody>' +
        d.ratingByFest.map(function (r) { return '<tr><td><b>' + (festNames[r.festival] || esc(r.festival)) + '</b></td><td>' + r.cnt + '</td><td>' + starBar(r.avg_rating) + '</td></tr>'; }).join('') +
        '</tbody></table></div><div class="chart-wrap"><div class="chart-wrap-t">Most Controversial</div><table class="tbl"><thead><tr><th>#</th><th>Space</th><th>Var</th><th>Avg</th></tr></thead><tbody>' +
        d.controversial.map(function (r, i) { return '<tr><td>' + (i + 1) + '</td><td class="link" data-nav="stage" data-vid="' + r.venue_id + '" data-sid="' + r.stage_id + '"><b>' + esc(r.stage_name) + '</b></td><td style="color:#e0a060;font-weight:800">±' + r.variance.toFixed(2) + '</td><td>' + starBar(r.avg_rating) + '</td></tr>'; }).join('') +
        '</tbody></table></div></div>' + mkCard('icon_fringe', '🎭', 'Edinburgh Festival tickets', 'Compare shows.', 'Find Shows');
}

function rSA(d) {
    var mx = 1;
    for (var i = 0; i < d.ratingByArea.length; i++) { if (d.ratingByArea[i].avg_rating > mx) mx = d.ratingByArea[i].avg_rating; }
    return '<div class="insight-box">' + (d.ratingByArea[0] && d.ratingByArea.length > 1 ? '<strong>' + esc(d.ratingByArea[0].area) + '</strong> leads (' + d.ratingByArea[0].avg_rating.toFixed(2) + ')' : '') + '</div>' +
        '<div class="stats-grid"><div class="chart-wrap"><div class="chart-wrap-t">By Area</div><div class="bar-chart">' +
        d.ratingByArea.map(function (r) { var clr = r.avg_rating >= 3.5 ? 'var(--grn)' : r.avg_rating >= 2.5 ? 'var(--gold)' : '#a05030'; return '<div class="bar-row"><div class="bar-label">' + esc(r.area) + '</div><div class="bar-track"><div class="bar-fill" style="width:' + Math.round(r.avg_rating / mx * 100) + '%;background:' + clr + '"></div></div><div class="bar-val">' + r.avg_rating.toFixed(2) + '</div></div>'; }).join('') +
        '</div></div><div class="chart-wrap"><div class="chart-wrap-t">Rankings</div><table class="tbl"><thead><tr><th>#</th><th>Area</th><th>N</th><th>Avg</th></tr></thead><tbody>' +
        d.ratingByArea.map(function (r, i) { return '<tr><td style="color:var(--t3)">' + (i + 1) + '</td><td><b>' + esc(r.area) + '</b></td><td>' + r.cnt + '</td><td>' + starBar(r.avg_rating) + '</td></tr>'; }).join('') +
        '</tbody></table></div></div>' + mkStrip('icon_explore', '🗺️', 'Explore Edinburgh by area', 'Neighbourhood guides.', 'Area Guides');
}

function rST(d) {
    var mx = 1;
    for (var i = 0; i < d.reviewsByYear.length; i++) { if (d.reviewsByYear[i].count > mx) mx = d.reviewsByYear[i].count; }
    var buckets = [[0,.5,0],[.5,1,0],[1,1.5,0],[1.5,2,0],[2,2.5,0],[2.5,3,0],[3,3.5,0],[3.5,4,0],[4,4.5,0],[4.5,5.01,0]];
    for (var j = 0; j < d.stageAvgs.length; j++) { var s = d.stageAvgs[j]; for (var k = 0; k < buckets.length; k++) { if (s.avg_rating >= buckets[k][0] && s.avg_rating < buckets[k][1]) { buckets[k][2]++; break; } } }
    var mxB = 1; for (var m = 0; m < buckets.length; m++) { if (buckets[m][2] > mxB) mxB = buckets[m][2]; }
    return '<div class="stats-grid"><div class="chart-wrap"><div class="chart-wrap-t">By Year</div><div class="bar-chart">' +
        d.reviewsByYear.map(function (r) { return '<div class="bar-row"><div class="bar-label sm">' + esc(r.year) + '</div><div class="bar-track"><div class="bar-fill" style="width:' + pct(r.count, mx) + '%"></div></div><div class="bar-val">' + r.count + ' (' + r.avg_rating.toFixed(1) + ')</div></div>'; }).join('') +
        '</div></div><div class="chart-wrap"><div class="chart-wrap-t">Year Summary</div><table class="tbl"><thead><tr><th>Year</th><th>N</th><th>Avg</th></tr></thead><tbody>' +
        d.reviewsByYear.map(function (r) { return '<tr><td><b>' + esc(r.year) + '</b></td><td>' + r.count + '</td><td>' + starBar(r.avg_rating) + '</td></tr>'; }).join('') +
        '</tbody></table></div></div><div class="chart-wrap"><div class="chart-wrap-t">Score Distribution</div><div class="bar-chart">' +
        buckets.map(function (b) { return '<div class="bar-row"><div class="bar-label sm">' + b[0].toFixed(1) + '–' + (b[1] >= 5 ? '5.0' : b[1].toFixed(1)) + '</div><div class="bar-track"><div class="bar-fill" style="width:' + pct(b[2], mxB) + '%;background:' + (b[0] >= 3.5 ? 'var(--grn)' : b[0] >= 2 ? 'var(--gold)' : '#a05030') + '"></div></div><div class="bar-val">' + b[2] + '</div></div>'; }).join('') +
        '</div></div>' + mkCard('icon_bed', '🛏️', 'Early bird accommodation', 'Hotels book fast in August.', 'Search Stays');
}


/* ═══════════════════════════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════════════════════════ */

function openAuth(t) { if (!t) t = 'login'; $('authOv').classList.add('open'); swTab(t); clrMsg(); }
function closeAuth() { $('authOv').classList.remove('open'); clrMsg(); rstRec(); }

function swTab(t) {
    document.querySelectorAll('.at').forEach(function (b) { b.classList.toggle('active', b.dataset.t === t); });
    var m = { login: 'pLogin', reg: 'pReg', rec: 'pRec' };
    document.querySelectorAll('.ap').forEach(function (p) { p.classList.toggle('active', p.id === m[t]); });
}

function clrMsg() {
    ['lErr','rErr','rOk','rcErr','rcOk','prefErr','prefOk','editUserErr','editUserOk'].forEach(function (id) { var e = $(id); if (e) { e.classList.remove('show'); e.innerHTML = ''; } });
    document.querySelectorAll('.ferr').forEach(function (e) { e.classList.remove('show'); e.textContent = ''; });
}

function msg(id, m, html) { var e = $(id); if (e) { if (html) e.innerHTML = m; else e.textContent = m; e.classList.add('show'); } }

function doLogin() {
    clrMsg();
    var u = $('lU').value.trim(), p = $('lP').value;
    if (!u || !p) { msg('lErr', 'Enter username/email and password.'); return; }
    var b = $('doL'); b.disabled = true; b.textContent = '…';
    api('/api/auth/login', { method: 'POST', body: JSON.stringify({ identifier: u, password: p }) })
        .then(function (d) { S.user = d.user; updUI(); closeAuth(); toast('Welcome back, ' + S.user.display_name + '!'); nav(S.view, S.vid, S.sid, S.awId); })
        .catch(function (e) {
            if (e.needsVerification) {
                msg('lErr', mkIcon('icon_email', '📧', 12, 12) + ' Verify email (' + e.maskedEmail + '). <a id="rsL">Resend</a>', true);
                var rsL = $('rsL');
                if (rsL) rsL.addEventListener('click', function () {
                    api('/api/auth/resend-verification', { method: 'POST', body: JSON.stringify({ identifier: u }) })
                        .then(function (r) { msg('lErr', r.verifyUrl ? 'Dev: <a href="' + r.verifyUrl + '" target="_blank">Verify</a>' : mkIcon('icon_star_verified', '✅', 12, 12) + ' Sent!', true); })
                        .catch(function (x) { msg('lErr', x.error || 'Failed'); });
                });
            } else { msg('lErr', e.error || 'Failed.'); }
        })
        .then(function () { b.disabled = false; b.textContent = 'Sign In'; });
}

function doReg() {
    clrMsg();
    var u = $('rU').value.trim(), em = $('rE').value.trim(), dn = $('rD').value.trim();
    var p = $('rP').value, p2 = $('rP2').value, sq = $('rSQ').value, sa = $('rSA').value.trim();
    var cm = parseFloat($('rCm').value), ft = parseFloat($('rFt').value), ins = $('rIn').value;
    var ok = true;
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(u)) { $('rUE').textContent = '3-30 chars'; $('rUE').classList.add('show'); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { $('rEE').textContent = 'Valid email needed'; $('rEE').classList.add('show'); ok = false; }
    if (p.length < 8) { $('rPE').textContent = 'Min 8 chars'; $('rPE').classList.add('show'); ok = false; }
    if (p !== p2) { $('rP2E').textContent = 'Mismatch'; $('rP2E').classList.add('show'); ok = false; }
    if (!sq) { $('rSQE').textContent = 'Choose one'; $('rSQE').classList.add('show'); ok = false; }
    if (sa.length < 2) { $('rSAE').textContent = 'Min 2 chars'; $('rSAE').classList.add('show'); ok = false; }
    if (!ok) return;
    var h = null;
    if (cm >= 90 && cm <= 250) h = cm; else if (ft >= 3 && ft <= 8) h = fi2cm(ft, ins);
    var b = $('doR'); b.disabled = true; b.textContent = '…';
    api('/api/auth/register', { method: 'POST', body: JSON.stringify({ username: u, email: em, display_name: dn || u, password: p, security_q: sq, security_a: sa, height_cm: h }) })
        .then(function (d) { var m2 = mkIcon('icon_star_verified', '✅', 12, 12) + ' Check <strong>' + d.maskedEmail + '</strong> for verification.'; if (d.verifyUrl) m2 += '<br>Dev: <a href="' + d.verifyUrl + '" target="_blank">Verify →</a>'; msg('rOk', m2, true); b.style.display = 'none'; })
        .catch(function (e) { msg('rErr', e.error || 'Failed'); })
        .then(function () { if (b.style.display !== 'none') { b.disabled = false; b.textContent = 'Create Account'; } });
}

function rstRec() { $('rc1').style.display = 'block'; $('rc2').style.display = 'none'; $('rc3').style.display = 'none'; }

function doRcL() {
    clrMsg();
    var u = $('rcU').value.trim(); if (!u) { msg('rcErr', 'Enter username or email.'); return; }
    api('/api/auth/recover-lookup', { method: 'POST', body: JSON.stringify({ identifier: u }) })
        .then(function (d) { if (d.question) { $('rcQ').textContent = d.question; $('rc1').style.display = 'none'; $('rc2').style.display = 'block'; } else { msg('rcErr', 'Not found.'); } })
        .catch(function (e) { msg('rcErr', e.error || 'Failed.'); });
}

function doRcV() {
    clrMsg();
    var a = $('rcA').value.trim(); if (!a) { msg('rcErr', 'Enter answer.'); return; }
    var b = $('doRcV'); b.disabled = true;
    api('/api/auth/recover-verify', { method: 'POST', body: JSON.stringify({ answer: a }) })
        .then(function () { $('rc2').style.display = 'none'; $('rc3').style.display = 'block'; })
        .catch(function (e) { msg('rcErr', e.error || 'Wrong.'); })
        .then(function () { b.disabled = false; });
}

function doRcR() {
    clrMsg();
    var p = $('rcNP').value, p2 = $('rcNP2').value;
    if (p.length < 8) { msg('rcErr', 'Min 8 chars.'); return; }
    if (p !== p2) { msg('rcErr', 'Mismatch.'); return; }
    api('/api/auth/recover-reset', { method: 'POST', body: JSON.stringify({ password: p }) })
        .then(function () { toast('Password set!'); closeAuth(); setTimeout(function () { openAuth('login'); }, 300); })
        .catch(function (e) { msg('rcErr', e.error || 'Failed.'); });
}

function doOut() {
    api('/api/auth/logout', { method: 'POST' }).catch(function () {});
    S.user = null; S.userActivity = null; S.activityLoaded = false;
    updUI(); toast('Signed out.'); nav(S.view, S.vid, S.sid, S.awId);
}

function updUI() {
    $('gBar').style.display = S.user ? 'none' : 'flex';
    $('uBar').style.display = S.user ? 'flex' : 'none';
    if (S.user) {
        $('uN').textContent = S.user.display_name;
        $('uH').textContent = S.user.height_cm ? fh(S.user.height_cm) : 'Set height';
        var ab = $('openAdmin');
        if (ab) { if (S.user.is_admin) { ab.classList.remove('hidden'); ab.style.display = 'inline-flex'; } else { ab.classList.add('hidden'); ab.style.display = 'none'; } }
        var mrBtn = $('openMyRevs');
        if (mrBtn) { mrBtn.classList.remove('hidden'); mrBtn.style.display = 'inline-flex'; }
    } else {
        var mrBtn2 = $('openMyRevs');
        if (mrBtn2) { mrBtn2.classList.add('hidden'); mrBtn2.style.display = 'none'; }
    }
    renderHeroCta();
    if (S.user) { S.activityLoaded = false; loadUserActivity(); }
}

function openPrefs() {
    if (!S.user) { openAuth('login'); return; }
    clrMsg();
    var h = S.user.height_cm;
    if (h) { var x = cm2fi(h); $('hFt').value = x.ft; $('hIn').value = x.in; $('hCm').value = Math.round(h); }
    else { $('hFt').value = ''; $('hIn').value = ''; $('hCm').value = ''; }
    $('prefDN').value = S.user.display_name || '';
    $('prefSH').checked = !!(S.user.show_height != null ? S.user.show_height : 1);
    $('prefME').checked = !!S.user.marketing_emails;
    $('prefEmail').textContent = S.user.email || '—';
    $('prefOv').classList.add('open');
}

function closePrefs() { $('prefOv').classList.remove('open'); clrMsg(); }

function savePrefs() {
    clrMsg();
    var cm = parseFloat($('hCm').value), ft = parseFloat($('hFt').value), ins = $('hIn').value;
    var h = null;
    if (cm >= 90 && cm <= 250) h = cm; else if (ft >= 3 && ft <= 8) h = fi2cm(ft, ins);
    var b = $('prefSv'); b.disabled = true; b.textContent = 'Saving…';
    var chain = Promise.resolve();
    if (h && h !== S.user.height_cm) chain = chain.then(function () { return api('/api/user/height', { method: 'PUT', body: JSON.stringify({ height_cm: h }) }).then(function () { S.user.height_cm = h; }); });
    chain.then(function () {
        return api('/api/user/preferences', { method: 'PUT', body: JSON.stringify({ display_name: $('prefDN').value.trim() || S.user.display_name, marketing_emails: $('prefME').checked, show_height: $('prefSH').checked }) })
            .then(function (res) { if (res.user) { S.user = Object.assign({}, S.user, res.user); if (h) S.user.height_cm = h; } updUI(); msg('prefOk', 'Saved!'); toast('Preferences saved'); if (h) nav(S.view, S.vid, S.sid, S.awId); });
    })
    .catch(function (e) { msg('prefErr', e.error || 'Failed'); })
    .then(function () { b.disabled = false; b.textContent = 'Save Changes'; });
}

function htSy(f, i, c) {
    [f, i].forEach(function (id) {
        var e = $(id); if (!e) return;
        e.addEventListener('input', function () {
            var fv = parseFloat($(f) && $(f).value) || 0, iv = $(i) && $(i).value || 0;
            if (fv >= 3) { var x = $(c); if (x) x.value = Math.round(fi2cm(fv, iv)); }
        });
    });
    var ce = $(c); if (!ce) return;
    ce.addEventListener('input', function () {
        var v = parseFloat(ce.value);
        if (v >= 90 && v <= 250) { var x = cm2fi(v); var fe = $(f), ie = $(i); if (fe) fe.value = x.ft; if (ie) ie.value = x.in; }
    });
}


/* ───────────────────────────────────────────────────────────────
   Search
   ─────────────────────────────────────────────────────────────── */

var sT = null;

function initSearch() {
    var inp = $('sIn'), dd = $('sDD');
    inp.addEventListener('input', function () {
        clearTimeout(sT);
        var q = inp.value.trim();
        if (q.length < 2) { dd.classList.remove('open'); return; }
        sT = setTimeout(function () {
            api('/api/search?q=' + encodeURIComponent(q)).then(function (h) {
                dd.innerHTML = h.length
                    ? h.map(function (r) { return '<div class="si" data-nav="stage" data-vid="' + r.venue_id + '" data-sid="' + r.stage_id + '"><b>' + esc(r.stage_name) + '</b><small>' + esc(r.venue_name) + ' · ' + esc(r.area) + '</small></div>'; }).join('')
                    : '<div class="si"><small style="color:var(--t3)">No results</small></div>';
                dd.classList.add('open');
            }).catch(function () {});
        }, 220);
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.srch')) { dd.classList.remove('open'); inp.value = ''; } });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Escape') { dd.classList.remove('open'); inp.value = ''; } });
}


/* ───────────────────────────────────────────────────────────────
   Hash Parsing
   ─────────────────────────────────────────────────────────────── */

function parseHash() {
    var h = location.hash.replace(/^#/, '');
    if (!h || h === 'home') return { view: 'home' };
    var parts = h.split('/');
    if (parts[0] === 'venue' && parts[1]) return { view: 'venue', vid: parts[1] };
    if (parts[0] === 'stage' && parts[1] && parts[2]) return { view: 'stage', vid: parts[1], sid: parts[2] };
    if (parts[0] === 'awards') return { view: 'awards', extra: parts[1] || 'vice' };
    if (parts[0] === 'award' && parts[1]) return { view: 'award', extra: parts[1] };
    if (['press','about','stats','venueReport','operatorReport','admin','myreviews'].indexOf(parts[0]) !== -1) return { view: parts[0] };
    return { view: 'home' };
}


/* ═══════════════════════════════════════════════════════════════
   EVENT WIRING
   ═══════════════════════════════════════════════════════════════ */

function initEv() {
    document.addEventListener('click', function (e) {
        var t = e.target.closest('[data-nav]');
        if (t && !t.closest('.ov') && !t.closest('.adm-main')) nav(t.dataset.nav, t.dataset.vid, t.dataset.sid, t.dataset.award || t.dataset.tab || null);
    });
    document.addEventListener('click', function (e) {
        var t = e.target.closest('.adm-main [data-nav]');
        if (t) nav(t.dataset.nav, t.dataset.vid, t.dataset.sid, t.dataset.award || t.dataset.tab || null);
    });

    $('logo').addEventListener('click', function () { nav('home'); });

    $('fTabs').addEventListener('click', function (e) {
        var b = e.target.closest('.ft'); if (!b) return;
        document.querySelectorAll('.ft').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active'); S.fest = b.dataset.f; S.grp = 'all';
        document.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c.dataset.g === 'all'); });
        loadVenues();
    });

    $('gFilt').addEventListener('click', function (e) {
        var c = e.target.closest('.chip'); if (!c) return;
        document.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('active'); });
        c.classList.add('active'); S.grp = c.dataset.g; loadVenues();
    });

    ['awViceStrip','awGoldStrip'].forEach(function (id) {
        var el = $(id); if (!el) return;
        el.addEventListener('mouseenter', function () { S.awPaused = true; });
        el.addEventListener('mouseleave', function () { S.awPaused = false; });
        el.addEventListener('touchstart', function () { S.awPaused = true; }, { passive: true });
        el.addEventListener('touchend', function () { setTimeout(function () { S.awPaused = false; }, 1000); }, { passive: true });
    });

    $('awdsTabs').addEventListener('click', function (e) {
        var b = e.target.closest('.awds-tab'); if (!b) return;
        S.awdsTab = b.dataset.tab; renderAwardsPage();
    });

    $('openAuth').addEventListener('click', function () { openAuth('login'); });
    document.querySelectorAll('.authCl').forEach(function (b) { b.addEventListener('click', closeAuth); });
    $('authOv').addEventListener('click', function (e) { if (e.target === e.currentTarget) closeAuth(); });
    document.querySelectorAll('.at').forEach(function (b) { b.addEventListener('click', function () { swTab(b.dataset.t); }); });

    $('doL').addEventListener('click', doLogin);
    $('lP').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });

    $('doR').addEventListener('click', doReg);
    $('rP').addEventListener('input', function (e) {
        upwb(e.target.value, 'pwB');
        var s = pws(e.target.value);
        $('pwH').textContent = e.target.value.length ? 'Strength: ' + ['Weak','Weak','Fair','Good','Strong','Very strong'][s] : 'Min 8 characters';
    });
    htSy('rFt', 'rIn', 'rCm');

    $('doRcL').addEventListener('click', doRcL);
    $('doRcV').addEventListener('click', doRcV);
    $('doRcR').addEventListener('click', doRcR);
    $('rcBk').addEventListener('click', function () { $('rc2').style.display = 'none'; $('rc1').style.display = 'block'; clrMsg(); });
    $('rcNP').addEventListener('input', function (e) { upwb(e.target.value, 'rcPB'); });
    $('rcU').addEventListener('keydown', function (e) { if (e.key === 'Enter') doRcL(); });
    $('rcA').addEventListener('keydown', function (e) { if (e.key === 'Enter') doRcV(); });

    $('openPrefs').addEventListener('click', openPrefs);
    $('prefCl').addEventListener('click', closePrefs);
    $('prefSv').addEventListener('click', savePrefs);
    $('prefOv').addEventListener('click', function (e) { if (e.target === e.currentTarget) closePrefs(); });
    htSy('hFt', 'hIn', 'hCm');

    $('logoutBtn').addEventListener('click', doOut);

    ['openStats','openStats2'].forEach(function (id) { var el = $(id); if (el) el.addEventListener('click', function () { nav('stats'); }); });

    var openAdm = $('openAdmin');
    if (openAdm) openAdm.addEventListener('click', function () { window.open('/admin.html', '_blank'); });
    var openMR = $('openMyRevs');
    if (openMR) openMR.addEventListener('click', function () { nav('myreviews'); });

    $('statsNav').addEventListener('click', function (e) {
        var b = e.target.closest('.sn-btn'); if (!b) return;
        S.statsSection = b.dataset.s;
        if (S.statsCache) renderStatsSection(S.statsCache, S.statsSection); else loadStats();
    });

    window.addEventListener('resize', function () { if (S.view === 'stage' && S.sd) drawCurve(S.sd.reviews, S.sd.userCm); });

    var admNav = $('admNav');
    if (admNav) admNav.addEventListener('click', function (e) { var item = e.target.closest('.adm-nav-item'); if (item && item.dataset.adm) loadAdminSection(item.dataset.adm); });

    var admRevFilters = $('admRevFilters');
    if (admRevFilters) admRevFilters.addEventListener('click', function (e) {
        var btn = e.target.closest('.adm-filter-btn'); if (!btn) return;
        document.querySelectorAll('.adm-filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active'); S.admRevFilter = btn.dataset.filter; S.admRevPage = 0; loadAdmReviews();
    });

    var admRevPrev = $('admRevPrev');
    if (admRevPrev) admRevPrev.addEventListener('click', function () { if (S.admRevPage > 0) { S.admRevPage--; loadAdmReviews(); } });
    var admRevNext = $('admRevNext');
    if (admRevNext) admRevNext.addEventListener('click', function () { if ((S.admRevPage + 1) * 50 < S.admRevTotal) { S.admRevPage++; loadAdmReviews(); } });

    var admUserPrev = $('admUserPrev');
    if (admUserPrev) admUserPrev.addEventListener('click', function () { if (S.admUserPage > 0) { S.admUserPage--; loadAdmUsers(); } });
    var admUserNext = $('admUserNext');
    if (admUserNext) admUserNext.addEventListener('click', function () { if ((S.admUserPage + 1) * 50 < S.admUserTotal) { S.admUserPage++; loadAdmUsers(); } });

    var admUserSearchBtn = $('admUserSearchBtn');
    if (admUserSearchBtn) admUserSearchBtn.addEventListener('click', function () { S.admUserQ = $('admUserSearch').value.trim(); S.admUserPage = 0; loadAdmUsers(); });
    var admUserSearch = $('admUserSearch');
    if (admUserSearch) admUserSearch.addEventListener('keydown', function (e) { if (e.key === 'Enter') { S.admUserQ = e.target.value.trim(); S.admUserPage = 0; loadAdmUsers(); } });

    var editUserCl = $('editUserCl');
    if (editUserCl) editUserCl.addEventListener('click', function () { $('editUserOv').classList.remove('open'); });
    var editUserOv = $('editUserOv');
    if (editUserOv) editUserOv.addEventListener('click', function (e) { if (e.target === e.currentTarget) $('editUserOv').classList.remove('open'); });
    var editUserSv = $('editUserSv');
    if (editUserSv) editUserSv.addEventListener('click', saveEditUser);

    var awardsHeroArt = $('awardsHeroArt');
    if (awardsHeroArt) applyArtImage('hero_awards', awardsHeroArt, '.hero-site-img', 'has-img');
    var awSideImg = $('awSideImg');
    if (awSideImg) applyArtImage('promo_edinburgh', awSideImg, '.side-site-img', 'has-img');
}


/* ═══════════════════════════════════════════════════════════════
   MISSION SCALE — horizontal strip, one column per rating
   ═══════════════════════════════════════════════════════════════ */

function renderMissionScale() {
    var el = $('mScale'); if (!el) return;

    var scaleItems = [
        { v: 0, label: "Can't sit" },
        { v: 1, label: 'Agonising' },
        { v: 2, label: 'Cramped' },
        { v: 3, label: 'Bearable' },
        { v: 4, label: 'Comfortable' },
        { v: 5, label: 'Luxurious' }
    ];

    var html = '<div class="m-scale-strip">';

    scaleItems.forEach(function (item, idx) {
        var iconHtml = '';
        if (item.v === 0) {
            iconHtml = mkIcon('icon_chair_0', '✖', 15, 15);
        } else {
            for (var i = 0; i < item.v; i++) {
                iconHtml += mkIcon('icon_chair_' + item.v, '🪑', 13, 13);
            }
        }

        var sep = idx < scaleItems.length - 1 ? ' m-scale-col-sep' : '';

        html +=
            '<div class="m-scale-col' + sep + '">' +
                '<div class="m-scale-col-icons">' + iconHtml + '</div>' +
                '<div class="m-scale-col-label rating-' + item.v + '">' + item.label + '</div>' +
            '</div>';
    });

    html += '</div>';

    el.innerHTML = html;
    initDynamicIcons(el);
}


/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */

function init() {
    initEv();
    initSearch();
    initIcons();
    renderMissionScale();
    renderHeroCta();

    var p = new URLSearchParams(location.search);
    if (p.get('verified') === '1') { toast('Email verified! Sign in now.'); history.replaceState(null, '', location.pathname + location.hash); }
    if (p.get('verify_error')) { toast('Link invalid or expired.', 'err'); history.replaceState(null, '', location.pathname + location.hash); }

    api('/api/auth/me').then(function (d) { if (d.user) { S.user = d.user; updUI(); } }).catch(function () {});

    var initial = parseHash();
    S._skipPush = true;
    loadVenues();
    if (initial.view !== 'home') {
        if (initial.extra && initial.view === 'awards') S.awdsTab = initial.extra;
        nav(initial.view, initial.vid, initial.sid, initial.extra);
    }
    S._skipPush = false;
    history.replaceState(buildHistoryState(), '', location.hash || '#home');

    loadAwards();
    loadRecent();
}

document.addEventListener('DOMContentLoaded', init);