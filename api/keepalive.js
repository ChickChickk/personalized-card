const supabase = require("./_db");

// Lightweight endpoint used by the scheduled GitHub Action to keep the
// Supabase project from being auto-paused for inactivity. It runs a cheap
// read (head request for a row count) — a real DB query, but it creates no
// rows and returns almost no data.
module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { error, count } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true });

  if (error) return res.status(500).json({ ok: false, error: error.message });

  return res.status(200).json({ ok: true, count, at: new Date().toISOString() });
};
