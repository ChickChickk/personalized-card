// Shared helper functions for the API.
// The underscore prefix tells Vercel this is NOT an endpoint — just a module.

function generateCode(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

module.exports = { generateCode };
