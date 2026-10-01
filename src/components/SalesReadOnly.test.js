// jest (react-scripts test) — รัน: CI=true npx react-scripts test --watchAll=false src/components/SalesReadOnly.test.js
// ตรึงสวิตช์ "หมวด 3. Sales ดูได้อย่างเดียว" (DEV-1664 · Pack เคาะ 2026-10-01) ทั้ง 2 ทิศ:
//   ใต้ wrapper + สวิตช์เปิด = ล็อก (toast + คืน true · แถบขึ้น) · นอก wrapper หรือสวิตช์ปิด = ไม่ล็อก (หมวดอื่นเขียนได้ตามเดิม)
import React from 'react';
import { render, screen } from '@testing-library/react';
import { toast } from 'react-toastify';
import {
  SalesReadOnly, useSalesReadOnly, salesWriteBlocked, isSalesReadOnly,
  SALES_READONLY_BANNER,
} from './SalesReadOnly';
import { LEGACY_SALES_READONLY, LEGACY_SALES_ROUTES, SCANOFFICE_SALES_URL } from '../configs/legacySales';

jest.mock('react-toastify', () => ({ toast: { warn: jest.fn(), success: jest.fn(), error: jest.fn() } }));

function Probe() {
  const readOnly = useSalesReadOnly();
  return <span data-testid="probe">{readOnly ? 'locked' : 'writable'}</span>;
}

beforeEach(() => { toast.warn.mockClear(); });

describe('สวิตช์ใน configs/legacySales.js', () => {
  test('สวิตช์เปิดอยู่ (ของที่ commit = ล็อกหมวด 3)', () => {
    expect(LEGACY_SALES_READONLY).toBe(true);
  });
  test('route หมวด 3 ครบ 14 ตัว + ลิงก์ scanoffice ชี้หน้า leads', () => {
    expect(LEGACY_SALES_ROUTES).toHaveLength(14);
    expect(LEGACY_SALES_ROUTES).toEqual(expect.arrayContaining(['sale', 'lead', 'extraDay', 'manualPaid', 'packageHistory', 'hardwareHistory', 'newShop']));
    expect(SCANOFFICE_SALES_URL).toBe('https://scanoffice.web.app/sales/leads');
  });
});

describe('isSalesReadOnly — ล็อกต้องครบ 2 ข้อ', () => {
  test('สวิตช์เปิด + ใต้หมวด 3 = ล็อก', () => expect(isSalesReadOnly(true, true)).toBe(true));
  test('สวิตช์เปิดแต่ไม่ได้อยู่ใต้หมวด 3 (เช่น 5. คลัง) = ไม่ล็อก', () => expect(isSalesReadOnly(true, false)).toBe(false));
  test('สวิตช์ปิด = ไม่ล็อก แม้อยู่ใต้หมวด 3', () => expect(isSalesReadOnly(false, true)).toBe(false));
});

describe('salesWriteBlocked — ด่านของฟังก์ชันเขียน', () => {
  test('ล็อก: คืน true + toast แจ้ง (ผู้เรียก return ทันที ไม่ถึง Firestore/API)', () => {
    expect(salesWriteBlocked(true, 'สร้าง lead')).toBe(true);
    expect(toast.warn).toHaveBeenCalledTimes(1);
    expect(toast.warn.mock.calls[0][0]).toMatch(/ดูได้อย่างเดียว/);
    expect(toast.warn.mock.calls[0][0]).toMatch(/สร้าง lead/);
  });
  test('ไม่ล็อก: คืน false เงียบ ๆ (หมวดอื่นไม่โดนแตะ)', () => {
    expect(salesWriteBlocked(false, 'อะไรก็ได้')).toBe(false);
    expect(toast.warn).not.toHaveBeenCalled();
  });
});

describe('<SalesReadOnly> wrapper + useSalesReadOnly', () => {
  test('ใต้ wrapper (สวิตช์เปิด) = hook เป็น true + แถบ "ย้ายไป scanoffice" ขึ้นพร้อมลิงก์', () => {
    render(<SalesReadOnly enabled={true}><Probe /></SalesReadOnly>);
    expect(screen.getByTestId('probe')).toHaveTextContent('locked');
    expect(screen.getByTestId('sales-readonly-banner')).toHaveTextContent(SALES_READONLY_BANNER);
    expect(screen.getByRole('link', { name: /scanoffice/ })).toHaveAttribute('href', SCANOFFICE_SALES_URL);
  });
  test('นอก wrapper = hook เป็น false + ไม่มีแถบ (เส้นทางลบ: หมวด 4-5 เขียนได้ตามเดิม)', () => {
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('writable');
    expect(screen.queryByTestId('sales-readonly-banner')).toBeNull();
  });
  test('ใต้ wrapper แต่สวิตช์ปิด = ไม่ล็อก ไม่มีแถบ (ทางถอยสวิตช์ตัวเดียว)', () => {
    render(<SalesReadOnly enabled={false}><Probe /></SalesReadOnly>);
    expect(screen.getByTestId('probe')).toHaveTextContent('writable');
    expect(screen.queryByTestId('sales-readonly-banner')).toBeNull();
  });
});
