// ============================================================
// UGC Onboarding Tracker — Google Apps Script
// Paste this entire file into script.google.com
// ============================================================

const SHEET_NAME = "Onboarding Tracker";

// Canonical name + email for each creator
const CREATORS = {
  "Kristen Stockman": "kristenstockman3@gmail.com",
  "Marco Rivera":     "Ezepargolf@gmail.com",
  "John Bair":        "Mrjohnbair@gmail.com",
  "James Schneider":  "info@workwiththeschneiders.com",
  "Christian B":      "christianbarto2@gmail.com",
  "D'Ondre Stockman": "djstockman3@gmail.com",
  "Jaden Melgoza":    "jadenmugc@gmail.com",
  "Ryan Kennedy":     "rskennedy04@gmail.com",
  "Calvin Ha":        "Calvin.ha@outlook.com"
};

// Merge aliases → canonical name
const NAME_MAP = {
  "James S": "James Schneider"
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    logCompletion(data.creator, data.video, data.completedAt, data.allCompleted);
  } catch(err) {
    logCompletion("ERROR", err.toString(), new Date().toISOString(), false);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Visit this URL in your browser to test the script is working
function doGet(e) {
  logCompletion("TEST USER", "Test Video", new Date().toISOString(), false);
  return ContentService
    .createTextOutput("✅ Script is working! Check your Onboarding Tracker sheet.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function testManually() {
  logCompletion("Test Creator", "Video 1 — Program Overview", new Date().toISOString(), false);
  Logger.log("Done — check the Onboarding Tracker sheet in Google Drive.");
}

function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName("Onboarding Tracker");
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  return SpreadsheetApp.create("Onboarding Tracker");
}

function getOrCreateCreatorFolder(creatorName) {
  // Resolve alias to canonical name
  const canonical = NAME_MAP[creatorName] || creatorName;

  let parentFolder;
  const existing = DriveApp.getFoldersByName("UGC Uploads");
  if (existing.hasNext()) {
    parentFolder = existing.next();
  } else {
    parentFolder = DriveApp.createFolder("UGC Uploads");
  }

  let folder;
  const subs = parentFolder.getFoldersByName(canonical);
  if (subs.hasNext()) {
    folder = subs.next();
  } else {
    folder = parentFolder.createFolder(canonical);
    // Share with creator if email is known
    const email = CREATORS[canonical];
    if (email) {
      folder.addEditor(email);
    }
  }
  return folder;
}

function logCompletion(creator, video, completedAt, allCompleted) {
  getOrCreateCreatorFolder(creator);
  const ss    = getOrCreateSpreadsheet();
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
  const ss         = getOrCreateSpreadsheet();
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

// ── Run this once to create all creator folders in Drive ──
function createCreatorFolders() {
  Object.keys(CREATORS).forEach(name => {
    getOrCreateCreatorFolder(name);
    Logger.log("Created/verified folder for: " + name + " → shared with " + CREATORS[name]);
  });
  Logger.log("Done! Check Google Drive → UGC Uploads.");
}
