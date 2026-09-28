// jest (react-scripts test) — รัน: CI=true npx react-scripts test --watchAll=false src/Utility/pendingTicket.test.js
// ตรึงด่าน "ห้ามออก QT ซ้ำให้ร้านที่มีใบแพ็กเกจค้าง" (Pack เคาะเมนู 3 · 2026-09-28) — ทั้ง 2 ทิศ:
//   ต้องบล็อก (เคสเฮงปังปั๊ว) และ **ต้องไม่บล็อก** (ฮาร์ดแวร์ · 1 เดือน · คนละแพ็กเกจ · ใบเดิมจบแล้ว · QT เดิมจ่ายแล้ว)
import {
  UNPAID_PROCESSES, PENDING_TICKET_STATUS,
  softwareIdsOf, findPendingTicket, findUnpaidQuotation, describePackages, checkBeforeIssue,
} from './pendingTicket';

const LICENSES = [{ id: '1', content: 'POS', day: '365' }, { id: 2, content: 'Member', day: '365' }];
const qt = (ids, extra = {}) => ({ software: ids.map((id) => ({ id, name: `pkg-${id}` })), ...extra });
const ticket = (status, packageId, extra = {}) => ({ id: 'po1', status, packageId, orderNumber: 'QT2609000182', requestBillDate: '2026-10-01', ...extra });

describe('softwareIdsOf', () => {
  test('อ่าน software[].id เป็นสตริง · ข้ามตัวที่ไม่มี id · ไม่มี software = []', () => {
    expect(softwareIdsOf(qt(['1', 2]))).toEqual(['1', '2']);
    expect(softwareIdsOf({ software: [{ name: 'x' }, null, { id: 3 }] })).toEqual(['3']);
    expect(softwareIdsOf({})).toEqual([]);
    expect(softwareIdsOf(null)).toEqual([]);
  });
});

describe('findPendingTicket — ตรรกะเดียวกับ server findPendingTicket (00924c2)', () => {
  test('🩸 เฮงปังปั๊ว: ใบ request แพ็กเกจเดียวกัน → เจอ พร้อม overlap/เลขใบ/วันเริ่ม', () => {
    const p = findPendingTicket([ticket('request', ['1', '2'])], ['2', '9']);
    expect(p).toEqual({ id: 'po1', orderNumber: 'QT2609000182', requestBillDate: '2026-10-01', packageId: ['1', '2'], overlap: ['2'] });
  });
  test('เทียบเป็นสตริง — packageId ในฐานเป็นเลข ก็ยังชน', () => {
    expect(findPendingTicket([ticket('request', [1, 2])], ['2'])).not.toBeNull();
  });
  test('ไม่บล็อก: แพ็กเกจคนละชุด', () => {
    expect(findPendingTicket([ticket('request', ['1'])], ['2'])).toBeNull();
  });
  test('ไม่บล็อก: ใบเดิม success / cancel / failed (ผู้เรียกส่งมาปน = ต้องกรองเอง)', () => {
    for (const s of ['success', 'cancel', 'failed', 'order', undefined]) {
      expect(findPendingTicket([ticket(s, ['1'])], ['1'])).toBeNull();
    }
  });
  test('ไม่บล็อก: ids ว่าง (ฮาร์ดแวร์ล้วน / 1 เดือน) แม้มีใบค้าง', () => {
    expect(findPendingTicket([ticket('request', ['1'])], [])).toBeNull();
  });
  test('ของพิกลรูปไม่ระเบิด: tickets ไม่ใช่ array · ใบไม่มี packageId', () => {
    expect(findPendingTicket(null, ['1'])).toBeNull();
    expect(findPendingTicket([{ id: 'x', status: 'request' }], ['1'])).toBeNull();
  });
  test('ค่าคงที่: สถานะที่นับว่าค้าง = request ตัวเดียว', () => {
    expect(PENDING_TICKET_STATUS).toBe('request');
  });
});

describe('findUnpaidQuotation — QT เดิมของร้านที่ยังไม่จ่าย', () => {
  test('สถานะยังไม่จ่ายทั้ง 4 ค่า + แพ็กเกจซ้อน → เจอ', () => {
    expect(UNPAID_PROCESSES).toEqual(['request', 'checking', 'preManual', 'manual']);
    for (const process of UNPAID_PROCESSES) {
      const u = findUnpaidQuotation([{ id: 'ap1', process, orderNumber: 'QT2609000304', software: [{ id: '1' }], saleName: 'บุษบา' }], ['1']);
      expect(u).toEqual({ id: 'ap1', orderNumber: 'QT2609000304', requestBillDate: '', process, saleName: 'บุษบา', overlap: ['1'] });
    }
  });
  test('ไม่บล็อก: QT เดิมจ่ายแล้ว/ยกเลิก/ล้มเหลว/demo', () => {
    for (const process of ['success', 'paid', 'cancel', 'failed', 'demo', undefined]) {
      expect(findUnpaidQuotation([{ id: 'ap1', process, software: [{ id: '1' }] }], ['1'])).toBeNull();
    }
  });
  test('ไม่บล็อก: QT เดิมยังไม่จ่ายแต่คนละแพ็กเกจ / ฮาร์ดแวร์ล้วน', () => {
    expect(findUnpaidQuotation([{ id: 'ap1', process: 'request', software: [{ id: '2' }] }], ['1'])).toBeNull();
    expect(findUnpaidQuotation([{ id: 'ap1', process: 'request', software: [], hardware: [{ id: 'h1' }] }], ['1'])).toBeNull();
  });
});

describe('describePackages', () => {
  test('รู้จัก = ชื่อ (รหัส) · ไม่รู้จัก = รหัสตรง ๆ · id เลข/สตริงเทียบกันได้', () => {
    expect(describePackages(['1', '2', '77'], LICENSES)).toBe('POS 365 (1), Member 365 (2), 77');
    expect(describePackages(['1'], undefined)).toBe('1');
  });
});

describe('checkBeforeIssue — ตัวที่ SaleScreen เรียกจริง', () => {
  const tickets = [ticket('request', ['1'])];
  const unpaid = [{ id: 'ap1', process: 'preManual', orderNumber: 'QT2609000304', software: [{ id: '2' }] }];

  test('🩸 บล็อก pending-ticket: ข้อความมีเลขใบ · แพ็กเกจ · วันเริ่ม · คำสั่ง "ยกเลิกหรือเปิดใบเดิมก่อน"', () => {
    const r = checkBeforeIssue({ quotation: qt(['1']), tickets, quotations: unpaid, licenses: LICENSES });
    expect(r.ok).toBe(false);
    expect(r.kind).toBe('pending-ticket');
    expect(r.message).toContain('QT2609000182');
    expect(r.message).toContain('POS 365 (1)');
    expect(r.message).toContain('2026-10-01');
    expect(r.message).toContain('ยกเลิกหรือเปิดใบเดิมก่อน');
  });
  test('บล็อก unpaid-quotation: QT เดิมยังไม่จ่าย แพ็กเกจเดียวกัน → บอกเลขใบ/สถานะ/ให้ยกเลิกใบเดิมก่อน', () => {
    const r = checkBeforeIssue({ quotation: qt(['2']), tickets, quotations: unpaid, licenses: LICENSES });
    expect(r.ok).toBe(false);
    expect(r.kind).toBe('unpaid-quotation');
    expect(r.message).toContain('QT2609000304');
    expect(r.message).toContain('preManual');
    expect(r.message).toContain('ยกเลิกใบเดิมก่อน');
  });
  test('ใบค้างมาก่อน QT ค้าง (เจอทั้งคู่ = รายงานใบค้างที่จ่ายแล้วก่อน)', () => {
    const r = checkBeforeIssue({ quotation: qt(['1', '2']), tickets, quotations: unpaid });
    expect(r.kind).toBe('pending-ticket');
  });
  test('⭐ ชุดควบคุมทิศผ่าน: ฮาร์ดแวร์ล้วน · 1 เดือน · คนละแพ็กเกจ · ไม่มีใบค้าง = ผ่านหมด', () => {
    expect(checkBeforeIssue({ quotation: { software: [], hardware: [{ id: 'h1', qty: 1 }] }, tickets, quotations: unpaid })).toEqual({ ok: true });
    expect(checkBeforeIssue({ quotation: { software: [], oneMonth: true }, tickets, quotations: unpaid })).toEqual({ ok: true });
    expect(checkBeforeIssue({ quotation: qt(['9']), tickets, quotations: unpaid })).toEqual({ ok: true });
    expect(checkBeforeIssue({ quotation: qt(['1', '2']), tickets: [], quotations: [] })).toEqual({ ok: true });
    expect(checkBeforeIssue({ quotation: qt(['1']), tickets: undefined, quotations: undefined })).toEqual({ ok: true });
  });
});
