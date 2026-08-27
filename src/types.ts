export type DataType = "text" | "number" | "date" | "boolean" | "email";
export type TransformName = "none" | "trim" | "lowercase" | "uppercase" | "number" | "date" | "boolean";

export interface ParseSettings {
  format: "csv" | "xlsx";
  delimiter: string;
  quote: string;
  newline: string;
  encoding: "utf-8";
  sheet?: string;
}

export interface ColumnRule {
  source: string;
  target: string;
  include: boolean;
  type: DataType;
  required: boolean;
  unique: boolean;
  transform: TransformName;
  allowedValues: string[];
  pattern: string;
}

export interface SourceData {
  fileName: string;
  fileSize: number;
  headers: string[];
  rows: string[][];
  parse: ParseSettings;
  warnings: string[];
  rawText?: string;
}

export interface ValidationIssue {
  row: number;
  column: string;
  target: string;
  code: "required" | "type" | "unique" | "allowed" | "pattern";
  message: string;
  originalValue: string;
}

export interface Project {
  id: string;
  name: string;
  contractVersion: string;
  updatedAt: string;
  source?: SourceData;
  rules: ColumnRule[];
}

export interface ImportContract {
  schema: "https://csv-import-contract.sociobot.in/schema/v1";
  version: string;
  createdAt: string;
  project: string;
  source: {
    fileName: string;
    rowCount: number;
    columns: number;
    parse: ParseSettings;
  };
  columns: ColumnRule[];
  safety: {
    preserveOriginalRowNumbers: true;
    deterministicTransforms: true;
    destructiveCoercions: string[];
  };
}
