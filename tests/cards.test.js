// Tests for POST /api/cards — the endpoint that saves a new card.
// We MOCK Supabase so these tests never touch the real database.

// Replace the real Supabase client with a fake one.
jest.mock("../api/_db", () => ({ from: jest.fn() }));

const supabase = require("../api/_db");
const handler = require("../api/cards");
const { mockRes, mockReq } = require("./helpers");

// Builds a fake Supabase chain. `existing` is what the uniqueness
// lookup returns; `insertError` is what the insert returns.
function fakeChain({ existing = null, insertError = null } = {}) {
  const chain = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    single: jest.fn(() => ({ data: existing })),
    insert: jest.fn(() => ({ error: insertError })),
  };
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/cards", () => {
  test("responds 200 to an OPTIONS preflight request", async () => {
    const req = mockReq({ method: "OPTIONS" });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
  });

  test("rejects non-POST methods with 405", async () => {
    const req = mockReq({ method: "GET" });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  test("returns 400 when required fields are missing", async () => {
    const req = mockReq({ body: { to: "Sarah" } }); // missing from/message/game
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/missing/i);
  });

  test("saves a valid card and returns 201 with a code", async () => {
    supabase.from.mockReturnValue(fakeChain({ existing: null, insertError: null }));
    const req = mockReq({
      body: { to: "Sarah", from: "John", message: "hi", selectedGame: "balloons" },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(201);
    expect(typeof res.body.code).toBe("string");
    expect(res.body.code).toHaveLength(6);
  });

  test("returns 500 when the database insert fails", async () => {
    supabase.from.mockReturnValue(
      fakeChain({ existing: null, insertError: { message: "db down" } })
    );
    const req = mockReq({
      body: { to: "Sarah", from: "John", message: "hi", selectedGame: "balloons" },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
  });
});
