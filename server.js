'use strict';
const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

let nodemailer; try { nodemailer = require('nodemailer'); } catch (_) {}
let multer;     try { multer    = require('multer');      } catch (_) { console.log('⚠ multer not installed — ticket uploads disabled'); }
let sharp;      try { sharp     = require('sharp');       } catch (_) { console.log('⚠ sharp not installed — ticket images stored raw'); }

const PORT            = process.env.PORT           || 3000;
const DB_PATH         = path.join(__dirname, 'data', 'fringeover6ft.db');
const TICKET_DIR      = path.join(__dirname, 'data', 'tickets');
const SESSION_SECRET  = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const BCRYPT_ROUNDS   = 12;
const COMMENT_MAX     = 256;
const USERNAME_RE     = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_RE        = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BASE_URL        = process.env.BASE_URL       || 'http://localhost:' + PORT;
const SMTP_HOST       = process.env.SMTP_HOST      || '';
const SMTP_PORT       = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER       = process.env.SMTP_USER      || '';
const SMTP_PASS       = process.env.SMTP_PASS      || '';
const SMTP_FROM       = process.env.SMTP_FROM      || 'noreply@fringeover6ft.com';
const TICKET_MAX_BYTES = 5 * 1024 * 1024;
const TICKET_RESIZE_PX = 900;
const TICKET_QUALITY   = 72;
const WEIGHT_UNVERIFIED = 1;
const WEIGHT_VERIFIED   = 5;

const SQ_TEXT = {
    '1': 'What is the name of the first street you lived on?',
    '2': 'What was the name of your first pet?',
    '3': "What is your maternal grandmother's maiden name?",
    '4': 'What city were you born in?',
    '5': 'What was the make of your first car?',
    '6': 'What is the name of your favourite childhood friend?'
};

const AWARD_CATS = [
    { id: 'vice-overall',  type: 'vice', icon: '🗜️', name: 'The Kneecap in a Vice',   short: 'Worst Overall',  tagline: 'The single worst seating experience in Edinburgh',                             quip: 'Abandon all legroom, ye who enter here' },
    { id: 'vice-large',    type: 'vice', icon: '🏗️', name: 'Cathedral of Cramp',       short: 'Worst Large',    tagline: 'Worst large venue (500+ seats)',                                              quip: 'All that square footage, and none of it for your legs' },
    { id: 'vice-mid',      type: 'vice', icon: '📏', name: 'The Squeezed Middle',      short: 'Worst Mid-Size', tagline: 'Worst mid-sized venue (101–499 seats)',                                       quip: 'Too big to be charmingly cramped, too small to have bothered with a proper rake' },
    { id: 'vice-intimate', type: 'vice', icon: '🥫', name: 'The Sardine Tin',          short: 'Worst Intimate', tagline: 'Worst intimate space (100 seats or fewer)',                                   quip: 'Intimate? More like internment for anyone over 5′10″' },
    { id: 'vice-indie',    type: 'vice', icon: '⚠️', name: 'Independently Agonising',  short: 'Worst Indie',    tagline: 'Worst independent venue',                                                    quip: "Proving you don't need a big operator to crush a kneecap" },
    { id: 'vice-operator', type: 'vice', icon: '🎪', name: 'The Economy Class Trophy', short: 'Worst Operator', tagline: 'Lowest-scoring operator group on average',                                    quip: 'Consistently treating tall people as a rounding error' },
    { id: 'vice-marmite',  type: 'vice', icon: '🎲', name: 'The Marmite Award',        short: 'Most Divisive',  tagline: 'Highest rating variance — love it or leave in an ambulance',                 quip: "Some love it, some can't feel their legs. There is no middle ground" },
    { id: 'gold-overall',  type: 'gold', icon: '🏆', name: 'The Golden Armchair',      short: 'Best Overall',   tagline: 'The single best seating experience in Edinburgh',                             quip: 'Your knees would like to extend their heartfelt gratitude' },
    { id: 'gold-large',    type: 'gold', icon: '🏛️', name: 'The Grand Stretch',        short: 'Best Large',     tagline: 'Best large venue (500+ seats)',                                              quip: 'Proof that big rooms can also have big legroom energy' },
    { id: 'gold-mid',      type: 'gold', icon: '🐻', name: 'The Goldilocks Award',     short: 'Best Mid-Size',  tagline: 'Best mid-sized venue (101–499 seats)',                                       quip: 'Not too big, not too small — and somebody actually measured the row pitch' },
    { id: 'gold-intimate', type: 'gold', icon: '💎', name: 'Small But Mighty',          short: 'Best Intimate',  tagline: 'Best intimate space (100 seats or fewer)',                                   quip: 'The TARDIS of theatres — somehow bigger on the inside' },
    { id: 'gold-indie',    type: 'gold', icon: '⭐', name: 'The Indie Darling',         short: 'Best Indie',     tagline: 'Best independent venue',                                                     quip: 'Sticking it to the big operators, one comfortable seat at a time' },
    { id: 'gold-operator', type: 'gold', icon: '✈️', name: 'The First Class Trophy',    short: 'Best Operator',  tagline: 'Highest-scoring operator group on average',                                  quip: 'Getting legroom right at scale — somebody give them a raise' },
    { id: 'gold-peoples',  type: 'gold', icon: '🔥', name: "The People's Choice",       short: 'Most Reviewed',  tagline: 'Most-reviewed spaces that actually hold up (3.0+)',                          quip: 'Everyone has an opinion, and it is mostly "wow, actual legroom"' },
];

// Ensure data directories exist
for (const d of [path.dirname(DB_PATH), TICKET_DIR]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}


/* ════════════════════════════════════════════════════════════════
   EMAIL
   ════════════════════════════════════════════════════════════════ */

let mailTransport = null;
if (nodemailer && SMTP_HOST) {
    mailTransport = nodemailer.createTransport({
        host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    console.log('📧 SMTP: ' + SMTP_HOST);
} else {
    console.log('📧 No SMTP — dev mode (links logged to console)');
}

async function sendVerificationEmail(toEmail, displayName, verifyUrl) {
    if (mailTransport) {
        try {
            await mailTransport.sendMail({
                from: SMTP_FROM, to: toEmail,
                subject: 'Verify your Fringe Over 6ft account',
                text: 'Hi ' + displayName + ',\n\nVerify: ' + verifyUrl + '\n\nExpires in 24h.\n\n— Fringe Over 6ft 🦵',
                html: '<div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;padding:20px;background:#1e1510;color:#f5e6d3;border:1px solid #d4af37;border-radius:8px">' +
                    '<h2 style="color:#d4af37">Fringe Over 6ft</h2>' +
                    '<p>Hi ' + displayName + ',</p>' +
                    '<p style="text-align:center;margin:24px 0"><a href="' + verifyUrl + '" style="background:#d4af37;color:#1a0a02;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">Verify Email 🦵</a></p>' +
                    '<p style="font-size:12px;color:#7a6050">Expires in 24h.</p></div>'
            });
            return true;
        } catch (e) { console.error('Email error:', e.message); return false; }
    }
    console.log('\n' + '═'.repeat(60) + '\n📧 DEV VERIFY\n   To: ' + toEmail + '\n   Link: ' + verifyUrl + '\n' + '═'.repeat(60) + '\n');
    return false;
}

function maskEmail(e) {
    var p = e.split('@');
    return p[0][0] + '***@' + p[1];
}


/* ════════════════════════════════════════════════════════════════
   DATABASE
   ════════════════════════════════════════════════════════════════ */

const SIGMA = 15;
function gaussWeight(rCm, uCm) {
    var d = (rCm - uCm) / SIGMA;
    return Math.exp(-0.5 * d * d);
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');


/* ════════════════════════════════════════════════════════════════
   MODERATION
   ════════════════════════════════════════════════════════════════ */

const MOD_WORDS = new Set('fuck,fucking,shit,cunt,cock,dickhead,bitch,wanker,twat,arsehole,asshole,whore,slut,retard,bollocks,motherfucker,cocksucker,bullshit'.split(','));
const MOD_SLURS = ['nigger', 'nigga', 'faggot', 'chink', 'spic', 'kike', 'wetback', 'tranny'];
const SPAM_RE = /https?:\/\/|www\.|bit\.ly|buy\s*now|free\s*money|click\s*here|casino|viagra/i;
const URL_RE  = /\b[\w-]+\.(com|co\.uk|net|org|io|me)\b/i;

function moderate(text) {
    if (!text || !text.trim()) return { ok: true };
    var t = text.trim(), low = t.toLowerCase();

    for (var i = 0; i < MOD_SLURS.length; i++) {
        if (low.indexOf(MOD_SLURS[i]) !== -1) return { ok: false, reason: 'Contains prohibited language.' };
    }

    var words = low.replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/).filter(Boolean);
    for (var j = 0; j < words.length; j++) {
        if (MOD_WORDS.has(words[j])) return { ok: false, reason: 'Please keep reviews respectful.' };
    }

    if (SPAM_RE.test(t) || URL_RE.test(t)) return { ok: false, reason: 'Links not allowed in reviews.' };

    var alpha = t.replace(/[^a-zA-Z]/g, '');
    if (alpha.length >= 10 && alpha.replace(/[^A-Z]/g, '').length / alpha.length > 0.7) {
        return { ok: false, reason: 'Please avoid all capitals.' };
    }

    if (/(.)\1{4,}/.test(t)) return { ok: false, reason: 'Please avoid repeated characters.' };

    return { ok: true };
}


/* ════════════════════════════════════════════════════════════════
   SESSION STORE
   ════════════════════════════════════════════════════════════════ */

class SqliteStore extends session.Store {
    constructor(database) {
        super();
        this.db = database;
        setInterval(function () {
            database.prepare('DELETE FROM sessions WHERE expired<?').run(Date.now());
        }, 3600000);
    }
    get(sid, cb) {
        try {
            var r = this.db.prepare('SELECT sess FROM sessions WHERE sid=? AND expired>?').get(sid, Date.now());
            cb(null, r ? JSON.parse(r.sess) : null);
        } catch (e) { cb(e); }
    }
    set(sid, sess, cb) {
        try {
            var exp = Date.now() + (sess.cookie && sess.cookie.maxAge ? sess.cookie.maxAge : 86400000);
            this.db.prepare('INSERT OR REPLACE INTO sessions(sid,sess,expired)VALUES(?,?,?)').run(sid, JSON.stringify(sess), exp);
            cb(null);
        } catch (e) { cb(e); }
    }
    destroy(sid, cb) {
        try { this.db.prepare('DELETE FROM sessions WHERE sid=?').run(sid); cb(null); } catch (e) { cb(e); }
    }
    touch(sid, sess, cb) {
        try {
            var exp = Date.now() + (sess.cookie && sess.cookie.maxAge ? sess.cookie.maxAge : 86400000);
            this.db.prepare('UPDATE sessions SET expired=? WHERE sid=?').run(exp, sid);
            cb(null);
        } catch (e) { cb(e); }
    }
}


/* ════════════════════════════════════════════════════════════════
   MULTER (ticket uploads)
   ════════════════════════════════════════════════════════════════ */

var ticketUpload = null;
if (multer) {
    ticketUpload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: TICKET_MAX_BYTES },
        fileFilter: function (req, file, cb) {
            var allowed = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
            var ext = path.extname(file.originalname).toLowerCase();
            if (allowed.indexOf(ext) !== -1 || (file.mimetype || '').startsWith('image/')) cb(null, true);
            else cb(new Error('Images only.'));
        }
    });
    console.log('📸 Multer ready');
} else {
    console.log('📸 Multer not available — ticket uploads disabled');
}

async function saveTicketImage(buffer) {
    var fname = 'ticket_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex') + '.jpg';
    var outPath = path.join(TICKET_DIR, fname);

    if (sharp) {
        await sharp(buffer)
            .rotate()
            .resize(TICKET_RESIZE_PX, TICKET_RESIZE_PX, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: TICKET_QUALITY, progressive: true })
            .toFile(outPath);
        console.log('📸 Ticket saved (sharp resized):', fname);
    } else {
        fs.writeFileSync(outPath, buffer);
        console.log('📸 Ticket saved (raw):', fname);
    }
    return fname;
}

/**
 * Delete a ticket image file from disk.
 * Logs success or failure but does not throw.
 */
function deleteTicketImage(filename) {
    if (!filename) return;
    var fp = path.join(TICKET_DIR, filename);
    try {
        if (fs.existsSync(fp)) {
            fs.unlinkSync(fp);
            console.log('📸 Ticket image deleted:', filename);
        }
    } catch (e) {
        console.error('📸 Failed to delete ticket image:', filename, e.message);
    }
}


/* ════════════════════════════════════════════════════════════════
   EXPRESS APP
   ════════════════════════════════════════════════════════════════ */

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/font', express.static(path.join(__dirname, 'font')));
app.use(session({
    store: new SqliteStore(db),
    secret: SESSION_SECRET,
    name: 'fof_sid',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 30 * 24 * 3600 * 1000 }
}));

const authLimiter   = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, message: { error: 'Too many attempts.' } });
const reviewLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: 'Slow down.' } });

function requireAuth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Sign in required.' });
    var u = db.prepare('SELECT * FROM users WHERE id=?').get(req.session.userId);
    if (!u) { req.session.destroy(function () {}); return res.status(401).json({ error: 'Session expired.' }); }
    if (u.banned) return res.status(403).json({ error: 'Account suspended.' });
    req.user = u;
    next();
}

function requireAdmin(req, res, next) {
    if (!req.user || !req.user.is_admin) return res.status(403).json({ error: 'Admin required.' });
    next();
}

function san(s, max) {
    if (max === undefined) max = 500;
    return String(s !== null && s !== undefined ? s : '').trim().slice(0, max);
}

function getUserCm(req) {
    if (!req.session.userId) return null;
    var u = db.prepare('SELECT height_cm FROM users WHERE id=?').get(req.session.userId);
    return (u && u.height_cm) ? u.height_cm : null;
}

function computeScore(reviews, userCm) {
    if (!reviews || !reviews.length) return { score: null, weighted: false };
    var tW = 0, tR = 0, isW = false;
    for (var i = 0; i < reviews.length; i++) {
        var r = reviews[i];
        var mult = (r.ticket_status === 'approved') ? WEIGHT_VERIFIED : WEIGHT_UNVERIFIED;
        var w;
        if (userCm && r.height_cm) { isW = true; w = gaussWeight(r.height_cm, userCm); }
        else { w = 1; }
        w *= mult;
        tW += w;
        tR += w * r.rating;
    }
    return { score: tW > 0 ? tR / tW : null, weighted: isW };
}


/* ════════════════════════════════════════════════════════════════
   API: VENUES
   ════════════════════════════════════════════════════════════════ */

app.get('/api/venues', function (req, res) {
    try {
        var fest  = san(req.query.fest  || '', 10);
        var group = san(req.query.group || '', 30);
        var sql = 'SELECT v.id,v.name,v.address,v.area,v.festival,v.group_id as grp,g.display_name as group_name FROM venues v JOIN groups g ON v.group_id=g.id WHERE 1=1';
        var params = [];
        if (fest && fest !== 'all') {
            if (fest === 'fringe')    sql += " AND v.festival IN('fringe','both')";
            else if (fest === 'intl') sql += " AND v.festival IN('intl','both')";
        }
        if (group && group !== 'all') { sql += ' AND v.group_id=?'; params.push(group); }
        sql += ' ORDER BY v.name';
        var stmt = db.prepare(sql);
        var venues = params.length ? stmt.all(params[0]) : stmt.all();
        var stageRows = db.prepare('SELECT id,venue_id FROM stages').all();
        var revRows   = db.prepare('SELECT r.stage_id,r.rating,u.height_cm,r.ticket_status FROM reviews r JOIN users u ON r.user_id=u.id').all();
        var byVenue = {}, byStage = {};
        for (var i = 0; i < stageRows.length; i++) { var s = stageRows[i]; if (!byVenue[s.venue_id]) byVenue[s.venue_id] = []; byVenue[s.venue_id].push(s); }
        for (var j = 0; j < revRows.length; j++) { var r = revRows[j]; if (!byStage[r.stage_id]) byStage[r.stage_id] = []; byStage[r.stage_id].push(r); }
        var uCm = getUserCm(req);
        res.json(venues.map(function (v) {
            var stages = byVenue[v.id] || [], allRevs = [];
            for (var k = 0; k < stages.length; k++) { var sr = byStage[stages[k].id] || []; for (var m = 0; m < sr.length; m++) allRevs.push(sr[m]); }
            var sc = computeScore(allRevs, uCm);
            return Object.assign({}, v, { stageCount: stages.length, reviewCount: allRevs.length, score: sc.score });
        }));
    } catch (e) { console.error('/api/venues error:', e); res.status(500).json({ error: 'Server error.' }); }
});

app.get('/api/venues/:id', function (req, res) {
    try {
        var vid = san(req.params.id, 60);
        var v = db.prepare('SELECT v.*,g.display_name as group_name FROM venues v JOIN groups g ON v.group_id=g.id WHERE v.id=?').get(vid);
        if (!v) return res.status(404).json({ error: 'Venue not found.' });
        var stages = db.prepare('SELECT * FROM stages WHERE venue_id=? ORDER BY name').all(vid);
        var uCm = getUserCm(req), allR = [];
        var sd = stages.map(function (st) {
            var revs = db.prepare('SELECT r.rating,u.height_cm,r.ticket_status FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.stage_id=?').all(st.id);
            for (var i = 0; i < revs.length; i++) allR.push(revs[i]);
            var sc = computeScore(revs, uCm);
            return Object.assign({}, st, { score: sc.score, weighted: sc.weighted, reviewCount: revs.length });
        });
        var vsc = computeScore(allR, uCm);
        res.json(Object.assign({}, v, { score: vsc.score, weighted: vsc.weighted, stages: sd }));
    } catch (e) { console.error('/api/venues/:id error:', e); res.status(500).json({ error: 'Server error.' }); }
});

app.get('/api/stages/:id', function (req, res) {
    try {
        var sid = san(req.params.id, 60);
        var st = db.prepare('SELECT s.*,v.name as venue_name,v.id as venue_id FROM stages s JOIN venues v ON s.venue_id=v.id WHERE s.id=?').get(sid);
        if (!st) return res.status(404).json({ error: 'Stage not found.' });
        var reviews = db.prepare('SELECT r.id,r.rating,r.year,r.comment,r.created_at,r.user_id,r.ticket_status,u.display_name,u.height_cm FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.stage_id=? ORDER BY r.created_at DESC').all(sid);
        var uCm = getUserCm(req), userId = req.session.userId || null;
        var rawRevs = reviews.map(function (r) { return { rating: r.rating, height_cm: r.height_cm, ticket_status: r.ticket_status }; });
        var rawScore = rawRevs.length > 0 ? rawRevs.reduce(function (s, r) { return s + r.rating; }, 0) / rawRevs.length : null;
        var adjSc = computeScore(rawRevs, uCm);
        var hasReviewed = userId ? reviews.some(function (r) { return r.user_id === userId; }) : false;
        res.json(Object.assign({}, st, { adjScore: adjSc.score, rawScore: rawScore, reviewCount: reviews.length, reviews: reviews, userCm: uCm, hasReviewed: hasReviewed }));
    } catch (e) { console.error('/api/stages/:id error:', e); res.status(500).json({ error: 'Server error.' }); }
});


/* ════════════════════════════════════════════════════════════════
   API: USER REVIEWS & ACTIVITY
   ════════════════════════════════════════════════════════════════ */

app.get('/api/user/my-reviews', requireAuth, function (req, res) {
    try {
        var uid = req.user.id;
        var limit = Math.min(parseInt(req.query.limit) || 50, 200);
        var offset = parseInt(req.query.offset) || 0;
        var rows = db.prepare('SELECT r.id,r.rating,r.year,r.comment,r.created_at,r.ticket_status,s.name as stage_name,s.id as stage_id,v.name as venue_name,v.id as venue_id FROM reviews r JOIN stages s ON r.stage_id=s.id JOIN venues v ON s.venue_id=v.id WHERE r.user_id=? ORDER BY r.created_at DESC LIMIT ? OFFSET ?').all(uid, limit, offset);
        var total = db.prepare('SELECT COUNT(*) as n FROM reviews WHERE user_id=?').get(uid).n;
        var verifiedCount = db.prepare("SELECT COUNT(*) as n FROM reviews WHERE user_id=? AND ticket_status='approved'").get(uid).n;
        var pendingCount  = db.prepare("SELECT COUNT(*) as n FROM reviews WHERE user_id=? AND ticket_status='pending'").get(uid).n;
        var avgRow = db.prepare('SELECT AVG(rating) as avg FROM reviews WHERE user_id=?').get(uid);
        res.json({ reviews: rows, total: total, verifiedCount: verifiedCount, pendingCount: pendingCount, avgRating: avgRow ? avgRow.avg : null });
    } catch (e) { console.error('/api/user/my-reviews error:', e); res.status(500).json({ error: 'Server error.' }); }
});

app.get('/api/user/activity', requireAuth, function (req, res) {
    try {
        var uid = req.user.id;
        var lastReview = db.prepare('SELECT r.id,r.rating,r.comment,r.year,r.created_at,r.ticket_status,s.name as stage_name,s.id as stage_id,v.name as venue_name,v.id as venue_id FROM reviews r JOIN stages s ON r.stage_id=s.id JOIN venues v ON s.venue_id=v.id WHERE r.user_id=? ORDER BY r.created_at DESC LIMIT 1').get(uid);
        var reviewCount     = db.prepare('SELECT COUNT(*) as n FROM reviews WHERE user_id=?').get(uid).n;
        var pendingTickets  = db.prepare("SELECT COUNT(*) as n FROM reviews WHERE user_id=? AND ticket_status='pending'").get(uid).n;
        var approvedTickets = db.prepare("SELECT COUNT(*) as n FROM reviews WHERE user_id=? AND ticket_status='approved'").get(uid).n;
        var noTicketReviews = db.prepare("SELECT r.id,r.rating,r.ticket_status,s.name as stage_name,s.id as stage_id,v.name as venue_name,v.id as venue_id FROM reviews r JOIN stages s ON r.stage_id=s.id JOIN venues v ON s.venue_id=v.id WHERE r.user_id=? AND (r.ticket_status IS NULL OR r.ticket_status='rejected') ORDER BY r.created_at DESC LIMIT 3").all(uid);
        res.json({ reviewCount: reviewCount, pendingTickets: pendingTickets, approvedTickets: approvedTickets, lastReview: lastReview || null, noTicketReviews: noTicketReviews });
    } catch (e) { console.error('/api/user/activity error:', e); res.status(500).json({ error: 'Server error.' }); }
});


/* ════════════════════════════════════════════════════════════════
   API: REVIEWS
   ════════════════════════════════════════════════════════════════ */

app.post('/api/reviews', requireAuth, reviewLimiter, function (req, res) {
    try {
        var body = req.body;
        var stage_id = san(body.stage_id || '', 60);
        var year     = san(body.year     || '', 4);
        var comment  = san(body.comment  || '', COMMENT_MAX);
        var ratingRaw = body.rating;
        var rating = -1;
        if (ratingRaw !== undefined && ratingRaw !== null && ratingRaw !== '') {
            rating = parseInt(String(ratingRaw), 10);
        }

        if (!stage_id)                             return res.status(400).json({ error: 'Stage required.' });
        if (isNaN(rating) || rating < 0 || rating > 5) return res.status(400).json({ error: 'Rating 0–5 required.' });
        if (!db.prepare('SELECT id FROM stages WHERE id=?').get(stage_id))
                                                   return res.status(404).json({ error: 'Stage not found.' });
        if (!req.user.height_cm)                   return res.status(400).json({ error: 'Set your height in preferences first.' });
        if (comment) { var mod = moderate(comment); if (!mod.ok) return res.status(400).json({ error: mod.reason }); }
        if (db.prepare('SELECT id FROM reviews WHERE stage_id=? AND user_id=?').get(stage_id, req.user.id))
                                                   return res.status(409).json({ error: 'Already reviewed this space.' });

        var result = db.prepare('INSERT INTO reviews(stage_id,user_id,rating,year,comment)VALUES(?,?,?,?,?)').run(stage_id, req.user.id, rating, year, comment);
        console.log('✓ Review #' + result.lastInsertRowid + ' created by user #' + req.user.id + ' for stage ' + stage_id);
        res.json({ ok: true, reviewId: result.lastInsertRowid, ticketStatus: null });
    } catch (e) {
        console.error('POST /api/reviews error:', e);
        res.status(500).json({ error: 'Failed to save review.' });
    }
});


/* ════════════════════════════════════════════════════════════════
   API: TICKET UPLOAD
   ════════════════════════════════════════════════════════════════ */

app.post('/api/reviews/:id/ticket', requireAuth, function (req, res) {
    if (!ticketUpload) return res.status(400).json({ error: 'Ticket upload not available — multer not installed.' });

    ticketUpload.single('ticket')(req, res, function (err) {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Image too large (max 5MB).' });
            console.error('Multer error:', err);
            return res.status(400).json({ error: err.message || 'Upload failed.' });
        }
        if (!req.file) return res.status(400).json({ error: 'No file received.' });

        var rid = parseInt(req.params.id, 10);
        if (isNaN(rid)) return res.status(400).json({ error: 'Invalid review ID.' });

        var review = db.prepare('SELECT id,user_id,ticket_status FROM reviews WHERE id=?').get(rid);
        if (!review) return res.status(404).json({ error: 'Review not found.' });
        if (review.user_id !== req.user.id) return res.status(403).json({ error: 'Not your review.' });
        if (review.ticket_status) return res.status(409).json({ error: 'Ticket already submitted.' });

        saveTicketImage(req.file.buffer).then(function (fname) {
            db.prepare('UPDATE reviews SET ticket_photo=?,ticket_status=? WHERE id=?').run(fname, 'pending', rid);
            console.log('📸 Ticket uploaded for review #' + rid + ': ' + fname);
            res.json({ ok: true, ticketStatus: 'pending' });
        }).catch(function (e) {
            console.error('Ticket save error:', e);
            res.status(500).json({ error: 'Failed to save ticket image.' });
        });
    });
});


/* ════════════════════════════════════════════════════════════════
   API: AWARDS
   ════════════════════════════════════════════════════════════════ */

app.get('/api/awards', function (req, res) {
    try {
        var CAP = 50;
        var allStages = db.prepare('SELECT s.id AS stage_id,s.name AS stage_name,s.capacity,v.id AS venue_id,v.name AS venue_name,v.group_id,v.area,v.festival,g.display_name AS group_name,AVG(r.rating) AS avg_rating,COUNT(r.id) AS cnt FROM stages s JOIN venues v ON s.venue_id=v.id JOIN groups g ON v.group_id=g.id LEFT JOIN reviews r ON r.stage_id=s.id GROUP BY s.id').all();
        var allGroups = db.prepare('SELECT v.group_id AS gid,g.display_name AS name,AVG(r.rating) AS avg_rating,COUNT(r.id) AS cnt,COUNT(DISTINCT s.id) AS stage_cnt FROM groups g JOIN venues v ON v.group_id=g.id JOIN stages s ON s.venue_id=v.id LEFT JOIN reviews r ON r.stage_id=s.id GROUP BY v.group_id').all();
        var withVar = allStages.filter(function (s) { return s.cnt >= 2; }).map(function (s) {
            var rats = db.prepare('SELECT rating FROM reviews WHERE stage_id=?').all(s.stage_id).map(function (r) { return r.rating; });
            var mean = rats.reduce(function (a, b) { return a + b; }, 0) / rats.length;
            var variance = rats.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / rats.length;
            return Object.assign({}, s, { variance: variance });
        });

        function fmtStage(s) { return { name: s.stage_name, sub: s.venue_name + ' · ' + s.group_name, detail: '~' + s.capacity + ' seats · ' + s.area, avg_rating: s.avg_rating, cnt: s.cnt, venue_id: s.venue_id, stage_id: s.stage_id, variance: s.variance !== undefined ? s.variance : null, reviewed: s.cnt > 0 }; }
        function fmtGroup(g) { return { name: g.name, sub: g.stage_cnt + ' space' + (g.stage_cnt !== 1 ? 's' : '') + ' in database', detail: 'Operator group', avg_rating: g.avg_rating, cnt: g.cnt, reviewed: g.cnt > 0 }; }
        function sortAsc(a, b) { if (a.reviewed && !b.reviewed) return -1; if (!a.reviewed && b.reviewed) return 1; if (!a.reviewed && !b.reviewed) return (a.name || '').localeCompare(b.name || ''); return a.avg_rating - b.avg_rating; }
        function sortDesc(a, b) { if (a.reviewed && !b.reviewed) return -1; if (!a.reviewed && b.reviewed) return 1; if (!a.reviewed && !b.reviewed) return (a.name || '').localeCompare(b.name || ''); return b.avg_rating - a.avg_rating; }
        function pack(arr, fmt, sorter) { var f = arr.map(fmt).sort(sorter); return { list: f.slice(0, CAP), total: arr.length }; }

        function contendersFor(id) {
            switch (id) {
                case 'vice-overall':  return pack(allStages, fmtStage, sortAsc);
                case 'vice-large':    return pack(allStages.filter(function (s) { return s.capacity >= 500; }), fmtStage, sortAsc);
                case 'vice-mid':      return pack(allStages.filter(function (s) { return s.capacity > 100 && s.capacity < 500; }), fmtStage, sortAsc);
                case 'vice-intimate': return pack(allStages.filter(function (s) { return s.capacity <= 100; }), fmtStage, sortAsc);
                case 'vice-indie':    return pack(allStages.filter(function (s) { return s.group_id === 'other'; }), fmtStage, sortAsc);
                case 'vice-operator': return pack(allGroups, fmtGroup, sortAsc);
                case 'vice-marmite':  return pack(withVar, fmtStage, function (a, b) { return (b.variance || 0) - (a.variance || 0); });
                case 'gold-overall':  return pack(allStages, fmtStage, sortDesc);
                case 'gold-large':    return pack(allStages.filter(function (s) { return s.capacity >= 500; }), fmtStage, sortDesc);
                case 'gold-mid':      return pack(allStages.filter(function (s) { return s.capacity > 100 && s.capacity < 500; }), fmtStage, sortDesc);
                case 'gold-intimate': return pack(allStages.filter(function (s) { return s.capacity <= 100; }), fmtStage, sortDesc);
                case 'gold-indie':    return pack(allStages.filter(function (s) { return s.group_id === 'other'; }), fmtStage, sortDesc);
                case 'gold-operator': return pack(allGroups, fmtGroup, sortDesc);
                case 'gold-peoples':  return pack(allStages.filter(function (s) { return s.cnt > 0 && s.avg_rating >= 3; }), fmtStage, function (a, b) { return b.cnt - a.cnt || b.avg_rating - a.avg_rating; });
                default: return { list: [], total: 0 };
            }
        }

        res.json({
            categories: AWARD_CATS.map(function (c) {
                var r = contendersFor(c.id);
                return Object.assign({}, c, { contenders: r.list, eligible: r.total });
            })
        });
    } catch (e) { console.error('/api/awards error:', e); res.status(500).json({ error: 'Server error.' }); }
});


/* ════════════════════════════════════════════════════════════════
   API: REPORTS & STATS
   ════════════════════════════════════════════════════════════════ */

app.get('/api/venue-report', function (req, res) {
    try {
        var venueAvgs = db.prepare('SELECT v.id as venue_id,v.name as venue_name,g.display_name as group_name,AVG(r.rating) as avg_rating,COUNT(r.id) as cnt FROM venues v JOIN stages s ON s.venue_id=v.id JOIN groups g ON v.group_id=g.id JOIN reviews r ON r.stage_id=s.id GROUP BY v.id HAVING cnt>=1 ORDER BY avg_rating DESC').all();
        function getStages(vid, order) { return db.prepare('SELECT s.id as stage_id,s.name as stage_name,v.id as venue_id,v.name as venue_name,AVG(r.rating) as avg_rating,COUNT(r.id) as cnt FROM stages s JOIN venues v ON s.venue_id=v.id JOIN reviews r ON r.stage_id=s.id WHERE v.id=? GROUP BY s.id HAVING cnt>=1 ORDER BY avg_rating ' + order + ' LIMIT 5').all(vid); }
        var best = venueAvgs.slice(0, 10).map(function (v) { return Object.assign({}, v, { stages: getStages(v.venue_id, 'DESC') }); });
        var worst = venueAvgs.slice().sort(function (a, b) { return a.avg_rating - b.avg_rating; }).slice(0, 10).map(function (v) { return Object.assign({}, v, { stages: getStages(v.venue_id, 'ASC') }); });
        res.json({ best: best, worst: worst });
    } catch (e) { console.error('/api/venue-report error:', e); res.status(500).json({ error: 'Server error.' }); }
});

app.get('/api/operator-report', function (req, res) {
    try {
        var groups = db.prepare('SELECT v.group_id,g.display_name as group_name,AVG(r.rating) as avg_rating,COUNT(r.id) as cnt,COUNT(DISTINCT s.id) as stage_cnt FROM groups g JOIN venues v ON v.group_id=g.id JOIN stages s ON s.venue_id=v.id JOIN reviews r ON r.stage_id=s.id GROUP BY v.group_id').all();
        function getGroupStages(gid, order) { return db.prepare('SELECT s.id as stage_id,s.name as stage_name,v.id as venue_id,v.name as venue_name,AVG(r.rating) as avg_rating,COUNT(r.id) as cnt FROM stages s JOIN venues v ON s.venue_id=v.id JOIN reviews r ON r.stage_id=s.id WHERE v.group_id=? GROUP BY s.id HAVING cnt>=1 ORDER BY avg_rating ' + order + ' LIMIT 3').all(gid); }
        res.json({ groups: groups.map(function (g) { return Object.assign({}, g, { bestStages: getGroupStages(g.group_id, 'DESC'), worstStages: getGroupStages(g.group_id, 'ASC') }); }) });
    } catch (e) { console.error('/api/operator-report error:', e); res.status(500).json({ error: 'Server error.' }); }
});

app.get('/api/stats', function (req, res) {
    try {
        var totalReviews    = db.prepare('SELECT COUNT(*) as n FROM reviews').get().n;
        var totalVenues     = db.prepare('SELECT COUNT(*) as n FROM venues').get().n;
        var totalStages     = db.prepare('SELECT COUNT(*) as n FROM stages').get().n;
        var totalUsers      = db.prepare('SELECT COUNT(*) as n FROM users').get().n;
        var reviewedStages  = db.prepare('SELECT COUNT(DISTINCT stage_id) as n FROM reviews').get().n;
        var pendingTickets  = db.prepare("SELECT COUNT(*) as n FROM reviews WHERE ticket_status='pending'").get().n;
        var approvedTickets = db.prepare("SELECT COUNT(*) as n FROM reviews WHERE ticket_status='approved'").get().n;
        var ratingDist      = db.prepare('SELECT rating,COUNT(*) as count FROM reviews GROUP BY rating ORDER BY rating').all();
        var avgRow          = db.prepare('SELECT AVG(rating) as avg FROM reviews').get();
        var avgRating       = avgRow ? avgRow.avg : null;
        var stageAvgs       = db.prepare('SELECT s.id,AVG(r.rating) as avg_rating,COUNT(r.id) as cnt FROM stages s JOIN reviews r ON r.stage_id=s.id GROUP BY s.id HAVING cnt>=1').all();
        var heightDist      = db.prepare('SELECT ROUND(u.height_cm/5)*5 as bucket,COUNT(DISTINCT r.user_id) as count FROM reviews r JOIN users u ON r.user_id=u.id WHERE u.height_cm IS NOT NULL GROUP BY bucket ORDER BY bucket').all();
        var ratingByHeight  = db.prepare('SELECT ROUND(u.height_cm/5)*5 as height_bucket,AVG(r.rating) as avg_rating,COUNT(r.id) as count FROM reviews r JOIN users u ON r.user_id=u.id WHERE u.height_cm IS NOT NULL GROUP BY height_bucket ORDER BY height_bucket').all();
        var ratingByCapacity = db.prepare("SELECT CASE WHEN s.capacity<=50 THEN 'Tiny (≤50)' WHEN s.capacity<=100 THEN 'Small (51-100)' WHEN s.capacity<=250 THEN 'Medium (101-250)' WHEN s.capacity<=500 THEN 'Large (251-500)' ELSE 'Huge (500+)' END as bracket,AVG(r.rating) as avg_rating,COUNT(r.id) as cnt,MIN(s.capacity) as min_cap FROM reviews r JOIN stages s ON r.stage_id=s.id GROUP BY bracket ORDER BY min_cap").all();
        var ratingByFest    = db.prepare('SELECT v.festival,AVG(r.rating) as avg_rating,COUNT(r.id) as cnt FROM reviews r JOIN stages s ON r.stage_id=s.id JOIN venues v ON s.venue_id=v.id GROUP BY v.festival').all();
        var ratingByGroup   = db.prepare('SELECT g.display_name as group_name,AVG(r.rating) as avg_rating,COUNT(r.id) as cnt,COUNT(DISTINCT s.id) as stage_cnt FROM reviews r JOIN stages s ON r.stage_id=s.id JOIN venues v ON s.venue_id=v.id JOIN groups g ON v.group_id=g.id GROUP BY v.group_id ORDER BY avg_rating DESC').all();
        var ratingByArea    = db.prepare('SELECT v.area,AVG(r.rating) as avg_rating,COUNT(r.id) as cnt FROM reviews r JOIN stages s ON r.stage_id=s.id JOIN venues v ON s.venue_id=v.id GROUP BY v.area ORDER BY avg_rating DESC').all();
        var reviewsByYear   = db.prepare("SELECT year,COUNT(*) as count,AVG(rating) as avg_rating FROM reviews WHERE year IS NOT NULL AND year!='' GROUP BY year ORDER BY year DESC").all();
        var mostReviewed    = db.prepare('SELECT s.name as stage_name,v.name as venue_name,COUNT(r.id) as cnt,AVG(r.rating) as avg_rating,s.id as stage_id,v.id as venue_id FROM reviews r JOIN stages s ON r.stage_id=s.id JOIN venues v ON s.venue_id=v.id GROUP BY s.id ORDER BY cnt DESC LIMIT 10').all();
        var controversial   = db.prepare('SELECT s.name as stage_name,v.name as venue_name,COUNT(r.id) as cnt,AVG(r.rating) as avg_rating,s.id as stage_id,v.id as venue_id FROM reviews r JOIN stages s ON r.stage_id=s.id JOIN venues v ON s.venue_id=v.id GROUP BY s.id HAVING cnt>=2 ORDER BY cnt DESC LIMIT 20').all().map(function (row) {
            var rats = db.prepare('SELECT rating FROM reviews WHERE stage_id=?').all(row.stage_id).map(function (r) { return r.rating; });
            var mean = rats.reduce(function (a, b) { return a + b; }, 0) / rats.length;
            return Object.assign({}, row, { variance: rats.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / rats.length });
        }).sort(function (a, b) { return b.variance - a.variance; }).slice(0, 5);
        var zeroCount    = db.prepare('SELECT COUNT(*) as n FROM reviews WHERE rating=0').get().n;
        var perfectCount = db.prepare('SELECT COUNT(*) as n FROM reviews WHERE rating=5').get().n;

        res.json({
            overview: { totalReviews: totalReviews, totalVenues: totalVenues, totalStages: totalStages, totalUsers: totalUsers, reviewedStages: reviewedStages, avgRating: avgRating, zeroCount: zeroCount, perfectCount: perfectCount, pendingTickets: pendingTickets, approvedTickets: approvedTickets },
            ratingDist: ratingDist, stageAvgs: stageAvgs, heightDist: heightDist, ratingByHeight: ratingByHeight, ratingByCapacity: ratingByCapacity, ratingByFest: ratingByFest, ratingByGroup: ratingByGroup, ratingByArea: ratingByArea, reviewsByYear: reviewsByYear, mostReviewed: mostReviewed, controversial: controversial
        });
    } catch (e) { console.error('/api/stats error:', e); res.status(500).json({ error: 'Server error.' }); }
});


/* ════════════════════════════════════════════════════════════════
   API: RECENT & SEARCH
   ════════════════════════════════════════════════════════════════ */

app.get('/api/recent-reviews', function (req, res) {
    try {
        res.json(db.prepare("SELECT r.id,r.rating,r.comment,r.year,r.created_at,r.ticket_status,u.display_name,u.height_cm,s.name as stage_name,s.id as stage_id,v.name as venue_name,v.id as venue_id FROM reviews r JOIN users u ON r.user_id=u.id JOIN stages s ON r.stage_id=s.id JOIN venues v ON s.venue_id=v.id WHERE r.comment IS NOT NULL AND r.comment!='' ORDER BY r.created_at DESC LIMIT 20").all());
    } catch (e) { console.error('/api/recent-reviews error:', e); res.status(500).json({ error: 'Server error.' }); }
});

app.get('/api/search', function (req, res) {
    try {
        var q = san(req.query.q || '', 100).toLowerCase();
        if (q.length < 2) return res.json([]);
        res.json(db.prepare('SELECT s.id as stage_id,s.name as stage_name,v.id as venue_id,v.name as venue_name,v.area FROM stages s JOIN venues v ON s.venue_id=v.id WHERE LOWER(s.name) LIKE ? OR LOWER(v.name) LIKE ? OR LOWER(v.area) LIKE ? LIMIT 15').all('%' + q + '%', '%' + q + '%', '%' + q + '%'));
    } catch (e) { res.status(500).json({ error: 'Server error.' }); }
});


/* ════════════════════════════════════════════════════════════════
   API: AUTH
   ════════════════════════════════════════════════════════════════ */

app.post('/api/auth/register', authLimiter, async function (req, res) {
    try {
        var username     = san(req.body.username || '', 30);
        var email        = san(req.body.email || '', 254);
        var display_name = san(req.body.display_name || req.body.displayName || username, 40);
        var password     = req.body.password || '';
        var security_q   = san(req.body.security_q || req.body.securityQ || '', 2);
        var security_a   = san(req.body.security_a || req.body.securityA || '', 100);
        var height_cm    = req.body.height_cm || req.body.heightCm;

        if (!USERNAME_RE.test(username))        return res.status(400).json({ error: 'Username: 3–30 chars.', field: 'username' });
        if (!EMAIL_RE.test(email))              return res.status(400).json({ error: 'Valid email required.', field: 'email' });
        if (!password || password.length < 8)   return res.status(400).json({ error: 'Password min 8 chars.', field: 'password' });
        if (!security_q || !SQ_TEXT[security_q]) return res.status(400).json({ error: 'Security question required.', field: 'security_q' });
        if (!security_a || security_a.length < 2) return res.status(400).json({ error: 'Security answer min 2 chars.', field: 'security_a' });

        var dnMod = moderate(display_name);
        if (!dnMod.ok) return res.status(400).json({ error: 'Display name: ' + dnMod.reason, field: 'display_name' });
        if (db.prepare('SELECT id FROM users WHERE username=? COLLATE NOCASE').get(username)) return res.status(409).json({ error: 'Username taken.', field: 'username' });
        if (db.prepare('SELECT id FROM users WHERE email=? COLLATE NOCASE').get(email))       return res.status(409).json({ error: 'Email already registered.', field: 'email' });

        var pwHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        var saHash = await bcrypt.hash(security_a.trim().toLowerCase(), BCRYPT_ROUNDS);
        var h = null; if (height_cm && height_cm >= 90 && height_cm <= 250) h = height_cm;
        var token = crypto.randomBytes(32).toString('hex');
        var expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        db.prepare('INSERT INTO users(username,email,display_name,password_hash,height_cm,security_q,security_a_hash,email_verified,verification_token,token_expires,marketing_emails,show_height) VALUES(?,?,?,?,?,?,?,0,?,?,0,1)')
            .run(username, email, display_name, pwHash, h, security_q, saHash, token, expires);

        var verifyUrl = BASE_URL + '/verify/' + token;
        var emailSent = await sendVerificationEmail(email, display_name, verifyUrl);
        res.json({ ok: true, message: 'Account created!', emailSent: emailSent, verifyUrl: emailSent ? undefined : verifyUrl, maskedEmail: maskEmail(email) });
    } catch (e) { console.error('Register error:', e); res.status(500).json({ error: 'Registration failed.' }); }
});

app.post('/api/auth/login', authLimiter, async function (req, res) {
    try {
        var identifier = san(req.body.identifier || req.body.username || '', 254);
        var password = req.body.password || '';
        if (!identifier || !password) return res.status(400).json({ error: 'Enter email/username and password.' });

        var user = db.prepare('SELECT * FROM users WHERE username=? COLLATE NOCASE OR email=? COLLATE NOCASE').get(identifier, identifier);
        if (!user) { await bcrypt.hash(password, BCRYPT_ROUNDS); return res.status(401).json({ error: 'Invalid credentials.' }); }

        var valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });
        if (!user.email_verified) return res.status(403).json({ error: 'Please verify your email.', needsVerification: true, maskedEmail: maskEmail(user.email) });
        if (user.banned) return res.status(403).json({ error: 'Account suspended' + (user.ban_reason ? ': ' + user.ban_reason : '.'), banned: true });

        req.session.userId = user.id;
        res.json({
            ok: true,
            user: { id: user.id, username: user.username, email: user.email, display_name: user.display_name, height_cm: user.height_cm, is_admin: user.is_admin, marketing_emails: user.marketing_emails || 0, show_height: user.show_height !== undefined ? user.show_height : 1 }
        });
    } catch (e) { console.error('Login error:', e); res.status(500).json({ error: 'Login failed.' }); }
});

app.post('/api/auth/resend-verification', authLimiter, async function (req, res) {
    var id = san(req.body.identifier || '', 254);
    if (!id) return res.status(400).json({ error: 'Enter email or username.' });
    await new Promise(function (r) { setTimeout(r, 300); });
    var user = db.prepare('SELECT id,email,display_name,email_verified FROM users WHERE username=? COLLATE NOCASE OR email=? COLLATE NOCASE').get(id, id);
    if (!user || user.email_verified) return res.json({ ok: true });
    var token = crypto.randomBytes(32).toString('hex');
    var expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.prepare('UPDATE users SET verification_token=?,token_expires=? WHERE id=?').run(token, expires, user.id);
    var verifyUrl = BASE_URL + '/verify/' + token;
    var emailSent = await sendVerificationEmail(user.email, user.display_name, verifyUrl);
    res.json({ ok: true, emailSent: emailSent, verifyUrl: emailSent ? undefined : verifyUrl });
});

app.post('/api/auth/logout', function (req, res) {
    req.session.destroy(function () { res.json({ ok: true }); });
});

app.get('/api/auth/me', function (req, res) {
    if (!req.session.userId) return res.json({ user: null });
    var u = db.prepare('SELECT id,username,email,display_name,height_cm,is_admin,marketing_emails,show_height FROM users WHERE id=?').get(req.session.userId);
    res.json({ user: u || null });
});

app.post('/api/auth/recover-lookup', authLimiter, async function (req, res) {
    var id = san(req.body.identifier || req.body.username || '', 254);
    if (!id) return res.status(400).json({ error: 'Enter email or username.' });
    await new Promise(function (r) { setTimeout(r, 300); });
    var user = db.prepare('SELECT id,security_q FROM users WHERE username=? COLLATE NOCASE OR email=? COLLATE NOCASE').get(id, id);
    if (!user || !user.security_q || !SQ_TEXT[user.security_q]) return res.json({ question: null });
    req.session.recoverUserId = user.id;
    res.json({ question: SQ_TEXT[user.security_q] });
});

app.post('/api/auth/recover-verify', authLimiter, async function (req, res) {
    var uid = req.session.recoverUserId;
    if (!uid) return res.status(400).json({ error: 'Start recovery again.' });
    var answer = san(req.body.answer || '', 100).trim().toLowerCase();
    if (!answer) return res.status(400).json({ error: 'Enter your answer.' });
    var user = db.prepare('SELECT security_a_hash FROM users WHERE id=?').get(uid);
    if (!user) return res.status(400).json({ error: 'Start recovery again.' });
    if (!await bcrypt.compare(answer, user.security_a_hash)) return res.status(401).json({ error: 'Incorrect answer.' });
    req.session.recoverVerified = true;
    res.json({ ok: true });
});

app.post('/api/auth/recover-reset', authLimiter, async function (req, res) {
    var uid = req.session.recoverUserId;
    if (!uid || !req.session.recoverVerified) return res.status(400).json({ error: 'Start recovery again.' });
    var pw = req.body.password || '';
    if (!pw || pw.length < 8) return res.status(400).json({ error: 'Password min 8 chars.' });
    db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(await bcrypt.hash(pw, BCRYPT_ROUNDS), uid);
    delete req.session.recoverUserId;
    delete req.session.recoverVerified;
    res.json({ ok: true });
});

app.get('/verify/:token', function (req, res) {
    var token = san(req.params.token, 64);
    var user = db.prepare("SELECT id FROM users WHERE verification_token=? AND token_expires>datetime('now')").get(token);
    if (!user) return res.redirect('/?verify_error=invalid_or_expired');
    db.prepare('UPDATE users SET email_verified=1,verification_token=NULL,token_expires=NULL WHERE id=?').run(user.id);
    res.redirect('/?verified=1');
});

app.put('/api/user/height', requireAuth, function (req, res) {
    var h = parseFloat(req.body.height_cm || req.body.heightCm);
    if (!h || h < 90 || h > 250) return res.status(400).json({ error: 'Height 90–250 cm.' });
    db.prepare('UPDATE users SET height_cm=? WHERE id=?').run(h, req.user.id);
    res.json({ ok: true, height_cm: h });
});

app.put('/api/user/preferences', requireAuth, function (req, res) {
    var display_name = req.body.display_name, marketing_emails = req.body.marketing_emails, show_height = req.body.show_height;
    var updates = [], params = [];

    if (display_name !== undefined) {
        var dn = san(display_name, 40);
        var mod = moderate(dn);
        if (!mod.ok) return res.status(400).json({ error: 'Display name: ' + mod.reason });
        if (dn.length < 2) return res.status(400).json({ error: 'Display name min 2 chars.' });
        updates.push('display_name=?'); params.push(dn);
    }
    if (marketing_emails !== undefined) { updates.push('marketing_emails=?'); params.push(marketing_emails ? 1 : 0); }
    if (show_height !== undefined) { updates.push('show_height=?'); params.push(show_height ? 1 : 0); }
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update.' });

    params.push(req.user.id);
    db.prepare('UPDATE users SET ' + updates.join(',') + ' WHERE id=?').run.apply(
        db.prepare('UPDATE users SET ' + updates.join(',') + ' WHERE id=?'), params
    );
    var updated = db.prepare('SELECT id,username,email,display_name,height_cm,is_admin,marketing_emails,show_height FROM users WHERE id=?').get(req.user.id);
    res.json({ ok: true, user: updated });
});


/* ════════════════════════════════════════════════════════════════
   ADMIN API
   ════════════════════════════════════════════════════════════════ */

// Serve ticket images to admin
app.get('/api/admin/ticket/:filename', requireAuth, requireAdmin, function (req, res) {
    var fname = path.basename(san(req.params.filename, 200));
    var fpath = path.join(TICKET_DIR, fname);
    if (!fs.existsSync(fpath)) return res.status(404).json({ error: 'Not found.' });
    res.sendFile(fpath);
});

app.get('/api/admin/tickets/pending', requireAuth, requireAdmin, function (req, res) {
    try {
        res.json({
            tickets: db.prepare("SELECT r.id,r.stage_id,r.rating,r.year,r.comment,r.ticket_photo,r.ticket_status,r.created_at,u.id as user_id,u.username,u.display_name,s.name as stage_name,v.name as venue_name FROM reviews r JOIN users u ON r.user_id=u.id JOIN stages s ON r.stage_id=s.id JOIN venues v ON s.venue_id=v.id WHERE r.ticket_status='pending' ORDER BY r.created_at ASC").all()
        });
    } catch (e) { res.status(500).json({ error: 'Server error.' }); }
});

/**
 * Approve or reject a ticket.
 * In BOTH cases the ticket image is deleted from disk and
 * ticket_photo is set to NULL — we only need the file while
 * it is being reviewed.  The ticket_status field is kept so
 * we know whether the review carries 5× weight.
 */
app.put('/api/admin/ticket/:reviewId', requireAuth, requireAdmin, function (req, res) {
    var rid = parseInt(req.params.reviewId);
    var action = san(req.body.action || '', 10);

    if (!rid) return res.status(400).json({ error: 'Invalid review ID.' });
    if (action !== 'approve' && action !== 'reject') return res.status(400).json({ error: 'Action must be approve or reject.' });

    var review = db.prepare('SELECT id,ticket_photo FROM reviews WHERE id=?').get(rid);
    if (!review) return res.status(404).json({ error: 'Review not found.' });

    var newStatus = action === 'approve' ? 'approved' : 'rejected';
    db.prepare('UPDATE reviews SET ticket_status=? WHERE id=?').run(newStatus, rid);

    // Always delete the image from disk and clear the photo column
    deleteTicketImage(review.ticket_photo);
    db.prepare('UPDATE reviews SET ticket_photo=NULL WHERE id=?').run(rid);

    console.log('📸 Ticket for review #' + rid + ': ' + newStatus + ' (image removed)');
    res.json({ ok: true, status: newStatus });
});

app.get('/api/admin/reviews', requireAuth, requireAdmin, function (req, res) {
    try {
        var limit = Math.min(parseInt(req.query.limit) || 200, 500);
        var offset = parseInt(req.query.offset) || 0;
        var filter = san(req.query.filter || 'all', 20);
        var where = '';
        if (filter === 'pending') where = "WHERE r.ticket_status='pending'";
        else if (filter === 'flagged') where = 'WHERE r.flagged=1';
        var rows = db.prepare('SELECT r.id,r.stage_id,r.rating,r.year,r.comment,r.flagged,r.ticket_photo,r.ticket_status,r.created_at,u.id as user_id,u.display_name,u.username,s.name as stage_name,v.name as venue_name,v.id as venue_id FROM reviews r JOIN users u ON r.user_id=u.id JOIN stages s ON r.stage_id=s.id JOIN venues v ON s.venue_id=v.id ' + where + ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
        var total = db.prepare('SELECT COUNT(*) as n FROM reviews r ' + where).get().n;
        res.json({ reviews: rows, total: total });
    } catch (e) { res.status(500).json({ error: 'Server error.' }); }
});

app.delete('/api/admin/review/:id', requireAuth, requireAdmin, function (req, res) {
    var rid = parseInt(req.params.id);
    if (!rid) return res.status(400).json({ error: 'Invalid ID.' });
    var rev = db.prepare('SELECT ticket_photo FROM reviews WHERE id=?').get(rid);
    if (rev) deleteTicketImage(rev.ticket_photo);
    db.prepare('DELETE FROM reviews WHERE id=?').run(rid);
    res.json({ ok: true });
});

app.put('/api/admin/review/:id/flag', requireAuth, requireAdmin, function (req, res) {
    var rid = parseInt(req.params.id);
    if (!rid) return res.status(400).json({ error: 'Invalid ID.' });
    db.prepare('UPDATE reviews SET flagged=? WHERE id=?').run(req.body.flagged ? 1 : 0, rid);
    res.json({ ok: true });
});

app.get('/api/admin/users', requireAuth, requireAdmin, function (req, res) {
    try {
        var limit = Math.min(parseInt(req.query.limit) || 100, 500);
        var offset = parseInt(req.query.offset) || 0;
        var q = san(req.query.q || '', 100);
        var where = '', wParams = [];
        if (q) { where = 'WHERE u.username LIKE ? OR u.email LIKE ? OR u.display_name LIKE ?'; wParams = ['%' + q + '%', '%' + q + '%', '%' + q + '%']; }
        var sql = 'SELECT u.id,u.username,u.email,u.display_name,u.height_cm,u.email_verified,u.is_admin,u.banned,u.ban_reason,u.created_at,COUNT(r.id) as review_count FROM users u LEFT JOIN reviews r ON r.user_id=u.id ' + where + ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
        var users = db.prepare(sql).all.apply(db.prepare(sql), wParams.concat([limit, offset]));
        var cntSql = 'SELECT COUNT(*) as n FROM users u ' + where;
        var total = db.prepare(cntSql).get.apply(db.prepare(cntSql), wParams).n;
        res.json({ users: users, total: total });
    } catch (e) { res.status(500).json({ error: 'Server error.' }); }
});

app.put('/api/admin/user/:id', requireAuth, requireAdmin, async function (req, res) {
    var uid = parseInt(req.params.id);
    if (!uid) return res.status(400).json({ error: 'Invalid ID.' });
    var user = db.prepare('SELECT * FROM users WHERE id=?').get(uid);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (uid === req.user.id && (req.body.banned === true || req.body.is_admin === false)) {
        return res.status(400).json({ error: 'Cannot demote or ban yourself.' });
    }

    var updates = [], params = [];
    if (req.body.is_admin !== undefined)      { updates.push('is_admin=?');     params.push(req.body.is_admin ? 1 : 0); }
    if (req.body.banned !== undefined)        { updates.push('banned=?');       params.push(req.body.banned ? 1 : 0); }
    if (req.body.ban_reason !== undefined)    { updates.push('ban_reason=?');   params.push(san(req.body.ban_reason || '', 200) || null); }
    if (req.body.display_name !== undefined)  { var dn2 = san(req.body.display_name, 40); if (dn2.length >= 2) { updates.push('display_name=?'); params.push(dn2); } }
    if (req.body.height_cm !== undefined) {
        var h2 = parseFloat(req.body.height_cm);
        if (h2 >= 90 && h2 <= 250) { updates.push('height_cm=?'); params.push(h2); }
        else if (req.body.height_cm === null || req.body.height_cm === '') { updates.push('height_cm=NULL'); }
    }
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update.' });

    params.push(uid);
    db.prepare('UPDATE users SET ' + updates.join(',') + ' WHERE id=?').run.apply(
        db.prepare('UPDATE users SET ' + updates.join(',') + ' WHERE id=?'), params
    );
    var updated = db.prepare('SELECT id,username,email,display_name,height_cm,email_verified,is_admin,banned,ban_reason,created_at FROM users WHERE id=?').get(uid);
    res.json({ ok: true, user: updated });
});

app.delete('/api/admin/user/:id', requireAuth, requireAdmin, function (req, res) {
    var uid = parseInt(req.params.id);
    if (!uid) return res.status(400).json({ error: 'Invalid ID.' });
    if (uid === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself.' });

    // Delete all ticket images for this user's reviews
    var revs = db.prepare('SELECT ticket_photo FROM reviews WHERE user_id=?').all(uid);
    for (var i = 0; i < revs.length; i++) {
        deleteTicketImage(revs[i].ticket_photo);
    }

    db.prepare('DELETE FROM reviews WHERE user_id=?').run(uid);
    db.prepare('DELETE FROM users WHERE id=?').run(uid);
    res.json({ ok: true });
});

app.get('/api/admin/summary', requireAuth, requireAdmin, function (req, res) {
    try {
        res.json({
            totalUsers:      db.prepare('SELECT COUNT(*) as n FROM users').get().n,
            totalReviews:    db.prepare('SELECT COUNT(*) as n FROM reviews').get().n,
            pendingTickets:  db.prepare("SELECT COUNT(*) as n FROM reviews WHERE ticket_status='pending'").get().n,
            approvedTickets: db.prepare("SELECT COUNT(*) as n FROM reviews WHERE ticket_status='approved'").get().n,
            rejectedTickets: db.prepare("SELECT COUNT(*) as n FROM reviews WHERE ticket_status='rejected'").get().n,
            flaggedReviews:  db.prepare('SELECT COUNT(*) as n FROM reviews WHERE flagged=1').get().n,
            bannedUsers:     db.prepare('SELECT COUNT(*) as n FROM users WHERE banned=1').get().n,
            adminUsers:      db.prepare('SELECT COUNT(*) as n FROM users WHERE is_admin=1').get().n,
        });
    } catch (e) { res.status(500).json({ error: 'Server error.' }); }
});


/* ════════════════════════════════════════════════════════════════
   API: EVENTS (Shows at a stage)
   ════════════════════════════════════════════════════════════════ */

app.get('/api/stages/:id/events', function (req, res) {
    try {
        var sid = san(req.params.id, 60);
        var year = san(req.query.year || '', 4) || null;
        var sql = 'SELECT * FROM events WHERE stage_id=?';
        var params = [sid];
        if (year) { sql += ' AND year=?'; params.push(year); }
        sql += ' ORDER BY date_start ASC, time_start ASC';
        var events = db.prepare(sql).all.apply(db.prepare(sql), params);
        res.json({ events: events, total: events.length });
    } catch (e) {
        console.error('/api/stages/:id/events error:', e);
        res.status(500).json({ error: 'Server error.' });
    }
});

/* ════════════════════════════════════════════════════════════════
   CATCH-ALL: SPA ROUTING
   ════════════════════════════════════════════════════════════════ */

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


/* ════════════════════════════════════════════════════════════════
   BOOT
   ════════════════════════════════════════════════════════════════ */

(async function () {
    // Verify schema
    try {
        db.prepare('SELECT id,rating,flagged,ticket_photo,ticket_status FROM reviews LIMIT 1').all();
        db.prepare('SELECT id,banned,ban_reason FROM users LIMIT 1').all();
        console.log('✓ Schema verified');
    } catch (e) {
        console.error('❌ Schema error — run: rm data/fringeover6ft.db && node setup.js');
        console.error(e.message);
        process.exit(1);
    }

    app.listen(PORT, function () {
        var vc = db.prepare('SELECT COUNT(*) as n FROM venues').get().n;
        var sc = db.prepare('SELECT COUNT(*) as n FROM stages').get().n;
        var rc = db.prepare('SELECT COUNT(*) as n FROM reviews').get().n;
        var pt = db.prepare("SELECT COUNT(*) as n FROM reviews WHERE ticket_status='pending'").get().n;
        console.log('\n🦵 Fringe Over 6ft — ' + BASE_URL);
        console.log('   ' + vc + ' venues · ' + sc + ' stages · ' + rc + ' reviews · ' + pt + ' tickets pending\n');
    });
})();