// Vercel Function: POST /api/quote
// Emails a quote request from the website through the shop's own mailbox (SMTP).
// No third-party form service. Configure in Vercel → Project → Settings → Environment Variables:
//   SMTP_HOST   mail server, e.g. smtp.gmail.com
//   SMTP_PORT   465 (SSL) or 587 (STARTTLS)
//   SMTP_USER   the mailbox login, e.g. info@theprintshops.ca
//   SMTP_PASS   that mailbox's password or app password
//   QUOTE_TO    who receives requests (comma-separated), e.g. michael@theprintshops.ca
//   SMTP_FROM   optional "From" address (defaults to SMTP_USER)
// Until these are set the endpoint answers 503 and the site falls back to opening the visitor's email app.
const nodemailer = require("nodemailer");

const LIMITS = { source: 60, name: 120, company: 160, email: 200, phone: 60, product: 120, qty: 60, size: 200, details: 5000 };
const ATTR_KEYS = ["source", "medium", "campaign", "term", "content", "landing", "referrer", "gclid", "fbclid", "msclkid",
  "first_source", "first_medium", "first_campaign", "first_landing", "first_days_ago", "submitted_from"];
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
  for (const k of ATTR_KEYS) a[k] = oneLine(clean(raw[k], 200));
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

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, QUOTE_TO, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !QUOTE_TO) {
    return res.status(503).json({ ok: false, error: "not_configured" });
  }

  const port = Number(SMTP_PORT) || 587;
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({ from: SMTP_FROM || SMTP_USER, to: QUOTE_TO, replyTo, subject, text });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("quote: send failed:", err && err.message);
    return res.status(502).json({ ok: false, error: "send_failed" });
  }
}

module.exports = handler;
module.exports.buildMessage = buildMessage;
