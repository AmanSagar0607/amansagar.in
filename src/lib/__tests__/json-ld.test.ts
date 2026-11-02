import { serializeJsonLd } from "../json-ld";

test("escapes script-breaking content while preserving JSON data", () => {
  const input = { title: '</script><script>alert("x")</script>' };
  const result = serializeJsonLd(input);
  expect(result).not.toContain("<");
  expect(JSON.parse(result)).toEqual(input);
});
