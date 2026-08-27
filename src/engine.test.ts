import { describe, expect, it } from "vitest";
import { cleanAndValidate, createRules, makeContract, parseCSV, toCSV, transformValue } from "./engine";

describe("CSV contract engine", () => {
  it("detects syntax, quoted fields, and duplicate headings", () => {
    const source = parseCSV('Name;Name;Note\r\nAda;Lovelace;"line; one"');
    expect(source.parse.delimiter).toBe(";");
    expect(source.headers).toEqual(["Name", "Name_2", "Note"]);
    expect(source.rows[0]).toEqual(["Ada", "Lovelace", "line; one"]);
  });

  it("applies deterministic transforms and retains original values in errors", () => {
    const source = parseCSV("Email,Amount\n A@EXAMPLE.COM ,1,200\nbad,oops");
    const rules = createRules(source);
    rules[0] = { ...rules[0]!, type: "email", transform: "lowercase", required: true };
    rules[1] = { ...rules[1]!, type: "number", transform: "number" };
    const result = cleanAndValidate(source, rules);
    expect(result.rows[0]?.[0]).toBe("a@example.com");
    expect(result.issues.find((issue) => issue.row === 3)?.originalValue).toBe("bad");
  });

  it("normalizes known values without guessing invalid values", () => {
    expect(transformValue(" 01/02/2025 ", "date")).toBe("2025-02-01");
    expect(transformValue("yes", "boolean")).toBe("true");
    expect(transformValue("maybe", "boolean")).toBe("maybe");
  });

  it("exports safe CSV and a versioned contract", () => {
    const source = parseCSV("Name\nAda");
    const project = { id: "1", name: "Pilot", updatedAt: "", contractVersion: "1.2.0", source, rules: createRules(source) };
    expect(makeContract(project).version).toBe("1.2.0");
    expect(toCSV(["note"], [['a,"b"']])).toBe('note\r\n"a,""b"""');
  });
});
