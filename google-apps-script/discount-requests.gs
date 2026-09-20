// Use ONLY in the dedicated Register & Get Discount Apps Script project.
// Do not replace the separate free-download/email script.
const DISCOUNT_SPREADSHEET_ID = '1G2UHzWdQqx1ySpXF_EPSbAKzXxerf68MOKDy6IzkeWw';
const DISCOUNT_SHEET_NAME = 'Discount Requests v2';
const DISCOUNT_HEADERS = ['Timestamp', 'Previous Course', 'Name', 'Email', 'WhatsApp', 'Interested Course', 'Reason', 'Source', 'Review Status'];

function setupDiscountSheet() {
  const spreadsheet = SpreadsheetApp.openById(DISCOUNT_SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(DISCOUNT_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(DISCOUNT_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, DISCOUNT_HEADERS.length).setValues([DISCOUNT_HEADERS]);
    sheet.setFrozenRows(1);
  }
  const headers = sheet.getRange(1, 1, 1, DISCOUNT_HEADERS.length).getValues()[0];
  if (headers.join('|') !== DISCOUNT_HEADERS.join('|')) {
    throw new Error('Sheet headers differ. Use a new empty tab name to preserve existing data.');
  }
  return sheet;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const p = (e && e.parameter) || {};
    const name = String(p.name || '').trim();
    const email = String(p.email || '').trim();
    const phone = String(p.phone || '').trim();
    const course = String(p.course || '').trim();
    // Compatibility with a cached version of the old form.
    const previousCourse = String(p.previousCourse || 'Not provided (legacy form)').trim();
    const reason = String(p.reason || 'Not specified').trim();
    if (!name || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !/^[+\d\s().-]+$/.test(phone) || phone.replace(/\D/g, '').length < 10 ||
        phone.replace(/\D/g, '').length > 15 || phone.length > 25 ||
        !course || course.length > 200 || previousCourse.length > 200 || reason.length > 500) {
      return discountJson({success: false, error: 'Please check your form details.'});
    }
    lock.waitLock(15000);
    const sheet = setupDiscountSheet();
    // Escape spreadsheet formulas in untrusted form values; preserve phone +/zeros.
    const text = value => /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
    sheet.appendRow([new Date(), text(previousCourse), text(name), text(email), "'" + phone,
      text(course), text(reason), 'Register & Get Discount', 'Pending review']);
    SpreadsheetApp.flush();
    return discountJson({success: true});
  } catch (error) {
    console.error(error);
    return discountJson({success: false, error: 'Unable to save your request. Please try again.'});
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function discountJson(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
