module.exports = (req, res) => {
  res.json({
    groq: !!process.env.GROQ_API_KEY,
    supabaseUrl: !!process.env.SUPABASE_URL,
    supabaseKey: !!process.env.SUPABASE_KEY,
  });
};
