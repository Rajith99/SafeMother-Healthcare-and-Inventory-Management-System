import "../src/config/env.js";
import { connectDB } from "../src/config/database.js";

async function check() {
  const pool = await connectDB();

  
  const mothersNoPreg = await pool.request().query(`
    SELECT UserID, FullName, Email FROM Users 
    WHERE Role = 'MOTHER' AND IsActive = 1 AND IsDeleted = 0
      AND UserID NOT IN (SELECT DISTINCT UserID FROM Pregnancies)
  `);
  console.log("\nActive Mothers with NO Pregnancy:");
  console.table(mothersNoPreg.recordset);

  
  const doctorsNoPreg = await pool.request().query(`
    SELECT UserID, FullName, Email FROM Users 
    WHERE Role = 'DOCTOR' AND IsActive = 1 AND IsDeleted = 0
      AND UserID NOT IN (SELECT DISTINCT DoctorID FROM Pregnancies WHERE DoctorID IS NOT NULL)
  `);
  console.log("\nActive Doctors with NO assigned Pregnancies:");
  console.table(doctorsNoPreg.recordset);

  
  const midwivesNoPreg = await pool.request().query(`
    SELECT UserID, FullName, Email FROM Users 
    WHERE Role = 'MIDWIFE' AND IsActive = 1 AND IsDeleted = 0
      AND UserID NOT IN (SELECT DISTINCT MidwifeID FROM Pregnancies WHERE MidwifeID IS NOT NULL)
  `);
  console.log("\nActive Midwives with NO assigned Pregnancies:");
  console.table(midwivesNoPreg.recordset);

  
  const chatsCount = await pool.request().query("SELECT COUNT(*) as count FROM Chats");
  console.log(`\nTotal Chats in DB: ${chatsCount.recordset[0].count}`);

  
  const apptsCount = await pool.request().query("SELECT COUNT(*) as count FROM Appointments");
  console.log(`Total Appointments in DB: ${apptsCount.recordset[0].count}`);

  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
