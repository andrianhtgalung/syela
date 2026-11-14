/* ====== EDIT BAGIAN INI ====== */
var CONFIG = {
  /* Kata rahasia yang harus diketik sebelum pesan maaf terbuka. Huruf besar/kecil, spasi, dan tanda hubung diabaikan.
     Kosongkan ("") untuk melewati layar kata rahasia. */
  secretWord: "wiwiwi",

  /* Opsional: tanggal jadian (TAHUN-BULAN-TANGGAL, contoh 2025-02-14) untuk menampilkan hitungan hari bersama di halaman surat.
     Kosongkan ("") kalau tidak mau ada hitungan hari. */
  anniversary: "",

  /* Musik latar. File lagu harus satu folder dengan index.html. Musik mulai saat layar pertama kali diketuk
     (aturan browser: suara tidak boleh langsung menyala sendiri). Kosongkan ("") untuk tanpa musik. */
  music: "lagu.mp3",

  ask: {
    title: "Maafin aku, ya?",
    yes: "MAAFIN", no: "NGGAK",
    noGone: "Tombol NGGAK sudah disita."
  },
  angry: ["Hmph! Padahal aku udah minta maaf...", "Sekali lagi pencet NGGAK, aku nangis lho...", "Aku sedih beneran nih...", "Oke. NGGAK-nya aku sita. Maafin ya?"],
  again: "COBA LAGI",

  /* Kalimat yang muncul saat karakter diketuk */
  say: {
    ask: ["Maafin aku dong...", "Aku sayang kamu", "Pencet MAAFIN ya!", "Jangan pencet NGGAK..."],
    angry: ["Hmph!", "Aku sedih...", "Pencet COBA LAGI dong"],
    gate: ["Ayo tebak!", "Pikirin pelan-pelan", "Aku tahu kamu bisa"]
  },

  gate: {
    title: "Kata rahasia",
    sub: "Sebelum lanjut, ketik kata rahasia kita dulu ya. Kalau benar, pesan maafku langsung terbuka.",
    button: "BUKA PESAN MAAF",
    empty: "Ketik dulu kata rahasianya ya.",
    wrong: [
      "Hmm, bukan itu. Coba lagi ya.",
      "Masih salah. Ini kata yang kita bilang kalau lagi gemes.",
      "Hampir! Pikirkan bunyinya, ada yang diulang.",
      "Ya ampun. Pencet 'Minta petunjuk' deh."
    ],
    hints: [
      "Petunjuk 1: katanya ada 6 huruf.",
      "Petunjuk 2: huruf pertamanya W.",
      "Petunjuk 3: bunyinya 'wi' yang diulang tiga kali."
    ],
    hintsDone: "Petunjuk habis, kamu pasti ingat!"
  },

  gifts: {
    title: "Pesan maaf buat kamu",
    note: "Klik hadiahnya untuk dibuka",
    done: "Semua sudah kamu buka. Maafin aku ya, aku sayang kamu.",
    replay: "Ulang dari awal",
    labels: ["Buka lagu kita", "Buka kenangan kita", "Buka surat maaf", "Buka bunga untukmu"]
  },

  /* Kartu lagu ikut mengendalikan musik latar (kalau lagu.mp3 ada). */
  song: { title: "Lagu buat kamu", name: "Last Night on Earth", artist: "Green Day", duration: "3:56", url: "" },
  letterSong: {
    title: "Lagu ini buat kamu",
    paras: [
      "Aku nggak pandai merangkai kata kalau lagi salah, jadi aku pilih lagu ini untuk mewakili perasaanku. Setiap kali mendengarnya, aku ingat betapa berharganya kamu buat aku.",
      "Aku sadar aku sudah bikin kamu sedih. Dan itu hal terakhir yang pernah mau aku lakukan.",
      "Kalau kamu dengarkan lagu ini sampai habis, anggap saja itu aku yang lagi bilang: maafin aku."
    ]
  },

  scrapTitle: "Kenangan kita",
  social: { name: "Nama Kamu", handle: "@kamu", text: "Maafin aku ya, kangen kamu", time: "09.15 · 29 Des 25" },

  letterAnniv: {
    title: "Maafin aku, Sayang",
    paras: [
      "Aku minta maaf dari hati yang paling dalam. Aku tahu sikap dan kata-kataku kemarin bikin kamu terluka, dan aku nggak mau cuma bilang maaf lalu berlalu begitu saja.",
      "Aku mau belajar jadi lebih baik: lebih sabar, lebih mau mendengarkan, dan lebih jujur soal perasaanku. Kamu terlalu berharga untuk aku sia-siakan.",
      "Terima kasih sudah sabar sama aku. Kalau kamu mau kasih aku satu kesempatan lagi, aku janji akan buktikan lewat sikap, bukan cuma kata-kata."
    ],
    sign: "dengan sayang dan penyesalan, Aku",
    polaroidCaption: "kamu, kesayanganku",
    hug: "KIRIM PELUKAN",
    hugNote: ["Pelukan terkirim. Aku sayang kamu.", "Pelukan kedua! Boleh minta lagi.", "Pelukan erat sekali. Maafin aku ya."]
  },

  bloom: {
    hint: "Sentuh kuncupnya",
    more: "Sentuh bunganya lagi"
  },

  /* Isi dengan alamat/nama file foto. Kosong = kotak foto kosong yang bisa diketuk untuk memilih foto dari HP. */
  photos: {
    song: ["", "", ""],
    collage: ["", "", "", ""],
    social: ["", ""],
    polaroid: "karakter.jpg"
  }
};
/* ============================= */

var $ = function(id){ return document.getElementById(id); };
var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
var INK = "#2c3547";
var stage = "ask", noRound = 0, visited = {}, wrongs = 0, hintIdx = 0, rainTimer = 0, hugCount = 0;
var screens = ["ask","angry","gate","gifts","song","collage","anniv","bloom"];
var GIFT_PAGES = ["song","collage","anniv","bloom"];

function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function rnd(a,b){ return a + Math.random()*(b-a); }
function buzz(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(e){} }

/* ================= musik latar ================= */
var bgm = null, bgmFailed = false, musicOn = false, musicStarted = false;
(function(){
  if(!CONFIG.music){ bgmFailed = true; return; }
  bgm = new Audio(CONFIG.music); bgm.loop = true; bgm.preload = "auto"; bgm.volume = 0.65;
  bgm.addEventListener("error", function(){ bgmFailed = true; var b = $("musicBtn"); if(b) b.hidden = true; });
  ["play","pause","timeupdate","loadedmetadata"].forEach(function(ev){ bgm.addEventListener(ev, function(){ syncMusic(); }); });
})();
function syncMusic(){
  var b = $("musicBtn");
  if(bgm && musicStarted && !bgmFailed) musicOn = !bgm.paused;
  if(b && !bgmFailed){
    b.hidden = !musicStarted;
    b.classList.toggle("off", !musicOn);
    b.setAttribute("aria-pressed", musicOn ? "true" : "false");
    b.setAttribute("aria-label", musicOn ? "Matikan musik" : "Nyalakan musik");
  }
  if(bgm && !bgmFailed && $("scFill")){
    player.on = !bgm.paused; player.t = bgm.currentTime || 0;
    if(isFinite(bgm.duration) && bgm.duration > 0) player.dur = bgm.duration;
    updPlayer();
  }
}
function startMusic(){
  if(!bgm || bgmFailed || musicStarted) return;
  musicStarted = true;
  var p = bgm.play();
  if(p && p.catch) p.catch(function(){ musicStarted = false; musicOn = false; syncMusic(); });
  syncMusic();
}
document.addEventListener("pointerdown", function(e){
  if(e.target.closest && e.target.closest("#musicBtn")) return;
  startMusic();
});
$("musicBtn").addEventListener("click", function(){
  if(!bgm || bgmFailed) return;
  if(bgm.paused){ var p = bgm.play(); if(p && p.catch) p.catch(function(){}); } else { bgm.pause(); }
  syncMusic();
});

/* ================= gambar ================= */
var FLOWER_COLORS = ["#ff7aa8","#ffd23f","#b99cff","#ff9d5c","#ffffff","#7fd6ff","#ff6b6b"];
var HEART = '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
function flowerHead(cx, cy, r, col, mid){
  var s = '<g transform="translate('+cx+' '+cy+')">';
  for(var i=0;i<6;i++){
    s += '<ellipse cx="0" cy="'+(-r*0.6)+'" rx="'+(r*0.36)+'" ry="'+(r*0.58)+'" fill="'+col+'" stroke="'+INK+'" stroke-width="2" transform="rotate('+(i*60)+')"/>';
  }
  return s + '<circle r="'+(r*0.3)+'" fill="'+(mid||"#ffd23f")+'" stroke="'+INK+'" stroke-width="2"/></g>';
}
function flowerSVG(col){ return '<svg viewBox="-20 -20 40 40" aria-hidden="true">'+flowerHead(0,0,17,col, col==="#ffd23f" ? "#ff9d5c" : "#ffd23f")+'</svg>'; }

/* Stiker Bubu & Dudu (gambar di folder stickers/) */
function stk(name){ return '<img class="stkimg" src="stickers/'+name+'.webp" alt="" draggable="false">'; }
function askArt(){ return stk("ask"); }
function angryArt(n){ n = n || 1; return stk("angry" + Math.min(n, 4)); }
function gateArt(mode){
  if(mode === "wrong") return stk("gate_wrong");
  if(mode === "right") return stk("gate_right");
  return stk("gate_ask");
}
function giftArt(i){ return i === 3 ? flowerSVG("#ff9ec0") : stk(["gift1","gift2","gift3"][i] || "gift1"); }
function buffArt(){ return stk("anniv"); }
function decoSVG(type){
  if(type === "star") return '<svg viewBox="0 0 24 24"><polygon points="12,1 15,9 23,9 17,14 19,22 12,17 5,22 7,14 1,9 9,9"/></svg>';
  if(type === "spark") return '<svg viewBox="0 0 24 24"><path d="M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5Z"/></svg>';
  return '<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="6.5" cy="18" r="3"/><circle cx="17.5" cy="16" r="3"/></svg>';
}
function addDeco(host, list){
  list.forEach(function(d){
    var el = document.createElement("span");
    el.className = "deco " + d.t; el.innerHTML = decoSVG(d.t);
    el.style.left = d.l; el.style.top = d.tp; el.style.width = d.s + "px"; el.style.height = d.s + "px";
    el.style.animationDelay = (Math.random()*2) + "s";
    host.appendChild(el);
  });
}
function addStickers(host, list){
  list.forEach(function(d){
    var el = document.createElement("div");
    el.className = "sticker"; el.innerHTML = d.svg;
    el.style.width = d.w;
    if(d.l) el.style.left = d.l; if(d.r) el.style.right = d.r;
    if(d.t) el.style.top = d.t; if(d.b) el.style.bottom = d.b;
    el.style.setProperty("--rot", (d.rot||0) + "deg");
    makeDraggable(el);
    host.appendChild(el);
  });
}
function makeDraggable(el){
  var sx = 0, sy = 0, ox = 0, oy = 0, on = false;
  el._x = 0; el._y = 0;
  el.addEventListener("pointerdown", function(e){
    on = true; sx = e.clientX; sy = e.clientY; ox = el._x; oy = el._y;
    try{ el.setPointerCapture(e.pointerId); }catch(err){}
    el.classList.add("lift"); e.preventDefault();
  });
  el.addEventListener("pointermove", function(e){
    if(!on) return;
    el._x = ox + e.clientX - sx; el._y = oy + e.clientY - sy;
    el.style.translate = el._x + "px " + el._y + "px";
  });
  var end = function(){ on = false; el.classList.remove("lift"); };
  el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
}

/* ================= efek hati ================= */
var HEART_COLORS = ["#e94f7b","#d65353","#ff8fab","#ffb703","#b99cff"];
function spawnFx(x, y, n, big){
  var host = $("fx");
  for(var i=0;i<n;i++){
    if(host.children.length > 70) return;
    var el = document.createElement("span");
    el.className = "fxh"; el.innerHTML = HEART;
    el.style.left = x + "px"; el.style.top = y + "px";
    el.style.setProperty("--s", (big ? rnd(14,28) : rnd(10,18)) + "px");
    el.style.setProperty("--c", HEART_COLORS[Math.floor(Math.random()*HEART_COLORS.length)]);
    el.style.setProperty("--dx", (big ? rnd(-130,130) : rnd(-36,36)) + "px");
    el.style.setProperty("--dy", (big ? rnd(-230,-70) : rnd(-90,-30)) + "px");
    el.style.setProperty("--d", rnd(.8,1.5) + "s");
    el.addEventListener("animationend", function(){ this.remove(); });
    host.appendChild(el);
  }
}
var lastTrail = 0;
document.addEventListener("pointermove", function(e){
  if(reduced || e.pointerType !== "mouse") return;
  var n = performance.now(); if(n - lastTrail < 70) return; lastTrail = n;
  spawnFx(e.clientX, e.clientY, 1, false);
});
document.addEventListener("pointerdown", function(e){
  if(reduced) return;
  spawnFx(e.clientX, e.clientY, e.pointerType === "mouse" ? 4 : 6, false);
});

/* gelembung bicara karakter */
function say(art, list){
  var old = art.querySelector(".say"); if(old) old.remove();
  var b = document.createElement("div"); b.className = "say";
  b.textContent = list[Math.floor(Math.random()*list.length)];
  art.appendChild(b);
  setTimeout(function(){ b.remove(); }, 1900);
}
function wireArt(id, key){
  $(id).addEventListener("click", function(){
    var art = this;
    art.classList.remove("tap"); void art.offsetWidth; art.classList.add("tap");
    say(art, CONFIG.say[key]); buzz(20);
  });
}

/* ================= foto ================= */
var CAM = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
function slot(src, label){
  if(src) return '<div class="slot" data-up="1"><img src="'+esc(src)+'" alt="'+esc(label)+'"></div>';
  return '<div class="slot ph" data-up="1" role="button" tabindex="0" aria-label="Pilih foto untuk '+esc(label)+'">'+CAM+'<span>Pilih foto</span></div>';
}
var picker = document.createElement("input");
picker.type = "file"; picker.accept = "image/*"; picker.hidden = true; picker.setAttribute("aria-hidden","true");
document.body.appendChild(picker);
var pickTarget = null;
document.addEventListener("click", function(e){
  var s = e.target.closest && e.target.closest(".slot");
  if(!s || !s.dataset.up) return;
  if(s.classList.contains("ph") || e.detail === 2){ pickTarget = s; picker.click(); }
});
document.addEventListener("keydown", function(e){
  if((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("ph")){ e.preventDefault(); e.target.click(); }
});
picker.addEventListener("change", function(){
  var f = picker.files && picker.files[0];
  if(f && pickTarget){
    var url = URL.createObjectURL(f);
    pickTarget.classList.remove("ph"); pickTarget.removeAttribute("role"); pickTarget.removeAttribute("tabindex");
    pickTarget.innerHTML = '<img src="'+url+'" alt="Fotomu">';
    var r = pickTarget.getBoundingClientRect(); spawnFx(r.left + r.width/2, r.top + r.height/2, 8, true);
  }
  picker.value = "";
});

/* ================= layar ================= */
function show(id){
  stage = id;
  screens.forEach(function(s){ $("s-"+s).hidden = (s !== id); });
  window.scrollTo(0,0);
  manageRain();
  if(id !== "song") stopPlayer();
  if(id === "gifts") updateGifts();
  if(id === "anniv"){ renderCounter(); startAnnivLetter(); } else { stopTyping(); }
  if(id === "bloom") resetBloom();
  var h = $("s-"+id).querySelector("h1,h2");
  if(h){ h.tabIndex = -1; try{ h.focus({preventScroll:true}); }catch(e){} }
}
document.addEventListener("click", function(e){
  var b = e.target.closest && e.target.closest("[data-back]");
  if(b) show("gifts");
});

/* ---- tanya / marah ---- */
function setupAsk(){
  $("askTitle").textContent = CONFIG.ask.title;
  $("yes").textContent = CONFIG.ask.yes; $("no").textContent = CONFIG.ask.no;
  $("askArt").innerHTML = askArt();
  $("angryArt").innerHTML = angryArt();
  $("again").textContent = CONFIG.again;
  wireArt("askArt","ask"); wireArt("angryArt","angry"); wireArt("gateArt","gate");
}
$("no").addEventListener("click", function(){
  noRound++;
  $("angryTitle").textContent = CONFIG.angry[Math.min(noRound-1, CONFIG.angry.length-1)];
  $("yes").style.setProperty("--yes-scale", Math.min(1 + noRound*0.1, 1.5));
  var art = $("angryArt");
  art.style.scale = Math.min(1 + noRound*0.08, 1.35);
  art.innerHTML = angryArt(noRound);
  art.classList.remove("shakeit"); void art.offsetWidth; art.classList.add("shakeit");
  if(noRound >= 4){ $("no").classList.add("gone"); $("askNote").textContent = CONFIG.ask.noGone; }
  buzz(60);
  show("angry");
});
$("again").addEventListener("click", function(){ show("ask"); });
$("yes").addEventListener("click", function(){
  buzz(30);
  if(CONFIG.secretWord){ openGate(); } else { show("gifts"); burst(); }
});

/* ---- kata rahasia ---- */
var codeEl = $("code");
function norm(s){ return String(s).toLowerCase().replace(/[^a-z0-9]/g,""); }
function renderBoxes(popLast){
  var v = codeEl.value, n = Math.max(6, v.length), h = "";
  for(var i=0;i<n;i++){
    var has = i < v.length;
    h += '<span class="bx'+(has?' on':'')+(i===v.length?' cur':'')+((popLast && i===v.length-1)?' pop':'')+'">'+(has?esc(v.charAt(i)):"")+'</span>';
  }
  $("boxes").innerHTML = h;
}
codeEl.addEventListener("input", function(){ renderBoxes(true); $("gateMsg").textContent = ""; });
codeEl.addEventListener("focus", function(){ $("codeWrap").classList.add("focused"); });
codeEl.addEventListener("blur", function(){ $("codeWrap").classList.remove("focused"); });
function openGate(){
  wrongs = 0; hintIdx = 0;
  $("gateTitle").textContent = CONFIG.gate.title;
  $("gateSub").textContent = CONFIG.gate.sub;
  $("gateBtn").textContent = CONFIG.gate.button;
  $("gateArt").innerHTML = gateArt("ask");
  codeEl.value = ""; renderBoxes(false);
  $("gateMsg").textContent = ""; $("hintBox").textContent = "";
  show("gate");
  if(!coarse){ try{ codeEl.focus(); }catch(e){} }
}
$("codeForm").addEventListener("submit", function(e){
  e.preventDefault();
  var v = norm(codeEl.value), msg = $("gateMsg"), form = $("codeForm");
  var bad = function(text){
    msg.textContent = text;
    form.classList.remove("wrong"); void form.offsetWidth; form.classList.add("wrong");
    buzz(80);
  };
  if(!v){ bad(CONFIG.gate.empty); return; }
  if(v === norm(CONFIG.secretWord)){
    msg.textContent = ""; $("gateArt").innerHTML = gateArt("right"); burst(); buzz([40,40,80]);
    codeEl.blur();
    setTimeout(function(){ show("gifts"); }, reduced ? 0 : 1100);
    return;
  }
  wrongs++;
  bad(CONFIG.gate.wrong[Math.min(wrongs-1, CONFIG.gate.wrong.length-1)]);
  $("gateArt").innerHTML = gateArt("wrong");
  codeEl.select();
});
$("hintBtn").addEventListener("click", function(){
  var hints = CONFIG.gate.hints;
  if(hintIdx < hints.length) hintIdx++;
  $("hintBox").textContent = hints.slice(0, hintIdx).join(" ") + (hintIdx >= hints.length ? " " + CONFIG.gate.hintsDone : "");
});

/* ---- hadiah ---- */
function setupGifts(){
  $("giftsTitle").textContent = CONFIG.gifts.title;
  var host = $("gifts"); host.innerHTML = "";
  GIFT_PAGES.forEach(function(page, i){
    var b = document.createElement("button");
    b.type = "button"; b.className = "gift"; b.style.setProperty("--i", i); b.setAttribute("aria-label", CONFIG.gifts.labels[i]);
    b.innerHTML = giftArt(i);
    b.addEventListener("click", function(){
      visited[page] = true; b.classList.add("done");
      b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
      var r = b.getBoundingClientRect(); spawnFx(r.left + r.width/2, r.top + r.height/2, 10, true);
      burst(); buzz(40);
      setTimeout(function(){ show(page); }, reduced ? 0 : 480);
    });
    host.appendChild(b);
  });
}
function updateGifts(){
  var n = GIFT_PAGES.filter(function(p){ return visited[p]; }).length, all = n === GIFT_PAGES.length;
  $("giftNote").textContent = all ? CONFIG.gifts.done : CONFIG.gifts.note + " (" + n + "/" + GIFT_PAGES.length + ")";
  $("replay").hidden = !all;
  $("replay").textContent = CONFIG.gifts.replay;
  Array.prototype.forEach.call($("gifts").children, function(b, i){ b.classList.toggle("done", !!visited[GIFT_PAGES[i]]); });
}
$("replay").addEventListener("click", function(){
  visited = {}; noRound = 0; wrongs = 0; hintIdx = 0; hugCount = 0;
  $("no").classList.remove("gone"); $("askNote").textContent = "";
  $("yes").style.setProperty("--yes-scale", 1);
  $("angryArt").style.scale = 1;
  show("ask");
});

/* ---- halaman lagu ---- */
var PLAY_ICON = '<svg viewBox="0 0 24 24"><path d="M8 5l12 7-12 7z"/></svg>';
var PAUSE_ICON = '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
var PREV_ICON = '<svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>';
var NEXT_ICON = '<svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5l11 7L4 19z"/></svg>';
var player = {on:false, t:0, dur:236, timer:0};
function fmt(s){ s = Math.max(0, Math.round(s)); return Math.floor(s/60) + ":" + ("0" + (s%60)).slice(-2); }
function updPlayer(){
  var f = $("scFill"); if(!f) return;
  f.style.width = (player.t/player.dur*100) + "%";
  $("scNow").textContent = fmt(player.t); $("scLeft").textContent = "-" + fmt(player.dur - player.t);
  $("scPlay").innerHTML = player.on ? PAUSE_ICON : PLAY_ICON;
  $("scPlay").setAttribute("aria-label", player.on ? "Jeda" : "Putar");
  $("songCard").classList.toggle("playing", player.on);
}
function stopPlayer(){ if(bgm && !bgmFailed){ syncMusic(); return; } player.on = false; clearInterval(player.timer); updPlayer(); }
function seekTo(sec){
  sec = Math.max(0, Math.min(player.dur - 1, sec));
  if(bgm && !bgmFailed){ bgm.currentTime = sec; syncMusic(); } else { player.t = sec; updPlayer(); }
}
function renderSong(){
  var S = CONFIG.song, P = CONFIG.photos.song;
  var dm = /^(\d+):(\d{2})$/.exec(S.duration || "");
  player.dur = dm ? (+dm[1])*60 + (+dm[2]) : 236;
  player.t = Math.round(player.dur * 0.4);
  var bars = ""; for(var i=0;i<30;i++){ bars += '<span style="height:'+Math.round(6 + Math.abs(Math.sin(i*1.7))*18)+'px"></span>'; }
  $("songMount").innerHTML =
    '<div class="songcard" id="songCard">' +
      '<div class="sc-photos"><div class="p1">'+slot(P[0],"Foto 1")+'</div><div class="p2">'+slot(P[1],"Foto 2")+'</div><div class="p3">'+slot(P[2],"Foto 3")+'</div></div>' +
      '<div class="sc-title">'+esc(S.title)+'</div>' +
      '<div class="sc-meta"><b>'+esc(S.name)+'</b><span>'+esc(S.artist)+'</span></div>' +
      '<div class="sc-seek" id="scSeek" role="slider" tabindex="0" aria-label="Posisi lagu" aria-valuemin="0" aria-valuemax="100"><div class="sc-bar"><i id="scFill"></i></div></div>' +
      '<div class="sc-times"><span id="scNow">0:00</span><span id="scLeft">-0:00</span></div>' +
      '<div class="sc-ctl"><button class="sc-btn" id="scPrev" type="button" aria-label="Ulang dari awal">'+PREV_ICON+'</button>' +
      '<button class="sc-btn main" id="scPlay" type="button"></button>' +
      '<button class="sc-btn" id="scNext" type="button" aria-label="Maju 15 detik">'+NEXT_ICON+'</button></div>' +
      '<div class="wave" aria-hidden="true">'+bars+'</div>' +
      (S.url ? '<a class="songlink" href="'+esc(S.url)+'" target="_blank" rel="noopener">Dengarkan lagunya</a>' : '') +
    '</div>';
  $("scPlay").addEventListener("click", function(){
    if(bgm && !bgmFailed){
      musicStarted = true;
      if(bgm.paused){ var pr = bgm.play(); if(pr && pr.catch) pr.catch(function(){}); } else { bgm.pause(); }
      syncMusic(); return;
    }
    if(player.on){ stopPlayer(); return; }
    player.on = true;
    player.timer = setInterval(function(){
      player.t += 1;
      if(player.t >= player.dur){ player.t = 0; stopPlayer(); return; }
      updPlayer();
    }, 1000);
    updPlayer();
  });
  $("scPrev").addEventListener("click", function(){ seekTo(0); });
  $("scNext").addEventListener("click", function(){ seekTo(player.t + 15); });

  /* geser atau ketuk bar untuk loncat ke bagian lagu */
  var seek = $("scSeek"), dragging = false;
  var fromEvent = function(e){
    var r = seek.getBoundingClientRect();
    seekTo(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * player.dur);
  };
  seek.addEventListener("pointerdown", function(e){ dragging = true; try{ seek.setPointerCapture(e.pointerId); }catch(err){} fromEvent(e); });
  seek.addEventListener("pointermove", function(e){ if(dragging) fromEvent(e); });
  seek.addEventListener("pointerup", function(){ dragging = false; });
  seek.addEventListener("pointercancel", function(){ dragging = false; });
  seek.addEventListener("keydown", function(e){
    if(e.key === "ArrowRight"){ e.preventDefault(); seekTo(player.t + 5); }
    if(e.key === "ArrowLeft"){ e.preventDefault(); seekTo(player.t - 5); }
  });
  updPlayer(); syncMusic();

  var L = CONFIG.letterSong;
  $("songLetter").innerHTML = '<h2>'+esc(L.title)+'</h2>' + L.paras.map(function(p){ return '<p>'+esc(p)+'</p>'; }).join("");
  addDeco($("songWrap"), [
    {t:"spark", l:"3%", tp:"-2%", s:18}, {t:"note", l:"58%", tp:"6%", s:26}, {t:"star", l:"92%", tp:"58%", s:30},
    {t:"spark", l:"46%", tp:"70%", s:16}, {t:"star", l:"34%", tp:"98%", s:44}, {t:"note", l:"90%", tp:"90%", s:26}
  ]);
}

/* ---- scrapbook ---- */
function collageStickers(){
  return [
    {svg:stk("c1"),  w:"19%", l:"1%",  t:"0%",  rot:-8},
    {svg:stk("c2"),  w:"23%", l:"78%",  t:"-6%",  rot:8},
    {svg:stk("c7"),  w:"26%", l:"37%",  t:"-3%",  rot:-3},
    {svg:stk("c6"),  w:"21%", l:"0%",  t:"27%",  rot:7},
    {svg:stk("c3"),  w:"22%", l:"40%",  t:"30%",  rot:-5},
    {svg:stk("c8"),  w:"23%", l:"0%",  t:"56%",  rot:6},
    {svg:flowerSVG("#ff7aa8"), w:"13%", l:"85%", t:"58%", rot:12},
    {svg:stk("c4"),  w:"22%", l:"68%",  t:"56%",  rot:-6},
    {svg:flowerSVG("#ffd23f"), w:"11%", l:"16%", t:"94%", rot:-14},
    {svg:stk("c5"),  w:"17%", l:"1%",   t:"86%",  rot:-6},
    {svg:stk("c10"), w:"24%", l:"34%",  t:"89%",  rot:4},
    {svg:stk("c9"),  w:"21%", l:"76%",  t:"88%",  rot:-5},
    {svg:stk("c11"), w:"22%", l:"58%",  t:"31%",  rot:7}
  ];
}
function renderCollage(){
  $("scrapTitle").textContent = CONFIG.scrapTitle;
  var P = CONFIG.photos.collage, Q = CONFIG.photos.social, S = CONFIG.social;
  var initial = (S.name || "?").charAt(0).toUpperCase();
  var host = $("collage");
  host.innerHTML =
    '<div class="c-photo" style="--rot:-2.5deg"><div class="box">'+slot(P[0],"Foto kenangan 1")+'</div></div>' +
    '<div class="c-photo" style="--rot:2deg"><div class="box">'+slot(P[1],"Foto kenangan 2")+'</div></div>' +
    '<div class="post">' +
      '<div class="post-head"><span class="avatar">'+esc(initial)+'</span><div><b>'+esc(S.name)+'</b><span>'+esc(S.handle)+'</span></div></div>' +
      '<p>'+esc(S.text)+'</p>' +
      '<div class="post-pics"><div class="box">'+slot(Q[0],"Foto postingan 1")+'</div><div class="box">'+slot(Q[1],"Foto postingan 2")+'</div></div>' +
      '<div class="post-foot"><span>'+esc(S.time)+'</span><svg id="likeHeart" viewBox="0 0 7 6" shape-rendering="crispEdges" aria-hidden="true"><path d="M1 0h2v1H1zM4 0h2v1H4zM0 1h7v2H0zM1 3h5v1H1zM2 4h3v1H2zM3 5h1v1H3z"/></svg></div>' +
    '</div>' +
    '<div class="c-photo sq" style="--rot:1.5deg"><div class="box">'+slot(P[2],"Foto kenangan 3")+'</div></div>' +
    '<div class="c-photo sq" style="--rot:-2deg"><div class="box">'+slot(P[3],"Foto kenangan 4")+'</div></div>';
  addStickers(host, collageStickers());
  $("likeHeart").addEventListener("click", function(e){ spawnFx(e.clientX, e.clientY, 8, true); buzz(20); });
}
function stickersIn(host){ return Array.prototype.slice.call(host.querySelectorAll(".sticker")); }
$("shuffleBtn").addEventListener("click", function(){
  stickersIn($("collage")).forEach(function(el){
    el.classList.add("moving");
    el._x = 0; el._y = 0; el.style.translate = "0px 0px";
    el.style.right = "auto"; el.style.bottom = "auto";
    el.style.left = rnd(0,76) + "%"; el.style.top = rnd(-4,90) + "%";
    setTimeout(function(){ el.classList.remove("moving"); }, 700);
  });
});
$("addBtn").addEventListener("click", function(){
  var host = $("collage");
  if(stickersIn(host).length > 28) return;
  addStickers(host, [{svg:flowerSVG(FLOWER_COLORS[Math.floor(Math.random()*FLOWER_COLORS.length)]), w:rnd(9,15).toFixed(1)+"%", l:rnd(25,60).toFixed(0)+"%", t:rnd(20,60).toFixed(0)+"%", rot:Math.round(rnd(-20,20))}]);
  buzz(15);
});
$("resetBtn").addEventListener("click", function(){
  var host = $("collage");
  stickersIn(host).forEach(function(el){ el.remove(); });
  addStickers(host, collageStickers());
});

/* ---- halaman surat ---- */
var typeTimer = 0, typeDone = true;
function stopTyping(){ clearTimeout(typeTimer); }
function renderAnniv(){
  var L = CONFIG.letterAnniv, P = CONFIG.photos;
  $("polaroid").innerHTML = '<div class="box">'+slot(P.polaroid,"Foto")+'</div><figcaption>'+esc(L.polaroidCaption)+'</figcaption>';
  $("hug").textContent = L.hug;
  $("polaroid").addEventListener("click", function(){
    var p = this; p.classList.add("wob"); setTimeout(function(){ p.classList.remove("wob"); }, 450);
    var r = p.getBoundingClientRect(); spawnFx(r.left + r.width/2, r.top + 10, 5, false);
  });
  addStickers($("annivSide"), [{svg:buffArt(), w:"165px", r:"6px", b:"-16px", rot:-4}]);
  addDeco($("annivWrap"), [
    {t:"star", l:"88%", tp:"-3%", s:46}, {t:"spark", l:"96%", tp:"20%", s:18}, {t:"spark", l:"-2%", tp:"40%", s:16},
    {t:"star", l:"40%", tp:"100%", s:40}, {t:"spark", l:"70%", tp:"72%", s:18}
  ]);
}
/* surat diketik pelan-pelan; ketuk untuk langsung membaca semuanya */
function startAnnivLetter(){
  stopTyping();
  var L = CONFIG.letterAnniv, host = $("annivLetter");
  var items = [{tag:"h2", text:L.title}].concat(L.paras.map(function(p){ return {tag:"p", text:p}; })).concat([{tag:"p", cls:"sign", text:L.sign}]);
  host.innerHTML = "";
  var els = items.map(function(it){ var e = document.createElement(it.tag); if(it.cls) e.className = it.cls; host.appendChild(e); return e; });
  $("hugWrap").hidden = true; $("hugNote").textContent = "";
  var i = 0, j = 0; typeDone = false;
  var finish = function(){
    typeDone = true; stopTyping();
    items.forEach(function(it, k){ els[k].textContent = it.text; els[k].classList.remove("caret"); });
    host.classList.remove("typing"); $("skipHint").hidden = true; $("hugWrap").hidden = false;
  };
  host.onclick = function(){ if(!typeDone) finish(); };
  if(reduced){ finish(); return; }
  host.classList.add("typing"); $("skipHint").hidden = false;
  (function tick(){
    if(i >= items.length){ finish(); return; }
    var it = items[i], el = els[i];
    el.classList.add("caret");
    j++; el.textContent = it.text.slice(0, j);
    if(j >= it.text.length){ el.classList.remove("caret"); i++; j = 0; typeTimer = setTimeout(tick, 320); }
    else { typeTimer = setTimeout(tick, it.tag === "h2" ? 40 : 18); }
  })();
}
$("hug").addEventListener("click", function(e){
  var r = this.getBoundingClientRect();
  spawnFx(r.left + r.width/2, r.top, 22, true); burst(); buzz([30,30,60]);
  var N = CONFIG.letterAnniv.hugNote;
  $("hugNote").textContent = N[Math.min(hugCount, N.length-1)];
  hugCount++;
});
var countAnim = 0;
function parseAnniv(){
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(CONFIG.anniversary || "");
  return m ? {y:+m[1], m:+m[2], d:+m[3]} : null;
}
function renderCounter(){
  var A = parseAnniv(), box = $("annivCount");
  if(!A){ box.hidden = true; return; }
  box.hidden = false;
  var now = new Date(), ty = now.getFullYear(), tm = now.getMonth(), td = now.getDate();
  var days = Math.round((Date.UTC(ty,tm,td) - Date.UTC(A.y, A.m-1, A.d)) / 86400000);
  var num = $("cNum");
  if(days < 0){
    num.textContent = String(-days); $("cUnit").textContent = "hari lagi"; $("cYmd").textContent = "Hitung mundur menuju hari jadian.";
    return;
  }
  var yy = ty - A.y, mm = tm - (A.m-1), dd = td - A.d;
  if(dd < 0){ mm--; dd += new Date(ty, tm, 0).getDate(); }
  if(mm < 0){ yy--; mm += 12; }
  $("cUnit").textContent = "hari bersama";
  $("cYmd").textContent = yy + " tahun, " + mm + " bulan, " + dd + " hari";
  cancelAnimationFrame(countAnim);
  if(reduced){ num.textContent = String(days); return; }
  var t0 = null;
  var step = function(ts){
    if(t0 === null) t0 = ts;
    var p = Math.min(1, (ts - t0) / 1500), ease = 1 - Math.pow(1 - p, 3);
    num.textContent = String(Math.round(days * ease));
    if(p < 1) countAnim = requestAnimationFrame(step);
  };
  countAnim = requestAnimationFrame(step);
}

/* ---- bunga ---- */
var bloomOpen = false, bloomTimer = 0;
function buildFlower(){
  var s = '<g id="plant">';
  s += '<path class="stem" pathLength="1" d="M150 408 C146 340 160 280 150 200" fill="none" stroke="var(--stem)" stroke-width="9" stroke-linecap="round"/>';
  s += '<path class="leaf" style="animation-delay:.5s" d="M150 330 C112 326 84 302 76 270 C112 270 142 292 150 330Z" fill="var(--leaf)"/>';
  s += '<path class="leaf r" style="animation-delay:.7s" d="M150 290 C188 286 216 262 224 230 C188 230 158 252 150 290Z" fill="var(--leaf)"/>';
  var big = 'M0 0 C-34 -22 -38 -92 0 -128 C38 -92 34 -22 0 0Z';
  var mid = 'M0 0 C-26 -16 -30 -70 0 -98 C30 -70 26 -16 0 0Z';
  var sm = 'M0 0 C-18 -12 -20 -46 0 -66 C20 -46 18 -12 0 0Z';
  var i;
  for(i=0;i<10;i++) s += '<g transform="translate(150 150) rotate('+(i*36)+')"><path class="petal" style="animation-delay:'+(0.25+i*0.07).toFixed(2)+'s" d="'+big+'" fill="var(--petal-a)" stroke="var(--petal-b)" stroke-width="1.5"/></g>';
  for(i=0;i<8;i++) s += '<g transform="translate(150 150) rotate('+(i*45+22)+')"><path class="petal" style="animation-delay:'+(0.45+i*0.07).toFixed(2)+'s" d="'+mid+'" fill="var(--petal-b)" stroke="var(--petal-c)" stroke-width="1.5"/></g>';
  for(i=0;i<6;i++) s += '<g transform="translate(150 150) rotate('+(i*60)+')"><path class="petal" style="animation-delay:'+(0.65+i*0.07).toFixed(2)+'s" d="'+sm+'" fill="var(--petal-c)"/></g>';
  s += '<g class="core"><circle cx="150" cy="150" r="21" fill="var(--core)"/>';
  for(i=0;i<9;i++){
    var r = i % 2 ? 9 : 14, t = i * 40 * Math.PI / 180;
    s += '<circle cx="'+(150 + r*Math.cos(t)).toFixed(1)+'" cy="'+(150 + r*Math.sin(t)).toFixed(1)+'" r="2.2" fill="var(--core-dot)"/>';
  }
  s += '</g>';
  s += '<g class="bud"><path d="M150 100 C182 126 182 172 150 198 C118 172 118 126 150 100Z" fill="var(--petal-b)" stroke="var(--petal-c)" stroke-width="2"/>' +
       '<path d="M150 112 C160 134 160 166 150 186" fill="none" stroke="var(--petal-a)" stroke-width="3" opacity=".7"/>' +
       '<path d="M118 190 C112 168 126 150 146 170 C140 180 130 188 118 190Z" fill="var(--leaf)"/>' +
       '<path d="M182 190 C188 168 174 150 154 170 C160 180 170 188 182 190Z" fill="var(--leaf)"/></g>';
  return s + '</g>';
}
function resetBloom(){
  clearTimeout(bloomTimer); bloomOpen = false;
  var svg = $("flowerSvg");
  svg.innerHTML = buildFlower(); svg.classList.remove("open");
  $("bloomText").hidden = true;
  $("bloomHint").textContent = CONFIG.bloom.hint;
  $("flowerBtn").setAttribute("aria-label", "Sentuh kuncup bunga");
}
$("flowerBtn").addEventListener("click", function(e){
  if(!bloomOpen){
    bloomOpen = true;
    $("flowerSvg").classList.add("open");
    $("bloomHint").textContent = "";
    $("flowerBtn").setAttribute("aria-label", "Sentuh bunga lagi");
    burst(); buzz([30,40,60]);
    bloomTimer = setTimeout(function(){
      $("bloomText").hidden = false; $("bloomHint").textContent = CONFIG.bloom.more;
    }, reduced ? 0 : 2300);
  } else {
    spawnFx(e.clientX, e.clientY, 16, true); buzz(25);
  }
});

/* ================= bunga berjatuhan ================= */
var sky = $("sky");
function spawnRain(){
  if(reduced) return;
  if(sky.querySelectorAll(".rain").length > 16) return;
  var el = document.createElement("span"), sz = rnd(18,32);
  el.className = "rain"; el.innerHTML = flowerSVG(FLOWER_COLORS[Math.floor(Math.random()*FLOWER_COLORS.length)]);
  el.style.left = rnd(0,96) + "vw"; el.style.width = sz + "px"; el.style.height = sz + "px";
  el.style.setProperty("--dur", rnd(8,13) + "s");
  el.addEventListener("animationend", function(){ el.remove(); });
  sky.appendChild(el);
}
function manageRain(){
  var on = ["gifts","song","collage","anniv","bloom"].indexOf(stage) > -1 && !reduced;
  if(on && !rainTimer){ rainTimer = setInterval(spawnRain, 1000); spawnRain(); }
  if(!on && rainTimer){ clearInterval(rainTimer); rainTimer = 0; sky.innerHTML = ""; }
}

/* ================= konfeti ================= */
var cv = $("confetti"), ctx = cv.getContext("2d"), parts = [], raf = 0;
var COLORS = ["#d65353","#ffb703","#4cc9f0","#7b5cff","#3fae5a","#ff8fab"];
function size(){ var d = window.devicePixelRatio||1; cv.width = window.innerWidth*d; cv.height = window.innerHeight*d; }
window.addEventListener("resize", size); size();
function burst(){
  if(reduced) return;
  var d = window.devicePixelRatio||1;
  for(var i=0;i<110;i++){
    parts.push({x:cv.width/2, y:cv.height*0.45, vx:(Math.random()-0.5)*16*d, vy:(-Math.random()*13-4)*d,
      s:(6+Math.random()*7)*d, r:Math.random()*6, vr:(Math.random()-0.5)*0.4, c:COLORS[i%COLORS.length], life:0});
  }
  if(!raf) raf = requestAnimationFrame(tick);
}
function tick(){
  ctx.clearRect(0,0,cv.width,cv.height);
  var d = window.devicePixelRatio||1;
  parts = parts.filter(function(p){ return p.y < cv.height+40 && p.life < 240; });
  parts.forEach(function(p){
    p.vy += 0.38*d; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s/2,-p.s/3,p.s,p.s*0.6); ctx.restore();
  });
  if(parts.length){ raf = requestAnimationFrame(tick); } else { raf = 0; ctx.clearRect(0,0,cv.width,cv.height); }
}

/* ================= mulai ================= */
setupAsk(); setupGifts(); renderSong(); renderCollage(); renderAnniv(); renderBoxes(false);
