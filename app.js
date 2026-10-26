/* Prayer Times — calculated on the device with adhan.js; the location never leaves the page. */
(function () {
  "use strict";
  var $ = S3.$, $$ = S3.$$, A = window.adhan;
  var KEYS = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
  var DEVICE_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  var STR = {
    en: { title: "Prayer Times", intro: "Prayer times for your city or exact location, calculated on your device. Your location never leaves this page.",
      city: "City", method: "Calculation method", asr: "Asr", shafi: "Standard (Shafi'i, Maliki, Hanbali)", hanafi: "Hanafi", useLoc: "Use my location",
      lat: "Latitude", lon: "Longitude", tz: "Time zone", today: "Today", nextPrayer: "Next prayer", monthly: "Monthly timetable", month: "Month", print: "Print",
      custom: "Custom location", myLoc: "My location", date: "Date", hijri: "Hijri", in: "in", tomorrow: "tomorrow",
      fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr_: "Asr", maghrib: "Maghrib", isha: "Isha",
      geoNo: "Location isn't available in this browser", geoDenied: "Location permission was denied. Pick a city or type coordinates.", geoOk: "Using your location (kept on this device)",
      badCoords: "Latitude must be −90 to 90 and longitude −180 to 180", note: "Method: {m}. Asr: {a}. Times are for {tz}." },
    ar: { title: "مواقيت الصلاة", intro: "مواقيت الصلاة لمدينتك أو لموقعك الدقيق، تُحسب على جهازك. موقعك لا يغادر هذه الصفحة.",
      city: "المدينة", method: "طريقة الحساب", asr: "العصر", shafi: "الجمهور (شافعي، مالكي، حنبلي)", hanafi: "حنفي", useLoc: "استخدم موقعي",
      lat: "خط العرض", lon: "خط الطول", tz: "المنطقة الزمنية", today: "اليوم", nextPrayer: "الصلاة القادمة", monthly: "جدول الشهر", month: "الشهر", print: "طباعة",
      custom: "موقع مخصص", myLoc: "موقعي", date: "التاريخ", hijri: "هجري", in: "بعد", tomorrow: "غدًا",
      fajr: "الفجر", sunrise: "الشروق", dhuhr: "الظهر", asr_: "العصر", maghrib: "المغرب", isha: "العشاء",
      geoNo: "تحديد الموقع غير متاح في هذا المتصفح", geoDenied: "تم رفض إذن الموقع. اختر مدينة أو أدخل الإحداثيات.", geoOk: "يتم استخدام موقعك (يبقى على هذا الجهاز)",
      badCoords: "خط العرض بين −90 و90 وخط الطول بين −180 و180", note: "الطريقة: {m}. العصر: {a}. الأوقات حسب توقيت {tz}." }
  };
  // Jordan: Ministry of Awqaf parameters (Fajr 18°, Isha 18°, Maghrib 5 minutes after sunset).
  var METHODS = {
    jordan: { en: "Jordan (Awqaf: 18°/18°, Maghrib +5 min)", ar: "الأردن (الأوقاف: 18°/18°، المغرب +5 د)", make: function () { var p = A.CalculationMethod.Other(); p.fajrAngle = 18; p.ishaAngle = 18; p.methodAdjustments = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 5, isha: 0 }; return p; } },
    mwl: { en: "Muslim World League", ar: "رابطة العالم الإسلامي", make: function () { return A.CalculationMethod.MuslimWorldLeague(); } },
    ummalqura: { en: "Umm al-Qura (Makkah)", ar: "أم القرى (مكة)", make: function () { return A.CalculationMethod.UmmAlQura(); } },
    egyptian: { en: "Egyptian General Authority", ar: "الهيئة المصرية العامة للمساحة", make: function () { return A.CalculationMethod.Egyptian(); } },
    isna: { en: "ISNA (North America)", ar: "الجمعية الإسلامية لأمريكا الشمالية", make: function () { return A.CalculationMethod.NorthAmerica(); } },
    karachi: { en: "University of Islamic Sciences, Karachi", ar: "جامعة العلوم الإسلامية، كراتشي", make: function () { return A.CalculationMethod.Karachi(); } },
    dubai: { en: "Dubai", ar: "دبي", make: function () { return A.CalculationMethod.Dubai(); } },
    kuwait: { en: "Kuwait", ar: "الكويت", make: function () { return A.CalculationMethod.Kuwait(); } },
    qatar: { en: "Qatar", ar: "قطر", make: function () { return A.CalculationMethod.Qatar(); } },
    turkey: { en: "Turkey (Diyanet)", ar: "تركيا (ديانت)", make: function () { return A.CalculationMethod.Turkey(); } },
    singapore: { en: "Singapore / Malaysia / Indonesia", ar: "سنغافورة / ماليزيا / إندونيسيا", make: function () { return A.CalculationMethod.Singapore(); } },
    tehran: { en: "Institute of Geophysics, Tehran", ar: "معهد الجيوفيزياء، طهران", make: function () { return A.CalculationMethod.Tehran(); } },
    moonsighting: { en: "Moonsighting Committee", ar: "لجنة رؤية الهلال", make: function () { return A.CalculationMethod.MoonsightingCommittee(); } }
  };
  var CITIES = [
    ["amman", "Amman", "عمّان", 31.9539, 35.9106, "Asia/Amman", "jordan"], ["irbid", "Irbid", "إربد", 32.5556, 35.85, "Asia/Amman", "jordan"],
    ["zarqa", "Zarqa", "الزرقاء", 32.0728, 36.088, "Asia/Amman", "jordan"], ["aqaba", "Aqaba", "العقبة", 29.5321, 35.0063, "Asia/Amman", "jordan"],
    ["mecca", "Mecca", "مكة المكرمة", 21.4225, 39.8262, "Asia/Riyadh", "ummalqura"], ["medina", "Medina", "المدينة المنورة", 24.4686, 39.6142, "Asia/Riyadh", "ummalqura"],
    ["riyadh", "Riyadh", "الرياض", 24.7136, 46.6753, "Asia/Riyadh", "ummalqura"], ["jeddah", "Jeddah", "جدة", 21.4858, 39.1925, "Asia/Riyadh", "ummalqura"],
    ["jerusalem", "Jerusalem", "القدس", 31.7683, 35.2137, "Asia/Jerusalem", "mwl"], ["gaza", "Gaza", "غزة", 31.5017, 34.4668, "Asia/Gaza", "mwl"],
    ["damascus", "Damascus", "دمشق", 33.5138, 36.2765, "Asia/Damascus", "mwl"], ["beirut", "Beirut", "بيروت", 33.8938, 35.5018, "Asia/Beirut", "mwl"],
    ["baghdad", "Baghdad", "بغداد", 33.3152, 44.3661, "Asia/Baghdad", "mwl"], ["cairo", "Cairo", "القاهرة", 30.0444, 31.2357, "Africa/Cairo", "egyptian"],
    ["alexandria", "Alexandria", "الإسكندرية", 31.2001, 29.9187, "Africa/Cairo", "egyptian"], ["dubai", "Dubai", "دبي", 25.2048, 55.2708, "Asia/Dubai", "dubai"],
    ["abudhabi", "Abu Dhabi", "أبوظبي", 24.4539, 54.3773, "Asia/Dubai", "dubai"], ["doha", "Doha", "الدوحة", 25.2854, 51.531, "Asia/Qatar", "qatar"],
    ["kuwait", "Kuwait City", "مدينة الكويت", 29.3759, 47.9774, "Asia/Kuwait", "kuwait"], ["manama", "Manama", "المنامة", 26.2285, 50.586, "Asia/Bahrain", "mwl"],
    ["muscat", "Muscat", "مسقط", 23.588, 58.3829, "Asia/Muscat", "mwl"], ["istanbul", "Istanbul", "إسطنبول", 41.0082, 28.9784, "Europe/Istanbul", "turkey"],
    ["casablanca", "Casablanca", "الدار البيضاء", 33.5731, -7.5898, "Africa/Casablanca", "mwl"], ["tunis", "Tunis", "تونس", 36.8065, 10.1815, "Africa/Tunis", "mwl"],
    ["algiers", "Algiers", "الجزائر", 36.7538, 3.0588, "Africa/Algiers", "mwl"], ["khartoum", "Khartoum", "الخرطوم", 15.5007, 32.5599, "Africa/Khartoum", "egyptian"],
    ["karachi", "Karachi", "كراتشي", 24.8607, 67.0011, "Asia/Karachi", "karachi"], ["lahore", "Lahore", "لاهور", 31.5204, 74.3587, "Asia/Karachi", "karachi"],
    ["dhaka", "Dhaka", "دكا", 23.8103, 90.4125, "Asia/Dhaka", "karachi"], ["delhi", "Delhi", "دلهي", 28.6139, 77.209, "Asia/Kolkata", "karachi"],
    ["kualalumpur", "Kuala Lumpur", "كوالالمبور", 3.139, 101.6869, "Asia/Kuala_Lumpur", "singapore"], ["jakarta", "Jakarta", "جاكرتا", -6.2088, 106.8456, "Asia/Jakarta", "singapore"],
    ["tehran", "Tehran", "طهران", 35.6892, 51.389, "Asia/Tehran", "tehran"], ["london", "London", "لندن", 51.5074, -0.1278, "Europe/London", "mwl"],
    ["paris", "Paris", "باريس", 48.8566, 2.3522, "Europe/Paris", "mwl"], ["berlin", "Berlin", "برلين", 52.52, 13.405, "Europe/Berlin", "mwl"],
    ["newyork", "New York", "نيويورك", 40.7128, -74.006, "America/New_York", "isna"], ["chicago", "Chicago", "شيكاغو", 41.8781, -87.6298, "America/Chicago", "isna"],
    ["toronto", "Toronto", "تورنتو", 43.6532, -79.3832, "America/Toronto", "isna"], ["losangeles", "Los Angeles", "لوس أنجلوس", 34.0522, -118.2437, "America/Los_Angeles", "isna"],
    ["sydney", "Sydney", "سيدني", -33.8688, 151.2093, "Australia/Sydney", "mwl"]
  ].map(function (c) { return { id: c[0], en: c[1], ar: c[2], lat: c[3], lon: c[4], tz: c[5], method: c[6] }; });

  var saved = S3.store("pt.settings") || {};
  var st = {
    lang: saved.lang === "ar" || (!saved.lang && /^ar/i.test(navigator.language || "")) ? "ar" : "en",
    city: saved.city || "amman", lat: +saved.lat || 31.9539, lon: +saved.lon || 35.9106, tz: saved.tz || "Asia/Amman", name: saved.name || "",
    method: METHODS[saved.method] ? saved.method : "jordan", madhab: saved.madhab === "hanafi" ? "hanafi" : "shafi", offset: 0
  };
  function save() { S3.store("pt.settings", { lang: st.lang, city: st.city, lat: st.lat, lon: st.lon, tz: st.tz, name: st.name, method: st.method, madhab: st.madhab }); }
  function t(k) { return STR[st.lang][k] || STR.en[k] || k; }
  function loc() { return st.lang === "ar" ? "ar-u-nu-latn" : "en"; }

  // ---------- core ----------
  function params(method, madhab, lat, lon) {
    var p = METHODS[method].make();
    p.madhab = madhab === "hanafi" ? A.Madhab.Hanafi : A.Madhab.Shafi;
    if (Math.abs(lat) > 48) p.highLatitudeRule = A.HighLatitudeRule.recommended(new A.Coordinates(lat, lon));
    return p;
  }
  // y/m/d are the calendar date AT THE LOCATION; adhan only reads the date's year/month/day.
  function compute(lat, lon, y, m, d, method, madhab) {
    var pt = new A.PrayerTimes(new A.Coordinates(lat, lon), new Date(y, m - 1, d), params(method, madhab, lat, lon)), o = {};
    KEYS.forEach(function (k) { o[k] = pt[k]; });
    return o;
  }
  var partFmt = {};
  function ymdIn(tz, date) {
    var f = partFmt[tz] || (partFmt[tz] = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric" })), o = {};
    f.formatToParts(date).forEach(function (p) { o[p.type] = +p.value; });
    return { y: o.year, m: o.month, d: o.day };
  }
  function shiftDay(ymd, n) { var x = new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d + n)); return { y: x.getUTCFullYear(), m: x.getUTCMonth() + 1, d: x.getUTCDate() }; }
  function nextOf(today, tomorrow, now) {
    var order = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
    for (var i = 0; i < order.length; i++) if (today[order[i]] > now) return { key: order[i], time: today[order[i]], tomorrow: false };
    return { key: "fajr", time: tomorrow.fajr, tomorrow: true };
  }
  function hijri(date, tz, opts) {
    try { return new Intl.DateTimeFormat(st.lang === "ar" ? "ar-u-ca-islamic-umalqura-nu-latn" : "en-u-ca-islamic-umalqura", Object.assign({ timeZone: tz }, opts || { day: "numeric", month: "long", year: "numeric" })).format(date); }
    catch (e) { return ""; }
  }
  function fmtTime(d, tz) { return d && !isNaN(d) ? new Intl.DateTimeFormat(loc(), { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(d) : "—"; }
  function hms(ms) { var s = Math.max(0, Math.floor(ms / 1000)); return String(Math.floor(s / 3600)).padStart(2, "0") + ":" + String(Math.floor(s / 60) % 60).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }

  // ---------- UI ----------
  function placeName() { var c = CITIES.filter(function (x) { return x.id === st.city; })[0]; return c ? c[st.lang] : st.name === "my" ? t("myLoc") : t("custom"); }
  function fillSelects() {
    var cs = $("#city"); cs.innerHTML = "";
    cs.appendChild(S3.h("option", { value: "custom", text: st.name === "my" ? t("myLoc") : t("custom") }));
    CITIES.slice().sort(function (a, b) { return a[st.lang].localeCompare(b[st.lang], st.lang); }).forEach(function (c) { cs.appendChild(S3.h("option", { value: c.id, text: c[st.lang] })); });
    cs.value = CITIES.some(function (c) { return c.id === st.city; }) ? st.city : "custom";
    var ms = $("#method"); ms.innerHTML = "";
    Object.keys(METHODS).forEach(function (k) { ms.appendChild(S3.h("option", { value: k, text: METHODS[k][st.lang] })); });
    ms.value = st.method;
    var tzs = $("#tz");
    if (!tzs.options.length) {
      var list = Intl.supportedValuesOf ? Intl.supportedValuesOf("timeZone") : [];
      CITIES.forEach(function (c) { if (list.indexOf(c.tz) < 0) list.push(c.tz); });
      if (list.indexOf(DEVICE_TZ) < 0) list.push(DEVICE_TZ);
      list.sort().forEach(function (z) { tzs.appendChild(S3.h("option", { value: z, text: z.replace(/_/g, " ") })); });
    }
    tzs.value = st.tz;
  }
  function applyLang() {
    var main = $("#main");
    main.dir = st.lang === "ar" ? "rtl" : "ltr"; main.lang = st.lang;
    $$("[data-t]").forEach(function (el) { el.textContent = t(el.dataset.t); });
    $$("#lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === st.lang)); });
    fillSelects(); renderAll();
  }
  function day() { return shiftDay(ymdIn(st.tz, new Date()), st.offset); }
  var cache = null;
  function renderToday() {
    var dd = day(), times = compute(st.lat, st.lon, dd.y, dd.m, dd.d, st.method, st.madhab), noon = new Date(Date.UTC(dd.y, dd.m - 1, dd.d, 12));
    var tdy = ymdIn(st.tz, new Date()), real = compute(st.lat, st.lon, tdy.y, tdy.m, tdy.d, st.method, st.madhab), tmr = shiftDay(tdy, 1);
    cache = { real: real, tomorrow: compute(st.lat, st.lon, tmr.y, tmr.m, tmr.d, st.method, st.madhab) };
    $("#place").textContent = placeName();
    $("#dates").textContent = new Intl.DateTimeFormat(loc(), { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(noon) + " · " + hijri(noon, "UTC");
    var nx = st.offset === 0 ? nextOf(real, cache.tomorrow, new Date()) : null, box = $("#times");
    box.innerHTML = "";
    KEYS.forEach(function (k) {
      var past = st.offset === 0 && times[k] < new Date();
      box.appendChild(S3.h("div", { "class": "pt" + (k === "sunrise" ? " sun" : "") + (nx && !nx.tomorrow && nx.key === k ? " next-p" : past ? " past" : "") }, [
        S3.h("div", { "class": "n", text: t(k === "asr" ? "asr_" : k) }), S3.h("div", { "class": "v", text: fmtTime(times[k], st.tz) })
      ]));
    });
    var p = params(st.method, st.madhab, st.lat, st.lon);
    $("#methodNote").textContent = t("note").replace("{m}", METHODS[st.method][st.lang]).replace("{a}", st.madhab === "hanafi" ? t("hanafi") : t("shafi")).replace("{tz}", st.tz) +
      (p.highLatitudeRule && Math.abs(st.lat) > 48 ? " High-latitude rule: " + p.highLatitudeRule + "." : "");
    tickCountdown();
  }
  function tickCountdown() {
    if (!cache) return;
    var now = new Date();
    var nx = nextOf(cache.real, cache.tomorrow, now);
    if (nx.tomorrow && cache.tomorrow.fajr < now) { renderToday(); return; } // the day rolled over
    $("#nextName").textContent = t(nx.key) + " · " + fmtTime(nx.time, st.tz) + (nx.tomorrow ? " (" + t("tomorrow") + ")" : "");
    $("#countdown").textContent = hms(nx.time - now);
  }
  function renderMonth() {
    var v = $("#month").value.split("-").map(Number), y = v[0], m = v[1];
    if (!y || !m) return;
    var days = new Date(Date.UTC(y, m, 0)).getUTCDate(), tdy = ymdIn(st.tz, new Date()), tbl = $("#table"), rows = [];
    $("#monthTitle").textContent = placeName() + " · " + new Intl.DateTimeFormat(loc(), { timeZone: "UTC", month: "long", year: "numeric" }).format(new Date(Date.UTC(y, m - 1, 15)));
    tbl.innerHTML = "";
    var head = S3.h("tr", null, [S3.h("th", { text: t("date") }), S3.h("th", { text: t("hijri") })].concat(KEYS.map(function (k) { return S3.h("th", { text: t(k === "asr" ? "asr_" : k) }); })));
    tbl.appendChild(S3.h("thead", null, [head]));
    var body = S3.h("tbody");
    for (var d = 1; d <= days; d++) {
      var times = compute(st.lat, st.lon, y, m, d, st.method, st.madhab), noon = new Date(Date.UTC(y, m - 1, d, 12));
      var dateTxt = new Intl.DateTimeFormat(loc(), { timeZone: "UTC", weekday: "short", day: "numeric" }).format(noon);
      var hj = hijri(noon, "UTC", { day: "numeric", month: "short" });
      var row = [dateTxt, hj].concat(KEYS.map(function (k) { return fmtTime(times[k], st.tz); }));
      rows.push([y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0"), hj].concat(row.slice(2)));
      body.appendChild(S3.h("tr", { "class": tdy.y === y && tdy.m === m && tdy.d === d ? "is-today" : "" }, row.map(function (c, i) { return S3.h("td", { "class": i === 1 ? "hj" : "", text: c }); })));
    }
    tbl.appendChild(body);
    renderMonth.rows = rows;
  }
  function renderAll() { renderToday(); renderMonth(); }

  // ---------- wiring ----------
  function setCity(id) {
    var c = CITIES.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    st.city = c.id; st.lat = c.lat; st.lon = c.lon; st.tz = c.tz; st.method = c.method; st.name = "";
    if (c.method === "karachi" && st.madhab !== "hanafi") setMadhab("hanafi", true);
    $("#lat").value = c.lat; $("#lon").value = c.lon; $("#tz").value = c.tz; $("#method").value = c.method;
    save(); renderAll();
  }
  function setMadhab(v, quiet) {
    st.madhab = v;
    $$("#madhab button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === v)); });
    if (!quiet) { save(); renderAll(); }
  }
  function setCoords(lat, lon, tz, name) {
    if (!(isFinite(lat) && isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180)) { S3.toast(t("badCoords"), "error"); return false; }
    st.lat = Math.round(lat * 1e4) / 1e4; st.lon = Math.round(lon * 1e4) / 1e4; st.tz = tz || st.tz; st.city = "custom"; st.name = name || "";
    fillSelects(); $("#lat").value = st.lat; $("#lon").value = st.lon;
    save(); renderAll(); return true;
  }
  $("#city").addEventListener("change", function () { if ($("#city").value !== "custom") setCity($("#city").value); });
  $("#method").addEventListener("change", function () { st.method = $("#method").value; save(); renderAll(); });
  $$("#madhab button").forEach(function (b) { b.addEventListener("click", function () { setMadhab(b.dataset.v); }); });
  ["#lat", "#lon"].forEach(function (id) { $(id).addEventListener("change", function () { setCoords(parseFloat($("#lat").value), parseFloat($("#lon").value), st.tz, ""); }); });
  $("#tz").addEventListener("change", function () { st.tz = $("#tz").value; if (st.city !== "custom") { st.city = "custom"; fillSelects(); } save(); renderAll(); });
  $("#geo").addEventListener("click", function () {
    if (!navigator.geolocation) { S3.toast(t("geoNo"), "error"); return; }
    navigator.geolocation.getCurrentPosition(function (pos) {
      if (setCoords(pos.coords.latitude, pos.coords.longitude, DEVICE_TZ, "my")) { S3.toast(t("geoOk")); S3.done(); }
    }, function () { S3.toast(t("geoDenied"), "error"); }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
  });
  $$("#lang button").forEach(function (b) { b.addEventListener("click", function () { st.lang = b.dataset.v; save(); applyLang(); }); });
  $("#prev").addEventListener("click", function () { st.offset--; renderToday(); });
  $("#next").addEventListener("click", function () { st.offset++; renderToday(); });
  $("#today").addEventListener("click", function () { st.offset = 0; renderToday(); });
  $("#month").addEventListener("change", renderMonth);
  $("#print").addEventListener("click", function () { window.print(); S3.done(); });
  $("#csv").addEventListener("click", function () {
    var rows = renderMonth.rows || [], head = ["date", "hijri"].concat(KEYS);
    var csv = [head].concat(rows).map(function (r) { return r.map(function (c) { return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(","); }).join("\n") + "\n";
    S3.download("﻿" + csv, "prayer-times-" + $("#month").value + ".csv", "text/csv"); S3.done();
  });

  var tdy0 = ymdIn(st.tz, new Date());
  $("#month").value = tdy0.y + "-" + String(tdy0.m).padStart(2, "0");
  $("#lat").value = st.lat; $("#lon").value = st.lon;
  setMadhab(st.madhab, true);
  applyLang();
  setInterval(tickCountdown, 1000);

  window.S3_DEMO = function () { st.lang = "en"; setCity("amman"); setMadhab("shafi"); applyLang(); };

  window.S3_SELFTEST = function () {
    var ok = true;
    // 1. matches adhan called directly
    var mine = compute(31.9539, 35.9106, 2026, 1, 15, "mwl", "shafi");
    var p = A.CalculationMethod.MuslimWorldLeague(); p.madhab = A.Madhab.Shafi;
    var ref = new A.PrayerTimes(new A.Coordinates(31.9539, 35.9106), new Date(2026, 0, 15), p);
    KEYS.forEach(function (k) { if (mine[k].getTime() !== ref[k].getTime()) ok = false; });
    // 2. known value: Amman 15 Jan 2026 (MWL) Dhuhr 09:47 UTC = 12:47 local
    if (mine.dhuhr.toISOString().slice(11, 16) !== "09:47") ok = false;
    // 3. order holds for many places/dates/methods
    [[31.9539, 35.9106, "jordan"], [21.4225, 39.8262, "ummalqura"], [51.5074, -0.1278, "mwl"], [30.0444, 31.2357, "egyptian"], [-33.8688, 151.2093, "mwl"], [40.7128, -74.006, "isna"]].forEach(function (c) {
      [[2026, 1, 15], [2026, 6, 21], [2026, 12, 21]].forEach(function (d) {
        ["shafi", "hanafi"].forEach(function (mh) {
          var x = compute(c[0], c[1], d[0], d[1], d[2], c[2], mh);
          for (var i = 1; i < KEYS.length; i++) if (!(x[KEYS[i - 1]] < x[KEYS[i]])) ok = false;
        });
      });
    });
    // 4. method facts: Umm al-Qura Isha = Maghrib + 90 min; Jordan Maghrib = sunset + 5; Hanafi Asr later
    var mk = compute(21.4225, 39.8262, 2026, 3, 1, "ummalqura", "shafi"); if ((mk.isha - mk.maghrib) !== 90 * 60000) ok = false;
    var jo = compute(31.9539, 35.9106, 2026, 3, 1, "jordan", "shafi"), mw = compute(31.9539, 35.9106, 2026, 3, 1, "mwl", "shafi");
    if (jo.maghrib - mw.maghrib !== 5 * 60000 || !(jo.isha > mw.isha) || !(jo.fajr <= mw.fajr)) ok = false;
    var hn = compute(31.9539, 35.9106, 2026, 3, 1, "jordan", "hanafi"); if (!(hn.asr > jo.asr)) ok = false;
    // 5. next prayer picks the first future one, else tomorrow's Fajr
    var n1 = nextOf(mine, mine, new Date(mine.dhuhr.getTime() + 1000)), n2 = nextOf(mine, { fajr: new Date(1) }, new Date(mine.isha.getTime() + 1000));
    if (n1.key !== "asr" || n2.key !== "fajr" || !n2.tomorrow) ok = false;
    // 6. calendar helpers
    var sd = shiftDay({ y: 2026, m: 12, d: 31 }, 1); if (sd.y !== 2027 || sd.m !== 1 || sd.d !== 1) ok = false;
    var tk = ymdIn("Asia/Tokyo", new Date(Date.UTC(2026, 0, 15, 20))); if (tk.d !== 16) ok = false;
    var hy = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { timeZone: "UTC", year: "numeric" }).formatToParts(new Date(Date.UTC(2026, 0, 15, 12)));
    if (!hy.some(function (q) { return q.type === "year" && /1447/.test(q.value); })) ok = false;
    return ok;
  };
})();
