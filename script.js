/* =========================================================
   Joanne Biju Justus & Paul Daniel Joseph — Wedding Invitation
   ========================================================= */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* =========================================================
     1. AMBIENT PARTICLES — drifting gold dust / petals
     ========================================================= */
  function initParticles() {
    var canvas = document.getElementById("particles");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var width, height, particles;
    var particleCount = window.innerWidth < 640 ? 26 : 46;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function makeParticle() {
      var isPetal = Math.random() < 0.35;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: isPetal ? 3 + Math.random() * 4 : 1 + Math.random() * 2,
        speedY: 0.18 + Math.random() * 0.35,
        speedX: (Math.random() - 0.5) * 0.35,
        drift: Math.random() * Math.PI * 2,
        driftSpeed: 0.004 + Math.random() * 0.01,
        opacity: 0.15 + Math.random() * 0.4,
        petal: isPetal,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.01,
      };
    }

    function init() {
      resize();
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push(makeParticle());
      }
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = "#d8a98f";
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 1.6, p.r * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawDust(p) {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = "#cba24d";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.drift += p.driftSpeed;
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.drift) * 0.3;
        p.rot += p.rotSpeed;

        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x > width + 10) p.x = -10;
        if (p.x < -10) p.x = width + 10;

        if (p.petal) drawPetal(p);
        else drawDust(p);
      }
      requestAnimationFrame(tick);
    }

    window.addEventListener("resize", resize);
    init();

    if (!prefersReducedMotion) {
      requestAnimationFrame(tick);
    } else {
      // draw a single static frame so the atmosphere still reads
      tick_static();
    }

    function tick_static() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(function (p) {
        if (p.petal) drawPetal(p);
        else drawDust(p);
      });
    }
  }

  /* =========================================================
     2. ENVELOPE INTRO GATE — CLICK TO PLAY & SMOOTH HERO REVEAL
     ========================================================= */
  function initEnvelopeGate() {
    var gate = document.getElementById("envelope-gate");
    var video = document.getElementById("envelope-video");
    var site = document.getElementById("site");
    var musicToggle = document.getElementById("music-toggle");

    if (!gate || !site) return;

    document.body.style.overflow = "hidden";

    var isPlaying = false;
    var hasOpened = false;

    function openInvitation() {
      if (hasOpened) return;
      hasOpened = true;

      gate.classList.add("is-open");
      site.hidden = false;
      musicToggle.hidden = false;
      document.body.style.overflow = "";

      document.querySelectorAll(".hero .reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });

      initScrollReveal();

      window.setTimeout(function () {
        if (gate && gate.parentNode) {
          gate.remove();
        }
      }, 1200);
    }

    function handleGateClick() {
      if (hasOpened) return;

      // Start background music using user gesture
      var music = document.getElementById("bg-music");
      if (music) {
        music.volume = 0.55;
        var p = music.play();
        if (p && p.then) {
          p.then(function () {
            musicToggle.classList.add("is-playing");
            musicToggle.setAttribute("aria-label", "Pause background music");
          }).catch(function () {});
        }
      }

      if (!isPlaying) {
        isPlaying = true;
        gate.classList.add("video-playing");
        if (video) {
          video.currentTime = 0;
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
              // Fallback if video play is blocked
              openInvitation();
            });
          }
        } else {
          openInvitation();
        }
      } else {
        // Second tap/click allows fast-forward to hero section
        openInvitation();
      }
    }

    if (video) {
      // When video ends, smoothly fade gate into hero section
      video.addEventListener("ended", function () {
        openInvitation();
      });
    }

    gate.addEventListener("click", handleGateClick);
    gate.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleGateClick();
      }
    });
  }

  /* =========================================================
     3. COUNTDOWN — to 29 December 2026, 11:30 AM IST
     ========================================================= */
  function initCountdown() {
    var target = new Date("2026-12-29T11:30:00+05:30");
    var els = {
      days: document.getElementById("cd-days"),
      hours: document.getElementById("cd-hours"),
      mins: document.getElementById("cd-mins"),
      secs: document.getElementById("cd-secs"),
    };
    if (!els.days) return;

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function tick() {
      var diff = target.getTime() - Date.now();
      if (diff <= 0) {
        els.days.textContent = "00";
        els.hours.textContent = "00";
        els.mins.textContent = "00";
        els.secs.textContent = "00";
        return;
      }
      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var mins = Math.floor((diff / (1000 * 60)) % 60);
      var secs = Math.floor((diff / 1000) % 60);

      els.days.textContent = pad(days);
      els.hours.textContent = pad(hours);
      els.mins.textContent = pad(mins);
      els.secs.textContent = pad(secs);
    }

    tick();
    window.setInterval(tick, 1000);
  }

  /* =========================================================
     4. SCROLL REVEAL
     ========================================================= */
  var revealObserver;
  function initScrollReveal() {
    var targets = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!targets.length) return;

    if (prefersReducedMotion) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
      );
    }

    targets.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* =========================================================
     5. MUSIC TOGGLE
     ========================================================= */
  function initMusicToggle() {
    var btn = document.getElementById("music-toggle");
    var music = document.getElementById("bg-music");
    if (!btn || !music) return;

    btn.addEventListener("click", function () {
      if (music.paused) {
        music.play().then(function () {
          btn.classList.add("is-playing");
          btn.setAttribute("aria-label", "Pause background music");
        }).catch(function () {
          alert("Add your music.mp3 file into the assets folder to enable the song.");
        });
      } else {
        music.pause();
        btn.classList.remove("is-playing");
        btn.setAttribute("aria-label", "Play background music");
      }
    });
  }

  /* =========================================================
     INIT
     ========================================================= */
  document.addEventListener("DOMContentLoaded", function () {
    initParticles();
    initEnvelopeGate();
    initCountdown();
    initMusicToggle();
  });
})();

/* ================= CALENDAR ================= */
(function () {
  var grid = document.getElementById("cal-grid");
  if (!grid) return;
  var YEAR = 2026, MONTH = 11, EVENT_DAY = 29; // December = 11
  var html = ["Mo","Tu","We","Th","Fr","Sa","Su"].map(function (d) { return '<div class="dow">' + d + "</div>"; }).join("");
  var offset = (new Date(YEAR, MONTH, 1).getDay() + 6) % 7;
  var days = new Date(YEAR, MONTH + 1, 0).getDate();
  for (var i = 0; i < offset; i++) html += "<div></div>";
  for (var d = 1; d <= days; d++) html += '<div class="day' + (d === EVENT_DAY ? ' event' : '') + '">' + d + "</div>";
  grid.innerHTML = html;

  // Times in IST (UTC+5:30) converted to UTC
  var title = "Wedding of Joanne & Paul";
  var details = "Wedding Ceremony – CSI Convention Center, Kollam. Reception on 2 January 2027, 7:00 PM at Hotel Dimora, Trivandrum.";
  var location = "CSI Convention Center, Kollam, Kerala";
  var start = "20261229T060000Z", end = "20261229T090000Z"; // 11:30 AM – 2:30 PM IST

  document.getElementById("cal-google").href =
    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(title) +
    "&dates=" + start + "/" + end + "&details=" + encodeURIComponent(details) + "&location=" + encodeURIComponent(location);

  var ics = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//JoannePaul//Wedding//EN",
    "BEGIN:VEVENT","UID:wedding-20261229@joanne-paul","DTSTAMP:20261101T000000Z",
    "DTSTART:" + start,"DTEND:" + end,"SUMMARY:" + title,"LOCATION:CSI Convention Center\, Kollam\, Kerala",
    "DESCRIPTION:Wedding Ceremony","END:VEVENT",
    "BEGIN:VEVENT","UID:reception-20270102@joanne-paul","DTSTAMP:20261101T000000Z",
    "DTSTART:20270102T133000Z","DTEND:20270102T163000Z","SUMMARY:Reception – Joanne & Paul",
    "LOCATION:Hotel Dimora\, Trivandrum\, Kerala","END:VEVENT","END:VCALENDAR"
  ].join("\r\n");
  document.getElementById("cal-ics").href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);

  var btn = document.getElementById("cal-btn"), menu = document.getElementById("cal-menu");
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    btn.setAttribute("aria-expanded", String(!menu.hidden));
  });
  document.addEventListener("click", function () { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); });
})();

/* ================= RSVP (Google Sheets via Apps Script) ================= */
(function () {
  // Paste your Apps Script Web App URL here (ends with /exec)
  var RSVP_URL = "https://script.google.com/macros/s/AKfycbxRKWzs92sJ2j1Rv2BjZbfDQJib8hEhcVF25pECPsAg5SykRsAArtlqjQvx5m7uUmjS/exec";

  var form = document.getElementById("rsvp-form");
  if (!form) return;
  var status = document.getElementById("rsvp-status");
  var attendFields = document.getElementById("rsvp-attend-fields");
  var btn = form.querySelector(".rsvp-submit");

  form.addEventListener("change", function (e) {
    if (e.target.name === "attending") attendFields.hidden = e.target.value === "No";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.className = "rsvp-status";
    var name = form.elements.name.value.trim();
    var phone = form.elements.phone.value.trim();
    var att = form.querySelector('input[name="attending"]:checked');
    var events = Array.prototype.map.call(
      form.querySelectorAll('input[name="events"]:checked'),
      function (c) { return c.value; }
    );
    if (!name || !phone || !att) { status.textContent = "Please fill in your name, phone and attendance."; return; }
    if (att.value === "Yes" && !events.length) { status.textContent = "Please choose which event(s) you will attend."; return; }

    var yes = att.value === "Yes";
    var data = new URLSearchParams({
      name: name,
      phone: phone,
      attending: att.value,
      events: yes ? events.join(", ") : "-",
      guests: yes ? form.elements.guests.value : "0",
      message: form.elements.message.value.trim()
    });

    btn.disabled = true;
    btn.textContent = "Sending...";
    fetch(RSVP_URL, { method: "POST", mode: "no-cors", body: data })
      .then(function () {
        form.reset();
        attendFields.hidden = false;
        status.className = "rsvp-status ok";
        status.textContent = yes
          ? "Thank you! We can't wait to celebrate with you ♥"
          : "Thank you for letting us know. You'll be missed ♥";
      })
      .catch(function () { status.textContent = "Something went wrong. Please try again."; })
      .then(function () { btn.disabled = false; btn.textContent = "Send RSVP"; });
  });
})();
