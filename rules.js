// เงื่อนไขพิเศษรายหัวข้อทดสอบ — ไฟล์นี้แก้ไขด้วยมือได้
//
// จำนวนสุ่มตัวอย่างหลักมาจากชีต (คอลัมน์ "จำนวนสุ่ม") ซึ่งถูกฝังใน data.js แล้ว
// ไฟล์นี้เก็บเฉพาะกติกา "จำนวนตัวอย่างต่อหัวข้อทดสอบ" ที่ต่างจากจำนวนสุ่มรวม
//
// วิธีเพิ่ม (จับคู่ชื่อหัวข้อแบบ substring ไม่สนตัวพิมพ์):
//  - perTestAlways1: หัวข้อที่ทดสอบเพียง 1 ตัวอย่างเสมอ
//  - byCode[รหัสพัสดุ] รองรับ:
//      perTestBySample: { "<จำนวนสุ่มรวม>": { "<ชื่อหัวข้อ>": จำนวน } }  (0 = ไม่ทดสอบ)
//      fullTests: ["<ชื่อหัวข้อ>"]  → ยกเว้นจาก perTestAlways1 ทดสอบครบทุกตัวอย่าง
//      pairTests: ["<ชื่อหัวข้อ>"]  → ทดสอบเป็นคู่ จำนวน = ปัดลง(จำนวนสุ่ม/2) ราคาคือราคาต่อคู่
//      ref: ข้อความอ้างอิงแสดงใต้ตาราง

window.SPECIAL_TEST_RULES = {

  // ทดสอบ 1 ตัวอย่างเสมอ ไม่ว่าจำนวนสุ่มเท่าไร
  perTestAlways1: [
    "Dropping point",
    "Chemical composition (OES)",
    "Hardness"
  ],

  byCode: {
    // Hotline clamps (สเปค RHOT-081/2561, คู่มือตรวจรับ Hotline clamp 2567):
    // Temperature rise ทดสอบเฉพาะกรณีสุ่ม 10 ตัวอย่าง โดยแบ่ง Torque 6 / Temp rise 4
    // คีย์ "1" รองรับกรณีซื้อ 1 ตัว (จำนวนสุ่มถูกปรับลดเท่าจำนวนที่ซื้อ)
    "1020330005": { ref: "อ้างอิง: สเปคเลขที่ RHOT-081/2561",
      perTestBySample: {
        "1":  { "Temperature rise": 0 },
        "2":  { "Temperature rise": 0 },
        "4":  { "Temperature rise": 0 },
        "10": { "Torque": 6, "Temperature rise": 4 }
      } },
    "1020330006": { ref: "อ้างอิง: สเปคเลขที่ RHOT-081/2561",
      perTestBySample: {
        "1":  { "Temperature rise": 0 },
        "2":  { "Temperature rise": 0 },
        "4":  { "Temperature rise": 0 },
        "10": { "Torque": 6, "Temperature rise": 4 }
      } },
    "1020330104": { ref: "อ้างอิง: สเปคเลขที่ RHOT-081/2561",
      perTestBySample: {
        "1":  { "Temperature rise": 0 },
        "2":  { "Temperature rise": 0 },
        "4":  { "Temperature rise": 0 },
        "10": { "Torque": 6, "Temperature rise": 4 }
      } },

    // ALUMINIUM INGOT (RCBL-009/2568): OES ทดสอบครบทุกตัวอย่าง (ยกเว้นจากกติกา 1 ตัวอย่างเสมอ)
    // ไม่ใส่ ref — คิดทุกตัวอย่างเฉยๆ โดยไม่แสดงหมายเหตุใต้ตาราง
    "1020200200": { fullTests: ["Chemical composition (OES)"] },
    "1020200201": { fullTests: ["Chemical composition (OES)"] }
  }
};

// PREFORMED D/E (RCBL-058/2563, RCBL-070/2567):
// Tensile strength without additional accessories (Preformed) ทดสอบเป็นคู่ ราคา 1,200 บาทต่อคู่
// สุ่ม 3 → 1 คู่ = 1,200 บาท / สุ่ม 5 → 2 คู่ = 2,400 บาท
[
  "1020260202", "1020260203", "1020260204", "1020260205",
  "1020260206", "1020260207", "1020260208", "1020260209",
  "1020260300", "1020260301", "1020260302", "1020260303",
  "1020260304", "1020260305"
].forEach(function (code) {
  window.SPECIAL_TEST_RULES.byCode[code] = {
    ref: "ทดสอบเป็นคู่ โดยราคาดังกล่าว ไม่รวมค่าสายไฟฟ้าสำหรับทดสอบ Tensile strength",
    pairTests: ["Tensile strength without additional accessories"]
  };
});

// CT/VT ตามสเปค RMTR-021/2553 (ข้อมูลตัวสุ่ม ส่งโดม.docx):
// จำนวนต่องวด > 25 เครื่อง (จำนวนสุ่ม 5 ขึ้นไป) → แยก 3 ตัวอย่างทดสอบหัวข้อ
// withstand / partial discharge / inter-turn ส่วนที่เหลือ (n-3) ทดสอบ
// Tests for accuracy & Verification of markings
// จำนวนต่องวด ≤ 25 (สุ่ม 1-3) → ทดสอบครบทุกหัวข้อทุกตัวอย่าง (default อยู่แล้ว)
// ref แยก 3 กลุ่ม (L.V. CT / H.V. CT / H.V. VT) เพราะชื่อหัวข้อเต็มใน data.js ต่างกัน
(function () {
  var split = {};
  [5, 8, 13, 20, 32].forEach(function (n) {
    split[String(n)] = {
      "on secondary terminals": 3,
      "on primary terminals": 3, // จับทั้ง Common mode และ Differential mode
      "Inter-turn overvoltage": 3,
      "Partial discharge": 3,
      "Tests for accuracy": n - 3
    };
  });
  var refHead = "อ้างอิง: สเปคเลขที่ RMTR-021/2553 — กรณีจำนวนต่องวดเกิน 25 เครื่อง แยกตัวอย่าง 3 เครื่อง ทดสอบหัวข้อ ";
  var groups = [
    {
      // L.V. CT
      codes: [
        "1060030000", "1060030001", "1060030002", "1060030003",
        "1060030004", "1060030005", "1060030100"
      ],
      ref: refHead + '"Power-frequency voltage withstand tests on secondary terminals ' +
           'และ Inter-turn overvoltage test" และจำนวนตัวอย่างที่เหลือทดสอบหัวข้อ ' +
           '"Tests for accuracy & Verification of markings test (Current Transformer for Low Voltage system)"'
    },
    {
      // H.V. CT (ไม่เกิน 33 kV)
      codes: [
        "1060040019", "1060040020", "1060040021", "1060040022", "1060040023",
        "1060040024", "1060040025", "1060040026", "1060040027", "1060040028",
        "1060040029", "1060040030", "1060040031", "1060040032", "1060040033",
        "1060040112", "1060040113", "1060040114", "1060040115", "1060040116",
        "1060040117", "1060040118", "1060040119", "1060040120", "1060040121",
        "1060040122"
      ],
      ref: refHead + '"Power-frequency voltage withstand tests on secondary terminals, ' +
           'Power-frequency voltage withstand tests on primary terminals [Common mode (separate source) power-frequency withstand test], ' +
           'Inter-turn overvoltage test และ Partial discharge measurement test" ' +
           'และจำนวนตัวอย่างที่เหลือทดสอบหัวข้อ "Tests for accuracy & Verification of markings test"'
    },
    {
      // H.V. VT (ไม่เกิน 33 kV)
      codes: ["1060020007", "1060020105"],
      ref: refHead + '"Power-frequency voltage withstand tests on secondary terminals, ' +
           'Power-frequency voltage withstand tests on primary terminals [Common mode (separate source) power-frequency withstand test], ' +
           'Power-frequency voltage withstand tests on primary terminals [Differential mode (induced) AC voltage test (Induced Overvoltage Test)] ' +
           'และ Partial discharge measurement test" ' +
           'และจำนวนตัวอย่างที่เหลือทดสอบหัวข้อ "Tests for accuracy & Verification of markings test"'
    }
  ];
  groups.forEach(function (g) {
    g.codes.forEach(function (code) {
      window.SPECIAL_TEST_RULES.byCode[code] = { ref: g.ref, perTestBySample: split };
    });
  });
})();
