/* ==========================================================================
   Cece African Hair Braiding — Site Script (vanilla JS, no dependencies)
   --------------------------------------------------------------------------
   1. SITE CONFIG  ← edit salon details & form delivery here
   2. Navigation (mobile menu, header on scroll)
   3. Back-to-top button, footer year, today's hours
   4. Scroll-reveal animations
   5. Gallery filtering + lightbox
   6. Form validation (shared by appointment & contact forms)
   7. Form submission (form service OR pre-filled email fallback)
   8. Appointment-specific helpers (style prefill, dates, time slots)
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. SITE CONFIG
     ------------------------------------------------------------------------
     formEndpoint:
       Leave EMPTY ("") until you connect a form service. While empty, the
       forms will open the visitor's email app with their request pre-filled
       (addressed to `email` below) and clearly tell them to press "Send".
       To receive submissions automatically, create a free form at
       Formspree (https://formspree.io), Web3Forms, Getform, etc. and paste the
       endpoint URL here, e.g. "https://formspree.io/f/abcdwxyz".
       See README.md → "Connecting the forms".
     hours:
       0 = Sunday … 6 = Saturday. Use null for closed days. 24-hour "HH:MM".
       `lastStart` is the latest appointment START time offered in the form.
     ---------------------------------------------------------------------- */
  const CONFIG = {
    salonName: "Cece African Hair Braiding",
    email: "hello@cecebraiding.com",          // PLACEHOLDER — replace
    phoneDisplay: "(555) 123-4567",           // PLACEHOLDER — replace
    phoneLink: "+15551234567",                // PLACEHOLDER — replace
    formEndpoint: "",                         // e.g. "https://formspree.io/f/xxxxxxx"
    hours: {
      0: { open: "12:00", close: "17:00", lastStart: "14:00" }, // Sunday
      1: null,                                                   // Monday — closed
      2: { open: "09:00", close: "19:00", lastStart: "15:00" },
      3: { open: "09:00", close: "19:00", lastStart: "15:00" },
      4: { open: "09:00", close: "19:00", lastStart: "15:00" },
      5: { open: "09:00", close: "19:00", lastStart: "15:00" },
      6: { open: "08:00", close: "18:00", lastStart: "14:00" }, // Saturday
    },
    slotMinutes: 30,
    maxDaysAhead: 120,
  };

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  document.documentElement.classList.add("js");

  /* ------------------------------------------------------------------------
     2. NAVIGATION
     ---------------------------------------------------------------------- */
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  function setMenu(open) {
    if (!toggle || !mobileMenu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.inert = !open;
    document.body.classList.toggle("no-scroll", open);
    header && header.classList.toggle("menu-open", open);
    if (open) {
      const first = mobileMenu.querySelector("a");
      first && first.focus();
    }
  }

  if (toggle && mobileMenu) {
    mobileMenu.inert = true;
    toggle.addEventListener("click", () => {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    // Close when a link is chosen
    mobileMenu.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenu(false);
    });
    // Close with Escape and return focus to the toggle
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    // Close if the window grows to desktop width
    window.matchMedia("(min-width: 1100px)").addEventListener("change", (mq) => {
      if (mq.matches) setMenu(false);
    });
  }

  /* Header shadow + back-to-top visibility on scroll */
  const backToTop = document.querySelector(".back-to-top");
  function onScroll() {
    const y = window.scrollY;
    header && header.classList.toggle("is-scrolled", y > 40);
    backToTop && backToTop.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------------
     3. BACK TO TOP, YEAR, TODAY'S HOURS
     ---------------------------------------------------------------------- */
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      const skipTarget = document.getElementById("main");
      skipTarget && skipTarget.focus({ preventScroll: true });
    });
  }

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // Highlight today's row in any hours list: <li data-day="2">…</li>
  const today = new Date().getDay();
  document.querySelectorAll(`.hours [data-day="${today}"]`).forEach((li) => {
    li.classList.add("is-today");
    li.setAttribute("aria-current", "date");
  });

  /* ------------------------------------------------------------------------
     4. SCROLL REVEAL
     ---------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------------------
     5. GALLERY FILTER + LIGHTBOX
     ---------------------------------------------------------------------- */
  const gallery = document.querySelector("[data-gallery]");
  const filterBtns = document.querySelectorAll("[data-filter]");
  const filterStatus = document.getElementById("filter-status");

  if (gallery && filterBtns.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.dataset.filter;
        filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        let shown = 0;
        gallery.querySelectorAll(".gallery__item").forEach((item) => {
          const match = cat === "all" || item.dataset.category === cat;
          item.hidden = !match;
          if (match) shown++;
        });
        if (filterStatus) {
          filterStatus.textContent = `Showing ${shown} ${shown === 1 ? "photo" : "photos"}` +
            (cat === "all" ? "" : ` in ${btn.textContent.trim()}`);
        }
      });
    });
  }

  const lightbox = document.getElementById("lightbox");
  if (gallery && lightbox) {
    const lbImg = lightbox.querySelector(".lightbox__img");
    const lbTitle = lightbox.querySelector(".lightbox__title");
    const lbCat = lightbox.querySelector(".lightbox__cat");
    const lbCount = lightbox.querySelector(".lightbox__count");
    const btnClose = lightbox.querySelector("[data-lb-close]");
    const btnPrev = lightbox.querySelector("[data-lb-prev]");
    const btnNext = lightbox.querySelector("[data-lb-next]");
    let items = [];
    let index = 0;
    let lastFocus = null;

    const visibleItems = () =>
      Array.from(gallery.querySelectorAll(".gallery__item:not([hidden]) .gallery__btn"));

    function show(i) {
      index = (i + items.length) % items.length;
      const btn = items[index];
      const img = btn.querySelector("img");
      lbImg.classList.add("is-loading");
      lbImg.onload = () => lbImg.classList.remove("is-loading");
      lbImg.src = btn.dataset.full || img.src;
      lbImg.alt = img.alt;
      lbTitle.textContent = btn.dataset.title || img.alt;
      lbCat.textContent = btn.dataset.categoryLabel || "";
      lbCount.textContent = `${index + 1} / ${items.length}`;
      const single = items.length < 2;
      btnPrev.hidden = single;
      btnNext.hidden = single;
    }

    function open(btn) {
      items = visibleItems();
      lastFocus = btn;
      show(items.indexOf(btn));
      lightbox.hidden = false;
      // allow display change before animating
      requestAnimationFrame(() => requestAnimationFrame(() => lightbox.classList.add("is-open")));
      document.body.classList.add("no-scroll");
      btnClose.focus();
    }

    function close() {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
      setTimeout(() => { lightbox.hidden = true; }, 350);
      lastFocus && lastFocus.focus();
    }

    gallery.addEventListener("click", (e) => {
      const btn = e.target.closest(".gallery__btn");
      if (btn) open(btn);
    });
    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", () => show(index - 1));
    btnNext.addEventListener("click", () => show(index + 1));
    // click on dark backdrop closes
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.classList.contains("lightbox__stage")) close();
    });

    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
      // simple focus trap
      if (e.key === "Tab") {
        const focusables = Array.from(lightbox.querySelectorAll("button:not([hidden])"));
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // swipe on touch devices
    let touchX = null;
    lightbox.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* ------------------------------------------------------------------------
     6. FORM VALIDATION
     Each validated field sits in a .field wrapper with a .field__error span.
     Rules come from HTML attributes (required, type, minlength, pattern) plus
     data-validate="phone|date|time" for custom checks.
     ---------------------------------------------------------------------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function fieldLabel(input) {
    const label = input.closest(".field")?.querySelector("label, .label");
    return label ? label.firstChild.textContent.trim() : "This field";
  }

  function validateField(input) {
    const value = input.value.trim();
    const kind = input.dataset.validate || input.type;
    let msg = "";

    if (input.required && !value) {
      msg = input.tagName === "SELECT"
        ? `Please choose ${fieldLabel(input).toLowerCase()}.`
        : `Please enter your ${fieldLabel(input).toLowerCase()}.`;
      if (input.dataset.requiredMsg) msg = input.dataset.requiredMsg;
    } else if (value) {
      if (kind === "email" && !EMAIL_RE.test(value)) {
        msg = "Please enter a valid email address (e.g. name@example.com).";
      } else if (kind === "phone") {
        const digits = value.replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 15) msg = "Please enter a valid phone number, including area code.";
      } else if (input.minLength > 0 && value.length < input.minLength) {
        msg = `Please enter at least ${input.minLength} characters.`;
      } else if (kind === "date") {
        msg = validateDate(value);
      }
    }

    const field = input.closest(".field");
    const errEl = field && field.querySelector(".field__error");
    if (field) field.classList.toggle("has-error", Boolean(msg));
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (errEl) errEl.innerHTML = msg ? `<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> ${msg}` : "";
    return !msg;
  }

  function validateForm(form) {
    const inputs = form.querySelectorAll("input:not([type=hidden]):not(.hp-input), select, textarea");
    let firstInvalid = null;
    inputs.forEach((input) => {
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  /* ------------------------------------------------------------------------
     7. FORM SUBMISSION
     ---------------------------------------------------------------------- */
  function showStatus(form, type, title, html) {
    const box = form.querySelector(".form-status");
    if (!box) return;
    const icons = { success: "fa-circle-check", error: "fa-circle-exclamation", info: "fa-envelope-open-text" };
    box.className = `form-status form-status--${type} is-visible`;
    box.innerHTML = `<i class="fa-solid ${icons[type]}" aria-hidden="true"></i><p><strong>${title}</strong>${html}</p>`;
    box.setAttribute("tabindex", "-1");
    box.focus({ preventScroll: true });
    box.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function clearStatus(form) {
    const box = form.querySelector(".form-status");
    if (box) { box.className = "form-status"; box.innerHTML = ""; }
  }

  const contactLine = () =>
    `call us at <a href="tel:${CONFIG.phoneLink}">${CONFIG.phoneDisplay}</a> or email <a href="mailto:${CONFIG.email}">${CONFIG.email}</a>`;

  /* Build a readable plain-text summary from labelled fields */
  function summarize(form) {
    const lines = [];
    form.querySelectorAll("[data-summary]").forEach((el) => {
      let val = el.value.trim();
      if (el.tagName === "SELECT" && el.selectedIndex > -1 && val) val = el.options[el.selectedIndex].text;
      if (el.type === "date" && val) val = formatDate(val);
      lines.push(`${el.dataset.summary}: ${val || "—"}`);
    });
    return lines.join("\n");
  }

  function openMailto(form) {
    const kind = form.dataset.formType === "appointment" ? "Appointment Request" : "Website Inquiry";
    const name = (form.querySelector("[name=name]") || {}).value || "";
    const subject = `${kind} — ${name.trim()}`;
    const intro = form.dataset.formType === "appointment"
      ? `Hello ${CONFIG.salonName},\n\nI would like to request an appointment:\n\n`
      : `Hello ${CONFIG.salonName},\n\n`;
    const body = `${intro}${summarize(form)}\n\nThank you!`;
    const href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    return href;
  }

  document.querySelectorAll("form[data-validate-form]").forEach((form) => {
    form.noValidate = true; // we handle validation in JS

    // live re-validation once a field has been touched
    form.addEventListener("input", (e) => {
      const el = e.target;
      if (el.closest(".field.has-error")) validateField(el);
    });
    form.addEventListener("focusout", (e) => {
      const el = e.target;
      if (el.matches("input, select, textarea") && el.value.trim()) validateField(el);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearStatus(form);

      // Honeypot: real visitors never fill this hidden field
      const hp = form.querySelector(".hp-input");
      if (hp && hp.value) return;

      if (!validateForm(form)) {
        showStatus(form, "error", "Please check the highlighted fields.",
          " A few details are missing or need a quick fix before we can send your request.");
        // keep focus on the first invalid field, not the status box
        form.querySelector("[aria-invalid=true]")?.focus();
        return;
      }

      const submitBtn = form.querySelector("[type=submit]");
      const btnHTML = submitBtn.innerHTML;
      const isAppt = form.dataset.formType === "appointment";

      /* A) A real form service is configured → send it and only report
            success if the service confirms it was received. */
      if (CONFIG.formEndpoint) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Sending…';
        try {
          const data = new FormData(form);
          data.append("_subject", `${isAppt ? "Appointment Request" : "Website Inquiry"} — ${data.get("name") || ""}`);
          data.append("summary", summarize(form));
          const res = await fetch(CONFIG.formEndpoint, {
            method: "POST",
            body: data,
            headers: { Accept: "application/json" },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          form.reset();
          form.querySelectorAll(".field").forEach((f) => f.classList.remove("has-error"));
          if (isAppt) refreshTimeSlots();
          showStatus(form, "success",
            isAppt ? "Thank you — your appointment request has been sent!" : "Thank you — your message has been sent!",
            isAppt
              ? " This is a request, not a confirmed booking. We'll contact you to confirm your date and time. Questions in the meantime? " + contactLine() + "."
              : " We'll get back to you as soon as possible. Need us sooner? " + contactLine() + ".");
        } catch (err) {
          console.error("Form submission failed:", err);
          showStatus(form, "error", "Sorry — we couldn't send your request.",
            " Nothing was submitted. Please try again in a moment, or " + contactLine() + ".");
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = btnHTML;
        }
        return;
      }

      /* B) No form service yet → open the visitor's email app with the
            details filled in. We do NOT claim it was sent: they must press Send. */
      console.info("[Cece] No formEndpoint set in js/script.js — using email fallback.");
      openMailto(form);
      showStatus(form, "info", "One more step: please press “Send” in your email app.",
        ` We've opened a new email to <a href="mailto:${CONFIG.email}">${CONFIG.email}</a> with your ${isAppt ? "appointment request" : "message"} filled in. ` +
        `Your ${isAppt ? "request" : "message"} is <em>not</em> delivered until you send that email. ` +
        `If no email window opened, please ${contactLine().replace("call us at", "call")} instead.`);
    });
  });

  /* ------------------------------------------------------------------------
     8. APPOINTMENT HELPERS
     ---------------------------------------------------------------------- */
  const apptForm = document.querySelector("form[data-form-type=appointment]");
  const dateInput = document.getElementById("appt-date");
  const timeSelect = document.getElementById("appt-time");

  function toISO(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function parseISO(s) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function formatDate(s) {
    const d = parseISO(s);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }
  function toMinutes(hhmm) { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; }
  function label12(mins) {
    const h = Math.floor(mins / 60), m = mins % 60;
    const suffix = h >= 12 ? "PM" : "AM";
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
  }

  function validateDate(value) {
    const d = parseISO(value);
    if (isNaN(d)) return "Please choose a valid date.";
    const todayMid = new Date(); todayMid.setHours(0, 0, 0, 0);
    if (d < todayMid) return "Please choose a date in the future.";
    const max = new Date(todayMid); max.setDate(max.getDate() + CONFIG.maxDaysAhead);
    if (d > max) return `Please choose a date within the next ${CONFIG.maxDaysAhead} days.`;
    if (!CONFIG.hours[d.getDay()]) return `Sorry, we're closed on ${DAY_NAMES[d.getDay()]}s. Please pick another day.`;
    return "";
  }

  function refreshTimeSlots() {
    if (!timeSelect) return;
    const prev = timeSelect.value;
    const hint = document.getElementById("appt-time-hint");
    timeSelect.innerHTML = "";
    const add = (val, text, disabled) => {
      const o = document.createElement("option");
      o.value = val; o.textContent = text; o.disabled = !!disabled;
      timeSelect.appendChild(o);
    };

    const date = dateInput && dateInput.value;
    const hours = date && !validateDate(date) ? CONFIG.hours[parseISO(date).getDay()] : null;
    if (!hours) {
      add("", date ? "Choose an open day first" : "Choose a date first");
      timeSelect.disabled = true;
      if (hint) hint.textContent = "Available start times appear after you pick a date.";
      return;
    }
    timeSelect.disabled = false;
    add("", "Select a start time");

    // Don't offer times that have already passed today
    const now = new Date();
    const isToday = date === toISO(now);
    const nowMins = now.getHours() * 60 + now.getMinutes() + 60; // need at least 1h notice
    let count = 0;
    for (let t = toMinutes(hours.open); t <= toMinutes(hours.lastStart); t += CONFIG.slotMinutes) {
      if (isToday && t < nowMins) continue;
      const val = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
      add(val, label12(t));
      count++;
    }
    if (!count) {
      timeSelect.innerHTML = "";
      add("", "No times left today — choose another date");
      timeSelect.disabled = true;
    }
    if (prev && timeSelect.querySelector(`option[value="${prev}"]`)) timeSelect.value = prev;
    if (hint) {
      const d = parseISO(date);
      hint.textContent = `${DAY_NAMES[d.getDay()]} hours: ${label12(toMinutes(hours.open))} – ${label12(toMinutes(hours.close))}. Longer styles start earlier in the day.`;
    }
  }

  if (apptForm && dateInput) {
    const now = new Date();
    dateInput.min = toISO(now);
    const max = new Date(now); max.setDate(max.getDate() + CONFIG.maxDaysAhead);
    dateInput.max = toISO(max);
    dateInput.addEventListener("change", () => {
      validateField(dateInput);
      refreshTimeSlots();
    });
    refreshTimeSlots();

    // Pre-select a style from the URL, e.g. appointment.html?style=box-braids
    const style = new URLSearchParams(window.location.search).get("style");
    const styleSelect = document.getElementById("appt-style");
    if (style && styleSelect && styleSelect.querySelector(`option[value="${CSS.escape(style)}"]`)) {
      styleSelect.value = style;
    }
  }

  // Contact form: pre-select a subject from the URL, e.g. contact.html?subject=pricing
  const subj = new URLSearchParams(window.location.search).get("subject");
  const subjSelect = document.getElementById("contact-subject");
  if (subj && subjSelect && subjSelect.querySelector(`option[value="${CSS.escape(subj)}"]`)) {
    subjSelect.value = subj;
  }
})();
