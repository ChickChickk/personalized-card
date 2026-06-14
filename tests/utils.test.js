const { generateCode } = require("../api/_utils");

describe("generateCode", () => {
  test("returns a 6-character code by default", () => {
    const code = generateCode();
    expect(code).toHaveLength(6);
  });

  test("only uses lowercase letters and numbers", () => {
    const code = generateCode();
    expect(code).toMatch(/^[a-z0-9]+$/);
  });

  test("respects a custom length", () => {
    expect(generateCode(10)).toHaveLength(10);
    expect(generateCode(3)).toHaveLength(3);
  });

  test("produces different codes on each call (very likely unique)", () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateCode());
    }
    // 100 random 6-char codes should essentially never collide
    expect(codes.size).toBe(100);
  });
});
