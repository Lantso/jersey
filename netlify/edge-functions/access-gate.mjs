const ACCESS_COOKIE_NAME = "lantso_access";
const ACCESS_COOKIE_VALUE = "granted";

const PUBLIC_FILE = /\.(?:css|js|mjs|json|svg|png|jpe?g|webp|ico|txt|xml|woff2?)$/i;
const OPEN_PREFIXES = ["/api/", "/assets/", "/.netlify/"];

export default async function accessGate(request, context) {
  if (env("LANTSO_GATE_ENABLED") === "false") return context.next();
  if (request.method !== "GET" && request.method !== "HEAD") return context.next();

  const url = new URL(request.url);
  if (isOpenPath(url.pathname) || hasAccessCookie(request)) return context.next();

  return new Response(gateHtml(url.pathname), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self'; connect-src 'self'; base-uri 'self'; object-src 'none'"
    }
  });
}

function env(name) {
  return globalThis.Netlify?.env?.get?.(name) || globalThis.Deno?.env?.get?.(name) || "";
}

function isOpenPath(pathname) {
  return OPEN_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || PUBLIC_FILE.test(pathname);
}

function hasAccessCookie(request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === `${ACCESS_COOKIE_NAME}=${ACCESS_COOKIE_VALUE}`);
}

function gateHtml(pathname) {
  const safePath = escapeHtml(pathname || "/");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Lantso - Private access</title>
    <link rel="icon" href="/lantso_logo.svg" type="image/svg+xml">
    <style>
      :root { color-scheme: dark; --cream: #f7f3ec; --paper: #202922; --red: #a90000; --line: rgba(247, 243, 236, .66); }
      * { box-sizing: border-box; }
      body { margin: 0; min-width: 320px; min-height: 100vh; display: grid; place-items: center; overflow: hidden; background: var(--red); color: var(--cream); font-family: "Courier New", monospace; text-transform: uppercase; }
      body::before { content: ""; position: fixed; inset: 0; background: linear-gradient(rgba(32, 41, 34, .22), rgba(32, 41, 34, .72)), url("/assets/photos/hero.png") center / cover; }
      body::after { content: ""; position: fixed; inset: 0; opacity: .08; background-image: radial-gradient(circle at 15% 20%, #000 0 1px, transparent 1px), radial-gradient(circle at 78% 13%, #000 0 1px, transparent 1px); background-size: 13px 17px, 19px 23px; pointer-events: none; }
      main { position: relative; z-index: 1; width: min(760px, calc(100vw - 34px)); display: grid; justify-items: center; gap: 16px; padding: 34px 0; text-align: center; }
      img { width: 128px; filter: invert(1); }
      h1 { margin: 8px 0 0; max-width: 720px; font-family: "Snell Roundhand", "Apple Chancery", cursive; font-size: clamp(58px, 8vw, 106px); line-height: .9; font-weight: 400; text-transform: none; }
      p { margin: 0; max-width: 560px; color: rgba(247, 243, 236, .82); line-height: 1.6; text-transform: none; }
      .date { font-weight: 700; color: var(--cream); }
      .countdown { width: min(520px, 100%); display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 10px 0 6px; }
      .unit { min-height: 76px; display: grid; place-items: center; gap: 2px; border: 1px solid var(--line); background: rgba(32, 41, 34, .3); }
      .unit strong { font-size: 26px; line-height: 1; }
      .unit span { font-size: 10px; }
      form { width: min(430px, 100%); display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: end; }
      label { display: grid; gap: 8px; text-align: left; font-size: 12px; }
      input, button { min-height: 48px; border: 1px solid transparent; border-radius: 0; font: inherit; }
      input { width: 100%; padding: 12px; background: rgba(247, 243, 236, .94); color: #111; }
      button { padding: 0 24px; background: var(--cream); color: #111; font-weight: 700; cursor: pointer; text-transform: uppercase; }
      button:disabled { opacity: .58; cursor: not-allowed; }
      .message { grid-column: 1 / -1; min-height: 22px; color: rgba(247, 243, 236, .9); font-size: 12px; text-align: left; }
      .newsletter { margin-top: 4px; }
      @media (max-width: 560px) { .countdown { grid-template-columns: repeat(2, 1fr); } form { grid-template-columns: 1fr; } h1 { font-size: 58px; } }
    </style>
  </head>
  <body>
    <main>
      <img src="/Lantso_text.svg" alt="Lantso">
      <p class="date">06 / 06 / 2026</p>
      <h1>From the Roots<br>to the World</h1>
      <p>Private access before the drop.</p>
      <div class="countdown" aria-label="Drop opens in">
        <div class="unit"><strong data-countdown="days">00</strong><span>Days</span></div>
        <div class="unit"><strong data-countdown="hours">00</strong><span>Hours</span></div>
        <div class="unit"><strong data-countdown="minutes">00</strong><span>Minutes</span></div>
        <div class="unit"><strong data-countdown="seconds">00</strong><span>Seconds</span></div>
      </div>
      <form data-access-form>
        <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
        <button type="submit">Enter</button>
        <p class="message" data-access-message role="status"></p>
      </form>
      <form class="newsletter" data-newsletter-form>
        <label>Email<input name="email" type="email" autocomplete="email" required></label>
        <button type="submit">Join the club</button>
        <p class="message" data-newsletter-message role="status"></p>
      </form>
    </main>
    <script>
      const launch = new Date("2026-06-06T00:00:00+02:00").getTime();
      const returnPath = "${safePath}";
      const accessForm = document.querySelector("[data-access-form]");
      const newsletterForm = document.querySelector("[data-newsletter-form]");
      function tick() {
        const diff = Math.max(0, launch - Date.now());
        const seconds = Math.floor(diff / 1000);
        const parts = {
          days: Math.floor(seconds / 86400),
          hours: Math.floor((seconds % 86400) / 3600),
          minutes: Math.floor((seconds % 3600) / 60),
          seconds: seconds % 60
        };
        Object.entries(parts).forEach(([key, value]) => {
          document.querySelector('[data-countdown="' + key + '"]').textContent = String(value).padStart(2, "0");
        });
      }
      tick();
      setInterval(tick, 1000);
      accessForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const message = document.querySelector("[data-access-message]");
        const button = accessForm.querySelector("button");
        message.textContent = "Checking...";
        button.disabled = true;
        const response = await fetch("/api/access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: new FormData(accessForm).get("password") })
        }).catch(() => null);
        button.disabled = false;
        if (!response || !response.ok) {
          message.textContent = "Wrong password.";
          return;
        }
        localStorage.setItem("lantso:access", "granted");
        location.assign(returnPath);
      });
      newsletterForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const message = document.querySelector("[data-newsletter-message]");
        const button = newsletterForm.querySelector("button");
        const body = new URLSearchParams({ "form-name": "club", name: "Launch list", email: new FormData(newsletterForm).get("email"), newsletter: "yes" });
        message.textContent = "Saving...";
        button.disabled = true;
        const response = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }).catch(() => null);
        button.disabled = false;
        message.textContent = response && response.ok ? "You are on the list." : "Please try again.";
        if (response && response.ok) newsletterForm.reset();
      });
    </script>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
