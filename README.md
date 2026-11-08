# Cece African Hair Braiding: Website

A responsive salon website built with HTML5, CSS3, and vanilla JavaScript. It does not use a framework or a build step.

It is a website for the salon only. It has no store, no shopping cart, and no payments. Visitors can browse styles, see starting prices, and send an **appointment request** that the salon then confirms.

---

## 1. Run it locally

**Quickest:** double-click `index.html` to open it in any browser.

**Recommended:** run it on a local web server so it behaves like the live site:

```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000

# or Node.js
npx serve .
```

In VS Code, the **Live Server** extension also works: right-click `index.html` and choose "Open with Live Server".

> Fonts (Google Fonts) and icons (Font Awesome) load from the internet. Offline, the site still works, but it falls back to system fonts and the icons are hidden.

---

## 2. Project structure

```
├── index.html          Home: hero, welcome, featured styles, why us, booking steps, reviews, CTA
├── about.html          Story, African heritage, values, salon experience
├── services.html       12 service cards with starting prices, prep tips, FAQ
├── gallery.html        Filterable photo gallery with a lightbox
├── appointment.html    Appointment REQUEST form (validated, no payments)
├── contact.html        Contact details, Call Now, contact form, map, socials
├── credits.html        Photo credits (required by the photo licences)
├── css/style.css       All styles (design tokens at the top)
├── js/script.js        All behaviour (salon CONFIG at the top)
└── assets/
    ├── images/
    │   ├── site/       Hero and About page photos
    │   ├── services/   One photo per service (filename = service id)
    │   └── gallery/    Additional gallery photos
    └── icons/favicon.svg
```

---

## 3. Before launch: replace the placeholders

Search the project for the values below and replace them in **all** `.html` files, plus `js/script.js`. In VS Code, Find in Files (Ctrl+Shift+F) and "Replace All" handle this.

| Placeholder | Where |
|---|---|
| `(555) 123-4567` and `+15551234567` | Phone number (displayed, and the `tel:` link) |
| `hello@cecebraiding.com` | Email address |
| `1234 Placeholder Avenue, Suite 100` and `Your City, ST 00000` | Address |
| Hours (Tue–Fri 9–7, Sat 8–6, Sun 12–5, Mon closed) | Footer, appointment and contact pages, mobile menu, **and** `CONFIG.hours` in `js/script.js` |
| `https://www.facebook.com/`, `instagram.com/`, `tiktok.com/` | Social profile links |
| Prices (`data-placeholder-price`) | `services.html`. After updating, delete the "Prices shown are placeholder…" notice. |
| Testimonials | `index.html`. Use real client reviews (with permission), then delete the "Sample reviews…" note. |
| Story text | `about.html`. Personalise it with Cece's own story. |
| Structured data (`application/ld+json`) | Top of `index.html`. Used by Google for local search. |

### Salon settings in `js/script.js`

```js
const CONFIG = {
  email: "hello@cecebraiding.com",
  phoneDisplay: "(555) 123-4567",
  phoneLink: "+15551234567",
  formEndpoint: "",              // see section 4
  hours: { 0: {...}, 1: null, ... } // 0 = Sunday; null = closed
};
```

The appointment form uses `hours` to block closed days and to offer only valid start times. `lastStart` is the latest start time the form offers on that day.

---

## 4. Connecting the forms

Both forms are validated in the browser (required fields, email and phone format, future dates only, closed days). The site never claims a request was delivered unless it actually was.

**Default (no setup):** `formEndpoint` is empty. When a visitor submits, the site opens **their email app** with the request already filled in and addressed to the salon. The page tells them clearly that they must press **Send**, and gives the phone number as a backup.

**Recommended:** connect a free form service so requests arrive in the salon's inbox automatically:

1. Create a form at [Formspree](https://formspree.io) (or Web3Forms, Getform, Basin, etc.).
2. Copy your endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
3. Paste it into `formEndpoint` in `js/script.js`.

Once connected, a success message only appears after the service confirms it received the request. If sending fails, the visitor sees an error with the phone number. Both forms include a hidden honeypot field to reduce spam.

---

## 5. Photos

Every photo currently on the site is an **openly licensed placeholder** (Creative Commons / public domain) from Wikimedia Commons, Flickr, and StockSnap. They show braiding styles in general, **not the salon's own work**. For a real salon portfolio, replace them with Cece's own photos as soon as possible.

**To replace a photo:** save your image with the **same filename** in the same folder, e.g. `assets/images/services/box-braids.jpg`. Portrait or square photos about 1000–1200 px wide work best. Compress them first (e.g. with [Squoosh](https://squoosh.app)) and aim for under 250 KB each.

**To add a gallery photo:** put it in `assets/images/gallery/`, then copy one `<li class="gallery__item">…</li>` block in `gallery.html`. Update `src`, `data-full`, `alt`, `data-title`, and `data-category`. The category must be one of `braids`, `twists`, `cornrows`, `updos`, `locs`, `kids`.

**Credits:** CC BY and CC BY-SA licences require crediting the photographer, which `credits.html` does. When you replace a photo with your own, remove its row from `credits.html`. When every placeholder is gone, you can delete that page and its footer link.

---

## 6. Customising the design

All colours, fonts, and spacing are CSS variables at the top of `css/style.css`:

```css
--cream: #faf5ee;  --espresso: #24170f;  --gold: #c9a35c;  --gold-text: #7e5e26;
--font-display: "Cormorant Garamond";  --font-body: "Jost";
```

- The African-inspired triangle band is `.pattern-band`, and the mud-cloth texture is `.texture-dark`. Both are inline SVG, so they need no image files.
- Animations respect the visitor's "reduce motion" setting.
- The layout is mobile-first, with breakpoints at 600px, 900px, and 1100px (where the full desktop menu appears).

---

## 7. Map

`contact.html` shows a styled map placeholder with an "Open in Google Maps" button. To embed a live map, open Google Maps, search the salon address, then choose **Share → Embed a map**. Paste the `<iframe>` in place of the `.map-placeholder` block and add `class="map-embed"` to the iframe.

---

## 8. Features checklist

- Responsive layout for phones, tablets, laptops, and desktops, with an accessible hamburger menu (Esc closes it, focus is managed)
- Smooth scrolling, scroll-reveal animations, hover effects, and a back-to-top button
- Gallery category filters and a lightbox with previous/next, keyboard arrows, swipe, Esc, and a focus trap
- Appointment form with style prefill from service cards (`appointment.html?style=box-braids`), closed-day detection, and time slots based on opening hours
- Contact form validation and a honeypot spam trap
- Semantic HTML5, unique titles and meta descriptions, descriptive alt text, `HairSalon` structured data, lazy-loaded images with fixed dimensions, a skip link, and visible focus styles
- No payments, carts, or checkout anywhere

## 9. Hosting

The site is plain static files, so you can upload the whole folder to any host: Netlify (drag and drop), GitHub Pages, Cloudflare Pages, or regular cPanel hosting. Once you have a domain, add `og:url` and `og:image` meta tags with full `https://` URLs so links look good when shared.
