// ============================================================
// API LAYER — Google Apps Script
//
// ⚠️  ENDPOINT 값을 Apps Script 배포 URL로 교체하세요.
// ============================================================

const API = {
  ENDPOINT: 'https://script.google.com/macros/s/AKfycbzb2yYiJgoGvoJPZhK9FEnV2l4buugy3jULeeDj5W8nXkRLeJcmMfhTwrR5Vof8AF6RlQ/exec',

  async lookup(name, phone4) {
    const url = this.ENDPOINT
      + '?action=lookup'
      + '&name='  + encodeURIComponent(name.trim())
      + '&phone=' + encodeURIComponent(phone4.trim());
    const res = await fetch(url);
    return res.json();
  },

  async checkin(rowId, day) {
    const url = this.ENDPOINT
      + '?action=checkin'
      + '&row_id=' + rowId
      + '&day='    + day;
    const res = await fetch(url);
    return res.json();
  },

  async checkinCompanion(rowId, day) {
    const url = this.ENDPOINT
      + '?action=checkin_companion'
      + '&row_id=' + rowId
      + '&day='    + day;
    const res = await fetch(url);
    return res.json();
  },

  async list() {
    const url = this.ENDPOINT + '?action=list';
    const res = await fetch(url);
    return res.json();
  },

  // 카카오 발송 상태 업데이트 (sent: true=발송완료, false=취소)
  async kakaoMark(rowId, sent) {
    const url = this.ENDPOINT
      + '?action=kakao_mark'
      + '&row_id=' + rowId
      + '&sent='   + (sent ? '1' : '0');
    const res = await fetch(url);
    return res.json();
  },
};
