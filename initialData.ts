import { Personnel, DutyPoint, Holiday } from './types';

export const INITIAL_DUTY_POINTS: DutyPoint[] = [
  { id: 1, name: 'สำนักงานเทศบาล', gender: 'M', order_index: 1 },
  { id: 2, name: 'ศูนย์บริการสาธารณสุข แห่งที่ 2', gender: 'M', order_index: 2 },
  { id: 3, name: 'ศูนย์บริการสาธารณสุข แห่งที่ 3', gender: 'M', order_index: 3 },
  { id: 4, name: 'โครงการปรับปรุงคุณภาพน้ำ', gender: 'M', order_index: 4 },
  { id: 5, name: 'สำนักงานเทศบาล', gender: 'F', order_index: 1 },
  { id: 6, name: 'ศูนย์บริการสาธารณสุข แห่งที่ 2', gender: 'F', order_index: 2 },
  { id: 7, name: 'ศูนย์บริการสาธารณสุข แห่งที่ 3', gender: 'F', order_index: 3 },
];

export const INITIAL_HOLIDAYS: Holiday[] = [
  { id: 1, holiday_date: '2026-01-01', name: 'วันขึ้นปีใหม่', type: 'official' },
  { id: 2, holiday_date: '2026-03-03', name: 'วันมาฆบูชา', type: 'official' },
  { id: 3, holiday_date: '2026-04-06', name: 'วันพระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช (วันจักรี)', type: 'official' },
  { id: 4, holiday_date: '2026-04-13', name: 'วันสงกรานต์', type: 'official' },
  { id: 5, holiday_date: '2026-04-14', name: 'วันสงกรานต์', type: 'official' },
  { id: 6, holiday_date: '2026-04-15', name: 'วันสงกรานต์', type: 'official' },
  { id: 7, holiday_date: '2026-05-01', name: 'วันแรงงานแห่งชาติ', type: 'official' },
  { id: 8, holiday_date: '2026-05-04', name: 'วันฉัตรมงคล', type: 'official' },
  { id: 9, holiday_date: '2026-05-31', name: 'วันวิสาขบูชา', type: 'official' },
  { id: 10, holiday_date: '2026-07-28', name: 'วันเฉลิมพระชนมพรรษา พระบาทสมเด็จพระเจ้าอยู่หัว', type: 'official' },
  { id: 11, holiday_date: '2026-07-29', name: 'วันอาสาฬหบูชา', type: 'official' },
  { id: 12, holiday_date: '2026-07-30', name: 'วันเข้าพรรษา', type: 'official' },
  { id: 13, holiday_date: '2026-08-12', name: 'วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าสิริกิติ์ฯ (วันแม่แห่งชาติ)', type: 'official' },
  { id: 14, holiday_date: '2026-10-13', name: 'วันนวมินทรมหาราช', type: 'official' },
  { id: 15, holiday_date: '2026-10-23', name: 'วันปิยมหาราช', type: 'official' },
  { id: 16, holiday_date: '2026-12-05', name: 'วันคล้ายวันพระบรมราชสมภพ ร.9 (วันพ่อแห่งชาติ)', type: 'official' },
  { id: 17, holiday_date: '2026-12-10', name: 'วันรัฐธรรมนูญ', type: 'official' },
  { id: 18, holiday_date: '2026-12-31', name: 'วันสิ้นปี', type: 'official' }
];

export const INITIAL_PERSONNEL: Personnel[] = [
  // ผู้ตรวจเวร ชาย
  {
    id: 'EMP101',
    db_id: 101,
    employee_id: '10101',
    fname: 'นายสมชาย',
    lname: 'มุ่งมั่นสุข',
    gender: 'M',
    position: 'หัวหน้าสำนักปลัดเทศบาล',
    dept: 'สำนักปลัดเทศบาล',
    status: 'active',
    canDuty: true,
    isInspector: true,
    orderIndex: 1
  },
  {
    id: 'EMP102',
    db_id: 102,
    employee_id: '10102',
    fname: 'นายวิเชียร',
    lname: 'วัฒนกุล',
    gender: 'M',
    position: 'ผู้อำนวยการกองช่าง',
    dept: 'กองช่าง',
    status: 'active',
    canDuty: true,
    isInspector: true,
    orderIndex: 2
  },
  {
    id: 'EMP103',
    db_id: 103,
    employee_id: '10103',
    fname: 'นายประเสริฐ',
    lname: 'ใจประเสริฐ',
    gender: 'M',
    position: 'ผู้อำนวยการกองสาธารณสุขฯ',
    dept: 'กองสาธารณสุขและสิ่งแวดล้อม',
    status: 'active',
    canDuty: true,
    isInspector: true,
    orderIndex: 3
  },
  {
    id: 'EMP104',
    db_id: 104,
    employee_id: '10104',
    fname: 'นายธีรพงษ์',
    lname: 'วงศ์สวัสดิ์',
    gender: 'M',
    position: 'ผู้อำนวยการกองคลัง',
    dept: 'กองคลัง',
    status: 'active',
    canDuty: true,
    isInspector: true,
    orderIndex: 4
  },

  // ผู้ตรวจเวร หญิง
  {
    id: 'EMP105',
    db_id: 105,
    employee_id: '10105',
    fname: 'นางสาวรัตนา',
    lname: 'ศรีสะอาด',
    gender: 'F',
    position: 'ผู้อำนวยการกองการศึกษา',
    dept: 'กองการศึกษา',
    status: 'active',
    canDuty: true,
    isInspector: true,
    orderIndex: 5
  },
  {
    id: 'EMP106',
    db_id: 106,
    employee_id: '10106',
    fname: 'นางพรพิมล',
    lname: 'เจริญพงษ์',
    gender: 'F',
    position: 'หัวหน้าฝ่ายบริหารงานทั่วไป',
    dept: 'สำนักปลัดเทศบาล',
    status: 'active',
    canDuty: true,
    isInspector: true,
    orderIndex: 6
  },
  {
    id: 'EMP107',
    db_id: 107,
    employee_id: '10107',
    fname: 'นางสาวกัลยา',
    lname: 'ทิพยวาริน',
    gender: 'F',
    position: 'หัวหน้าฝ่ายนโยบายและแผน',
    dept: 'กองยุทธศาสตร์และงบประมาณ',
    status: 'active',
    canDuty: true,
    isInspector: true,
    orderIndex: 7
  },

  // ผู้อยู่เวร ชาย - สำนักงานเทศบาล
  {
    id: 'EMP001',
    db_id: 1,
    employee_id: '66001',
    fname: 'นายอนุชา',
    lname: 'แก้วมณี',
    gender: 'M',
    position: 'เจ้าพนักงานธุรการชำนาญงาน',
    dept: 'สำนักปลัดเทศบาล',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'สำนักงานเทศบาล',
    pairNo: '1',
    orderIndex: 10
  },
  {
    id: 'EMP002',
    db_id: 2,
    employee_id: '66002',
    fname: 'นายวรวุฒิ',
    lname: 'ดวงจันทร์',
    gender: 'M',
    position: 'พนักงานขับรถยนต์',
    dept: 'สำนักปลัดเทศบาล',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'สำนักงานเทศบาล',
    pairNo: '1',
    orderIndex: 11
  },
  {
    id: 'EMP003',
    db_id: 3,
    employee_id: '66003',
    fname: 'นายเอกชัย',
    lname: 'ยอดเพชร',
    gender: 'M',
    position: 'นิติกรปฏิบัติการ',
    dept: 'สำนักปลัดเทศบาล',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'สำนักงานเทศบาล',
    pairNo: '2',
    orderIndex: 12
  },
  {
    id: 'EMP004',
    db_id: 4,
    employee_id: '66004',
    fname: 'นายไกรสร',
    lname: 'ทองคำ',
    gender: 'M',
    position: 'พนักงานดับเพลิง',
    dept: 'งานป้องกันและบรรเทาสาธารณภัย',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'สำนักงานเทศบาล',
    pairNo: '2',
    orderIndex: 13
  },
  {
    id: 'EMP005',
    db_id: 5,
    employee_id: '66005',
    fname: 'นายสิทธิชัย',
    lname: 'ศิริโชค',
    gender: 'M',
    position: 'นักวิชาการคอมพิวเตอร์',
    dept: 'สำนักปลัดเทศบาล',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'สำนักงานเทศบาล',
    pairNo: '3',
    orderIndex: 14
  },
  {
    id: 'EMP006',
    db_id: 6,
    employee_id: '66006',
    fname: 'นายมนัส',
    lname: 'ชื่นบาน',
    gender: 'M',
    position: 'พนักงานเทศกิจ',
    dept: 'สำนักปลัดเทศบาล',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'สำนักงานเทศบาล',
    pairNo: '3',
    orderIndex: 15
  },

  // ผู้อยู่เวร ชาย - ศูนย์บริการสาธารณสุข แห่งที่ 2
  {
    id: 'EMP007',
    db_id: 7,
    employee_id: '66007',
    fname: 'นายทวีศักดิ์',
    lname: 'บุญมี',
    gender: 'M',
    position: 'พยาบาลวิชาชีพ',
    dept: 'กองสาธารณสุขและสิ่งแวดล้อม',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'ศูนย์บริการสาธารณสุข แห่งที่ 2',
    pairNo: '1',
    orderIndex: 20
  },
  {
    id: 'EMP008',
    db_id: 8,
    employee_id: '66008',
    fname: 'นายภานุวัฒน์',
    lname: 'เลิศล้ำ',
    gender: 'M',
    position: 'พนักงานขับรถพยาบาล',
    dept: 'กองสาธารณสุขและสิ่งแวดล้อม',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'ศูนย์บริการสาธารณสุข แห่งที่ 2',
    pairNo: '1',
    orderIndex: 21
  },
  {
    id: 'EMP009',
    db_id: 9,
    employee_id: '66009',
    fname: 'นายศราวุธ',
    lname: 'คำอินทร์',
    gender: 'M',
    position: 'เจ้าพนักงานสาธารณสุข',
    dept: 'กองสาธารณสุขและสิ่งแวดล้อม',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'ศูนย์บริการสาธารณสุข แห่งที่ 2',
    pairNo: '2',
    orderIndex: 22
  },
  {
    id: 'EMP010',
    db_id: 10,
    employee_id: '66010',
    fname: 'นายกิตติพงษ์',
    lname: 'บุญเรือง',
    gender: 'M',
    position: 'พนักงานรักษาความปลอดภัย',
    dept: 'กองสาธารณสุขและสิ่งแวดล้อม',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'ศูนย์บริการสาธารณสุข แห่งที่ 2',
    pairNo: '2',
    orderIndex: 23
  },

  // ผู้อยู่เวร ชาย - ศูนย์บริการสาธารณสุข แห่งที่ 3
  {
    id: 'EMP011',
    db_id: 11,
    employee_id: '66011',
    fname: 'นายชานนท์',
    lname: 'สุขเจริญ',
    gender: 'M',
    position: 'นักวิชาการสาธารณสุข',
    dept: 'กองสาธารณสุขและสิ่งแวดล้อม',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'ศูนย์บริการสาธารณสุข แห่งที่ 3',
    pairNo: '1',
    orderIndex: 30
  },
  {
    id: 'EMP012',
    db_id: 12,
    employee_id: '66012',
    fname: 'นายธนาธิป',
    lname: 'แสงทอง',
    gender: 'M',
    position: 'พนักงานบริการทั่วไป',
    dept: 'กองสาธารณสุขและสิ่งแวดล้อม',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'ศูนย์บริการสาธารณสุข แห่งที่ 3',
    pairNo: '1',
    orderIndex: 31
  },
  {
    id: 'EMP013',
    db_id: 13,
    employee_id: '66013',
    fname: 'นายกมล',
    lname: 'เจริญกิจ',
    gender: 'M',
    position: 'เจ้าหน้าที่บริหารงานทั่วไป',
    dept: 'กองสาธารณสุขและสิ่งแวดล้อม',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'ศูนย์บริการสาธารณสุข แห่งที่ 3',
    pairNo: '2',
    orderIndex: 32
  },
  {
    id: 'EMP014',
    db_id: 14,
    employee_id: '66014',
    fname: 'นายปรีชา',
    lname: 'มงคลทรัพย์',
    gender: 'M',
    position: 'พนักงานขับเครื่องจักรกล',
    dept: 'กองสาธารณสุขและสิ่งแวดล้อม',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'ศูนย์บริการสาธารณสุข แห่งที่ 3',
    pairNo: '2',
    orderIndex: 33
  },

  // ผู้อยู่เวร ชาย - โครงการปรับปรุงคุณภาพน้ำ
  {
    id: 'EMP015',
    db_id: 15,
    employee_id: '66015',
    fname: 'นายชลิต',
    lname: 'วารีรักษ์',
    gender: 'M',
    position: 'วิศวกรสุขาภิบาล',
    dept: 'กองช่าง',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'โครงการปรับปรุงคุณภาพน้ำ',
    pairNo: '1',
    orderIndex: 40
  },
  {
    id: 'EMP016',
    db_id: 16,
    employee_id: '66016',
    fname: 'นายวิชัย',
    lname: 'สมบูรณ์',
    gender: 'M',
    position: 'ช่างเครื่องยนต์',
    dept: 'กองช่าง',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'โครงการปรับปรุงคุณภาพน้ำ',
    pairNo: '1',
    orderIndex: 41
  },
  {
    id: 'EMP017',
    db_id: 17,
    employee_id: '66017',
    fname: 'นายสุชาติ',
    lname: 'มั่นคง',
    gender: 'M',
    position: 'นายช่างไฟฟ้าปฏิบัติงาน',
    dept: 'กองช่าง',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'โครงการปรับปรุงคุณภาพน้ำ',
    pairNo: '2',
    orderIndex: 42
  },
  {
    id: 'EMP018',
    db_id: 18,
    employee_id: '66018',
    fname: 'นายสุริยา',
    lname: 'ประทุมทอง',
    gender: 'M',
    position: 'พนักงานควบคุมระบบบำบัดน้ำ',
    dept: 'กองช่าง',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'โครงการปรับปรุงคุณภาพน้ำ',
    pairNo: '2',
    orderIndex: 43
  },

  // ผู้อยู่เวร หญิง (เข้าเวรวันหยุดและเสาร์-อาทิตย์)
  {
    id: 'EMP020',
    db_id: 20,
    employee_id: '66020',
    fname: 'นางสาวจินตนา',
    lname: 'สุขเกษม',
    gender: 'F',
    position: 'นักวิชาการเงินและบัญชี',
    dept: 'กองคลัง',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'สำนักงานเทศบาล',
    pairNo: '1',
    orderIndex: 50
  },
  {
    id: 'EMP021',
    db_id: 21,
    employee_id: '66021',
    fname: 'นางสาวดวงใจ',
    lname: 'รุ่งโรจน์',
    gender: 'F',
    position: 'เจ้าพนักงานการเงินและบัญชี',
    dept: 'กองคลัง',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'สำนักงานเทศบาล',
    pairNo: '1',
    orderIndex: 51
  },
  {
    id: 'EMP022',
    db_id: 22,
    employee_id: '66022',
    fname: 'นางสุภาพร',
    lname: 'พิทักษ์ธรรม',
    gender: 'F',
    position: 'นักจัดการงานทั่วไปชำนาญการ',
    dept: 'กองการศึกษา',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'ศูนย์บริการสาธารณสุข แห่งที่ 2',
    pairNo: '2',
    orderIndex: 52
  },
  {
    id: 'EMP023',
    db_id: 23,
    employee_id: '66023',
    fname: 'นางสาวสุภาวดี',
    lname: 'แก้ววิลัย',
    gender: 'F',
    position: 'เจ้าพนักงานพัสดุปฏิบัติงาน',
    dept: 'กองการศึกษา',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'ศูนย์บริการสาธารณสุข แห่งที่ 2',
    pairNo: '2',
    orderIndex: 53
  },
  {
    id: 'EMP024',
    db_id: 24,
    employee_id: '66024',
    fname: 'นางสาวณิชาภา',
    lname: 'พงษ์พาณิชย์',
    gender: 'F',
    position: 'นักวิเคราะห์นโยบายและแผน',
    dept: 'กองยุทธศาสตร์และงบประมาณ',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'ศูนย์บริการสาธารณสุข แห่งที่ 3',
    pairNo: '3',
    orderIndex: 54
  },
  {
    id: 'EMP025',
    db_id: 25,
    employee_id: '66025',
    fname: 'นางสาวปิยะพร',
    lname: 'ศิริรัตน์',
    gender: 'F',
    position: 'เจ้าพนักงานธุรการ',
    dept: 'กองยุทธศาสตร์และงบประมาณ',
    status: 'active',
    canDuty: true,
    isInspector: false,
    dutyPoint: 'ศูนย์บริการสาธารณสุข แห่งที่ 3',
    pairNo: '3',
    orderIndex: 55
  }
];

export const APPS_SCRIPT_CODE_SAMPLE = `/**
 * Google Apps Script Web App API สำหรับระบบจัดเวรยาม
 * วางโค้ดนี้ใน Apps Script Editor แล้วกด Deploy -> New Deployment -> Web app
 * (Who has access: Anyone)
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'get_all_data';
  let result = { status: 'error', message: 'Action not found' };

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    if (action === 'get_all_data') {
      result = {
        status: 'success',
        guards: getSheetData(ss, 'guards'),
        duty_points: getSheetData(ss, 'duty_points'),
        holidays: getSheetData(ss, 'holidays'),
        rosters: getSheetData(ss, 'rosters')
      };
    } else if (action === 'get_guards') {
      result = { status: 'success', data: getSheetData(ss, 'guards') };
    } else if (action === 'get_duty_points') {
      result = { status: 'success', data: getSheetData(ss, 'duty_points') };
    } else if (action === 'get_holidays') {
      result = { status: 'success', data: getSheetData(ss, 'holidays') };
    }
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let result = { status: 'error', message: 'Unknown error' };

  try {
    const rawData = e.postData.contents;
    const body = JSON.parse(rawData);
    const action = body.action || '';
    const payload = body.data || {};
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    switch (action) {
      case 'add_guard': {
        const sheet = getOrCreateSheet(ss, 'guards', [
          'id', 'employee_id', 'fname', 'lname', 'gender', 'position', 
          'department', 'status', 'can_duty', 'is_inspector', 'duty_point', 
          'pair_no', 'order_index', 'updated_at'
        ]);
        const id = 'G_' + new Date().getTime();
        const row = [
          id,
          payload.employee_id || '',
          payload.fname || '',
          payload.lname || '',
          payload.gender || 'M',
          payload.position || '',
          payload.department || '',
          payload.status || 'active',
          payload.can_duty ? 1 : 0,
          payload.is_inspector ? 1 : 0,
          payload.duty_point || '',
          payload.pair_no || '',
          payload.order_index || new Date().getTime(),
          new Date().toISOString()
        ];
        sheet.appendRow(row);
        result = { status: 'success', id: id, message: 'เพิ่มบุคลากรเรียบร้อย' };
        break;
      }

      case 'edit_guard': {
        const sheet = ss.getSheetByName('guards');
        if (!sheet) throw new Error('Sheet guards not found');
        const rows = sheet.getDataRange().getValues();
        const targetId = payload.id;
        let foundRow = -1;
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] == targetId) { foundRow = i + 1; break; }
        }
        if (foundRow > 0) {
          const updatedRow = [
            targetId,
            payload.employee_id || rows[foundRow-1][1],
            payload.fname || '',
            payload.lname || '',
            payload.gender || 'M',
            payload.position || '',
            payload.department || '',
            payload.status || 'active',
            payload.can_duty ? 1 : 0,
            payload.is_inspector ? 1 : 0,
            payload.duty_point || '',
            payload.pair_no || '',
            payload.order_index || rows[foundRow-1][12],
            new Date().toISOString()
          ];
          sheet.getRange(foundRow, 1, 1, updatedRow.length).setValues([updatedRow]);
          result = { status: 'success', message: 'อัปเดตบุคลากรสำเร็จ' };
        } else {
          result = { status: 'error', message: 'ไม่พบรหัสบุคลากรนี้' };
        }
        break;
      }

      case 'delete_guard': {
        const sheet = ss.getSheetByName('guards');
        if (!sheet) throw new Error('Sheet guards not found');
        const rows = sheet.getDataRange().getValues();
        const targetId = payload.id;
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] == targetId) {
            sheet.deleteRow(i + 1);
            result = { status: 'success', message: 'ลบข้อมูลเรียบร้อย' };
            break;
          }
        }
        break;
      }

      case 'batch_update_guards': {
        const sheet = ss.getSheetByName('guards');
        if (!sheet) throw new Error('Sheet guards not found');
        const list = payload.guards || [];
        const dataRange = sheet.getDataRange();
        const rows = dataRange.getValues();
        
        list.forEach(item => {
          for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] == item.id) {
              if (item.pair_no !== undefined) rows[i][11] = item.pair_no;
              if (item.duty_point !== undefined) rows[i][10] = item.duty_point;
              if (item.order_index !== undefined) rows[i][12] = item.order_index;
              if (item.is_inspector !== undefined) rows[i][9] = item.is_inspector ? 1 : 0;
              if (item.can_duty !== undefined) rows[i][8] = item.can_duty ? 1 : 0;
              rows[i][13] = new Date().toISOString();
            }
          }
        });
        dataRange.setValues(rows);
        result = { status: 'success', message: 'อัปเดตการเรียงลำดับสำเร็จ' };
        break;
      }

      case 'save_roster': {
        const sheet = getOrCreateSheet(ss, 'rosters', ['id', 'month', 'year', 'gender', 'schedule_json', 'created_at']);
        const id = 'R_' + payload.year + '_' + payload.month + '_' + payload.gender;
        const rows = sheet.getDataRange().getValues();
        let foundRow = -1;
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] == id) { foundRow = i + 1; break; }
        }
        const rowData = [
          id,
          payload.month,
          payload.year,
          payload.gender,
          typeof payload.schedule === 'string' ? payload.schedule : JSON.stringify(payload.schedule),
          new Date().toISOString()
        ];
        if (foundRow > 0) {
          sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
        } else {
          sheet.appendRow(rowData);
        }
        result = { status: 'success', message: 'บันทึกตารางเวรลง Google Sheet สำเร็จ' };
        break;
      }

      default:
        result = { status: 'error', message: 'Unknown Action: ' + action };
    }
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const headers = rows[0];
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = rows[i][j];
    }
    data.push(item);
  }
  return data;
}

function getOrCreateSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
  }
  return sheet;
}
`;
