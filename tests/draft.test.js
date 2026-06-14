// Tests for POST /api/draft — the AI message generator.
// We MOCK the Groq SDK so these tests never make a real AI call.

// This mock fn stands in for groq.chat.completions.create().
// The name must start with "mock" for Jest to allow it inside jest.mock().
const mockCreate = jest.fn();

jest.mock("groq-sdk", () => {
  // Groq is used as `new Groq(...)`, so the mock is a constructor
  // returning an object with the chat.completions.create method.
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  }));
});

const handler = require("../api/draft");
const { mockRes, mockReq } = require("./helpers");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/draft", () => {
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

  test("returns 400 when the prompt is missing", async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/prompt/i);
  });

  test("returns 200 with the generated message on success", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "  A warm little note.  " } }],
    });
    const req = mockReq({ body: { prompt: "a note for my friend" } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("A warm little note."); // trimmed
  });

  test("returns 500 when the AI returns an empty response", async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: "" } }] });
    const req = mockReq({ body: { prompt: "hi" } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
  });

  test("returns 500 when the Groq call throws", async () => {
    mockCreate.mockRejectedValue(new Error("groq exploded"));
    const req = mockReq({ body: { prompt: "hi" } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
  });
});
