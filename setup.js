'use strict';
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'fringeover6ft.db');
const BCRYPT_ROUNDS = 12;

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const ticketDir = path.join(__dirname, 'data', 'tickets');
if (!fs.existsSync(ticketDir)) fs.mkdirSync(ticketDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 99
);
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  area TEXT DEFAULT '',
  festival TEXT NOT NULL DEFAULT 'fringe' CHECK(festival IN('fringe','intl','both')),
  group_id TEXT NOT NULL REFERENCES groups(id),
  created_at TEXT DEFAULT(datetime('now')),
  updated_at TEXT DEFAULT(datetime('now'))
);
CREATE TABLE IF NOT EXISTS stages (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT(datetime('now')),
  updated_at TEXT DEFAULT(datetime('now'))
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  height_cm REAL,
  security_q TEXT NOT NULL DEFAULT '',
  security_a_hash TEXT NOT NULL DEFAULT '',
  email_verified INTEGER DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  banned INTEGER DEFAULT 0,
  ban_reason TEXT DEFAULT NULL,
  verification_token TEXT DEFAULT NULL,
  token_expires TEXT DEFAULT NULL,
  marketing_emails INTEGER DEFAULT 0,
  show_height INTEGER DEFAULT 1,
  created_at TEXT DEFAULT(datetime('now'))
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stage_id TEXT NOT NULL REFERENCES stages(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK(rating BETWEEN 0 AND 5),
  year TEXT,
  comment TEXT DEFAULT '',
  flagged INTEGER DEFAULT 0,
  ticket_photo TEXT DEFAULT NULL,
  ticket_status TEXT DEFAULT NULL,
  created_at TEXT DEFAULT(datetime('now')),
  UNIQUE(stage_id, user_id)
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  stage_id TEXT NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT DEFAULT '',
  genre TEXT DEFAULT '',
  description TEXT DEFAULT '',
  festival TEXT NOT NULL DEFAULT 'fringe' CHECK(festival IN('fringe','intl','both')),
  year TEXT DEFAULT '2025',
  date_start TEXT DEFAULT NULL,
  date_end TEXT DEFAULT NULL,
  time_start TEXT DEFAULT NULL,
  time_end TEXT DEFAULT NULL,
  price_text TEXT DEFAULT '',
  url TEXT DEFAULT '',
  created_at TEXT DEFAULT(datetime('now')),
  updated_at TEXT DEFAULT(datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_stage ON events(stage_id);
CREATE INDEX IF NOT EXISTS idx_events_year ON events(year);
CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expired INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reviews_stage ON reviews(stage_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user  ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_stages_venue  ON stages(venue_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exp  ON sessions(expired);
`);

console.log('✓ Schema created (incl. events table)');

const insG = db.prepare('INSERT OR IGNORE INTO groups(id,display_name,sort_order)VALUES(?,?,?)');
for (const [id,dn,so] of [
  ['pleasance','Pleasance',1],['assembly','Assembly',2],['underbelly','Underbelly',3],
  ['gilded','Gilded Balloon',4],['theSpace','theSpace',5],['laughing','LH / JtT',6],
  ['pbh','PBH Free Fringe',7],['monkey','Monkey Barrel',8],['stand','The Stand',9],
  ['zoo','ZOO',10],['other','Independent',11],['intl',"Int'l Festival",12]
]) insG.run(id,dn,so);
console.log('✓ Groups seeded');

const insV = db.prepare('INSERT OR IGNORE INTO venues(id,name,address,area,festival,group_id)VALUES(?,?,?,?,?,?)');
const insS = db.prepare('INSERT OR IGNORE INTO stages(id,venue_id,name,capacity,notes)VALUES(?,?,?,?,?)');

const VD=[
  ['if-churchhill','Church Hill Theatre','Morningside Rd, EH10 4DR','South Side','intl','intl',[['chh-main','Main Auditorium',450,''],['chh-studio','Studio',60,'']]],
  ['if-playhouse','Edinburgh Playhouse','Greenside Place, EH1 3AA','New Town','both','intl',[['ep-main','Main Auditorium',3059,'Largest in UK']]],
  ['if-festival-theatre','Festival Theatre','Nicolson Street, EH8 9FT','South Side','both','intl',[['ft-main','Main Auditorium',1915,'Opera & dance'],['ft-studio','Studio',200,'']]],
  ['if-hub','The Hub','Castlehill, EH1 2NE','Old Town','intl','intl',[['hub-main','Hub Hall',120,'']]],
  ['if-lyceum','The Lyceum','Grindlay St, EH3 9AX','West End','both','intl',[['lyc-main','Main',658,'Victorian']]],
  ['if-old-college','Old College Quad','South Bridge, EH8 9YL','Old Town','intl','intl',[['ocq-main','Quad',600,'Outdoor']]],
  ['if-ross','Ross Bandstand','Princes St Gardens','City Centre','intl','intl',[['ross-main','Bandstand',5000,'Open-air']]],
  ['if-queens-hall',"Queen's Hall",'Clerk Street, EH8 9JG','South Side','both','intl',[['qh-main','Main Hall',900,'Converted chapel']]],
  ['if-usher','Usher Hall','Lothian Road, EH1 2EA','West End','both','intl',[['usher-main','Main',2197,'Concert hall']]],
  ['pleasance-courtyard','Pleasance Courtyard','60 Pleasance, EH8 9TJ','Old Town','fringe','pleasance',[['pc-grand','The Grand',900,'Tiered'],['pc-dome','Dome',350,''],['pc-beyond','Beyond',300,''],['pc-cabaret','Cabaret Bar',150,'Basement'],['pc-upstairs','Upstairs',180,'Black box'],['pc-two','Two',100,''],['pc-ace','Ace Dome',450,'']]],
  ['pleasance-dome','Pleasance Dome','Bristo Square, EH8 9AL','Old Town','fringe','pleasance',[['pd-main','Dome Main',500,'']]],
  ['pleasance-eicc','Pleasance EICC','Morrison St, EH3 8EE','West End','fringe','pleasance',[['peicc-main','EICC Hall',1200,'Conference centre']]],
  ['assembly-hall','Assembly Hall','Mound Place, EH1 2LU','Old Town','fringe','assembly',[['ah-main','Assembly Hall',950,'']]],
  ['assembly-rooms','Assembly Rooms','George Street, EH2 2LR','New Town','fringe','assembly',[['ar-music','Music Hall',800,''],['ar-ballroom','Ballroom',350,''],['ar-drawing','Drawing Room',150,''],['ar-bijou','Bijou',200,''],['ar-front','Front Room',80,'']]],
  ['assembly-gs','Assembly George Sq','George Square, EH8 9LH','South Side','fringe','assembly',[['ags-gordon','Gordon Aikman',500,''],['ags-box','Box',74,''],['ags-crate','Crate',74,''],['ags-cubicle','Cubicle',50,'']]],
  ['assembly-gs-gardens','Assembly GS Gardens','George Square','South Side','fringe','assembly',[['agsg-spiegel','Spiegeltent',300,''],['agsg-garden','Garden',200,'']]],
  ['assembly-gs-studios','Assembly GS Studios','George Square','South Side','fringe','assembly',[['agss-1','Studio 1',150,''],['agss-2','Studio 2',120,''],['agss-3','Studio 3',100,''],['agss-4','Studio 4',80,''],['agss-5','Studio 5',60,''],['agss-u','Underground',150,'']]],
  ['assembly-checkpoint','Assembly Checkpoint','Bristo Place','Old Town','fringe','assembly',[['ac-main','Checkpoint',200,''],['ac-below','Below',80,'']]],
  ['assembly-roxy','Assembly Roxy','Roxburgh Place','South Side','fringe','assembly',[['arx-1','Roxy 1',250,''],['arx-2','Roxy 2',120,''],['arx-3','Roxy 3',80,''],['arx-outside','Outside',100,'']]],
  ['assembly-dance-base','Assembly Dance Base','Grassmarket','Old Town','fringe','assembly',[['adb-1','Dance Base 1',160,''],['adb-3','Dance Base 3',80,'']]],
  ['underbelly-cowgate','Underbelly Cowgate','66 Cowgate','Old Town','fringe','underbelly',[['uc-big','Big Belly',361,''],['uc-wee','Wee Belly',140,''],['uc-button','Belly Button',80,''],['uc-baby','Baby Belly',50,''],['uc-v','V Belly',100,'']]],
  ['underbelly-bristo','Underbelly Bristo Sq','Teviot Place','Old Town','fringe','underbelly',[['ubs-mcewan','McEwan Hall',1800,'Domed hall'],['ubs-main','Bristo Main',400,''],['ubs-studio','Bristo Studio',150,'']]],
  ['underbelly-gs','Underbelly George Sq','George Square','South Side','fringe','underbelly',[['ugs-udder','Udderbelly',300,''],['ugs-coo','Wee Coo',100,'']]],
  ['underbelly-circus','Circus Hub','Middle Meadow Walk','Meadows','fringe','underbelly',[['uch-lafayette','Lafayette',450,''],['uch-beauty','Beauty',200,'']]],
  ['gilded-patter','Gilded Balloon Patter House','Chambers St','Old Town','fringe','gilded',[['gbph-1','Patter 1',300,''],['gbph-2','Patter 2',200,''],['gbph-3','Patter 3',150,''],['gbph-4','Patter 4',100,''],['gbph-5','Patter 5',80,''],['gbph-6','Patter 6',80,''],['gbph-7','Patter 7',60,''],['gbph-8','Patter 8',60,''],['gbph-bar','Patter Bar',120,'']]],
  ['gilded-museum','Gilded Balloon Museum','Lothian St','Old Town','fringe','gilded',[['gbm-main','Museum',210,'']]],
  ['gilded-appleton','Gilded Balloon Appleton','Crichton St','South Side','fringe','gilded',[['gba-1','Appleton 1',300,''],['gba-2','Appleton 2',200,''],['gba-3','Appleton 3',150,''],['gba-4','Appleton 4',100,''],['gba-5','Appleton 5',80,''],['gba-6','Appleton 6',60,''],['gba-7','Appleton 7',40,'']]],
  ['space-surgeons',"theSpace Surgeons' Hall",'Nicolson St','South Side','fringe','theSpace',[['tss-1',"Surgeons' 1",250,''],['tss-2',"Surgeons' 2",180,''],['tss-3',"Surgeons' 3",120,''],['tss-4',"Surgeons' 4",100,''],['tss-5',"Surgeons' 5",80,'']]],
  ['space-triplex','theSpace Triplex','Prince Philip Building','South Side','fringe','theSpace',[['tst-1','Triplex 1',300,''],['tst-2','Triplex 2',200,''],['tst-3','Triplex 3',150,'']]],
  ['space-symposium','theSpace Symposium','Hill Square','South Side','fringe','theSpace',[['tsh-1','Symposium 1',200,''],['tsh-2','Symposium 2',120,'']]],
  ['space-niddry','theSpace Niddry St','Niddry Street','Old Town','fringe','theSpace',[['tsn-1','Niddry 1',120,''],['tsn-2','Niddry 2',80,''],['tsn-3','Niddry 3',60,'']]],
  ['space-mile','theSpace on the Mile','80 High Street','Old Town','fringe','theSpace',[['tsm-1','Mile 1',150,''],['tsm-2','Mile 2',100,''],['tsm-3','Mile 3',80,'']]],
  ['space-v45','theSpace Venue 45','Jeffrey Street','Old Town','fringe','theSpace',[['tsv45-m','V45 Main',200,''],['tsv45-s','V45 Studio',80,'']]],
  ['lh-counting','LH @ Counting House','W Nicolson St','South Side','fringe','laughing',[['lhch-1','CH 1',80,''],['lhch-2','CH 2',60,''],['lhch-3','CH 3',50,'']]],
  ['lh-pear','LH @ Pear Tree','W Nicolson St','South Side','fringe','laughing',[['lhpt-in','Pear Tree In',80,''],['lhpt-out','Pear Tree Out',200,'']]],
  ['jtt-caves','JtT @ Caves','Cowgate','Old Town','fringe','laughing',[['jttc-big','Big Cave',150,''],['jttc-small','Small Cave',80,'']]],
  ['jtt-mash','JtT @ Mash House','Guthrie St','Old Town','fringe','laughing',[['jttm-main','Mash Main',200,''],['jttm-studio','Mash Studio',100,'']]],
  ['jtt-nucleus','JtT Nucleus','Pleasance','Old Town','fringe','laughing',[['jttn-main','Nucleus',120,'']]],
  ['jtt-la-belle','JtT La Belle Angele',"Hastie's Close",'Old Town','fringe','laughing',[['jttlba-main','La Belle Angele',500,'']]],
  ['lh-three-sisters','LH @ Three Sisters','139 Cowgate','Old Town','fringe','laughing',[['lhts-1','3 Sisters 1',80,''],['lhts-2','3 Sisters 2',60,''],['lhts-3','3 Sisters 3',50,'']]],
  ['pbh-bannermans','PBH Bannermans','212 Cowgate','Old Town','fringe','pbh',[['pbhb-main','Bannermans',150,'']]],
  ['pbh-banshee','PBH Banshee Labyrinth','Niddry Street','Old Town','fringe','pbh',[['pbhbl-1','Banshee 1',80,''],['pbhbl-2','Banshee 2',60,''],['pbhbl-3','Banshee 3',50,'']]],
  ['pbh-voodoo','PBH Voodoo Rooms','W Register St','New Town','fringe','pbh',[['pbhvr-sk','Speakeasy',120,''],['pbhvr-bl','Ballroom',250,''],['pbhvr-cb','Carte Blanche',80,'']]],
  ['pbh-liquid','PBH Liquid Room','Victoria Street','Old Town','fringe','pbh',[['pbhlr-an','Annexe',150,''],['pbhlr-wh','Warehouse',100,'']]],
  ['pbh-canons',"PBH Canons' Gait",'Canongate','Old Town','fringe','pbh',[['pbhcg-bar',"Canons' Gait",60,''],['pbhcg-cellar','Cellar',40,'']]],
  ['monkey-main','Monkey Barrel','Blair Street','Old Town','fringe','monkey',[['mb-main','Monkey Barrel',200,'']]],
  ['monkey-cv','Monkey Barrel (Cab Volt)','Blair Street','Old Town','fringe','monkey',[['mbcv-main','Cabaret Voltaire',150,'']]],
  ['monkey-hive','Monkey Barrel (Hive)','Niddry Street','Old Town','fringe','monkey',[['mbh-main','The Hive',100,'']]],
  ['monkey-tron','Monkey Barrel (Tron)','Hunter Square','Old Town','fringe','monkey',[['mbt-main','The Tron',120,'']]],
  ['stand-1','The Stand 1','5 York Place','New Town','fringe','stand',[['st1-main','Stand 1',200,'']]],
  ['stand-2','The Stand 2','N St Andrew St','New Town','fringe','stand',[['st2-main','Stand 2',80,'']]],
  ['stand-34','The Stand 3&4','28 York Place','New Town','fringe','stand',[['st3-main','Stand 3',300,''],['st4-studio','Stand 4',80,'']]],
  ['stand-w','Stand @ W Edinburgh','St James Square','New Town','fringe','stand',[['stw-main','W Edinburgh',150,'']]],
  ['zoo-playground','ZOO Playground','High School Yards','Old Town','fringe','zoo',[['zp-1','Playground 1',80,''],['zp-2','Playground 2',60,''],['zp-3','Playground 3',40,'']]],
  ['zoo-southside','ZOO Southside','Nicolson Street','South Side','fringe','zoo',[['zs-main','Southside Main',200,''],['zs-studio','Southside Studio',80,'']]],
  ['traverse','Traverse Theatre','Cambridge Street','West End','fringe','other',[['tr-1','Traverse 1',250,''],['tr-2','Traverse 2',100,'']]],
  ['summerhall','Summerhall','1 Summerhall, EH9 1PL','South Side','fringe','other',[['sh-main','Main Hall',360,''],['sh-rd','Royal Dick',200,''],['sh-anatomy','Anatomy Lecture Theatre',90,'Notorious tight seats'],['sh-demo','Demo Room',100,''],['sh-dissect','Dissection Room',150,''],['sh-tech','Tech Cube',60,'']]],
  ['bedlam','Bedlam Theatre','Bristo Place','Old Town','fringe','other',[['bl-main','Bedlam',100,'Neo-gothic church']]],
  ['greenside-george','Greenside George St','George Street','New Town','fringe','other',[['ggg-1','George St 1',150,''],['ggg-2','George St 2',100,''],['ggg-3','George St 3',80,''],['ggg-4','George St 4',60,''],['ggg-5','George St 5',50,''],['ggg-6','George St 6',40,'']]],
  ['greenside-riddles','Greenside Riddles Court','Lawnmarket','Old Town','fringe','other',[['ggr-1','Riddles 1',80,''],['ggr-2','Riddles 2',60,''],['ggr-3','Riddles 3',50,''],['ggr-4','Riddles 4',40,'']]],
  ['paradise-aug','Paradise Augustines','George IV Bridge','Old Town','fringe','other',[['pia-main','Augustines',150,'']]],
  ['paradise-vault','Paradise in The Vault','Merchant Street','Old Town','fringe','other',[['piv-main','The Vault',100,'']]],
  ['c-aurora','C aurora','Lauriston Street','Old Town','fringe','other',[['cau-main','C aurora Main',200,''],['cau-studio','C aurora Studio',80,'']]],
  ['scottish-storytelling','Scottish Storytelling Centre','High Street','Old Town','fringe','other',[['ssc-netherbow','Netherbow',100,''],['ssc-court','Storytelling Court',60,'']]],
  ['famous-spiegel','Famous Spiegeltent','St Andrew Sq','New Town','fringe','other',[['fs-main','Spiegeltent',300,'']]],
  ['ghillie-dhu','Ghillie Dhu','Rutland Place','West End','fringe','other',[['gd-main','Ghillie Dhu',300,'High ceilings']]],
  ['jazz-bar','The Jazz Bar','Chambers Street','Old Town','fringe','other',[['jb-main','Jazz Bar',100,'Basement bar']]],
  ['theatre-big-top','Theatre Big Top','Festival Square','West End','fringe','other',[['tbt-main','Big Top',600,'']]],
  ['hoots-apex','Hoots @ Apex','Grassmarket','Old Town','fringe','other',[['ha-1','Apex 1',120,''],['ha-2','Apex 2',100,''],['ha-3','Apex 3',80,''],['ha-4','Apex 4',60,'']]],
  ['st-brides',"St Bride's",'Orwell Terrace','West End','fringe','other',[['stb-main',"St Bride's",200,'']]],
  ['braw-grand-lodge','Braw Grand Lodge','George Street','New Town','fringe','other',[['bwgl-1','Grand Lodge 1',200,''],['bwgl-2','Grand Lodge 2',120,''],['bwgl-3','Grand Lodge 3',80,'']]],
  ['deaf-action','Deaf Action','Albany Street','New Town','fringe','other',[['da-sanc','Sanctuary',200,''],['da-bar','Bar/Lounge',80,''],['da-garden','Hidden Garden',60,'']]],
  ['venue-13','Venue 13','Lochend Close','Old Town','fringe','other',[['v13-main','Venue 13',60,'Tiny gem']]]
];

const txn = db.transaction(function() {
  for (var i = 0; i < VD.length; i++) {
    var row = VD[i];
    insV.run(row[0],row[1],row[2],row[3],row[4],row[5]);
    var stages = row[6];
    for (var j = 0; j < stages.length; j++) {
      insS.run(stages[j][0], row[0], stages[j][1], stages[j][2], stages[j][3]);
    }
  }
});
txn();

var vc = db.prepare('SELECT COUNT(*) as n FROM venues').get().n;
var sc = db.prepare('SELECT COUNT(*) as n FROM stages').get().n;
console.log('✓ ' + vc + ' venues, ' + sc + ' stages seeded');

/* ════════════════════════════════════════════════════════════════
   SEED EXAMPLE EVENTS
   ════════════════════════════════════════════════════════════════ */

var insE = db.prepare('INSERT OR IGNORE INTO events(id,stage_id,title,artist,genre,description,festival,year,date_start,date_end,time_start,time_end,price_text,url)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

var EVENTS = [
  // Pleasance Courtyard — The Grand
  ['ev-pc-grand-1','pc-grand','Knee Deep in Comedy','Sarah Millican','Stand-up Comedy','An hour of razor-sharp observational comedy about the indignities of modern life — and modern seating.','fringe','2025','2025-08-02','2025-08-24','19:30','20:30','£16–£22',''],
  ['ev-pc-grand-2','pc-grand','The Tall Tales Show','Various','Comedy Variety','Five of the tallest comedians in the business share their worst legroom stories. A Fringe Over 6ft special.','fringe','2025','2025-08-04','2025-08-22','21:15','22:15','£14',''],

  // Pleasance Courtyard — Upstairs
  ['ev-pc-up-1','pc-upstairs','Cramped: A One-Man Show','Tom Fletcher','Theatre','A claustrophobic one-man play set entirely in Row G, Seat 14. Warning: may trigger legroom flashbacks.','fringe','2025','2025-08-03','2025-08-25','13:00','14:00','£12',''],

  // Summerhall — Anatomy Lecture Theatre (worst-rated stage)
  ['ev-sh-anat-1','sh-anatomy','Bones of Contention','Dr Anatomy Collective','Physical Theatre','Immersive performance in the notorious Victorian lecture theatre. Audience members sit on original benches. Bring padding.','fringe','2025','2025-08-01','2025-08-25','15:45','16:45','£10–£14',''],
  ['ev-sh-anat-2','sh-anatomy','The Autopsy of Comfort','Jenny McBride','Spoken Word','A poetic excavation of what it means to sit still for an hour when you physically cannot.','fringe','2025','2025-08-05','2025-08-20','11:30','12:20','£8',''],

  // Assembly Hall
  ['ev-ah-1','ah-main','The Scottish Play (Standing Edition)','RSC Touring','Drama','Shakespeare as it was meant to be seen — with proper theatre seating and actual legroom.','fringe','2025','2025-08-06','2025-08-23','19:00','21:15','£18–£32',''],

  // Underbelly Big Belly
  ['ev-uc-big-1','uc-big','Sardine Cabaret','The Squash Collective','Cabaret','Late-night cabaret in the famous cowgate cave. Plastic chairs included, lumbar support not.','fringe','2025','2025-08-02','2025-08-24','22:30','23:45','£15',''],

  // Traverse 1
  ['ev-tr-1','tr-1','New Writing: Altitude','Mark Ravenhill','New Writing','World premiere. A play about a basketball player who retires to become a theatre critic — and can never fit in the seats.','fringe','2025','2025-08-07','2025-08-24','14:00','15:15','£15–£20',''],

  // Usher Hall (Int'l Festival)
  ['ev-usher-1','usher-main','Edinburgh International Orchestra Gala','RSNO','Classical','Season-opening gala. The plush Usher Hall stalls are among the most comfortable seats in Edinburgh.','intl','2025','2025-08-08','2025-08-08','19:30','21:30','£20–£65',''],

  // Festival Theatre (Int'l)
  ['ev-ft-1','ft-main','Scottish Ballet: Tall Stories','Scottish Ballet','Dance','A new commission exploring height, space, and the geometry of the human body.','intl','2025','2025-08-12','2025-08-16','19:30','21:00','£18–£45',''],

  // Monkey Barrel
  ['ev-mb-1','mb-main','Late Night Stand-Up Showcase','Various','Stand-up Comedy','Five acts, one hour, zero legroom complaints (cabaret tables help).','fringe','2025','2025-08-01','2025-08-25','22:00','23:00','£10',''],

  // Bedlam
  ['ev-bl-1','bl-main','Pew Pew: An Improv Mass','The Holy Improvisers','Improv','Long-form improv in a converted church. Audience confessions become scenes. Church pews are authentic — and authentically painful.','fringe','2025','2025-08-04','2025-08-23','17:00','18:00','Free (donations)',''],

  // Venue 13
  ['ev-v13-1','v13-main','Tiny Gem: Solo Stories','Rotating Artists','Storytelling','Intimate storytelling in Edinburgh\'s cosiest venue. Proper chairs, proper space, proper stories.','fringe','2025','2025-08-02','2025-08-24','12:30','13:15','£7',''],

  // Queen's Hall
  ['ev-qh-1','qh-main','Jazz at the Queen\'s','Courtney Pine','Jazz','World-class jazz in one of Edinburgh\'s best-padded venues. Converted chapel, converted to comfort.','intl','2025','2025-08-10','2025-08-10','20:00','22:00','£22–£38',''],

  // Ghillie Dhu
  ['ev-gd-1','gd-main','Ceilidh & Comedy Night','Various','Comedy / Music','Traditional Scottish ceilidh meets stand-up comedy. High ceilings, actual legroom, and dancing.','fringe','2025','2025-08-05','2025-08-22','20:00','22:30','£16',''],
];

var evTxn = db.transaction(function() {
  for (var i = 0; i < EVENTS.length; i++) {
    var e = EVENTS[i];
    if (db.prepare('SELECT id FROM stages WHERE id=?').get(e[1])) {
      insE.run(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],e[11],e[12],e[13]);
    }
  }
});
evTxn();

var ec = db.prepare('SELECT COUNT(*) as n FROM events').get().n;
console.log('✓ ' + ec + ' example events seeded');

// ── Read admin credentials from environment or use defaults ──
var ADMIN_PASS  = process.env.ADMIN_PASS  || 'Admin@Fringe25!';
var ADMIN_USER  = process.env.ADMIN_USER  || 'admin';
var ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fringeover6ft.com';

(async function() {
  var saHash = await bcrypt.hash('princes street', BCRYPT_ROUNDS);

  // ── Main admin account ──────────────────────────────────────
  var adminPwHash = await bcrypt.hash(ADMIN_PASS, BCRYPT_ROUNDS);
  var existingAdmin = db.prepare('SELECT id FROM users WHERE username=? COLLATE NOCASE').get(ADMIN_USER);
  if (existingAdmin) {
    db.prepare('UPDATE users SET password_hash=?,is_admin=1,email_verified=1,banned=0 WHERE id=?').run(adminPwHash, existingAdmin.id);
    console.log('✓ Admin account updated: ' + ADMIN_USER);
  } else {
    db.prepare('INSERT INTO users(username,email,display_name,password_hash,height_cm,security_q,security_a_hash,email_verified,is_admin,marketing_emails,show_height) VALUES(?,?,?,?,?,?,?,1,1,0,1)')
      .run(ADMIN_USER, ADMIN_EMAIL, 'Site Admin', adminPwHash, null, '4', saHash);
    console.log('✓ Admin account created: ' + ADMIN_USER);
  }

  // ── Demo user ────────────────────────────────────────────
  var demoPwHash = await bcrypt.hash('Demo@2025!', BCRYPT_ROUNDS);
  var demoSaHash = await bcrypt.hash('demo street', BCRYPT_ROUNDS);
  db.prepare('INSERT OR IGNORE INTO users(username,email,display_name,password_hash,height_cm,security_q,security_a_hash,email_verified,is_admin,marketing_emails,show_height) VALUES(?,?,?,?,?,?,?,1,0,0,1)')
    .run('demo','demo@fringeover6ft.com','Tall Demo User',demoPwHash,190,'1',demoSaHash);
  var demoUser = db.prepare('SELECT id FROM users WHERE username=?').get('demo');
  var uid = demoUser.id;

  var insR = db.prepare('INSERT OR IGNORE INTO reviews(stage_id,user_id,rating,year,comment,ticket_status)VALUES(?,?,?,?,?,?)');
  var reviews = [
    ['pc-grand',    3,'2024','Good rake but tight middle rows.',       null],
    ['pc-upstairs', 1,'2024','Brutal bench edges cut off circulation.','approved'],
    ['sh-anatomy',  0,'2024','Cannot sit. Victorian benches.',         'approved'],
    ['uc-big',      2,'2024','Plastic chairs, knees jammed.',          null],
    ['tr-1',        3,'2024','Raked seating. Survivable for an hour.', 'approved'],
    ['ah-main',     4,'2024','Grand space, proper theatre seats.',      null],
    ['pd-main',     3,'2024','Tent seating OK in back rows.',           null],
    ['qh-main',     4,'2024','Padded seats, generous spacing.',        'pending'],
    ['mb-main',     3,'2024','Cabaret tables help.',                   null],
    ['jb-main',     2,'2024','Bar stools, no back support.',           null],
    ['gd-main',     4,'2024','High ceilings, proper legroom.',         'approved'],
    ['bl-main',     1,'2024','Church pews. No padding. Awful.',        'approved'],
    ['usher-main',  4,'2024','Plush seats, great rake.',               null],
    ['ft-main',     4,'2024','Purpose-built stalls. Excellent.',       'approved'],
    ['lyc-main',    3,'2024','OK if you avoid upper circle.',          null],
    ['ep-main',     3,'2024','Stalls comfortable, rear circle a squeeze.',null],
    ['v13-main',    5,'2024','Tiny gem — proper chairs, great space.', 'pending'],
    ['ssc-netherbow',4,'2024','Well designed. Good legroom.',          null]
  ];
  for (var k = 0; k < reviews.length; k++) {
    var r = reviews[k];
    if (db.prepare('SELECT id FROM stages WHERE id=?').get(r[0])) {
      insR.run(r[0], uid, r[1], r[2], r[3], r[4]);
    }
  }

  var rc = db.prepare('SELECT COUNT(*) as n FROM reviews').get().n;

  console.log('\n' + '═'.repeat(56));
  console.log('  DATABASE READY');
  console.log('═'.repeat(56));
  console.log('  ' + vc + ' venues · ' + sc + ' stages · ' + rc + ' reviews · ' + ec + ' events');
  console.log('');
  console.log('  ┌─ ADMIN LOGIN ──────────────────────────────┐');
  console.log('  │  URL:      http://localhost:3000/admin.html │');
  console.log('  │  Username: ' + ADMIN_USER.padEnd(34) + '│');
  console.log('  │  Password: ' + ADMIN_PASS.padEnd(34) + '│');
  console.log('  └─────────────────────────────────────────────┘');
  console.log('');
  console.log('  ┌─ DEMO USER ────────────────────────────────┐');
  console.log('  │  Username: demo                             │');
  console.log('  │  Password: Demo@2025!                       │');
  console.log('  │  Height:   190cm (6\'3")  · is_admin: NO    │');
  console.log('  └─────────────────────────────────────────────┘');
  console.log('');
  console.log('  To set a custom admin password:');
  console.log('  ADMIN_PASS=YourPassword node setup.js');
  console.log('═'.repeat(56) + '\n');

  process.exit(0);
})();