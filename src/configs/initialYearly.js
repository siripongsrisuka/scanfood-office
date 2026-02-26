  
  const qrcode = new Set(['3', '6',  '9'])
  const staff = new Set(['12',  '15', '18'])
  const language = new Set(['21', '24', '27'])
  const premium = new Set([ '29', '31', '33'])
  const member = new Set([ '35',  '37','39'])
  const crm = new Set(['40', '41', '42'])

  export default new Set([...qrcode, ...staff, ...language, ...premium, ...member, ...crm])