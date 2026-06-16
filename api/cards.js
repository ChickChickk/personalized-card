const supabase = require("./_db");
const { generateCode } = require("./_utils");

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { to, from, message, selectedGame } = req.body;

  if (!to || !from || !message || !selectedGame) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Insert with a fresh code. The `code` column has a UNIQUE constraint, so
  // the database guarantees no duplicates — on the rare collision (Postgres
  // error 23505) we generate a new code and retry.
  const MAX_ATTEMPTS = 5;
  let code, error;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    code = generateCode();
    ({ error } = await supabase.from("cards").insert({
      code,
      data: { to, from, message, selectedGame },
    }));

    if (!error) return res.status(201).json({ code });
    if (error.code !== "23505") break; // real error — stop retrying
  }

  return res.status(500).json({ error: error.message, details: error });
};
