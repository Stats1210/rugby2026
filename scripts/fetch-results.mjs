// Runs inside GitHub Actions. Fetches live Nations Championship scores from the
// rugby API and writes results.json. The API key comes from repo Secrets
// (APISPORTS_KEY) — never committed, never exposed to the browser.
//
// If no key is set, it writes an empty feed so the app cleanly falls back to
// manual score entry.

import { writeFileSync, readFileSync } from "node:fs";

// "Home|Away" (no rankings) -> our internal match id used by the app.
const FIXTURE_MAP = {
  "New Zealand|France": 1, "Japan|Italy": 2, "Australia|Ireland": 3, "Fiji|Wales": 4,
  "South Africa|England": 5, "Argentina|Scotland": 6, "New Zealand|Italy": 7, "Australia|France": 8,
  "Japan|Ireland": 9, "Fiji|England": 10, "South Africa|Scotland": 11, "Argentina|Wales": 12,
  "New Zealand|Ireland": 13, "Japan|France": 14, "Australia|Italy": 15, "Fiji|Scotland": 16,
  "South Africa|Wales": 17, "Argentina|England": 18, "Ireland|Argentina": 19, "Italy|South Africa": 20,
  "Scotland|New Zealand": 21, "Wales|Japan": 22, "France|Fiji": 23, "England|Australia": 24,
  "France|South Africa": 25, "Italy|Argentina": 26, "Wales|New Zealand": 27, "England|Japan": 28,
  "Ireland|Fiji": 29, "Scotland|Australia": 30, "Scotland|Japan": 31, "England|New Zealand": 32,
  "Ireland|South Africa": 33, "Italy|Fiji": 34, "Wales|Australia": 35, "France|Argentina": 36
};

// Normalise team names the API might phrase differently.
const ALIASES = {
  "usa": "United States", "united states of america": "United States"
};
function norm(name) {
  let n = (name || "").replace(/\brugby\b/ig, "").replace(/\bunion\b/ig, "").trim();
  const key = n.toLowerCase();
  return ALIASES[key] || n;
}

async function main() {
  const key = process.env.APISPORTS_KEY;
  const out = { updated: new Date().toISOString(), results: {} };

  if (!key) {
    console.log("No APISPORTS_KEY set — writing empty feed (app uses manual entry).");
    save(out);
    return;
  }

  try {
    // Nations Championship 2026. If results don't show once the tournament is live,
    // confirm the league id/season in the API dashboard and adjust this URL.
    const url = "https://v1.rugby.api-sports.io/games?season=2026&search=Nations";
    const r = await fetch(url, { headers: { "x-apisports-key": key } });
    const data = await r.json();
    const games = data.response || [];
    console.log(`API returned ${games.length} games.`);

    for (const g of games) {
      const home = norm(g.teams?.home?.name);
      const away = norm(g.teams?.away?.name);
      const id = FIXTURE_MAP[`${home}|${away}`];
      if (!id) continue;
      const hs = g.scores?.home, as = g.scores?.away;
      if (hs == null || as == null) continue;
      const st = g.status?.short;           // NS, 1H, HT, 2H, FT, ...
      if (st === "NS") continue;            // not started → skip
      out.results[id] = { h: hs, a: as, status: st === "FT" ? "FT" : (st || "LIVE") };
    }
    console.log(`Mapped ${Object.keys(out.results).length} results.`);
  } catch (e) {
    console.error("Fetch failed:", e);
    // Keep whatever results.json already has rather than wiping it on a transient error.
    try {
      const prev = JSON.parse(readFileSync("results.json", "utf8"));
      if (prev && prev.results) out.results = prev.results;
    } catch {}
    out.error = String(e);
  }

  save(out);
}

function save(out) {
  writeFileSync("results.json", JSON.stringify(out, null, 2) + "\n");
  console.log("Wrote results.json");
}

main();
