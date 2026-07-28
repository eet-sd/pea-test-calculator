// เงื่อนไขพิเศษรายหัวข้อทดสอบ — ไฟล์นี้แก้ไขด้วยมือได้
//
// *** ไฟล์นี้มี mirror เป็น Python อยู่ที่ ***
//   "Claude DMz\cost_estimate (ประมาณการ+ทำ มท)\test_rules.py"
// ซึ่งใช้กรอกจำนวนตัวอย่างรายหัวข้อลงชีต "2570วางหน้า" ของไฟล์ประมาณการ
// แก้กฎที่นี่แล้วต้องไปแก้ไฟล์นั้นด้วย (เครื่องที่รันสคริปต์ไม่มี Node.js จึงอ่านไฟล์นี้ตรงๆ ไม่ได้)
// ยกเว้นกลุ่ม CT/VT (RMTR-021/2553) ด้านล่างที่ฝั่ง Python ตั้งใจไม่ port
//
// จำนวนสุ่มตัวอย่างหลักมาจากชีต (คอลัมน์ "จำนวนสุ่ม") ซึ่งถูกฝังใน data.js แล้ว
// ไฟล์นี้เก็บเฉพาะกติกา "จำนวนตัวอย่างต่อหัวข้อทดสอบ" ที่ต่างจากจำนวนสุ่มรวม
//
// วิธีเพิ่ม (จับคู่ชื่อหัวข้อแบบ substring ไม่สนตัวพิมพ์):
//  - perTestAlways1: หัวข้อที่ทดสอบเพียง 1 ตัวอย่างเสมอ
//  - byCode[รหัสพัสดุ] รองรับ:
//      perTestBySample: { "<จำนวนสุ่มรวม>": { "<ชื่อหัวข้อ>": จำนวน } }  (0 = ไม่ทดสอบ)
//      perTestFixed: { "<ชื่อหัวข้อ>": จำนวน }  → ทดสอบเท่านี้เสมอ ไม่ว่าจำนวนสุ่มเท่าไร
//                                               (ใช้กับรหัสที่จำนวนสุ่มเป็น % จึงคาดเดาคีย์ไม่ได้)
//      fullTests: ["<ชื่อหัวข้อ>"]  → ยกเว้นจาก perTestAlways1 ทดสอบครบทุกตัวอย่าง
//      pairTests: ["<ชื่อหัวข้อ>"]  → ทดสอบเป็นคู่ จำนวน = ปัดลง(จำนวนสุ่ม/2) ราคาคือราคาต่อคู่
//      manualPerTestBelowQty: N  → ซื้อต่ำกว่า N ตัว = "ตามที่ตกลง" กรอกจำนวนรายหัวข้อเอง (ไม่เกินจำนวนที่ซื้อ)
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
    "1020200201": { fullTests: ["Chemical composition (OES)"] },

    // IPC (RCBL-066/2563, ตรวจสอบค่าทดสอบ.docx):
    // Visual test ทดสอบครบทุกตัวอย่าง ส่วนหัวข้อแบบทำลาย (Torque, Power frequency dry withstand)
    // ทดสอบตามตาราง — สุ่ม 3/5/8 ไม่ต้องทดสอบเลย
    // คีย์ "1"/"2" รองรับล็อตเล็กที่จำนวนสุ่มถูกปรับลดเท่าจำนวนที่ซื้อ
    "1020360000": {
      ref: "อ้างอิง: สเปคเลขที่ RCBL-066/2563 — หัวข้อทดสอบแบบทำลาย (Torque test, " +
           "Power frequency dry withstand test) ทดสอบตามจำนวนในตาราง ส่วน Visual test ทดสอบครบทุกตัวอย่าง",
      perTestBySample: {
        "1":  { "Torque": 0,  "Power frequency dry withstand": 0 },
        "2":  { "Torque": 0,  "Power frequency dry withstand": 0 },
        "3":  { "Torque": 0,  "Power frequency dry withstand": 0 },
        "5":  { "Torque": 0,  "Power frequency dry withstand": 0 },
        "8":  { "Torque": 0,  "Power frequency dry withstand": 0 },
        "13": { "Torque": 4,  "Power frequency dry withstand": 4 },
        "20": { "Torque": 8,  "Power frequency dry withstand": 8 },
        "32": { "Torque": 12, "Power frequency dry withstand": 12 },
        "50": { "Torque": 20, "Power frequency dry withstand": 20 }
      }
    },

    // CABLE SPACER (RINS-014/2563): สุ่ม 5 → ไม่ทำลาย 4 / ทำลาย 1, สุ่ม 10 → ไม่ทำลาย 8 / ทำลาย 2
    // ทำลาย = Tensile strength เท่านั้น
    "1020440008": {
      ref: "อ้างอิง: สเปคเลขที่ RINS-014/2563 — สุ่ม 5 ทดสอบแบบไม่ทำลาย 4 ตัวอย่าง/แบบทำลาย 1 ตัวอย่าง, " +
           "สุ่ม 10 ทดสอบแบบไม่ทำลาย 8 ตัวอย่าง/แบบทำลาย 2 ตัวอย่าง",
      perTestBySample: {
        "5":  { "Tensile strength": 1, "Dimension": 4, "Leakage distance": 4, "Weight": 4,
                "Power frequency dry withstand": 4, "Power frequency dry flashover": 4,
                "Fourier Transform": 4 },
        "10": { "Tensile strength": 2, "Dimension": 8, "Leakage distance": 8, "Weight": 8,
                "Power frequency dry withstand": 8, "Power frequency dry flashover": 8,
                "Fourier Transform": 8 }
      }
    },

    // FSD (RPRO-052/2562): เฉพาะ Glow wire test ที่ทดสอบไม่ครบทุกตัวอย่าง
    // ตารางในสเปคคิดจาก "จำนวนที่ซื้อ" แต่ขอบเขตชั้นตรงกับตารางจำนวนสุ่มของรหัสนี้พอดี
    // (3-25/26-90/91-150/151-500/501-1200/1201-10000/>10000) จึงแปลงเป็นคีย์จำนวนสุ่มได้ 1:1
    "1040020102": {
      ref: "อ้างอิง: สเปคเลขที่ RPRO-052/2562 — Glow wire test ทดสอบตามจำนวนในตาราง",
      perTestBySample: {
        "1":  { "Glow wire": 1 },
        "2":  { "Glow wire": 1 },
        "3":  { "Glow wire": 1 },
        "5":  { "Glow wire": 1 },
        "8":  { "Glow wire": 2 },
        "13": { "Glow wire": 2 },
        "20": { "Glow wire": 2 },
        "32": { "Glow wire": 2 },
        "50": { "Glow wire": 3 }
      }
    }
  }
};

// VT (RPRO-014/2559): Temperature rise ทดสอบ 1 ตัวอย่างในทุกจำนวนส่งทดสอบ
// จำนวนสุ่มของรหัสกลุ่มนี้เป็น 5% ของจำนวนที่ซื้อ (ขั้นต่ำ 5) จึงคาดเดาคีย์ perTestBySample ไม่ได้
// *** ห้ามใส่ "Temperature rise" ใน perTestAlways1 *** — H.R.C. FUSE (1040020010-1040020019)
// และ FSD (1040020102) มีหัวข้อเดียวกันแต่ทดสอบครบทุกตัวอย่าง
["1040073011", "1040073012"].forEach(function (code) {
  window.SPECIAL_TEST_RULES.byCode[code] = {
    ref: "อ้างอิง: สเปคเลขที่ RPRO-014/2559 — Temperature rise test ทดสอบ 1 ตัวอย่างในทุกจำนวนส่งทดสอบ",
    perTestFixed: { "Temperature rise": 1 }
  };
});

// LINE-POST (RINS-017/2567) / PIN-POST (RINS-018/2568): สุ่ม 3 ทดสอบครบทุกหัวข้อ ยกเว้น Porosity 1 ตัวอย่าง
// ผูกรายรหัสตามที่ระบุใน ตรวจสอบค่าทดสอบ.docx — ไม่ใส่ perTestAlways1 เพราะ CABLE SPACER PORCELAIN
// (1020440006/1020440007, RINS-009/2560) ก็มีหัวข้อนี้แต่เอกสารไม่ได้พูดถึง ปล่อยให้กรอกเองในตาราง
[
  { codes: ["1030010008", "1030010009", "1030010010"], spec: "RINS-017/2567" },
  { codes: ["1030010104", "1030010105", "1030010106"], spec: "RINS-018/2568" }
].forEach(function (g) {
  g.codes.forEach(function (code) {
    window.SPECIAL_TEST_RULES.byCode[code] = {
      ref: "อ้างอิง: สเปคเลขที่ " + g.spec + " — Porosity test ทดสอบ 1 ตัวอย่าง หัวข้ออื่นทดสอบครบทุกตัวอย่าง",
      perTestFixed: { "Porosity test": 1 }
    };
  });
});

// SPOOL (RINS-020/2568) / STRAIN (RINS-021/2568): สุ่ม 5 → Visual 5, Dimension 3, Tensile 5, Porosity 1
[
  { codes: ["1030030000"], spec: "RINS-020/2568" },
  { codes: ["1030030100", "1030030103"], spec: "RINS-021/2568" }
].forEach(function (g) {
  g.codes.forEach(function (code) {
    window.SPECIAL_TEST_RULES.byCode[code] = {
      ref: "อ้างอิง: สเปคเลขที่ " + g.spec + " — Dimension ทดสอบ 3 ตัวอย่าง, Porosity test ทดสอบ 1 ตัวอย่าง " +
           "หัวข้ออื่นทดสอบครบทุกตัวอย่าง",
      perTestFixed: { "Porosity test": 1, "Dimension": 3 }
    };
  });
});

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

// COMPOSITE SUSPENSION INSULATOR (RINS-003/2561) 1030020100/101/103:
// แก้ตามตาราง "ไม่ทำลาย/ทำลาย" ใน ตรวจสอบค่าทดสอบ.docx (2569-07-28) — ตัวเลขชุดเดิมไม่ตรงเอกสาร
//   ไม่ทำลาย = Dimension, Leakage distance, Coating thickness | ทำลาย = Tensile strength
//   สุ่ม 3 → 2/1, 5 → 3/2, 7 → 4/3, 12 → 8/4, 18 → 12/6
// เอกสารกำหนดชั้น "น้อยกว่า 11 → สุ่ม 3" แล้ว จึงเลิกใช้ manualPerTestBelowQty ("ตามที่ตกลง")
// *** ตารางจำนวนสุ่มในชีตยังเป็น N ≤ 300 : 5 *** ต้องแก้เป็น <11:3 / 11-30:3 / 31-300:5
// ไม่งั้นซื้อ 4-30 ตัวจะได้สุ่ม 5 แทนที่จะเป็น 3 (ซื้อ 1-3 ถูกปรับลดเท่าจำนวนที่ซื้ออยู่แล้ว)
["1030020100", "1030020101", "1030020103"].forEach(function (code) {
  window.SPECIAL_TEST_RULES.byCode[code] = {
    ref: "อ้างอิง: สเปคเลขที่ RINS-003/2561 — ทดสอบแบบไม่ทำลาย (Dimension, Leakage distance, " +
         "Coating thickness) และแบบทำลาย (Tensile strength) ตามจำนวนในตาราง",
    perTestBySample: {
      "3":  { "Tensile strength": 1, "Dimension": 2,  "Leakage distance": 2,  "Coating thickness": 2 },
      "5":  { "Tensile strength": 2, "Dimension": 3,  "Leakage distance": 3,  "Coating thickness": 3 },
      "7":  { "Tensile strength": 3, "Dimension": 4,  "Leakage distance": 4,  "Coating thickness": 4 },
      "12": { "Tensile strength": 4, "Dimension": 8,  "Leakage distance": 8,  "Coating thickness": 8 },
      "18": { "Tensile strength": 6, "Dimension": 12, "Leakage distance": 12, "Coating thickness": 12 }
    }
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
      ref: refHead + 'Power-frequency voltage withstand tests on secondary terminals ' +
           'และ Inter-turn overvoltage test และจำนวนตัวอย่างที่เหลือทดสอบหัวข้อ ' +
           'Tests for accuracy & Verification of markings test (Current Transformer for Low Voltage system)'
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
      ref: refHead + 'Power-frequency voltage withstand tests on secondary terminals, ' +
           'Power-frequency voltage withstand tests on primary terminals [Common mode (separate source) power-frequency withstand test], ' +
           'Inter-turn overvoltage test และ Partial discharge measurement test ' +
           'และจำนวนตัวอย่างที่เหลือทดสอบหัวข้อ Tests for accuracy & Verification of markings test'
    },
    {
      // H.V. VT (ไม่เกิน 33 kV)
      codes: ["1060020007", "1060020105"],
      ref: refHead + 'Power-frequency voltage withstand tests on secondary terminals, ' +
           'Power-frequency voltage withstand tests on primary terminals [Common mode (separate source) power-frequency withstand test], ' +
           'Power-frequency voltage withstand tests on primary terminals [Differential mode (induced) AC voltage test (Induced Overvoltage Test)] ' +
           'และ Partial discharge measurement test ' +
           'และจำนวนตัวอย่างที่เหลือทดสอบหัวข้อ Tests for accuracy & Verification of markings test'
    }
  ];
  groups.forEach(function (g) {
    g.codes.forEach(function (code) {
      window.SPECIAL_TEST_RULES.byCode[code] = { ref: g.ref, perTestBySample: split };
    });
  });
})();
