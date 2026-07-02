import "./src/config/env.js";
import { connectDB, sql } from "./src/config/database.js";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Connecting to DB...");
  const pool = await connectDB();
  console.log("DB connected.");

  const users = [
    {
      fullName: "Admin User",
      email: "admin@safemother.com",
      contactNumber: "0771111111",
      address: "123 Main St, Colombo",
      dateOfBirth: "1990-01-01",
      password: "Password123!",
      role: "ADMIN",
      isActive: true,
    },
    {
      fullName: "System Administrator",
      email: "admin@hospital.com",
      contactNumber: "0771111111",
      address: "General Hospital",
      dateOfBirth: "1985-01-01",
      password: "Admin@123",
      role: "ADMIN",
      isActive: true,
    },
    
    { fullName: "Dr. John Doe", email: "doctor@safemother.com", contactNumber: "0772222222", address: "General Hospital, Colombo", dateOfBirth: "1980-05-15", password: "Password123!", role: "DOCTOR", isActive: true },
    { fullName: "Dr Alice Smith", email: "doctor1@safemother.com", contactNumber: "0772000001", address: "General Hospital, Colombo", dateOfBirth: "1982-03-12", password: "Password123!", role: "DOCTOR", isActive: true },
    { fullName: "Dr Bob Johnson", email: "doctor2@safemother.com", contactNumber: "0772000002", address: "Teaching Hospital, Kandy", dateOfBirth: "1978-07-24", password: "Password123!", role: "DOCTOR", isActive: true },
    { fullName: "Dr Carol Williams", email: "doctor3@safemother.com", contactNumber: "0772000003", address: "Base Hospital, Negombo", dateOfBirth: "1985-11-09", password: "Password123!", role: "DOCTOR", isActive: true },
    { fullName: "Dr David Brown", email: "doctor4@safemother.com", contactNumber: "0772000004", address: "General Hospital, Jaffna", dateOfBirth: "1974-02-18", password: "Password123!", role: "DOCTOR", isActive: true },
    { fullName: "Dr Eva Davis", email: "doctor5@safemother.com", contactNumber: "0772000005", address: "Base Hospital, Galle", dateOfBirth: "1983-09-30", password: "Password123!", role: "DOCTOR", isActive: true },
    { fullName: "Dr Frank Miller", email: "doctor6@safemother.com", contactNumber: "0772000006", address: "Provincial Hospital, Kurunegala", dateOfBirth: "1980-12-05", password: "Password123!", role: "DOCTOR", isActive: true },
    { fullName: "Dr Grace Wilson", email: "doctor7@safemother.com", contactNumber: "0772000007", address: "General Hospital, Colombo", dateOfBirth: "1986-04-14", password: "Password123!", role: "DOCTOR", isActive: true },
    { fullName: "Dr Henry Moore", email: "doctor8@safemother.com", contactNumber: "0772000008", address: "Base Hospital, Badulla", dateOfBirth: "1977-08-22", password: "Password123!", role: "DOCTOR", isActive: true },
    { fullName: "Dr Irene Taylor", email: "doctor9@safemother.com", contactNumber: "0772000009", address: "General Hospital, Ratnapura", dateOfBirth: "1981-10-15", password: "Password123!", role: "DOCTOR", isActive: true },
    { fullName: "Dr Jack Anderson", email: "doctor10@safemother.com", contactNumber: "0772000010", address: "Teaching Hospital, Karapitiya", dateOfBirth: "1979-05-27", password: "Password123!", role: "DOCTOR", isActive: true },

    
    { fullName: "Midwife Mary", email: "midwife@safemother.com", contactNumber: "0773333333", address: "Community Clinic, Colombo", dateOfBirth: "1985-08-20", password: "Password123!", role: "MIDWIFE", isActive: true },
    { fullName: "Clara Barton", email: "midwife1@safemother.com", contactNumber: "0773000001", address: "Maternity Clinic, Colombo", dateOfBirth: "1987-01-25", password: "Password123!", role: "MIDWIFE", isActive: true },
    { fullName: "Florence Nightingale", email: "midwife2@safemother.com", contactNumber: "0773000002", address: "Community Health Centre, Kandy", dateOfBirth: "1984-05-12", password: "Password123!", role: "MIDWIFE", isActive: true },
    { fullName: "Mary Breckinridge", email: "midwife3@safemother.com", contactNumber: "0773000003", address: "Rural Care Clinic, Matara", dateOfBirth: "1989-10-02", password: "Password123!", role: "MIDWIFE", isActive: true },
    { fullName: "Edith Cavell", email: "midwife4@safemother.com", contactNumber: "0773000004", address: "Municipal Clinic, Jaffna", dateOfBirth: "1986-12-04", password: "Password123!", role: "MIDWIFE", isActive: true },
    { fullName: "Margaret Sanger", email: "midwife5@safemother.com", contactNumber: "0773000005", address: "Women's Wellness Centre, Galle", dateOfBirth: "1983-09-14", password: "Password123!", role: "MIDWIFE", isActive: true },
    { fullName: "Jane Sharp", email: "midwife6@safemother.com", contactNumber: "0773000006", address: "Community Clinic, Negombo", dateOfBirth: "1988-06-30", password: "Password123!", role: "MIDWIFE", isActive: true },
    { fullName: "Elizabeth Blackwell", email: "midwife7@safemother.com", contactNumber: "0773000007", address: "General Hospital, Colombo", dateOfBirth: "1985-02-03", password: "Password123!", role: "MIDWIFE", isActive: true },
    { fullName: "Marie Zakrzewska", email: "midwife8@safemother.com", contactNumber: "0773000008", address: "Rural Clinic, Anuradhapura", dateOfBirth: "1990-09-06", password: "Password123!", role: "MIDWIFE", isActive: true },
    { fullName: "Justina Ford", email: "midwife9@safemother.com", contactNumber: "0773000009", address: "Maternity Clinic, Ratnapura", dateOfBirth: "1987-03-22", password: "Password123!", role: "MIDWIFE", isActive: true },
    { fullName: "Mabel Staupers", email: "midwife10@safemother.com", contactNumber: "0773000010", address: "Community Clinic, Trincomalee", dateOfBirth: "1984-11-18", password: "Password123!", role: "MIDWIFE", isActive: true },

    
    { fullName: "Jane Doe", email: "mother@safemother.com", contactNumber: "0774444444", address: "456 Oak Rd, Kandy", dateOfBirth: "1995-10-10", password: "Password123!", role: "MOTHER", isActive: true },
    { fullName: "Jane Doe (M1)", email: "mother1@safemother.com", contactNumber: "0774000001", address: "12 Palm Grove, Colombo", dateOfBirth: "1996-02-14", password: "Password123!", role: "MOTHER", isActive: true },
    { fullName: "Anna Smith", email: "mother2@safemother.com", contactNumber: "0774000002", address: "78 Temple Rd, Kandy", dateOfBirth: "1994-06-21", password: "Password123!", role: "MOTHER", isActive: true },
    { fullName: "Emily Watson", email: "mother3@safemother.com", contactNumber: "0774000003", address: "34 Beach Rd, Galle", dateOfBirth: "1993-09-05", password: "Password123!", role: "MOTHER", isActive: true },
    { fullName: "Sarah Connor", email: "mother4@safemother.com", contactNumber: "0774000004", address: "55 Station Rd, Jaffna", dateOfBirth: "1991-03-19", password: "Password123!", role: "MOTHER", isActive: true },
    { fullName: "Lily Evans", email: "mother5@safemother.com", contactNumber: "0774000005", address: "90 Hill St, Nuwara Eliya", dateOfBirth: "1997-07-31", password: "Password123!", role: "MOTHER", isActive: true },
    { fullName: "Lucy Heartfilia", email: "mother6@safemother.com", contactNumber: "0774000006", address: "21 Lake View, Negombo", dateOfBirth: "1995-12-01", password: "Password123!", role: "MOTHER", isActive: true },
    { fullName: "Diana Prince", email: "mother7@safemother.com", contactNumber: "0774000007", address: "88 Palace Gdns, Colombo", dateOfBirth: "1992-05-18", password: "Password123!", role: "MOTHER", isActive: true },
    { fullName: "Lois Lane", email: "mother8@safemother.com", contactNumber: "0774000008", address: "14 Press Ave, Kurunegala", dateOfBirth: "1994-08-25", password: "Password123!", role: "MOTHER", isActive: true },
    { fullName: "Mary Jane", email: "mother9@safemother.com", contactNumber: "0774000009", address: "67 Web Rd, Gampaha", dateOfBirth: "1996-10-12", password: "Password123!", role: "MOTHER", isActive: true },
    { fullName: "Clara Oswald", email: "mother10@safemother.com", contactNumber: "0774000010", address: "40 Time Traveller St, Badulla", dateOfBirth: "1993-11-23", password: "Password123!", role: "MOTHER", isActive: true }
  ];

  for (const user of users) {
    
    const checkResult = await pool.request()
      .input("email", sql.NVarChar(255), user.email)
      .query("SELECT UserID FROM Users WHERE Email = @email");

    if (checkResult.recordset.length > 0) {
      console.log(`User ${user.email} already exists, updating password, active status, and restoring...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      await pool.request()
        .input("email", sql.NVarChar(255), user.email)
        .input("password", sql.NVarChar(255), hashedPassword)
        .input("isActive", sql.Bit, user.isActive)
        .query("UPDATE Users SET Password = @password, IsActive = @isActive, IsDeleted = 0 WHERE Email = @email");
    } else {
      console.log(`Creating user ${user.email}...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      await pool.request()
        .input("fullName", sql.NVarChar(200), user.fullName)
        .input("email", sql.NVarChar(255), user.email)
        .input("contactNumber", sql.VarChar(15), user.contactNumber)
        .input("address", sql.NVarChar(500), user.address)
        .input("dateOfBirth", sql.Date, new Date(user.dateOfBirth))
        .input("password", sql.NVarChar(255), hashedPassword)
        .input("role", sql.VarChar(10), user.role)
        .input("isActive", sql.Bit, user.isActive)
        .query(`
          INSERT INTO Users (FullName, Email, ContactNumber, Address, DateOfBirth, Password, Role, IsActive)
          VALUES (@fullName, @email, @contactNumber, @address, @dateOfBirth, @password, @role, @isActive)
        `);
    }
  }

  console.log("Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding users:", err);
  process.exit(1);
});
