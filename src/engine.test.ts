import { describe, expect, it } from "vitest";
import { cleanAndValidate, createRules, isValidISODate, makeContract, parseCSV, toCSV, transformValue } from "./engine";

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
    expect(transformValue("31/02/2025", "date")).toBe("31/02/2025");
    expect(transformValue("yes", "boolean")).toBe("true");
    expect(transformValue("maybe", "boolean")).toBe("maybe");
  });

  it("rejects impossible calendar dates while retaining source evidence", () => {
    const source = parseCSV("Join date\n31/02/2025\n2025-02-29\n2024-02-29");
    const rules = createRules(source);
    rules[0] = { ...rules[0]!, type: "date", transform: "date" };
    const result = cleanAndValidate(source, rules);

    expect(isValidISODate("2025-02-29")).toBe(false);
    expect(isValidISODate("2024-02-29")).toBe(true);
    expect(result.rows).toEqual([["31/02/2025"], ["2025-02-29"], ["2024-02-29"]]);
    expect(result.issues.map((issue) => [issue.row, issue.originalValue, issue.code])).toEqual([
      [2, "31/02/2025", "type"],
      [3, "2025-02-29", "type"]
    ]);
  });

  it("exports safe CSV and a versioned contract", () => {
    const source = parseCSV("Name\nAda");
    const project = { id: "1", name: "Pilot", updatedAt: "", contractVersion: "1.2.0", source, rules: createRules(source) };
    expect(makeContract(project).version).toBe("1.2.0");
    expect(toCSV(["note"], [['a,"b"']])).toBe('note\r\n"a,""b"""');
  });
});
