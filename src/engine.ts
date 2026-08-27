import type { ColumnRule, DataType, ImportContract, ParseSettings, Project, SourceData, TransformName, ValidationIssue } from "./types";

const DELIMITERS = [",", ";", "\t", "|"];

function splitRecord(record: string, delimiter: string, quote: string): string[] {
  const cells: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < record.length; index += 1) {
    const character = record[index] ?? "";
    if (character === quote) {
      if (quoted && record[index + 1] === quote) {
        value += quote;
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      cells.push(value);
      value = "";
    } else {
      value += character;
    }
  }
  cells.push(value);
  return cells;
}

export function parseCSV(text: string, fileName = "source.csv", delimiterOverride?: string): SourceData {
  const cleanText = text.replace(/^\uFEFF/, "");
  const newline = cleanText.includes("\r\n") ? "\r\n" : cleanText.includes("\r") ? "\r" : "\n";
  const physicalLines = cleanText.split(newline);
  const samples = physicalLines.filter(Boolean).slice(0, 12);
  const delimiter = delimiterOverride || DELIMITERS
    .map((candidate) => ({ candidate, score: samples.reduce((sum, line) => sum + Math.max(0, splitRecord(line, candidate, '"').length - 1), 0) }))
    .sort((a, b) => b.score - a.score)[0]?.candidate || ",";

  const records: string[] = [];
  let record = "";
  let quoted = false;
  for (const line of physicalLines) {
    record += record ? `${newline}${line}` : line;
    const quotes = line.match(/"/g)?.length ?? 0;
    if (quotes % 2 === 1) quoted = !quoted;
    if (!quoted) {
      records.push(record);
      record = "";
    }
  }
  if (record) records.push(record);
  const matrix = records.map((line) => splitRecord(line, delimiter, '"'));
  const rawHeaders = matrix.shift() ?? [];
  const seen = new Map<string, number>();
  const warnings: string[] = [];
  const headers = rawHeaders.map((header, index) => {
    const base = header.trim() || `column_${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    if (count) warnings.push(`Duplicate heading “${base}” was renamed for a stable mapping.`);
    return count ? `${base}_${count + 1}` : base;
  });
  const rows = matrix.filter((row) => row.some((cell) => cell !== ""));
  if (!headers.length) throw new Error("No header row was found in this file.");
  if (rows.some((row) => row.length !== headers.length)) warnings.push("Some rows have a different number of fields than the header row.");
  return {
    fileName,
    fileSize: new Blob([text]).size,
    headers,
    rows: rows.map((row) => headers.map((_, index) => row[index] ?? "")),
    parse: { format: "csv", delimiter, quote: '"', newline, encoding: "utf-8" },
    warnings
    ,rawText: text
  };
}

export function inferType(values: string[]): DataType {
  const present = values.map((value) => value.trim()).filter(Boolean);
  if (!present.length) return "text";
  if (present.every((value) => /^[-+]?\d+(?:[.,]\d+)?$/.test(value))) return "number";
  if (present.every((value) => /^(true|false|yes|no|y|n|0|1)$/i.test(value))) return "boolean";
  if (present.every((value) => /^\d{4}-\d{1,2}-\d{1,2}$/.test(value) || /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(value))) return "date";
  if (present.every((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) return "email";
  return "text";
}

export function createRules(source: SourceData): ColumnRule[] {
  return source.headers.map((header, columnIndex) => {
    const type = inferType(source.rows.slice(0, 100).map((row) => row[columnIndex] ?? ""));
    return {
      source: header,
      target: header.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
      include: true,
      type,
      required: false,
      unique: false,
      transform: type === "number" ? "number" : type === "date" ? "date" : "trim",
      allowedValues: [],
      pattern: ""
    };
  });
}

export function transformValue(input: string, transform: TransformName): string {
  if (transform === "none") return input;
  const value = input.trim();
  if (transform === "trim") return value;
  if (transform === "lowercase") return value.toLowerCase();
  if (transform === "uppercase") return value.toUpperCase();
  if (transform === "number") {
    const normalized = value.replace(/\s/g, "").replace(/,(?=\d{3}(?:\D|$))/g, "");
    return normalized && Number.isFinite(Number(normalized)) ? String(Number(normalized)) : value;
  }
  if (transform === "boolean") {
    if (/^(true|yes|y|1)$/i.test(value)) return "true";
    if (/^(false|no|n|0)$/i.test(value)) return "false";
    return value;
  }
  if (transform === "date") {
    const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) return `${iso[1]}-${iso[2]?.padStart(2, "0")}-${iso[3]?.padStart(2, "0")}`;
    const local = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (local) {
      const year = local[3]?.length === 2 ? `20${local[3]}` : local[3];
      return `${year}-${local[2]?.padStart(2, "0")}-${local[1]?.padStart(2, "0")}`;
    }
  }
  return value;
}

function valueMatchesType(value: string, type: DataType): boolean {
  if (!value) return true;
  if (type === "number") return Number.isFinite(Number(value));
  if (type === "boolean") return value === "true" || value === "false";
  if (type === "date") return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
  if (type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return true;
}

export function cleanAndValidate(source: SourceData, rules: ColumnRule[]): { rows: string[][]; issues: ValidationIssue[] } {
  const active = rules.filter((rule) => rule.include);
  const indices = active.map((rule) => source.headers.indexOf(rule.source));
  const rows = source.rows.map((row) => active.map((rule, index) => transformValue(row[indices[index] ?? -1] ?? "", rule.transform)));
  const issues: ValidationIssue[] = [];
  active.forEach((rule, activeIndex) => {
    const seen = new Map<string, number>();
    rows.forEach((row, rowIndex) => {
      const cleaned = row[activeIndex] ?? "";
      const original = source.rows[rowIndex]?.[indices[activeIndex] ?? -1] ?? "";
      const base = { row: rowIndex + 2, column: rule.source, target: rule.target, originalValue: original };
      if (rule.required && !cleaned) issues.push({ ...base, code: "required", message: "A value is required." });
      if (cleaned && !valueMatchesType(cleaned, rule.type)) issues.push({ ...base, code: "type", message: `Expected ${rule.type}.` });
      if (cleaned && rule.allowedValues.length && !rule.allowedValues.includes(cleaned)) issues.push({ ...base, code: "allowed", message: "Value is not in the allowed list." });
      if (cleaned && rule.pattern) {
        try { if (!new RegExp(rule.pattern).test(cleaned)) issues.push({ ...base, code: "pattern", message: "Value does not match the pattern." }); } catch { /* reported by UI */ }
      }
      if (rule.unique && cleaned) {
        if (seen.has(cleaned)) issues.push({ ...base, code: "unique", message: `Duplicates row ${seen.get(cleaned)}.` });
        else seen.set(cleaned, rowIndex + 2);
      }
    });
  });
  return { rows, issues };
}

export function makeContract(project: Project): ImportContract {
  if (!project.source) throw new Error("A source file is required.");
  const destructive = project.rules.filter((rule) => ["number", "date", "boolean"].includes(rule.transform)).map((rule) => `${rule.source} → ${rule.transform}`);
  const requestedApproval = project.approval ?? { preparedBy: "", reviewedBy: "", status: "draft" as const };
  const approval = requestedApproval.status === "approved" && cleanAndValidate(project.source, project.rules).issues.length
    ? { ...requestedApproval, status: "draft" as const }
    : requestedApproval;
  return {
    schema: "https://csv-import-contract.sociobot.in/schema/v1",
    version: project.contractVersion,
    createdAt: new Date().toISOString(),
    project: project.name,
    source: {
      fileName: project.source.fileName,
      rowCount: project.source.rows.length,
      columns: project.source.headers.length,
      parse: project.source.parse
    },
    columns: project.rules.filter((rule) => rule.include),
    safety: { preserveOriginalRowNumbers: true, deterministicTransforms: true, destructiveCoercions: destructive },
    approval
  };
}

export function escapeCSV(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCSV(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\r\n");
}
