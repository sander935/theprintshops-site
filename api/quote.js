// Vercel Function: POST /api/quote
// Emails each quote request to the shop. Two ways to send, picked by which env vars are set
// (Vercel → Project → Settings → Environment Variables):
//
// A) Resend (used when RESEND_API_KEY is set)
//   RESEND_API_KEY    Resend API key with sending access (mark as Sensitive)
//   QUOTE_FROM        sender on a domain verified in Resend, e.g. "The Print Shop website <forms@send.example.ca>"
//   QUOTE_TO          who receives requests (comma-separated), e.g. info@theprintshops.ca
//
// B) Microsoft Graph, from the shop's own Microsoft 365 mailbox
//   MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, QUOTE_FROM (mailbox address), QUOTE_TO (optional)
//
// Until one is set up the endpoint answers 503 and the site falls back to opening the visitor's email app.

const LIMITS = { source: 60, name: 120, company: 160, email: 200, phone: 60, product: 120, qty: 60, size: 200, details: 5000 };
const ATTR_KEYS = ["source", "medium", "campaign", "term", "content", "landing", "referrer", "gclid", "fbclid", "msclkid",
  "first_source", "first_medium", "first_campaign", "first_landing", "first_days_ago", "submitted_from",
  "visits", "engaged_seconds", "journey"];
const EMAIL_RE =/^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const clean = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
const oneLine = (s) => s.replace(/[\r\n]+/g, " ").trim();

function buildMessage(input) {
  const f = {};
  for (const k of Object.keys(LIMITS)) f[k] = clean(input && input[k], LIMITS[k]);
  for (const k of ["source", "name", "company", "email", "phone", "product", "qty", "size"]) f[k] = oneLine(f[k]);

  const errors = [];
  if (!f.name) errors.push("name");
  if (!EMAIL_RE.test(f.email)) errors.push("email");
  if (!f.phone) errors.push("phone");
  if (!f.details) errors.push("details");

  const lines = [`New quote request from the website (${f.source || "website"})`, "", `Name: ${f.name}`];
  if (f.company) lines.push(`Company: ${f.company}`);
  lines.push(`Email: ${f.email}`, `Phone: ${f.phone}`);
  if (f.product) lines.push(`Product: ${f.product}`);
  if (f.qty) lines.push(`Quantity: ${f.qty}`);
  if (f.size) lines.push(`Size/finish: ${f.size}`);
  lines.push("", "Details:", f.details);

  // Where the lead came from (sent by the site's tracking script).
  const a = {};
  const raw = input && typeof input.attribution === "object" && input.attribution ? input.attribution : {};
  for (const k of ATTR_KEYS) a[k] = oneLine(clean(raw[k], k === "journey" ? 900 : 200));
  const src = [a.source, a.medium, a.campaign].filter(Boolean).join(" / ");
  const first = [a.first_source, a.first_medium, a.first_campaign].filter(Boolean).join(" / ");
  const where = [];
  if (src) where.push(`Source: ${src}`);
  if (a.term) where.push(`Keyword: ${a.term}`);
  if (a.content) where.push(`Ad/content: ${a.content}`);
  if (a.landing) where.push(`Landing page: ${a.landing}`);
  if (a.referrer) where.push(`Referred by: ${a.referrer}`);
  if (first && (first !== src || a.first_landing !== a.landing)) {
    where.push(`First visit: ${first}${a.first_landing ? ` (landed on ${a.first_landing})` : ""}${a.first_days_ago ? `, ${a.first_days_ago} days ago` : ""}`);
  }
  if (a.submitted_from) where.push(`Submitted from: ${a.submitted_from}`);
  if (a.visits) where.push(`Visit number: ${a.visits}${a.engaged_seconds ? ` (${a.engaged_seconds}s on the site this visit)` : ""}`);
  if (a.journey) where.push(`Pages this visit: ${a.journey}`);
  const clicks = ["gclid", "fbclid", "msclkid"].filter((k) => a[k]).map((k) => `${k}=${a[k]}`);
  if (clicks.length) where.push(`Ad click ID: ${clicks.join(", ")}`);
  if (where.length) lines.push("", "Where they came from:", ...where);

  lines.push("", "Reply to this email to respond to the customer directly.");

  const subject = `Quote request${f.product ? " — " + f.product : ""} — ${f.name}`.slice(0, 200);
  return { errors, subject, text: lines.join("\n"), replyTo: f.email };
}

async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  if (!body || typeof body !== "object") body = {};

  // Spam trap: a hidden field real visitors never see. Bots fill it; accept quietly and drop.
  if (clean(body.website, 200)) return res.status(200).json({ ok: true });

  const { errors, subject, text, replyTo } = buildMessage(body);
  if (errors.length) return res.status(400).json({ ok: false, error: "invalid", fields: errors });

  const rcfg = resendConfig();
  const cfg = rcfg ? null : config();
  if (!rcfg && !cfg) return res.status(503).json({ ok: false, error: "not_configured" });

  try {
    const msg = { subject, text, replyTo, replyName: oneLine(clean(body.name, 120)) };
    if (rcfg) await sendViaResend(rcfg, msg);
    else await sendViaGraph(cfg, msg);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("quote: send failed:", err && err.message);
    return res.status(502).json({ ok: false, error: "send_failed" });
  }
}

// ---------------------------------------------------------------- Resend
function resendConfig() {
  const { RESEND_API_KEY, QUOTE_FROM, QUOTE_TO } = process.env;
  if (!RESEND_API_KEY || !QUOTE_FROM || !QUOTE_TO) return null;
  const from = QUOTE_FROM.trim();
  const addr = (from.match(/<([^>]+)>\s*$/) || [null, from])[1].trim();
  const to = String(QUOTE_TO).split(",").map((s) => s.trim()).filter((s) => EMAIL_RE.test(s));
  if (!EMAIL_RE.test(addr) || !to.length) return null;
  return { key: RESEND_API_KEY.trim(), from, to };
}

async function sendViaResend(cfg, { subject, text, replyTo, replyName }) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: cfg.from,
      to: cfg.to,
      subject,
      text,
      reply_to: replyName ? `${replyName.replace(/[<>"]/g, "")} <${replyTo}>` : replyTo,
    }),
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(`resend ${r.status}: ${j.name || ""} ${j.message || ""}`);
  }
}

// ---------------------------------------------------------------- Microsoft Graph
function config() {
  const { MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, QUOTE_FROM, QUOTE_TO } = process.env;
  if (!MS_TENANT_ID || !MS_CLIENT_ID || !MS_CLIENT_SECRET || !QUOTE_FROM) return null;
  const to = String(QUOTE_TO || QUOTE_FROM).split(",").map((s) => s.trim()).filter((s) => EMAIL_RE.test(s));
  if (!EMAIL_RE.test(QUOTE_FROM.trim()) || !to.length) return null;
  return { tenant: MS_TENANT_ID.trim(), clientId: MS_CLIENT_ID.trim(), secret: MS_CLIENT_SECRET, from: QUOTE_FROM.trim(), to };
}

// App-only access token, reused across requests while the function instance stays warm.
let tokenCache = { key: "", token: "", exp: 0 };
async function getToken(cfg) {
  const key = cfg.tenant + "|" + cfg.clientId;
  if (tokenCache.key === key && tokenCache.token && Date.now() < tokenCache.exp - 60000) return tokenCache.token;
  const r = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(cfg.tenant)}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: cfg.clientId,
      client_secret: cfg.secret,
      scope: "https://graph.microsoft.com/.default",
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`token ${r.status}: ${j.error || ""} ${String(j.error_description || "").split("\n")[0]}`);
  tokenCache = { key, token: j.access_token, exp: Date.now() + (Number(j.expires_in) || 3600) * 1000 };
  return j.access_token;
}

async function sendViaGraph(cfg, { subject, text, replyTo, replyName }) {
  const token = await getToken(cfg);
  const message = {
    subject,
    body: { contentType: "Text", content: text },
    toRecipients: cfg.to.map((address) => ({ emailAddress: { address } })),
    replyTo: [{ emailAddress: { address: replyTo, ...(replyName ? { name: replyName } : {}) } }],
  };
  const r = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(cfg.from)}/sendMail`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message, saveToSentItems: true }),
  });
  if (r.status !== 202) {
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) tokenCache = { key: "", token: "", exp: 0 };
    throw new Error(`sendMail ${r.status}: ${(j.error && (j.error.code + " " + j.error.message)) || ""}`);
  }
}

module.exports = handler;
module.exports.buildMessage = buildMessage;
module.exports._test = { config, resendConfig,resetToken: () => { tokenCache = { key: "", token: "", exp: 0 }; } };
