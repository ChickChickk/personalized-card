const supabase = require("./_db");

function generateCode(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { to, from, message, selectedGame } = req.body;

  if (!to || !from || !message || !selectedGame) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Generate a unique short code
  let code, exists;
  do {
    code = generateCode();
    const { data } = await supabase.from("cards").select("code").eq("code", code).single();
    exists = !!data;
  } while (exists);

  const { error } = await supabase.from("cards").insert({
    code,
    data: { to, from, message, selectedGame },
  });

  if (error) return res.status(500).json({ error: "Failed to save card" });

  return res.status(201).json({ code });
};
