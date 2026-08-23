// Client Google Sheets — écriture/lecture directe dans le classeur CONTENT_ENGINE_DYONYSOS.
// Nécessite un compte de service Google Cloud (Sheets API activée) partagé en "Éditeur"
// sur le classeur, avec ses identifiants dans les variables d'environnement Vercel :
//   GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, SPREADSHEET_ID
//
// Tant que ces variables ne sont pas configurées, chaque fonction lève une erreur claire
// (catchée par les routes API -> réponse 501 "configuration requise") plutôt que de planter
// silencieusement : l'interface reste utilisable pendant que le branchement se met en place.

const { google } = require("googleapis");

function assertConfigured() {
  const missing = ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", "SPREADSHEET_ID"].filter(
    (k) => !process.env[k]
  );
  if (missing.length) {
    const err = new Error(
      `Google Sheets non configuré — variables manquantes: ${missing.join(", ")}`
    );
    err.code = "NOT_CONFIGURED";
    throw err;
  }
}

let cachedClient = null;

async function getSheetsClient() {
  assertConfigured();
  if (cachedClient) return cachedClient;
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  await auth.authorize();
  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

function spreadsheetId() {
  return process.env.SPREADSHEET_ID;
}

// Lit toutes les lignes d'un onglet (hors en-tête) sur la plage donnée, ex "PROJECTS!A1:AM"
async function readRows(sheetName, range) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${sheetName}!${range}`,
    valueRenderOption: "FORMATTED_VALUE",
  });
  const values = res.data.values || [];
  if (values.length === 0) return [];
  return values.slice(1); // enlève la ligne d'en-tête
}

// Ajoute une ligne à la fin de l'onglet
async function appendRow(sheetName, rowValues) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(),
    range: `${sheetName}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [rowValues] },
  });
  return res.data;
}

// Met à jour une cellule précise, ex updateCell("CONTENT_QUEUE", "W", 12, "READY")
async function updateCell(sheetName, columnLetter, rowNumber, value) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: `${sheetName}!${columnLetter}${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[value]] },
  });
}

// Retrouve le numéro de ligne réel (1-based, avec en-tête = ligne 1) d'une valeur trouvée
// dans une colonne — utile pour cibler updateCell après un readRows.
function rowNumberFromIndex(indexInDataRows) {
  return indexInDataRows + 2; // +1 pour l'en-tête, +1 pour passer de 0-based à 1-based
}

module.exports = { getSheetsClient, readRows, appendRow, updateCell, rowNumberFromIndex };
