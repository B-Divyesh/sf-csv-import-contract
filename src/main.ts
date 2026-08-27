import "./styles.css";
import { cleanAndValidate, createRules, makeContract, parseCSV, toCSV } from "./engine";
import { clearProject, listProjects, loadProject, saveProject } from "./storage";
import { checkoutUrl, initialLicenseState, storeLicense, verifyLicense, type LicenseState } from "./license";
import type { ColumnRule, Project, SourceData, TransformName } from "./types";

const mount = document.querySelector<HTMLDivElement>("#app");
if (!mount) throw new Error("App mount is missing.");
const app: HTMLDivElement = mount;

let project: Project = { id: "current", name: "Untitled migration", contractVersion: "1.0.0", updatedAt: new Date().toISOString(), rules: [], approval: { preparedBy: "", reviewedBy: "", status: "draft" } };
let step = 0;
let busy = false;
let saveStatus = "Ready";
let saveTimer = 0;
let license: LicenseState = initialLicenseState();
let announcement = "";
let archives: Project[] = [];
let updateAvailable = false;

const steps = ["Source", "Map", "Validate", "Handoff"];
const OFFLINE_KEY = "csv-contract:offline";
const isOffline = (): boolean => !navigator.onLine || sessionStorage.getItem(OFFLINE_KEY) === "1";
const esc = (value: unknown): string => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function download(name: string, contents: string, type: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function scheduleSave(): void {
  saveStatus = "Saving…";
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(async () => {
    project.updatedAt = new Date().toISOString();
    try {
      await saveProject(project);
      saveStatus = "Saved on this device";
    } catch {
      saveStatus = "Could not save locally";
    }
    renderChromeStatus();
  }, 350);
  renderChromeStatus();
}

function renderChromeStatus(): void {
  const status = document.querySelector<HTMLElement>("#save-status");
  if (status) status.textContent = saveStatus;
  const live = document.querySelector<HTMLElement>("#announcer");
  if (live && announcement) {
    live.textContent = announcement;
    announcement = "";
  }
}

function header(): string {
  return `<a class="skip-link" href="#main">Skip to workspace</a>
    <header class="site-header">
      <a class="brand" href="/" aria-label="CSV Import Contract home"><span class="brand-mark" aria-hidden="true">⌗</span><span>CSV / import contract</span></a>
      <div class="header-actions">
        <span class="connection" id="connection"><span aria-hidden="true">●</span> <span>${isOffline() ? "Offline—local tools ready" : "Local & online"}</span></span>
        <button class="text-button" id="license-button" type="button">${license.unlocked ? "Pro active" : "Unlock Pro"}</button>
      </div>
    </header>`;
}

function shell(content: string): string {
  const sourceReady = Boolean(project.source);
  return `${header()}
    <div class="sheet-number" aria-hidden="true">SHEET 01 / REV ${esc(project.contractVersion)}</div>
    <main id="main" tabindex="-1">
      <section class="masthead">
        <div>
          <p class="eyebrow">Local migration workbench</p>
          <h1>Make the import<br><em>repeatable.</em></h1>
          <p class="lede">Turn parsing assumptions, column decisions, and validation rules into a contract another person can run—not another undocumented cleanup.</p>
        </div>
        ${sourceReady ? `<div class="source-stamp"><span>Active source</span><strong>${esc(project.source?.fileName)}</strong><small>${project.source?.rows.length.toLocaleString()} data rows · never uploaded</small></div>` : ""}
      </section>
      ${sourceReady ? navigation() : ""}
      <div id="workspace" class="workspace">${content}</div>
    </main>
    <footer><p>Files and working data stay in this browser. <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></p><p>Original generated illustration · CSV Import Contract v1</p></footer>
    <div class="save-strip"><span id="save-status">${esc(saveStatus)}</span><span>Contract ${esc(project.contractVersion)}</span></div>
    <div id="announcer" class="sr-only" aria-live="polite"></div>
    ${updateAvailable ? '<div class="update-toast" role="status"><span>An app update is ready.</span><button id="reload-app" type="button">Reload</button></div>' : ""}
    <dialog id="license-dialog">${licenseDialog()}</dialog>`;
}

function navigation(): string {
  return `<nav class="step-rail" aria-label="Contract steps"><ol>${steps.map((label, index) => `<li><button type="button" data-step="${index}" ${index === step ? 'aria-current="step"' : ""}><span>${String(index + 1).padStart(2, "0")}</span>${label}</button></li>`).join("")}</ol></nav>`;
}

function emptyState(): string {
  return `<section class="hero-sheet" aria-labelledby="start-heading">
      <div class="hero-copy">
        <p class="dimension">01 — establish source</p>
        <h2 id="start-heading">Inspect before you import.</h2>
        <p>Open a CSV or Excel export. We’ll reveal its parsing assumptions, propose a column contract, and keep every source value on your device.</p>
        <div class="drop-zone" id="drop-zone">
          <input id="source-file" type="file" accept=".csv,.tsv,.txt,.xlsx" aria-describedby="file-help">
          <label class="primary-button" for="source-file">Choose a CSV or XLSX</label>
          <span id="file-help">or drop it here · processed locally</span>
        </div>
        <button class="sample-button" id="sample-button" type="button">Try a safe sample</button>
        <p class="error-message" id="file-error" role="alert"></p>
      </div>
      <picture class="hero-art">
        <source srcset="/assets/contract-drafting-hero-768.avif 768w, /assets/contract-drafting-hero.avif 1280w" sizes="(max-width: 900px) 100vw, 55vw" type="image/avif">
        <source srcset="/assets/contract-drafting-hero-768.webp 768w, /assets/contract-drafting-hero.webp 1280w" sizes="(max-width: 900px) 100vw, 55vw" type="image/webp">
        <img src="/assets/contract-drafting-hero.jpg" width="1280" height="853" fetchpriority="high" alt="Technical illustration of messy data strips passing through a measuring jig and becoming a precise contract sheet.">
      </picture>
      <div class="trust-line"><span>01 / Read locally</span><span>02 / Make rules explicit</span><span>03 / Hand off evidence</span></div>
    </section>`;
}

function sourcePanel(): string {
  const source = project.source!;
  const sampleRows = source.rows.slice(0, 5);
  return `<section class="panel" aria-labelledby="source-heading">
    <div class="panel-heading"><div><p class="dimension">01 — source profile</p><h2 id="source-heading">Parsing assumptions</h2></div><button class="secondary-button" id="replace-file" type="button">Replace source</button></div>
    <div class="metrics">
      <div><span>Format</span><strong>${source.parse.format.toUpperCase()}</strong></div>
      <div><span>Rows</span><strong>${source.rows.length.toLocaleString()}</strong></div>
      <div><span>Columns</span><strong>${source.headers.length}</strong></div>
      <div><span>Size</span><strong>${formatBytes(source.fileSize)}</strong></div>
    </div>
    <dl class="syntax-card">
      <div><dt>Delimiter</dt><dd>${source.parse.format === "csv" ? source.parse.delimiter === "\t" ? "Tab" : `<code>${esc(source.parse.delimiter)}</code>` : "Worksheet cells"}</dd></div>
      <div><dt>Quote</dt><dd><code>${esc(source.parse.quote || "n/a")}</code></dd></div>
      <div><dt>New line</dt><dd><code>${esc(source.parse.newline.replace("\r", "CR").replace("\n", "LF"))}</code></dd></div>
      <div><dt>Encoding</dt><dd>${esc(source.parse.encoding.toUpperCase())}</dd></div>
      ${source.parse.sheet ? `<div><dt>Worksheet</dt><dd>${esc(source.parse.sheet)}</dd></div>` : ""}
    </dl>
    ${source.warnings.length ? `<div class="notice warning"><strong>Review the source</strong><ul>${source.warnings.map((warning) => `<li>${esc(warning)}</li>`).join("")}</ul></div>` : `<div class="notice success"><strong>Structure looks consistent</strong><span>No uneven records were found in the sample.</span></div>`}
    <div class="table-wrap" tabindex="0" aria-label="Scrollable source data preview"><table><caption>First ${sampleRows.length} source rows</caption><thead><tr><th scope="col">Source row</th>${source.headers.map((header) => `<th scope="col">${esc(header)}</th>`).join("")}</tr></thead><tbody>${sampleRows.map((row, index) => `<tr><th scope="row">${index + 2}</th>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    ${panelActions("Continue to map", 1)}
  </section>`;
}

const typeOptions = ["text", "number", "date", "boolean", "email"];
const transformOptions: TransformName[] = ["none", "trim", "lowercase", "uppercase", "number", "date", "boolean"];

function mappingPanel(): string {
  return `<section class="panel" aria-labelledby="mapping-heading">
    <div class="panel-heading"><div><p class="dimension">02 — mapping schedule</p><h2 id="mapping-heading">Define the receiving shape</h2><p>Rename targets, exclude columns, and choose a deterministic transform. Coercions are marked for review.</p></div></div>
    <div class="mapping-list" role="list">${project.rules.map((rule, index) => mappingRow(rule, index)).join("")}</div>
    ${panelActions("Continue to validate", 2)}
  </section>`;
}

function mappingRow(rule: ColumnRule, index: number): string {
  const destructive = ["number", "date", "boolean"].includes(rule.transform);
  return `<fieldset class="mapping-row" data-index="${index}"><legend class="sr-only">Mapping for ${esc(rule.source)}</legend>
    <label class="include-control"><input type="checkbox" data-field="include" ${rule.include ? "checked" : ""}><span>Include</span></label>
    <div class="mapping-source"><span>Source</span><strong>${esc(rule.source)}</strong></div><span class="mapping-arrow" aria-hidden="true">→</span>
    <label><span>Target field</span><input type="text" data-field="target" value="${esc(rule.target)}" required></label>
    <label><span>Type</span><select data-field="type">${typeOptions.map((type) => `<option value="${type}" ${rule.type === type ? "selected" : ""}>${type}</option>`).join("")}</select></label>
    <label><span>Transform ${destructive ? '<b class="coercion">Review</b>' : ""}</span><select data-field="transform">${transformOptions.map((transform) => `<option value="${transform}" ${rule.transform === transform ? "selected" : ""}>${transform}</option>`).join("")}</select></label>
  </fieldset>`;
}

function validationPanel(): string {
  const active = project.rules.filter((rule) => rule.include);
  const result = cleanAndValidate(project.source!, project.rules);
  return `<section class="panel" aria-labelledby="validation-heading">
    <div class="panel-heading"><div><p class="dimension">03 — acceptance schedule</p><h2 id="validation-heading">Set pass / fail rules</h2><p>Rules run against the full file. Every issue points back to its original row and value.</p></div><div class="issue-count ${result.issues.length ? "has-issues" : ""}"><strong>${result.issues.length}</strong><span>issues</span></div></div>
    <div class="rule-grid">${project.rules.map((rule, index) => rule.include ? `<fieldset class="rule-card" data-index="${index}"><legend>${esc(rule.target)}</legend>
      <p>from <code>${esc(rule.source)}</code> · ${esc(rule.type)}</p>
      <div class="check-row"><label><input type="checkbox" data-field="required" ${rule.required ? "checked" : ""}> Required</label><label><input type="checkbox" data-field="unique" ${rule.unique ? "checked" : ""}> Unique</label></div>
      <label><span>Allowed values <small>comma-separated</small></span><input data-field="allowedValues" value="${esc(rule.allowedValues.join(", "))}"></label>
      <label><span>Pattern <small>regular expression</small></span><input data-field="pattern" value="${esc(rule.pattern)}" placeholder="e.g. ^[A-Z]{3}$"></label>
    </fieldset>` : "").join("")}</div>
    <section class="result-section" aria-labelledby="result-heading"><div class="subheading"><h3 id="result-heading">Validation evidence</h3><span>${active.length} included fields · ${project.source?.rows.length} rows checked</span></div>
      ${result.issues.length ? issueTable(result.issues.slice(0, 100)) : `<div class="zero-state"><span aria-hidden="true">✓</span><div><strong>All current rules pass.</strong><p>The handoff will record this validation run.</p></div></div>`}
    </section>
    ${panelActions("Review handoff", 3)}
  </section>`;
}

function issueTable(issues: ReturnType<typeof cleanAndValidate>["issues"]): string {
  return `<div class="table-wrap" tabindex="0" aria-label="Scrollable validation issues"><table><caption>${issues.length} validation issues${issues.length === 100 ? " (first 100 shown)" : ""}</caption><thead><tr><th>Source row</th><th>Field</th><th>Issue</th><th>Original value</th></tr></thead><tbody>${issues.map((issue) => `<tr><th scope="row">${issue.row}</th><td>${esc(issue.target)}</td><td><span class="error-tag">${esc(issue.code)}</span> ${esc(issue.message)}</td><td><code>${esc(issue.originalValue || "(empty)")}</code></td></tr>`).join("")}</tbody></table></div>`;
}

function handoffPanel(): string {
  const source = project.source!;
  const result = cleanAndValidate(source, project.rules);
  const included = project.rules.filter((rule) => rule.include);
  const coercions = included.filter((rule) => ["number", "date", "boolean"].includes(rule.transform));
  const targetNames = included.map((rule) => rule.target.trim()).filter(Boolean);
  const mappingProblems = !included.length || included.some((rule) => !rule.target.trim()) || new Set(targetNames).size !== targetNames.length;
  return `<section class="panel" aria-labelledby="handoff-heading">
    <div class="panel-heading"><div><p class="dimension">04 — issue for handoff</p><h2 id="handoff-heading">A portable agreement</h2><p>Export the machine-readable contract, cleaned review file, and evidence report together.</p></div><span class="approval-stamp ${result.issues.length ? "revision" : ""}">${result.issues.length ? "Review required" : "Ready to hand off"}</span></div>
    <div class="project-fields"><label><span>Project / client name</span><input id="project-name" value="${esc(project.name)}"></label><label><span>Contract version</span><input id="contract-version" value="${esc(project.contractVersion)}" pattern="\d+\.\d+\.\d+"></label></div>
    <fieldset class="signoff"><legend>Review sign-off</legend><label><span>Prepared by</span><input id="prepared-by" value="${esc(project.approval?.preparedBy ?? "")}"></label><label><span>Reviewed by</span><input id="reviewed-by" value="${esc(project.approval?.reviewedBy ?? "")}"></label><label><span>Status</span><select id="approval-status"><option value="draft" ${project.approval?.status !== "approved" ? "selected" : ""}>Draft</option><option value="approved" ${project.approval?.status === "approved" ? "selected" : ""} ${result.issues.length ? "disabled" : ""}>Approved${result.issues.length ? " — resolve issues first" : ""}</option></select></label></fieldset>
    ${mappingProblems ? '<div class="notice danger"><strong>Mapping is not exportable</strong><span>Include at least one field, and give every included target a unique name. Return to Map to correct it.</span></div>' : ""}
    ${coercions.length ? `<div class="notice warning"><strong>Destructive coercions are documented</strong><span>${coercions.map((rule) => `${esc(rule.source)} → ${esc(rule.transform)}`).join(" · ")}. Original values remain in the issue report.</span></div>` : ""}
    <section class="clean-preview" aria-labelledby="clean-preview-heading"><div class="subheading"><h3 id="clean-preview-heading">Cleaned preview</h3><span>First ${Math.min(5, result.rows.length)} rows after transforms</span></div>
      <div class="table-wrap" tabindex="0" aria-label="Scrollable cleaned data preview"><table><caption>Transformed values before export</caption><thead><tr><th>Source row</th>${included.map((rule) => `<th>${esc(rule.target || "(unnamed)")}</th>`).join("")}</tr></thead><tbody>${result.rows.slice(0, 5).map((row, index) => `<tr><th scope="row">${index + 2}</th>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    </section>
    <div class="export-grid">
      <article><span class="file-mark">{ }</span><h3>Contract JSON</h3><p>Parsing syntax, mappings, transforms, validation rules, and safety notes.</p><button class="primary-button export" data-export="contract" type="button" ${mappingProblems ? "disabled" : ""}>Export contract</button></article>
      <article><span class="file-mark">CSV</span><h3>Cleaned data</h3><p>All transformed rows, ready for an independent test import.</p><button class="secondary-button export" data-export="clean" type="button" ${mappingProblems ? "disabled" : ""}>Export cleaned CSV</button></article>
      <article><span class="file-mark">MD</span><h3>Handoff report</h3><p>Human-readable decisions, counts, warnings, and issue evidence.</p><button class="secondary-button export" data-export="report" type="button" ${mappingProblems ? "disabled" : ""}>Export report</button></article>
      <article><span class="file-mark">!</span><h3>Error evidence</h3><p>Source row, target field, reason, and untouched original value.</p><button class="secondary-button export" data-export="errors" type="button" ${!result.issues.length ? "disabled" : ""}>Export issues CSV</button></article>
    </div>
    <div class="import-contract"><div><h3>Repeat this contract</h3><p>Open a contract JSON after choosing another compatible source file.</p></div><label class="secondary-button" for="contract-file">Import contract JSON</label><input class="sr-only" id="contract-file" type="file" accept="application/json,.json"></div>
    <div class="privacy-callout"><strong>Your evidence package is yours.</strong><p>Nothing was uploaded. Send these artifacts through your approved client channel.</p></div>
  </section>`;
}

function panelActions(label: string, next: number): string {
  return `<div class="panel-actions"><span>${steps[step]} complete when the decisions above are correct.</span><button class="primary-button next-step" data-next="${next}" type="button">${label} <span aria-hidden="true">→</span></button></div>`;
}

function licenseDialog(): string {
  return `<form method="dialog" class="dialog-shell"><button class="dialog-close" value="cancel" aria-label="Close license panel">×</button>
    <p class="dimension">Reusable practice</p><h2>${license.unlocked ? "Pro is active" : "Unlock Pro once"}</h2>
    <p>The free workbench always includes profiling, all safety rules, and every export. Pro adds a reusable multi-client project archive for a one-time <strong>$29</strong>.</p>
    ${license.unlocked ? `<div class="notice success"><strong>License active on this device</strong><span>${esc(license.notice)}</span></div><div class="archive-tools"><button class="secondary-button" id="archive-project" type="button" ${project.source ? "" : "disabled"}>Archive current project</button>${archives.length ? `<ul>${archives.map((item) => `<li><button type="button" class="archive-item" data-archive="${esc(item.id)}"><strong>${esc(item.name)}</strong><span>${new Date(item.updatedAt).toLocaleDateString()}</span></button></li>`).join("")}</ul>` : '<p class="dialog-notice">No archived projects yet.</p>'}</div>` : `<a class="primary-button buy-link" href="${checkoutUrl}">Buy Pro securely · $29</a>`}
    <label><span>Have a license? Paste it here</span><input id="license-input" type="text" autocomplete="off" spellcheck="false"></label>
    <button class="secondary-button" id="restore-license" type="button">Verify license</button>
    <p class="dialog-notice" id="license-notice" role="status">${esc(license.notice)}</p>
    <small>Sociobot/Dodo is the merchant of record. Refunds are handled there and revoke the license automatically. <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></small>
  </form>`;
}

function render(): void {
  const panel = !project.source ? emptyState() : step === 0 ? sourcePanel() : step === 1 ? mappingPanel() : step === 2 ? validationPanel() : handoffPanel();
  app.innerHTML = shell(panel);
  bindEvents();
}

async function readSource(file: File): Promise<void> {
  busy = true;
  const error = document.querySelector<HTMLElement>("#file-error");
  if (error) error.textContent = "Reading the file locally…";
  try {
    let source: SourceData;
    if (/\.xlsx$/i.test(file.name)) {
      const XLSX = await import("read-excel-file/browser");
      const sheets = await XLSX.default(file);
      const firstSheet = sheets[0];
      const sheetName = firstSheet?.sheet;
      if (!sheetName || !firstSheet) throw new Error("The workbook has no visible worksheet.");
      const matrix = firstSheet.data;
      if (!matrix.length) throw new Error("The first worksheet is empty.");
      const csv = toCSV([], matrix.map((row) => row.map((cell) => cell === null ? "" : cell instanceof Date ? cell.toISOString().slice(0, 10) : String(cell)))).replace(/^\r\n/, "");
      source = parseCSV(csv, file.name, ",");
      source.fileSize = file.size;
      source.rawText = undefined;
      source.parse = { format: "xlsx", delimiter: "", quote: "", newline: "\n", encoding: "utf-8", sheet: sheetName };
      source.warnings.unshift(`Using the first worksheet: “${sheetName}”.`);
    } else {
      const text = await file.text();
      if (!text.trim()) throw new Error("This file is empty. Choose an export with a header row.");
      source = parseCSV(text, file.name);
      source.fileSize = file.size;
    }
    project.source = source;
    project.rules = createRules(source);
    project.approval = { preparedBy: project.approval?.preparedBy ?? "", reviewedBy: "", status: "draft" };
    step = 0;
    announcement = `${file.name} profiled. ${source.rows.length} rows and ${source.headers.length} columns found.`;
    scheduleSave();
    render();
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "The file could not be read.";
    if (error) error.textContent = `${message} Choose a CSV, TSV, or XLSX with headings in its first row.`;
  } finally { busy = false; }
}

function updateRule(element: HTMLInputElement | HTMLSelectElement): void {
  const fieldset = element.closest<HTMLElement>("[data-index]");
  const index = Number(fieldset?.dataset.index);
  const field = element.dataset.field as keyof ColumnRule | undefined;
  const rule = project.rules[index];
  if (!rule || !field) return;
  if (field === "pattern" && element.value) {
    try { new RegExp(element.value); (element as HTMLInputElement).setCustomValidity(""); }
    catch { (element as HTMLInputElement).setCustomValidity("Enter a valid regular expression."); (element as HTMLInputElement).reportValidity(); return; }
  }
  if (field === "include" || field === "required" || field === "unique") rule[field] = (element as HTMLInputElement).checked;
  else if (field === "allowedValues") rule.allowedValues = element.value.split(",").map((value) => value.trim()).filter(Boolean);
  else if (field === "type") rule.type = element.value as ColumnRule["type"];
  else if (field === "transform") rule.transform = element.value as ColumnRule["transform"];
  else if (field === "target" || field === "pattern") rule[field] = element.value;
  if (project.approval?.status === "approved") project.approval.status = "draft";
  scheduleSave();
}

function reportText(): string {
  const source = project.source!;
  const result = cleanAndValidate(source, project.rules);
  const contract = makeContract(project);
  const issueEvidence = result.issues.slice(0, 100).map((issue) => `- Row ${issue.row}, ${issue.target}: ${issue.message} Original value: ${JSON.stringify(issue.originalValue)}`).join("\n");
  return `# Import handoff — ${project.name}\n\nContract version: ${project.contractVersion}\nGenerated: ${contract.createdAt}\nStatus: ${contract.approval.status}\nPrepared by: ${contract.approval.preparedBy || "Not recorded"}\nReviewed by: ${contract.approval.reviewedBy || "Not recorded"}\n\n## Source profile\n\n- File: ${source.fileName}\n- Rows: ${source.rows.length}\n- Columns: ${source.headers.length}\n- Format: ${source.parse.format.toUpperCase()}\n- Delimiter: ${source.parse.delimiter || "worksheet cells"}\n- Quote: ${source.parse.quote || "n/a"}\n- Newline: ${JSON.stringify(source.parse.newline)}\n- Encoding: UTF-8\n${source.warnings.map((warning) => `- Warning: ${warning}`).join("\n")}\n\n## Mapping and rules\n\n${project.rules.filter((rule) => rule.include).map((rule) => `- ${rule.source} → ${rule.target} (${rule.type}; transform: ${rule.transform}; required: ${rule.required}; unique: ${rule.unique})`).join("\n")}\n\n## Validation result\n\n${result.issues.length ? `${result.issues.length} issue(s) found.\n\n${issueEvidence}${result.issues.length > 100 ? "\n- Additional issues are available in the exported error CSV." : ""}` : `All ${source.rows.length} rows passed the current rules.`}\n\n## Safety\n\nTransforms are deterministic. Original source row numbers and values are preserved in issue evidence. This contract does not execute a production import.\n`;
}

function exportArtifact(kind: string): void {
  const source = project.source!;
  const result = cleanAndValidate(source, project.rules);
  const active = project.rules.filter((rule) => rule.include);
  const targetNames = active.map((rule) => rule.target.trim()).filter(Boolean);
  if (!active.length || active.some((rule) => !rule.target.trim()) || new Set(targetNames).size !== targetNames.length) {
    alert("Include at least one field and give every included target a unique name before export.");
    return;
  }
  const base = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "import";
  if (kind === "contract") download(`${base}.import-contract.json`, JSON.stringify(makeContract(project), null, 2), "application/json");
  if (kind === "clean") download(`${base}.cleaned.csv`, toCSV(active.map((rule) => rule.target), result.rows), "text/csv;charset=utf-8");
  if (kind === "report") download(`${base}.handoff.md`, reportText(), "text/markdown;charset=utf-8");
  if (kind === "errors") download(`${base}.issues.csv`, toCSV(["source_row", "source_column", "target_field", "code", "message", "original_value"], result.issues.map((issue) => [String(issue.row), issue.column, issue.target, issue.code, issue.message, issue.originalValue])), "text/csv;charset=utf-8");
  announcement = `${kind} export prepared.`;
  renderChromeStatus();
}

function bindEvents(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-step]").forEach((button) => button.addEventListener("click", () => { step = Number(button.dataset.step); render(); document.querySelector("#workspace")?.scrollIntoView(); }));
  document.querySelectorAll<HTMLButtonElement>("[data-next]").forEach((button) => button.addEventListener("click", () => { step = Number(button.dataset.next); render(); document.querySelector("#workspace")?.scrollIntoView({ behavior: "smooth" }); }));
  document.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-field]").forEach((input) => input.addEventListener("change", () => { updateRule(input); if (step === 2 || input.dataset.field === "transform") render(); }));
  const file = document.querySelector<HTMLInputElement>("#source-file");
  file?.addEventListener("change", () => { if (file.files?.[0] && !busy) void readSource(file.files[0]); });
  const zone = document.querySelector<HTMLElement>("#drop-zone");
  zone?.addEventListener("dragover", (event) => { event.preventDefault(); zone.classList.add("is-dragging"); });
  zone?.addEventListener("dragleave", () => zone.classList.remove("is-dragging"));
  zone?.addEventListener("drop", (event) => { event.preventDefault(); zone.classList.remove("is-dragging"); if (event.dataTransfer?.files[0]) void readSource(event.dataTransfer.files[0]); });
  document.querySelector("#sample-button")?.addEventListener("click", () => {
    const sample = new File(["Customer ID,Email,Join date,Active,Balance\nC-001, ADA@EXAMPLE.COM ,31/01/2025,yes,\"1,200\"\nC-002,bad address,2025-02-04,no,58.40\nC-002,grace@example.com,05/02/2025,Y,unknown"], "migration-sample.csv", { type: "text/csv" });
    void readSource(sample);
  });
  document.querySelector("#replace-file")?.addEventListener("click", async () => {
    if (!confirm(`Replace “${project.source?.fileName}”? The current rules will be cleared.`)) return;
    project.source = undefined; project.rules = []; step = 0; await clearProject(); render();
  });
  document.querySelectorAll<HTMLButtonElement>(".export").forEach((button) => button.addEventListener("click", () => exportArtifact(button.dataset.export ?? "")));
  document.querySelector("#project-name")?.addEventListener("change", (event) => { project.name = (event.target as HTMLInputElement).value.trim() || "Untitled migration"; scheduleSave(); });
  document.querySelector("#contract-version")?.addEventListener("change", (event) => {
    const input = event.target as HTMLInputElement;
    if (!/^\d+\.\d+\.\d+$/.test(input.value)) { input.setCustomValidity("Use a semantic version such as 1.0.0."); input.reportValidity(); return; }
    input.setCustomValidity(""); project.contractVersion = input.value; scheduleSave();
  });
  document.querySelector("#prepared-by")?.addEventListener("change", (event) => { project.approval = { ...(project.approval ?? { preparedBy: "", reviewedBy: "", status: "draft" }), preparedBy: (event.target as HTMLInputElement).value.trim() }; scheduleSave(); });
  document.querySelector("#reviewed-by")?.addEventListener("change", (event) => { project.approval = { ...(project.approval ?? { preparedBy: "", reviewedBy: "", status: "draft" }), reviewedBy: (event.target as HTMLInputElement).value.trim() }; scheduleSave(); });
  document.querySelector("#approval-status")?.addEventListener("change", (event) => { project.approval = { ...(project.approval ?? { preparedBy: "", reviewedBy: "", status: "draft" }), status: (event.target as HTMLSelectElement).value as "draft" | "approved" }; scheduleSave(); render(); });
  const contractFile = document.querySelector<HTMLInputElement>("#contract-file");
  contractFile?.addEventListener("change", async () => {
    const file = contractFile.files?.[0];
    if (!file || !project.source) return;
    try {
      const contract = JSON.parse(await file.text()) as { version?: string; project?: string; columns?: ColumnRule[]; approval?: Project["approval"] };
      if (!Array.isArray(contract.columns)) throw new Error("Missing columns");
      const available = new Set(project.source.headers);
      project.rules = contract.columns.map((rule) => ({ ...rule, include: available.has(rule.source) }));
      project.contractVersion = contract.version ?? project.contractVersion;
      project.name = contract.project ?? project.name;
      project.approval = contract.approval ?? project.approval;
      scheduleSave(); announcement = "Contract imported and matched to the current source."; render();
    } catch { alert("That JSON is not a supported import contract. Export a v1 contract and try again."); }
  });
  const dialog = document.querySelector<HTMLDialogElement>("#license-dialog");
  document.querySelector("#license-button")?.addEventListener("click", () => dialog?.showModal());
  document.querySelector("#restore-license")?.addEventListener("click", async () => {
    const token = document.querySelector<HTMLInputElement>("#license-input")?.value.trim();
    if (!token) return;
    storeLicense(token);
    const notice = document.querySelector<HTMLElement>("#license-notice");
    if (notice) notice.textContent = "Verifying…";
    license = await verifyLicense(token, true);
    render();
    document.querySelector<HTMLDialogElement>("#license-dialog")?.showModal();
  });
  document.querySelector("#archive-project")?.addEventListener("click", async () => {
    const snapshot = structuredClone(project);
    snapshot.id = `archive:${crypto.randomUUID()}`;
    snapshot.updatedAt = new Date().toISOString();
    await saveProject(snapshot);
    archives = await listProjects();
    announcement = "Project archived for reuse.";
    render();
    document.querySelector<HTMLDialogElement>("#license-dialog")?.showModal();
  });
  document.querySelectorAll<HTMLButtonElement>("[data-archive]").forEach((button) => button.addEventListener("click", async () => {
    const archived = await loadProject(button.dataset.archive);
    if (!archived) return;
    project = structuredClone(archived);
    project.id = "current";
    step = 0;
    scheduleSave();
    announcement = `${project.name} opened from the archive.`;
    render();
  }));
  document.querySelector("#reload-app")?.addEventListener("click", () => location.reload());
}

window.addEventListener("online", () => { sessionStorage.removeItem(OFFLINE_KEY); const element = document.querySelector("#connection span:last-child"); if (element) element.textContent = "Local & online"; });
window.addEventListener("offline", () => { sessionStorage.setItem(OFFLINE_KEY, "1"); const element = document.querySelector("#connection span:last-child"); if (element) element.textContent = "Offline—local tools ready"; });

async function start(): Promise<void> {
  try { project = await loadProject() ?? project; } catch { saveStatus = "Local storage unavailable"; }
  try { archives = await listProjects(); } catch { /* optional archive */ }
  render();
  if (license.token) { license = await verifyLicense(license.token); render(); }
  if ("serviceWorker" in navigator) {
    let alreadyControlled = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.register("/sw.js").catch(() => { /* app remains usable */ });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (alreadyControlled) { updateAvailable = true; render(); }
      alreadyControlled = true;
    });
  }
}

void start();
