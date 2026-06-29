const ACCESS_COOKIE_NAME = "lantso_access";
const ACCESS_COOKIE_VALUE = "granted";

const PUBLIC_FILE = /\.(?:css|js|mjs|json|svg|png|jpe?g|webp|ico|txt|xml|woff2?)$/i;
const OPEN_PREFIXES = ["/api/", "/assets/", "/.netlify/"];
const LANGS = ["en", "fr", "ar"];
const DEFAULT_LANG = "en";

const COPY = {
  en: {
    title: "From the Roots<br>to the World",
    documentTitle: "Lantso - Private access",
    intro: "Private access before the drop.",
    countdown: "Drop opens in",
    password: "Password",
    enter: "Enter",
    checking: "Checking...",
    invalid: "Wrong password.",
    email: "Email",
    join: "Join the club",
    saving: "Saving...",
    saved: "You are on the list.",
    failed: "Please try again.",
    invalidEmail: "Enter a valid email address.",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds"
  },
  fr: {
    title: "From the Roots<br>to the World",
    documentTitle: "Lantso - Accès privé",
    intro: "Accès privé avant le drop.",
    countdown: "Ouverture du drop dans",
    password: "Mot de passe",
    enter: "Entrer",
    checking: "Vérification...",
    invalid: "Mot de passe incorrect.",
    email: "Email",
    join: "Rejoindre le club",
    saving: "Enregistrement...",
    saved: "Tu es dans la liste.",
    failed: "Réessaie dans un instant.",
    invalidEmail: "Entre une adresse email valide.",
    days: "Jours",
    hours: "Heures",
    minutes: "Minutes",
    seconds: "Secondes"
  },
  ar: {
    title: "From the Roots<br>to the World",
    documentTitle: "Lantso - دخول خاص",
    intro: "دخول خاص قبل الإصدار.",
    countdown: "يفتح الإصدار بعد",
    password: "كلمة المرور",
    enter: "دخول",
    checking: "جاري التحقق...",
    invalid: "كلمة المرور غير صحيحة.",
    email: "البريد الإلكتروني",
    join: "انضم إلى النادي",
    saving: "جاري الحفظ...",
    saved: "أنت الآن في القائمة.",
    failed: "حاول مرة أخرى.",
    invalidEmail: "أدخل بريدا إلكترونيا صحيحا.",
    days: "أيام",
    hours: "ساعات",
    minutes: "دقائق",
    seconds: "ثوان"
  }
};

export default async function accessGate(request, context) {
  if (env("LANTSO_GATE_ENABLED") !== "true") return context.next();
  if (request.method !== "GET" && request.method !== "HEAD") return context.next();

  const url = new URL(request.url);
  if (isOpenPath(url.pathname) || hasAccessCookie(request)) return context.next();

  const lang = detectLang(url.pathname, request.headers.get("accept-language") || "");
  const nonce = nonceValue();

  return new Response(gateHtml(url.pathname, lang, nonce), {
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
        `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self'; connect-src 'self'; base-uri 'self'; object-src 'none'`
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

function detectLang(pathname, acceptLanguage) {
  const firstSegment = String(pathname || "")
    .split("/")
    .filter(Boolean)[0];
  if (LANGS.includes(firstSegment)) return firstSegment;
  const requested = String(acceptLanguage || "")
    .split(",")
    .map((part) => part.trim().split(";")[0].slice(0, 2).toLowerCase())
    .find((lang) => LANGS.includes(lang));
  return requested || DEFAULT_LANG;
}

function nonceValue() {
  return globalThis.crypto?.randomUUID?.().replaceAll("-", "") || Math.random().toString(36).slice(2);
}

function gateHtml(pathname, lang, nonce) {
  const copy = COPY[lang] || COPY[DEFAULT_LANG];
  const htmlClass = lang === "ar" ? ' class="is-arabic"' : "";
  return `<!doctype html>
<html lang="${escapeHtml(lang)}"${htmlClass}>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>${escapeHtml(copy.documentTitle)}</title>
    <link rel="icon" href="/assets/brand/lantso-logo.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Luxurious+Script&display=swap" rel="stylesheet">
    <style nonce="${escapeHtml(nonce)}">
      :root { color-scheme: dark; --cream: #f8f8f6; --paper: #d9d9d7; --line: rgba(248, 248, 246, .66); }
      * { box-sizing: border-box; }
      body { margin: 0; min-width: 320px; height: 100svh; min-height: 100svh; display: grid; place-items: center; overflow: hidden; background: var(--paper); color: var(--cream); font-family: "Courier New", monospace; text-transform: uppercase; }
      body::before { content: ""; position: fixed; inset: 0; background: linear-gradient(rgba(17, 17, 17, .18), rgba(17, 17, 17, .56)), url("/assets/photos/gate/foot.jpg") center / cover; }
      body::after { content: ""; position: fixed; inset: 0; opacity: .08; background-image: radial-gradient(circle at 15% 20%, #000 0 1px, transparent 1px), radial-gradient(circle at 78% 13%, #000 0 1px, transparent 1px); background-size: 13px 17px, 19px 23px; pointer-events: none; }
      main { position: relative; z-index: 1; width: min(760px, calc(100vw - 34px)); display: grid; justify-items: center; gap: 14px; padding: 34px 0 calc(34px + env(safe-area-inset-bottom)); text-align: center; }
      h1 { margin: 8px 0 0; max-width: 720px; font-family: "Luxurious Script", "Snell Roundhand", "Apple Chancery", cursive; font-size: clamp(58px, 8vw, 106px); line-height: .9; font-weight: 400; text-transform: none; }
      p { margin: 0; max-width: 560px; color: rgba(247, 243, 236, .82); line-height: 1.6; text-transform: none; }
      .gate-logo { width: 116px; filter: invert(1); }
      form { width: min(430px, 100%); display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: end; }
      label { display: grid; gap: 8px; text-align: left; font-size: 12px; }
      input, button { min-height: 48px; border: 1px solid transparent; border-radius: 0; font: inherit; }
      input { width: 100%; padding: 12px; background: rgba(247, 243, 236, .94); color: #111; }
      button { padding: 0 24px; background: var(--cream); color: #111; font-weight: 700; cursor: pointer; text-transform: uppercase; }
      button:disabled { opacity: .58; cursor: not-allowed; }
      .message { grid-column: 1 / -1; min-height: 22px; color: rgba(247, 243, 236, .9); font-size: 12px; text-align: left; }
      .newsletter { margin-top: 4px; }
      .is-arabic p, .is-arabic label, .is-arabic .message { unicode-bidi: plaintext; }
      @media (max-width: 560px) { main { width: min(420px, calc(100vw - 28px)); gap: 8px; padding: 52px 0 calc(14px + env(safe-area-inset-bottom)); } .gate-logo { width: 96px; } form { grid-template-columns: 1fr; gap: 7px; } h1 { font-size: clamp(42px, 13vw, 58px); line-height: .92; } p { font-size: 12px; line-height: 1.35; } input, button { min-height: 42px; padding-top: 9px; padding-bottom: 9px; } .message { min-height: 14px; } }
    </style>
  </head>
  <body>
    <main>
      <img class="gate-logo" src="/assets/brand/lantso-text.svg" alt="Lantso">
      <h1>${copy.title}</h1>
      <p>${escapeHtml(copy.intro)}</p>
      <form data-access-form>
        <label>${escapeHtml(copy.password)}<input name="password" type="password" autocomplete="current-password" required></label>
        <button type="submit">${escapeHtml(copy.enter)}</button>
        <p class="message" data-access-message role="status"></p>
      </form>
      <form class="newsletter" data-newsletter-form>
        <input name="bot-field" type="text" autocomplete="off" tabindex="-1" hidden>
        <label>${escapeHtml(copy.email)}<input name="email" type="email" inputmode="email" autocomplete="email" maxlength="320" required></label>
        <button type="submit">${escapeHtml(copy.join)}</button>
        <p class="message" data-newsletter-message role="status"></p>
      </form>
    </main>
    <script nonce="${escapeHtml(nonce)}">
      const returnPath = ${scriptJson(pathname || "/")};
      const formStartedAt = String(Date.now());
      const copy = ${scriptJson({
        checking: copy.checking,
        invalid: copy.invalid,
        saving: copy.saving,
        saved: copy.saved,
        failed: copy.failed,
        invalidEmail: copy.invalidEmail
      })};
      const accessForm = document.querySelector("[data-access-form]");
      const newsletterForm = document.querySelector("[data-newsletter-form]");
      accessForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const message = document.querySelector("[data-access-message]");
        const button = accessForm.querySelector("button");
        message.textContent = copy.checking;
        button.disabled = true;
        const response = await fetch("/api/access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: new FormData(accessForm).get("password") })
        }).catch(() => null);
        button.disabled = false;
        if (!response || !response.ok) {
          message.textContent = copy.invalid;
          return;
        }
        localStorage.setItem("lantso:access", "granted");
        location.assign(returnPath);
      });
      newsletterForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const message = document.querySelector("[data-newsletter-message]");
        const button = newsletterForm.querySelector("button");
        const emailInput = newsletterForm.querySelector('input[name="email"]');
        const email = String(emailInput.value || "").trim().toLowerCase();
        emailInput.setCustomValidity("");
        if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) || email.length > 320) {
          message.textContent = copy.invalidEmail;
          emailInput.setCustomValidity(copy.invalidEmail);
          emailInput.reportValidity();
          emailInput.addEventListener("input", () => emailInput.setCustomValidity(""), { once: true });
          return;
        }
        const payload = {
          name: "Launch list",
          email,
          newsletter: "yes",
          source: "edge-gate-newsletter",
          "bot-field": String(new FormData(newsletterForm).get("bot-field") || ""),
          formStartedAt,
          formSubmittedAt: String(Date.now())
        };
        const body = new URLSearchParams({ "form-name": "club", ...payload });
        message.textContent = copy.saving;
        button.disabled = true;
        const apiResponse = await fetch("/api/club", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).catch(() => null);
        const response = apiResponse && apiResponse.ok
          ? apiResponse
          : await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }).catch(() => null);
        button.disabled = false;
        message.textContent = response && response.ok ? copy.saved : copy.failed;
        if (response && response.ok) newsletterForm.reset();
      });
    </script>
  </body>
</html>`;
}

function scriptJson(value) {
  return JSON.stringify(value).replaceAll("</", "<\\/");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
