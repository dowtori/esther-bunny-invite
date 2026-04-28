// ============================================================
// 틈결 × ESTHER BUNNY 체크인 시스템 — Google Apps Script
//
// [설정 방법]
// 1. script.google.com → 새 프로젝트 생성
// 2. 이 코드 전체 붙여넣기
// 3. 배포 → 새 배포 → 웹 앱 → 액세스: 모든 사용자
// 4. 배포 URL → teumgyul/api.js의 REPLACE_WITH_APPS_SCRIPT_URL 교체
// ============================================================

const SHEET_ID       = '1RkmLnQlYDpXeCF9666879xBJexe5uppRKwFN1jGYFqc';
const GUESTS_SHEET   = 'guests';
const CHECKINS_SHEET = 'checkins';

// ──────────────────────────────────────────────────────────────
// [guests 시트 컬럼 인덱스] 0-based
// 순서: id | name | phone_last4 | phone | instagram |
//        invite_day | is_checked_in | checked_in_at |
//        companion_name | companion_is_checked_in | actual_day |
//        kakao_sent | kakao_sent_at
// ──────────────────────────────────────────────────────────────
const COL = {
  ID:                    0,
  NAME:                  1,
  PHONE_LAST4:           2,
  PHONE:                 3,
  INSTAGRAM:             4,
  INVITE_DAY:            5,
  IS_CHECKED_IN:         6,
  CHECKED_IN_AT:         7,
  COMPANION_NAME:        8,
  COMPANION_IS_CHECKED:  9,
  ACTUAL_DAY:            10,
  KAKAO_SENT:            11,
  KAKAO_SENT_AT:         12,
};

// ──────────────────────────────────────────────────────────────
// 진입점
// ──────────────────────────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action;
  let result;

  try {
    if      (action === 'lookup')          result = lookup(e.parameter);
    else if (action === 'checkin')         result = checkin(e.parameter);
    else if (action === 'checkin_companion') result = checkinCompanion(e.parameter);
    else if (action === 'kakao_mark')      result = kakaoMark(e.parameter);
    else if (action === 'list')            result = listGuests();
    else                                   result = { error: 'unknown_action' };
  } catch (err) {
    result = { error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ──────────────────────────────────────────────────────────────
// lookup
// ──────────────────────────────────────────────────────────────
function lookup(params) {
  const name   = (params.name  || '').trim();
  const phone4 = (params.phone || '').trim();

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(GUESTS_SHEET);
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (
      String(row[COL.NAME]).trim()        === name &&
      String(row[COL.PHONE_LAST4]).trim() === phone4
    ) {
      return {
        found:         true,
        row_id:        i + 1,
        id:            row[COL.ID],
        name:          row[COL.NAME],
        instagram:     row[COL.INSTAGRAM] || '',
        is_checked_in: toBool(row[COL.IS_CHECKED_IN]),
        checked_in_at: toIso(row[COL.CHECKED_IN_AT]),
      };
    }
  }

  return { found: false };
}

// ──────────────────────────────────────────────────────────────
// checkin
// ──────────────────────────────────────────────────────────────
function checkin(params) {
  const rowId = parseInt(params.row_id, 10);
  const day   = parseInt(params.day,    10);

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(GUESTS_SHEET);
  const row   = sheet.getRange(rowId, 1, 1, sheet.getLastColumn()).getValues()[0];

  if (toBool(row[COL.IS_CHECKED_IN])) {
    return {
      already_checked_in: true,
      checked_in_at: toIso(row[COL.CHECKED_IN_AT]),
    };
  }

  const now = new Date();
  sheet.getRange(rowId, COL.IS_CHECKED_IN + 1).setValue(true);
  sheet.getRange(rowId, COL.CHECKED_IN_AT  + 1).setValue(now);
  sheet.getRange(rowId, COL.ACTUAL_DAY     + 1).setValue(day);

  const logSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CHECKINS_SHEET);
  logSheet.appendRow([row[COL.ID], row[COL.NAME], now, day]);

  return {
    success:        true,
    name:           row[COL.NAME],
    companion_name: row[COL.COMPANION_NAME] || null,
  };
}

// ──────────────────────────────────────────────────────────────
// checkinCompanion
// ──────────────────────────────────────────────────────────────
function checkinCompanion(params) {
  const rowId = parseInt(params.row_id, 10);
  const day   = parseInt(params.day,    10);

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(GUESTS_SHEET);
  const row   = sheet.getRange(rowId, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.getRange(rowId, COL.COMPANION_IS_CHECKED + 1).setValue(true);

  const logSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CHECKINS_SHEET);
  logSheet.appendRow([row[COL.ID], row[COL.COMPANION_NAME] + ' (동행)', new Date(), day]);

  return { success: true };
}

// ──────────────────────────────────────────────────────────────
// kakaoMark — 카카오 발송 상태 수동 업데이트
// ──────────────────────────────────────────────────────────────
function kakaoMark(params) {
  const rowId = parseInt(params.row_id, 10);
  const sent  = params.sent === '1';

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(GUESTS_SHEET);
  sheet.getRange(rowId, COL.KAKAO_SENT    + 1).setValue(sent);
  sheet.getRange(rowId, COL.KAKAO_SENT_AT + 1).setValue(sent ? new Date() : '');

  return { success: true, sent };
}

// ──────────────────────────────────────────────────────────────
// listGuests — 어드민용 전체 목록
// ──────────────────────────────────────────────────────────────
function listGuests() {
  const sheet  = SpreadsheetApp.openById(SHEET_ID).getSheetByName(GUESTS_SHEET);
  const rows   = sheet.getDataRange().getValues();
  const guests = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[COL.NAME]) continue;

    guests.push({
      id:                      row[COL.ID],
      row_id:                  i + 1,
      name:                    row[COL.NAME],
      instagram:               row[COL.INSTAGRAM] || '',
      invite_day:              row[COL.INVITE_DAY],
      is_checked_in:           toBool(row[COL.IS_CHECKED_IN]),
      checked_in_at:           toIso(row[COL.CHECKED_IN_AT]),
      actual_day:              row[COL.ACTUAL_DAY] || null,
      companion_name:          row[COL.COMPANION_NAME] || null,
      companion_is_checked_in: toBool(row[COL.COMPANION_IS_CHECKED]),
      kakao_sent:              toBool(row[COL.KAKAO_SENT]),
      kakao_sent_at:           toIso(row[COL.KAKAO_SENT_AT]),
    });
  }

  return { guests };
}

// ──────────────────────────────────────────────────────────────
// 헬퍼
// ──────────────────────────────────────────────────────────────
function toBool(val) {
  return val === true || String(val).toUpperCase() === 'TRUE';
}

function toIso(val) {
  if (!val) return null;
  try { return new Date(val).toISOString(); } catch { return null; }
}
