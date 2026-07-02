import "./src/config/env.js";
import { connectDB, sql } from "./src/config/database.js";
import { computeAllMetrics } from "./src/utils/pregnancyUtils.js";

async function seed() {
  console.log("Connecting to database...");
  const pool = await connectDB();
  console.log("Connected successfully!");

  
  console.log("Fetching users from DB...");
  const mothersResult = await pool.request().query("SELECT UserID, FullName, Email FROM Users WHERE Role = 'MOTHER'");
  const doctorsResult = await pool.request().query("SELECT UserID, FullName, Email FROM Users WHERE Role = 'DOCTOR'");
  const midwivesResult = await pool.request().query("SELECT UserID, FullName, Email FROM Users WHERE Role = 'MIDWIFE'");

  const mothers = mothersResult.recordset;
  const doctors = doctorsResult.recordset;
  const midwives = midwivesResult.recordset;

  console.log(`Found: ${mothers.length} mothers, ${doctors.length} doctors, ${midwives.length} midwives.`);

  if (mothers.length === 0 || doctors.length === 0 || midwives.length === 0) {
    console.error("Missing seeded users. Run npm run seed or seedUsers.js first.");
    process.exit(1);
  }

  
  console.log("Cleaning old inventory logs and batches...");
  await pool.request().query("DELETE FROM DispenseLogs");
  await pool.request().query("DELETE FROM Batches");
  await pool.request().query("DELETE FROM Medicines");
  await pool.request().query("DELETE FROM Categories");

  console.log("Cleaning old appointments and messaging history...");
  await pool.request().query("DELETE FROM Appointments");
  await pool.request().query("DELETE FROM Messages");
  await pool.request().query("DELETE FROM ChatParticipants");
  await pool.request().query("DELETE FROM Chats");
  console.log("Cleaning old pregnancies...");
  await pool.request().query("DELETE FROM Pregnancies");

  
  console.log("Seeding Categories...");
  const categories = [
    { name: "Vitamins", desc: "Essential dietary supplements for mother and fetal development" },
    { name: "Antibiotics", desc: "Used to treat bacterial infections" },
    { name: "Analgesics", desc: "Pain relief and management" },
    { name: "Antiseptics", desc: "Disinfectants and microbial inhibitors" },
    { name: "Hormones", desc: "Hormonal therapy and labor induction" },
    { name: "Supplements", desc: "Iron, Calcium, and other critical mineral supplements" }
  ];

  const categoryIdMap = {};
  for (const cat of categories) {
    const res = await pool.request()
      .input("name", sql.VarChar(100), cat.name)
      .input("desc", sql.VarChar(255), cat.desc)
      .query("INSERT INTO Categories (CategoryName, Description) OUTPUT INSERTED.CategoryID VALUES (@name, @desc)");
    categoryIdMap[cat.name] = res.recordset[0].CategoryID;
  }

  
  console.log("Seeding Medicines...");
  const medicines = [
    { name: "Folic Acid 5mg", cat: "Vitamins", threshold: 300, price: 6.50 },
    { name: "Prenatal Multivitamins", cat: "Vitamins", threshold: 400, price: 15.00 },
    { name: "Amoxicillin 500mg", cat: "Antibiotics", threshold: 250, price: 12.50 },
    { name: "Ciprofloxacin 250mg", cat: "Antibiotics", threshold: 150, price: 18.00 },
    { name: "Paracetamol 500mg", cat: "Analgesics", threshold: 500, price: 3.50 },
    { name: "Ibuprofen 400mg", cat: "Analgesics", threshold: 300, price: 6.00 },
    { name: "Povidone Iodine 10%", cat: "Antiseptics", threshold: 80, price: 22.00 },
    { name: "Chlorhexidine Solution", cat: "Antiseptics", threshold: 100, price: 35.00 },
    { name: "Iron Supplement 200mg", cat: "Supplements", threshold: 450, price: 8.00 },
    { name: "Calcium Carbonate 500mg", cat: "Supplements", threshold: 400, price: 9.50 },
    { name: "Oxytocin 10 IU/mL", cat: "Hormones", threshold: 50, price: 55.00 },
    { name: "Mifepristone 200mg", cat: "Hormones", threshold: 30, price: 120.00 }
  ];

  const medicineIdMap = {};
  for (const med of medicines) {
    const catId = categoryIdMap[med.cat];
    const res = await pool.request()
      .input("catId", sql.Int, catId)
      .input("name", sql.VarChar(150), med.name)
      .input("threshold", sql.Int, med.threshold)
      .input("price", sql.Decimal(10, 2), med.price)
      .query("INSERT INTO Medicines (CategoryID, MedicineName, MinSafetyThreshold, UnitPrice) OUTPUT INSERTED.MedicineID VALUES (@catId, @name, @threshold, @price)");
    medicineIdMap[med.name] = res.recordset[0].MedicineID;
  }

  
  console.log("Seeding Batches...");
  const batches = [
    
    { med: "Folic Acid 5mg", number: "FOL-ACT-01", mfg: "2025-01-10", exp: "2027-01-10", stock: 250 }, 
    { med: "Folic Acid 5mg", number: "FOL-EXP-01", mfg: "2023-01-10", exp: "2025-01-10", stock: 150 }, 
    { med: "Folic Acid 5mg", number: "FOL-NEX-01", mfg: "2024-08-01", exp: "2026-08-15", stock: 100 },  

    
    { med: "Prenatal Multivitamins", number: "PMV-ACT-01", mfg: "2025-02-15", exp: "2027-02-15", stock: 900 },
    { med: "Prenatal Multivitamins", number: "PMV-EXP-01", mfg: "2023-02-15", exp: "2025-02-15", stock: 200 },
    { med: "Prenatal Multivitamins", number: "PMV-NEX-01", mfg: "2024-07-20", exp: "2026-07-20", stock: 200 },

    
    { med: "Amoxicillin 500mg", number: "AMX-ACT-01", mfg: "2025-03-20", exp: "2027-03-20", stock: 800 },
    { med: "Amoxicillin 500mg", number: "AMX-EXP-01", mfg: "2023-03-20", exp: "2025-03-20", stock: 100 },
    { med: "Amoxicillin 500mg", number: "AMX-NEX-01", mfg: "2024-07-05", exp: "2026-07-15", stock: 200 },

    
    { med: "Ciprofloxacin 250mg", number: "CIP-ACT-01", mfg: "2025-04-05", exp: "2027-04-05", stock: 600 },
    { med: "Ciprofloxacin 250mg", number: "CIP-EXP-01", mfg: "2023-04-05", exp: "2025-04-05", stock: 50 },
    { med: "Ciprofloxacin 250mg", number: "CIP-NEX-01", mfg: "2024-07-10", exp: "2026-07-25", stock: 100 },

    
    { med: "Paracetamol 500mg", number: "PAR-ACT-01", mfg: "2025-05-12", exp: "2028-05-12", stock: 1500 },
    { med: "Paracetamol 500mg", number: "PAR-EXP-01", mfg: "2023-05-12", exp: "2025-05-12", stock: 300 },
    { med: "Paracetamol 500mg", number: "PAR-NEX-01", mfg: "2024-08-01", exp: "2026-08-10", stock: 300 },

    
    { med: "Ibuprofen 400mg", number: "IBU-ACT-01", mfg: "2025-06-18", exp: "2028-06-18", stock: 1000 },
    { med: "Ibuprofen 400mg", number: "IBU-EXP-01", mfg: "2023-06-18", exp: "2025-06-18", stock: 150 },
    { med: "Ibuprofen 400mg", number: "IBU-NEX-01", mfg: "2024-08-05", exp: "2026-08-05", stock: 200 },

    
    { med: "Povidone Iodine 10%", number: "POV-ACT-01", mfg: "2025-07-22", exp: "2027-07-22", stock: 110 }, 
    { med: "Povidone Iodine 10%", number: "POV-EXP-01", mfg: "2023-07-22", exp: "2025-07-22", stock: 80 },
    { med: "Povidone Iodine 10%", number: "POV-NEX-01", mfg: "2024-07-01", exp: "2026-07-30", stock: 15 },

    
    { med: "Chlorhexidine Solution", number: "CHL-ACT-01", mfg: "2025-08-30", exp: "2027-08-30", stock: 500 },
    { med: "Chlorhexidine Solution", number: "CHL-EXP-01", mfg: "2023-08-30", exp: "2025-08-30", stock: 40 },
    { med: "Chlorhexidine Solution", number: "CHL-NEX-01", mfg: "2024-08-15", exp: "2026-08-15", stock: 150 },

    
    { med: "Iron Supplement 200mg", number: "IRO-ACT-01", mfg: "2025-09-10", exp: "2027-09-10", stock: 400 }, 
    { med: "Iron Supplement 200mg", number: "IRO-EXP-01", mfg: "2023-09-10", exp: "2025-09-10", stock: 300 },
    { med: "Iron Supplement 200mg", number: "IRO-NEX-01", mfg: "2024-07-05", exp: "2026-07-15", stock: 80 },

    
    { med: "Calcium Carbonate 500mg", number: "CAL-ACT-01", mfg: "2025-10-01", exp: "2028-10-01", stock: 1200 },
    { med: "Calcium Carbonate 500mg", number: "CAL-EXP-01", mfg: "2023-10-01", exp: "2025-10-01", stock: 200 },
    { med: "Calcium Carbonate 500mg", number: "CAL-NEX-01", mfg: "2024-08-10", exp: "2026-08-10", stock: 200 },

    
    { med: "Oxytocin 10 IU/mL", number: "OXY-ACT-01", mfg: "2025-11-15", exp: "2027-11-15", stock: 200 },
    { med: "Oxytocin 10 IU/mL", number: "OXY-EXP-01", mfg: "2023-11-15", exp: "2025-11-15", stock: 30 },
    { med: "Oxytocin 10 IU/mL", number: "OXY-NEX-01", mfg: "2024-07-20", exp: "2026-07-20", stock: 100 },

    
    { med: "Mifepristone 200mg", number: "MIF-ACT-01", mfg: "2025-12-05", exp: "2027-12-05", stock: 150 },
    { med: "Mifepristone 200mg", number: "MIF-EXP-01", mfg: "2023-12-05", exp: "2025-12-05", stock: 20 },
    { med: "Mifepristone 200mg", number: "MIF-NEX-01", mfg: "2024-08-25", exp: "2026-08-25", stock: 100 }
  ];

  const batchIdMap = {};
  for (const b of batches) {
    const medId = medicineIdMap[b.med];
    const res = await pool.request()
      .input("medId", sql.Int, medId)
      .input("number", sql.VarChar(50), b.number)
      .input("mfg", sql.Date, new Date(b.mfg))
      .input("exp", sql.Date, new Date(b.exp))
      .input("stock", sql.Int, b.stock)
      .query("INSERT INTO Batches (MedicineID, BatchNumber, ManufacturingDate, ExpiryDate, CurrentStock) OUTPUT INSERTED.BatchID VALUES (@medId, @number, @mfg, @exp, @stock)");
    batchIdMap[b.number] = res.recordset[0].BatchID;
  }

  
  console.log("Seeding DispenseLogs...");
  const activeBatches = [
    "FOL-ACT-01", "PMV-ACT-01", "AMX-ACT-01", "CIP-ACT-01", "PAR-ACT-01", 
    "IBU-ACT-01", "POV-ACT-01", "CHL-ACT-01", "IRO-ACT-01", "CAL-ACT-01", 
    "OXY-ACT-01", "MIF-ACT-01", "FOL-NEX-01", "PMV-NEX-01", "AMX-NEX-01",
    "PAR-NEX-01", "IBU-NEX-01", "CAL-NEX-01"
  ];
  const wards = ["Ward-A", "Ward-B", "Maternity Ward", "OB-GYN Clinic", "NICU", "Delivery Room-1", "Delivery Room-2", "ICU", "Ward-C", "Ward-D"];
  
  for (let logIdx = 0; logIdx < 80; logIdx++) {
    const batchNum = activeBatches[logIdx % activeBatches.length];
    const batchId = batchIdMap[batchNum];
    const ward = wards[logIdx % wards.length];
    const qty = 5 + (logIdx % 15); 
    const daysAgo = 90 - Math.floor((logIdx / 80) * 90); 
    const dispenseDate = new Date();
    dispenseDate.setDate(dispenseDate.getDate() - daysAgo);

    await pool.request()
      .input("batchId", sql.Int, batchId)
      .input("ward", sql.VarChar(100), ward)
      .input("qty", sql.Int, qty)
      .input("dispenseDate", sql.DateTime, dispenseDate)
      .query("INSERT INTO DispenseLogs (BatchID, PatientOrWardID, QuantityDispensed, DispenseDate) VALUES (@batchId, @ward, @qty, @dispenseDate)");
  }

  
  console.log("Seeding Pregnancies...");
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-'];
  const conditionsList = [
    ['None'],
    ['Gestational Diabetes'],
    ['Mild Hypertension'],
    ['Anemia'],
    ['None'],
    ['Preeclampsia History'],
    ['None']
  ];
  const allergiesList = [
    ['None'],
    ['Penicillin'],
    ['Sulfa Drugs'],
    ['None']
  ];
  const complicationsList = [
    ['None'],
    ['Preterm Labor in previous pregnancy'],
    ['None']
  ];

  const motherPregnancyMap = {};
  for (let i = 0; i < mothers.length; i++) {
    const mother = mothers[i];
    const doctor = doctors[i % doctors.length];
    const midwife = midwives[i % midwives.length];

    let lmpDate = new Date();
    let status = 'ACTIVE';
    let isCompletedPreg = false;

    
    if (i === 8) {
      
      lmpDate.setMonth(lmpDate.getMonth() - 10);
      lmpDate.setDate(lmpDate.getDate() - 15);
      status = 'COMPLETED';
      isCompletedPreg = true;
    } else if (i === 9) {
      
      lmpDate.setMonth(lmpDate.getMonth() - 4);
      lmpDate.setDate(lmpDate.getDate() - 10);
      status = 'CANCELLED';
    } else {
      
      const monthsAgo = 1 + (i % 8);
      lmpDate.setMonth(lmpDate.getMonth() - monthsAgo);
      lmpDate.setDate(lmpDate.getDate() - (i * 3));
    }

    const cycleLength = 28;
    let metrics;
    if (isCompletedPreg) {
      metrics = {
        eddDate: new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000),
        gestationalAgeWeeks: 40,
        gestationalAgeDays: 0,
        trimester: 'THIRD',
        pregnancyWeekNumber: 41,
        percentageComplete: 100.00
      };
    } else {
      metrics = await computeAllMetrics(lmpDate, cycleLength);
    }

    const pregResult = await pool.request()
      .input("userId", sql.Int, mother.UserID)
      .input("doctorID", sql.Int, doctor.UserID)
      .input("midwifeID", sql.Int, midwife.UserID)
      .input("lmpDate", sql.Date, lmpDate)
      .input("cycleLength", sql.Int, cycleLength)
      .input("isFirstPregnancy", sql.Bit, i % 2 === 0)
      .input("bloodGroup", sql.NVarChar(10), bloodGroups[i % bloodGroups.length])
      .input("medicalConditions", sql.NVarChar(sql.MAX), JSON.stringify(conditionsList[i % conditionsList.length]))
      .input("allergies", sql.NVarChar(sql.MAX), JSON.stringify(allergiesList[i % allergiesList.length]))
      .input("previousComplications", sql.NVarChar(sql.MAX), JSON.stringify(complicationsList[i % complicationsList.length]))
      .input("complicationNotes", sql.NVarChar(sql.MAX), i % 3 === 0 ? "Requires monitoring for blood pressure spike." : null)
      .input("eddDate", sql.Date, metrics.eddDate)
      .input("gestationalAgeWeeks", sql.Int, metrics.gestationalAgeWeeks)
      .input("gestationalAgeDays", sql.Int, metrics.gestationalAgeDays)
      .input("trimester", sql.VarChar(10), metrics.trimester)
      .input("pregnancyWeekNumber", sql.Int, metrics.pregnancyWeekNumber)
      .input("percentageComplete", sql.Decimal(5, 2), metrics.percentageComplete)
      .input("status", sql.VarChar(10), status)
      .query(`
        INSERT INTO Pregnancies (UserID, DoctorID, MidwifeID, LmpDate, CycleLength, IsFirstPregnancy, BloodGroup,
          MedicalConditions, Allergies, PreviousComplications, ComplicationNotes,
          EddDate, GestationalAgeWeeks, GestationalAgeDays, Trimester,
          PregnancyWeekNumber, PercentageComplete, Status)
        OUTPUT INSERTED.PregnancyID
        VALUES (@userId, @doctorID, @midwifeID, @lmpDate, @cycleLength, @isFirstPregnancy, @bloodGroup,
          @medicalConditions, @allergies, @previousComplications, @complicationNotes,
          @eddDate, @gestationalAgeWeeks, @gestationalAgeDays, @trimester,
          @pregnancyWeekNumber, @percentageComplete, @status)
      `);

    const pregnancyId = pregResult.recordset[0].PregnancyID;
    motherPregnancyMap[mother.UserID] = { pregnancyId, doctor, midwife };
  }

  
  console.log("Seeding Chats and Messages...");
  for (const motherId of Object.keys(motherPregnancyMap)) {
    const mId = parseInt(motherId, 10);
    const { pregnancyId, doctor, midwife } = motherPregnancyMap[mId];

    
    const chatDocResult = await pool.request()
      .input("pregnancyId", sql.Int, pregnancyId)
      .query("INSERT INTO Chats (PregnancyID) OUTPUT INSERTED.ChatID VALUES (@pregnancyId)");
    const chatDocId = chatDocResult.recordset[0].ChatID;

    await pool.request().input("chatId", sql.Int, chatDocId).input("userId", sql.Int, mId).query("INSERT INTO ChatParticipants (ChatID, UserID) VALUES (@chatId, @userId)");
    await pool.request().input("chatId", sql.Int, chatDocId).input("userId", sql.Int, doctor.UserID).query("INSERT INTO ChatParticipants (ChatID, UserID) VALUES (@chatId, @userId)");

    
    const docMsgs = [
      { sender: mId, text: "Good morning Doctor. I have a question about my glucose test. When should I take it?" },
      { sender: doctor.UserID, text: "Good morning! The oral glucose tolerance test (OGTT) is typically scheduled between 24 and 28 weeks of pregnancy." },
      { sender: mId, text: "Ah, I see. I'm currently at 20 weeks. Should I wait for the next clinic checkup to schedule it?" },
      { sender: doctor.UserID, text: "Yes, exactly. We will write the laboratory request during your next routine clinic visit at 22 weeks." },
      { sender: mId, text: "Thank you, doctor! That is very clear." },
      { sender: doctor.UserID, text: "You are welcome. Continue taking your iron and calcium supplements daily, and let me know if you experience any severe headaches or swelling." }
    ];

    let lastMsgText = "";
    let lastMsgTime = null;
    for (let msgIdx = 0; msgIdx < docMsgs.length; msgIdx++) {
      const msg = docMsgs[msgIdx];
      const secondsAgo = (docMsgs.length - msgIdx) * 3600; 
      const msgTime = new Date();
      msgTime.setSeconds(msgTime.getSeconds() - secondsAgo);
      
      await pool.request()
        .input("chatId", sql.Int, chatDocId)
        .input("senderId", sql.Int, msg.sender)
        .input("text", sql.NVarChar(2000), msg.text)
        .input("msgTime", sql.DateTime, msgTime)
        .query("INSERT INTO Messages (ChatID, SenderID, Text, IsRead, CreatedAt, UpdatedAt) VALUES (@chatId, @senderId, @text, 1, @msgTime, @msgTime)");
      
      lastMsgText = msg.text;
      lastMsgTime = msgTime;
    }

    await pool.request()
      .input("chatId", sql.Int, chatDocId)
      .input("lastMsgText", sql.NVarChar(sql.MAX), lastMsgText)
      .input("lastMsgTime", sql.DateTime, lastMsgTime)
      .query("UPDATE Chats SET LastMessage = @lastMsgText, LastMessageAt = @lastMsgTime WHERE ChatID = @chatId");

    
    const chatMidResult = await pool.request()
      .input("pregnancyId", sql.Int, pregnancyId)
      .query("INSERT INTO Chats (PregnancyID) OUTPUT INSERTED.ChatID VALUES (@pregnancyId)");
    const chatMidId = chatMidResult.recordset[0].ChatID;

    await pool.request().input("chatId", sql.Int, chatMidId).input("userId", sql.Int, mId).query("INSERT INTO ChatParticipants (ChatID, UserID) VALUES (@chatId, @userId)");
    await pool.request().input("chatId", sql.Int, chatMidId).input("userId", sql.Int, midwife.UserID).query("INSERT INTO ChatParticipants (ChatID, UserID) VALUES (@chatId, @userId)");

    
    const midMsgs = [
      { sender: mId, text: "Hello Sister. I'm feeling some mild lower back pain today. Is it normal at this stage?" },
      { sender: midwife.UserID, text: "Hello! Mild back pain is very common as your baby grows and shifts your center of gravity. Are you experiencing any cramping or spotting?" },
      { sender: mId, text: "No cramping or bleeding, just some dull ache when I stand up for too long." },
      { sender: midwife.UserID, text: "Good, that's reassuring. Try to rest with your feet elevated, do gentle pelvic tilts, and avoid heavy lifting. If the pain becomes sharp or rhythmic, contact me immediately." },
      { sender: mId, text: "Okay, I will rest more. Thank you so much for the advice." },
      { sender: midwife.UserID, text: "You're welcome! Rest well and see you at our checkup on Wednesday." }
    ];

    lastMsgText = "";
    lastMsgTime = null;
    for (let msgIdx = 0; msgIdx < midMsgs.length; msgIdx++) {
      const msg = midMsgs[msgIdx];
      const secondsAgo = (midMsgs.length - msgIdx) * 1800; 
      const msgTime = new Date();
      msgTime.setSeconds(msgTime.getSeconds() - secondsAgo);
      
      await pool.request()
        .input("chatId", sql.Int, chatMidId)
        .input("senderId", sql.Int, msg.sender)
        .input("text", sql.NVarChar(2000), msg.text)
        .input("msgTime", sql.DateTime, msgTime)
        .query("INSERT INTO Messages (ChatID, SenderID, Text, IsRead, CreatedAt, UpdatedAt) VALUES (@chatId, @senderId, @text, 1, @msgTime, @msgTime)");
      
      lastMsgText = msg.text;
      lastMsgTime = msgTime;
    }

    await pool.request()
      .input("chatId", sql.Int, chatMidId)
      .input("lastMsgText", sql.NVarChar(sql.MAX), lastMsgText)
      .input("lastMsgTime", sql.DateTime, lastMsgTime)
      .query("UPDATE Chats SET LastMessage = @lastMsgText, LastMessageAt = @lastMsgTime WHERE ChatID = @chatId");
  }

  
  console.log("Seeding Appointments...");
  for (const motherId of Object.keys(motherPregnancyMap)) {
    const mId = parseInt(motherId, 10);
    const { pregnancyId, doctor, midwife } = motherPregnancyMap[mId];

    
    const pastDays = 15 + (mId % 20); 
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - pastDays);
    pastDate.setHours(9 + (mId % 4), 0, 0, 0);

    const bpSystolic = 110 + (mId % 15);
    const bpDiastolic = 70 + (mId % 15);
    const bp = `${bpSystolic}/${bpDiastolic}`;
    const pulse = 72 + (mId % 12);
    const temp = 36.4 + (mId % 8) * 0.1;

    await pool.request()
      .input("pregId", sql.Int, pregnancyId)
      .input("mId", sql.Int, mId)
      .input("mwId", sql.Int, midwife.UserID)
      .input("apptDate", sql.DateTime, pastDate)
      .input("pulse", sql.Decimal(6, 2), pulse)
      .input("temp", sql.Decimal(5, 2), temp)
      .input("bp", sql.VarChar(20), bp)
      .input("notes", sql.NVarChar(sql.MAX), "Antenatal checkup complete. Fetal growth matches gestational age. Patient advised on nutrition, hydration, and prenatal supplement intake. Blood pressure stable.")
      .query(`
        INSERT INTO Appointments (PregnancyID, MotherID, MidwifeID, AppointmentDate, PreferredDateTime, ConfirmedDateTime, Status, 
          PulseRate, Temperature, BloodPressure, SpecialMedicalConditions, AppointmentNotes, IsCompleted, CompletedAt)
        VALUES (@pregId, @mId, @mwId, @apptDate, @apptDate, @apptDate, 'CONFIRMED',
          @pulse, @temp, @bp, '[]', @notes, 1, @apptDate)
      `);

    
    if (mId % 4 === 0) {
      const todayAppt = new Date();
      todayAppt.setHours(10 + (mId % 3), 0, 0, 0);
      await pool.request()
        .input("pregId", sql.Int, pregnancyId)
        .input("mId", sql.Int, mId)
        .input("mwId", sql.Int, midwife.UserID)
        .input("apptDate", sql.DateTime, todayAppt)
        .query(`
          INSERT INTO Appointments (PregnancyID, MotherID, MidwifeID, AppointmentDate, PreferredDateTime, ConfirmedDateTime, Status)
          VALUES (@pregId, @mId, @mwId, @apptDate, @apptDate, @apptDate, 'CONFIRMED')
        `);
    }

    
    const futureDays = 3 + (mId % 12); 
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + futureDays);
    futureDate.setHours(9 + (mId % 3), 30, 0, 0);

    const statuses = ['PENDING', 'APPROVED', 'CONFIRMED'];
    const apptStatus = statuses[mId % statuses.length];

    await pool.request()
      .input("pregId", sql.Int, pregnancyId)
      .input("mId", sql.Int, mId)
      .input("mwId", sql.Int, midwife.UserID)
      .input("apptDate", sql.DateTime, futureDate)
      .input("status", sql.VarChar(25), apptStatus)
      .query(`
        INSERT INTO Appointments (PregnancyID, MotherID, MidwifeID, AppointmentDate, PreferredDateTime, ConfirmedDateTime, Status)
        VALUES (@pregId, @mId, @mwId, @apptDate, @apptDate, CASE WHEN @status = 'PENDING' THEN NULL ELSE @apptDate END, @status)
      `);

    
    if (mId % 3 === 0) {
      const oddDate = new Date();
      oddDate.setDate(oddDate.getDate() + 1);
      oddDate.setHours(14, 0, 0, 0);

      await pool.request()
        .input("pregId", sql.Int, pregnancyId)
        .input("mId", sql.Int, mId)
        .input("mwId", sql.Int, midwife.UserID)
        .input("apptDate", sql.DateTime, oddDate)
        .query(`
          INSERT INTO Appointments (PregnancyID, MotherID, MidwifeID, AppointmentDate, PreferredDateTime, Status, RejectionReason)
          VALUES (@pregId, @mId, @mwId, @apptDate, @apptDate, 'REJECTED', 'Midwife is unavailable during the requested afternoon slot. Please select a morning time.')
        `);
    } else if (mId % 3 === 1) {
      const oddDate = new Date();
      oddDate.setDate(oddDate.getDate() + 2);
      oddDate.setHours(15, 0, 0, 0);

      await pool.request()
        .input("pregId", sql.Int, pregnancyId)
        .input("mId", sql.Int, mId)
        .input("mwId", sql.Int, midwife.UserID)
        .input("apptDate", sql.DateTime, oddDate)
        .query(`
          INSERT INTO Appointments (PregnancyID, MotherID, MidwifeID, AppointmentDate, PreferredDateTime, Status, RescheduleReason)
          VALUES (@pregId, @mId, @mwId, @apptDate, @apptDate, 'RESCHEDULE_REQUESTED', 'Mother has an urgent family matter and needs to push the checkup by 2 days.')
        `);
    } else {
      const oddDate = new Date();
      oddDate.setDate(oddDate.getDate() - 5);
      oddDate.setHours(11, 0, 0, 0);

      await pool.request()
        .input("pregId", sql.Int, pregnancyId)
        .input("mId", sql.Int, mId)
        .input("mwId", sql.Int, midwife.UserID)
        .input("apptDate", sql.DateTime, oddDate)
        .query(`
          INSERT INTO Appointments (PregnancyID, MotherID, MidwifeID, AppointmentDate, PreferredDateTime, Status)
          VALUES (@pregId, @mId, @mwId, @apptDate, @apptDate, 'CANCELLED')
        `);
    }
  }

  console.log("Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding data:", err);
  process.exit(1);
});
