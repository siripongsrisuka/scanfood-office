// leadChannel.test.js (scanfood-office · jest ผ่าน react-scripts) — DEV-1642
// ไฟล์ leadChannel.js + leadChannel.cases.json = สำเนาตรงตัวจาก scanfood_server/functions/claude/marketingExport/
// เทสนี้รันเคสชุดเดียวกับฝั่ง server ⇒ 2 สำเนาให้คำตอบเดียวกันเสมอ (แก้ต้นฉบับแล้ว cp ทับทั้ง 2 ไฟล์)
import * as L from './leadChannel';
import C from './leadChannel.cases.json';

test('9 ช่องตามลำดับสัญญา §1', () => {
  expect(L.CHANNEL_KEYS).toEqual(['facebook', 'google-search', 'google-app', 'apple-search', 'chatgpt', 'line', 'tiktok', 'website', 'unknown']);
});
test.each(C.channel.map((c) => [c.why, c.lead, c.want]))('channelOf: %s', (_why, lead, want) => {
  expect(L.channelOf(lead)).toBe(want);
});
test.each(C.status)('normalizeStatus(%p) = %p', (raw, want) => {
  expect(L.normalizeStatus(raw)).toBe(want);
});
test.each(C.contacted.map((c) => [c.why, c.lead, c.want]))('isContacted: %s', (_why, lead, want) => {
  expect(L.isContacted(lead)).toBe(want);
});
test.each(C.closedWithBills.map((c) => [c.why, c.lead, c.paid, c.want]))('isClosedWithBills: %s', (_why, lead, paid, want) => {
  expect(L.isClosedWithBills(lead, paid)).toBe(want);
});
test.each(C.paid)('isPaidBill(%s, %s) = %p', (col, st, want) => {
  expect(L.isPaidBill(col, { status: st })).toBe(want);
});
