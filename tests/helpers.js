// Shared test helpers for simulating Vercel's (req, res) objects.
// These are NOT tests themselves — just utilities the test files import.

// Builds a fake `res` that records what the handler calls on it.
// status() returns `res` so chaining like res.status(400).json(...) works.
function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.body = undefined;
  res.setHeader = jest.fn();
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((payload) => {
    res.body = payload;
    return res;
  });
  res.end = jest.fn(() => res);
  return res;
}

// Builds a fake `req` with sensible defaults you can override.
function mockReq({ method = "POST", body = {}, query = {} } = {}) {
  return { method, body, query };
}

module.exports = { mockRes, mockReq };
