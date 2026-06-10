// ============================================================
// UGC Onboarding Tracker — Google Apps Script
// Paste this entire file into script.google.com
// ============================================================

const SHEET_NAME = "Onboarding Tracker";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    logCompletion(data.creator, data.video, data.completedAt, data.allCompleted);
  } catch(err) {
    // silent
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function logCompletion(creator, video, completedAt, allCompleted) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName(SHEET_NAME);

  // Create sheet + headers on first run
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, 6).setValues([[
      "Timestamp", "Creator", "Video Completed", "Completed At", "All Videos Done?", "Notes"
    ]]);
    sheet.getRange(1, 1, 1, 6)
      .setBackground("#0f3460")
      .setFontColor("#ffffff")
      .setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    creator,
    video,
    completedAt,
    allCompleted ? "YES ✓" : "",
    ""
  ]);

  // Auto-resize columns for readability
  sheet.autoResizeColumns(1, 6);

  // Highlight "all done" rows in green
  if (allCompleted) {
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 6).setBackground("#d4edda");
  }
}

// ── Dashboard summary (run manually to refresh) ──────────
function buildDashboard() {
  const ss         = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet   = ss.getSheetByName(SHEET_NAME);
  if (!logSheet) { Logger.log("No data yet."); return; }

  let dash = ss.getSheetByName("Dashboard");
  if (!dash) dash = ss.insertSheet("Dashboard");
  dash.clearContents();

  const data      = logSheet.getDataRange().getValues();
  const headers   = data[0];
  const rows      = data.slice(1);

  // Count completed videos per creator
  const creatorMap = {};
  rows.forEach(row => {
    const creator = row[1];
    const video   = row[2];
    if (!creatorMap[creator]) creatorMap[creator] = new Set();
    creatorMap[creator].add(video);
  });

  // Build dashboard table
  const dashData = [["Creator", "Videos Watched", "Progress", "Fully Onboarded?"]];
  const videoTitles = ["Video 1 — Program Overview", "Video 2 — Content Guidelines",
                       "Video 3 — Shoot & Edit Tips", "Video 4 — Submission Process"];

  Object.keys(creatorMap).sort().forEach(name => {
    const watched  = creatorMap[name].size;
    const progress = watched + " / 4";
    const done     = watched >= 4 ? "✅ Yes" : "⏳ In Progress";
    dashData.push([name, watched, progress, done]);
  });

  dash.getRange(1, 1, dashData.length, 4).setValues(dashData);
  dash.getRange(1, 1, 1, 4)
    .setBackground("#0f3460")
    .setFontColor("#ffffff")
    .setFontWeight("bold");
  dash.setFrozenRows(1);
  dash.autoResizeColumns(1, 4);

  Logger.log("Dashboard updated.");
}
