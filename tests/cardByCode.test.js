// Tests for GET /api/cards/:code — fetches one card by its code.
// We MOCK Supabase so these tests never touch the real database.

jest.mock("../api/_db", () => ({ from: jest.fn() }));

const supabase = require("../api/_db");
const handler = require("../api/cards/[code]");
const { mockRes, mockReq } = require("./helpers");

// Fake Supabase chain ending in .single() returning { data, error }.
function fakeChain({ data = null, error = null } = {}) {
  const chain = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    single: jest.fn(() => ({ data, error })),
  };
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/cards/:code", () => {
  test("responds 200 to an OPTIONS preflight request", async () => {
    const req = mockReq({ method: "OPTIONS" });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
  });

  test("rejects non-GET methods with 405", async () => {
    const req = mockReq({ method: "POST" });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  test("returns the card data with 200 when found", async () => {
    const cardData = { to: "Sarah", from: "John", message: "hi", selectedGame: "balloons" };
    supabase.from.mockReturnValue(fakeChain({ data: { data: cardData } }));
    const req = mockReq({ method: "GET", query: { code: "abc123" } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(cardData);
  });

  test("returns 404 when the card is not found", async () => {
    supabase.from.mockReturnValue(fakeChain({ data: null, error: { message: "not found" } }));
    const req = mockReq({ method: "GET", query: { code: "nope99" } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(404);
  });
});
