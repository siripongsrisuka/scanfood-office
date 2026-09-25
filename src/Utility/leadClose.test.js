// leadClose.test.js — DEV-1642 ②① · jest (react-scripts)
import { validateClose, planClose, planStatus, leadRevenue, billBlockReason } from './leadClose';

const NOW = new Date('2026-09-25T10:00:00+07:00');
const po = (id, data) => ({ collection: 'packageOrder', id, data });
const hw = (id, data) => ({ collection: 'hardwareOrder', id, data });

describe('ปิดการขาย = ต้องผูกบิล (check ②)', () => {
  test('ไม่มีบิล = ปัด', () => {
    expect(validateClose('L1', [])).toEqual({ ok: false, error: 'ปิดการขายต้องผูกบิลอย่างน้อย 1 ใบ' });
    expect(validateClose('L1', undefined).ok).toBe(false);
    expect(planClose({ leadDocId: 'L1', lead: {}, bills: [], now: NOW }).ok).toBe(false);
  });
  test('ปิดผ่านทางเปลี่ยนสถานะธรรมดาไม่ได้', () => {
    expect(planStatus({ lead: { status: 'contacted' }, next: 'closed', now: NOW })).toEqual({ ok: false, error: 'ปิดการขายต้องผูกบิลอย่างน้อย 1 ใบ' });
  });
  test('บิลยกเลิก / บิลของ lead อื่น / ไม่ใช่บิล = ปัด', () => {
    expect(billBlockReason('L1', po('a', { status: 'cancel' }))).toBe('บิลถูกยกเลิกแล้ว');
    expect(billBlockReason('L1', po('a', { status: 'success', leadId: 'L2' }))).toBe('บิลนี้ผูกกับ lead อื่นแล้ว');
    expect(billBlockReason('L1', { collection: 'autoPayment', id: 'x', data: {} })).toBe('ไม่ใช่บิลซอฟต์แวร์/ฮาร์ดแวร์');
    expect(billBlockReason('L1', po('a', { status: 'success', leadId: 'L1' }))).toBeNull();
    expect(validateClose('L1', [po('a', { status: 'cancel', orderNumber: 'SW1' })])).toEqual({ ok: false, error: 'SW1: บิลถูกยกเลิกแล้ว' });
  });
  test('เลือกบิลซ้ำ = ปัด', () => {
    const b = po('a', { status: 'success' });
    expect(validateClose('L1', [b, b]).error).toBe('เลือกบิลซ้ำ');
  });
  test('ผูกสำเร็จ: บิลได้ leadId = doc id · lead ได้ closed + billRefs + timeline', () => {
    const p = planClose({
      leadDocId: 'L1',
      lead: { status: 'contacted', timeline: [{ type: 'contact' }], billRefs: [{ collection: 'packageOrder', id: 'old', orderNumber: 'SW0' }] },
      bills: [po('a', { status: 'success', orderNumber: 'SW1', net: 4200 }), hw('h', { status: 'sent', orderNumber: 'HW1', net: 1500 })],
      now: NOW, by: 'sale1',
    });
    expect(p.ok).toBe(true);
    expect(p.billUpdates).toEqual([
      { collection: 'packageOrder', id: 'a', update: { leadId: 'L1' } },
      { collection: 'hardwareOrder', id: 'h', update: { leadId: 'L1' } },
    ]);
    expect(p.leadUpdate.status).toBe('closed');
    expect(p.leadUpdate.billRefs).toEqual([
      { collection: 'packageOrder', id: 'old', orderNumber: 'SW0' },
      { collection: 'packageOrder', id: 'a', orderNumber: 'SW1' },
      { collection: 'hardwareOrder', id: 'h', orderNumber: 'HW1' },
    ]);
    expect(p.leadUpdate.timeline).toEqual([{ type: 'contact' }, { type: 'closed', timestamp: NOW, by: 'sale1', bills: ['packageOrder/a', 'hardwareOrder/h'] }]);
    expect(p.leadUpdate).not.toHaveProperty('purchaseValue');
  });
  test('ผูกบิลเดิมซ้ำ (ปิดรอบ 2) billRefs ไม่ซ้ำ', () => {
    const p = planClose({ leadDocId: 'L1', lead: { billRefs: [{ collection: 'packageOrder', id: 'a', orderNumber: 'SW1' }] }, bills: [po('a', { status: 'success', leadId: 'L1', orderNumber: 'SW1' })], now: NOW });
    expect(p.leadUpdate.billRefs).toHaveLength(1);
  });
});

describe('ยอดขายของ lead = ผลรวมบิลจ่ายแล้ว (§3)', () => {
  test('บิลจ่ายแล้ว 1 ใบ = ยอดนั้นเป๊ะ', () => {
    expect(leadRevenue([po('a', { status: 'success', net: 4200.5 })])).toBe(4200.5);
  });
  test('request นับ · cancel ไม่นับ · บิลซ้ำนับครั้งเดียว · ฮาร์ดแวร์ sent นับ', () => {
    expect(leadRevenue([
      po('a', { status: 'request', net: 3000 }), po('a', { status: 'request', net: 3000 }),
      po('c', { status: 'cancel', net: 999 }), hw('h', { status: 'sent', net: '1500' }),
    ])).toBe(4500);
  });
  test('ไม่มีบิล = 0', () => expect(leadRevenue([])).toBe(0));
});

describe('เปลี่ยนสถานะ 4 ค่าที่ไม่ต้องผูกบิล (check ①)', () => {
  test.each(['not_contacted', 'contacting', 'unreachable', 'rejected'])('%s เขียนค่าใหม่ + timeline', (next) => {
    const p = planStatus({ lead: { status: next === 'not_contacted' ? 'in_progress' : 'registered', timeline: [] }, next, now: NOW, by: 's' });
    expect(p).toEqual({ ok: true, leadUpdate: { status: next, timeline: [{ type: next, timestamp: NOW, by: 's' }], updatedAt: NOW } });
  });
  test('สถานะเดิม (รวมค่าเก่าที่แมปแล้ว) = ปัด', () => {
    expect(planStatus({ lead: { status: 'not_interested' }, next: 'rejected', now: NOW }).ok).toBe(false);
    expect(planStatus({ lead: { status: 'registered' }, next: 'not_contacted', now: NOW }).ok).toBe(false);
  });
  test('ค่าแปลก = ปัด', () => expect(planStatus({ lead: {}, next: 'purchased', now: NOW }).ok).toBe(false));
});

import { billSummaryByLead, effectiveStatus, CLOSED_BY_BILL_LABEL } from './leadClose';

describe('จอเซลนับปิดการขายตัวเดียวกับ dashboard (รอบ 3)', () => {
  const bill = (col, id, data) => [`${col}/${id}`, { collection: col, id, data }];
  const billsById = new Map([
    bill('packageOrder', 'p1', { status: 'success', net: 4200 }),
    bill('hardwareOrder', 'h1', { status: 'sent', net: 1500 }),
    bill('packageOrder', 'pc', { status: 'cancel', net: 999 }),
    bill('packageOrder', 'pr', { status: 'request', net: 3000 }),
  ]);
  const leads = [
    { id: 'A' },                                                     // ทาง ข อย่างเดียว
    { id: 'B', billRefs: [{ collection: 'packageOrder', id: 'pr' }] }, // ทาง ก
    { id: 'C' },                                                     // มีแต่บิลยกเลิก
    { id: 'D' },                                                     // ไม่มีบิล
  ];
  const apDocs = [
    { leadId: 'A', reference: ['p1', 'h1'] }, { leadId: 'A', reference: ['p1'] }, // ซ้ำ = นับครั้งเดียว
    { leadId: 'B', reference: ['pr'] },                                          // ซ้ำทาง ก
    { leadId: 'C', reference: ['pc'] },
    { leadId: 'Z', reference: ['p1'] },                                          // lead นอกจอ
  ];
  const m = billSummaryByLead({ leads, apDocs, billsById });
  test('รวม ก ∪ ข · บิลซ้ำนับครั้งเดียว · ยกเลิกไม่นับ', () => {
    expect(m.get('A')).toEqual({ revenue: 5700, hasPaidBill: true });
    expect(m.get('B')).toEqual({ revenue: 3000, hasPaidBill: true });
    expect(m.get('C')).toEqual({ revenue: 0, hasPaidBill: false });
    expect(m.has('D')).toBe(false);
    expect(m.has('Z')).toBe(false);
  });
  test('ค้าง contacted แต่มีบิลจ่าย = ปิดการขาย (มีบิลจ่าย) · ไม่มีบิล = ติดต่ออยู่', () => {
    expect(effectiveStatus({ status: 'contacted' }, true)).toEqual({ key: 'closed', label: CLOSED_BY_BILL_LABEL, byBill: true });
    expect(effectiveStatus({ status: 'contacted' }, false)).toEqual({ key: 'contacting', label: 'ติดต่ออยู่', byBill: false });
    expect(effectiveStatus({ status: 'purchased' }, false)).toEqual({ key: 'closed', label: 'ปิดการขาย', byBill: false });
    expect(effectiveStatus({ status: 'weird' }, false)).toEqual({ key: null, label: null, byBill: false });
  });
  test('บิลยกเลิกอย่างเดียวไม่ทำให้ปิด', () => {
    expect(effectiveStatus({ status: 'contacted' }, m.get('C').hasPaidBill).key).toBe('contacting');
  });
});
