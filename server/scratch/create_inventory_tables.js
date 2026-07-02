import '../src/config/env.js';
import { connectDB, getPool, sql } from '../src/config/database.js';

async function createTables() {
    try {
        console.log('Connecting to database...');
        const pool = await connectDB();
        console.log('Connected successfully!');

        console.log('Dropping old dependent views, procedures, and functions...');
        
        // Drop views
        await pool.request().query("DROP VIEW IF EXISTS vw_CriticalStock");
        await pool.request().query("DROP VIEW IF EXISTS vw_ExpiringSoon");

        // Drop procedures
        await pool.request().query("DROP PROCEDURE IF EXISTS sp_ProcessIncomingShipment");
        await pool.request().query("DROP PROCEDURE IF EXISTS sp_DemandForecastingAndReorder");
        await pool.request().query("DROP PROCEDURE IF EXISTS sp_GenerateMonthlyAudit");

        // Drop functions
        await pool.request().query("DROP FUNCTION IF EXISTS fn_CalculateCategoryValue");
        await pool.request().query("DROP FUNCTION IF EXISTS fn_GetAverageDailyConsumption");

        // Drop old tables
        await pool.request().query("DROP TABLE IF EXISTS DispenseLogs");
        await pool.request().query("DROP TABLE IF EXISTS Batches");
        await pool.request().query("DROP TABLE IF EXISTS Medicines");
        await pool.request().query("DROP TABLE IF EXISTS Categories");

        console.log('Dropping new tables if they already exist...');
        await pool.request().query("DROP TABLE IF EXISTS reorder_forecasts");
        await pool.request().query("DROP TABLE IF EXISTS stock_transactions");
        await pool.request().query("DROP TABLE IF EXISTS medicine_batches");
        await pool.request().query("DROP TABLE IF EXISTS medicines");
        await pool.request().query("DROP TABLE IF EXISTS medicine_categories");

        console.log('Creating new inventory tables...');

        // 1. medicine_categories
        await pool.request().query(`
            CREATE TABLE medicine_categories (
                CategoryID INT IDENTITY(1,1) PRIMARY KEY,
                CategoryName NVARCHAR(100) NOT NULL UNIQUE,
                Description NVARCHAR(500) NULL,
                Status VARCHAR(10) NOT NULL DEFAULT 'Active' CONSTRAINT CHK_medicine_categories_Status CHECK (Status IN ('Active', 'Inactive')),
                CreatedDate DATETIME NOT NULL DEFAULT GETDATE()
            )
        `);
        console.log('Created: medicine_categories');

        // 2. medicines
        await pool.request().query(`
            CREATE TABLE medicines (
                MedicineID INT IDENTITY(1,1) PRIMARY KEY,
                MedicineName NVARCHAR(150) NOT NULL,
                GenericName NVARCHAR(150) NOT NULL,
                CategoryID INT NOT NULL,
                UnitType VARCHAR(50) NOT NULL,
                Manufacturer NVARCHAR(150) NULL,
                SellingPrice DECIMAL(10,2) NOT NULL CONSTRAINT CHK_medicines_SellingPrice CHECK (SellingPrice >= 0),
                ReorderLevel INT NOT NULL DEFAULT 0 CONSTRAINT CHK_medicines_ReorderLevel CHECK (ReorderLevel >= 0),
                Description NVARCHAR(MAX) NULL,
                Status VARCHAR(10) NOT NULL DEFAULT 'Active' CONSTRAINT CHK_medicines_Status CHECK (Status IN ('Active', 'Inactive')),
                CONSTRAINT FK_medicines_categories FOREIGN KEY (CategoryID) REFERENCES medicine_categories(CategoryID) ON DELETE CASCADE
            )
        `);
        console.log('Created: medicines');

        // 3. medicine_batches
        await pool.request().query(`
            CREATE TABLE medicine_batches (
                BatchID INT IDENTITY(1,1) PRIMARY KEY,
                MedicineID INT NOT NULL,
                BatchNumber VARCHAR(50) NOT NULL,
                QuantityReceived INT NOT NULL CONSTRAINT CHK_medicine_batches_QtyReceived CHECK (QuantityReceived >= 0),
                CurrentQuantity INT NOT NULL CONSTRAINT CHK_medicine_batches_CurrentQty CHECK (CurrentQuantity >= 0),
                ManufacturingDate DATE NOT NULL,
                ExpiryDate DATE NOT NULL,
                PurchasePrice DECIMAL(10,2) NOT NULL CONSTRAINT CHK_medicine_batches_PurchasePrice CHECK (PurchasePrice >= 0),
                SupplierName NVARCHAR(150) NULL,
                CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
                CONSTRAINT FK_medicine_batches_medicines FOREIGN KEY (MedicineID) REFERENCES medicines(MedicineID) ON DELETE CASCADE,
                CONSTRAINT CHK_medicine_batches_Dates CHECK (ExpiryDate > ManufacturingDate)
            )
        `);
        console.log('Created: medicine_batches');

        // 4. stock_transactions
        await pool.request().query(`
            CREATE TABLE stock_transactions (
                TransactionID INT IDENTITY(1,1) PRIMARY KEY,
                BatchID INT NOT NULL,
                TransactionType VARCHAR(20) NOT NULL CONSTRAINT CHK_stock_transactions_Type CHECK (TransactionType IN ('RECEIVED', 'DISPENSED', 'ADJUSTED', 'EXPIRED', 'RETURNED')),
                Quantity INT NOT NULL,
                PatientOrWardID NVARCHAR(100) NULL,
                Notes NVARCHAR(500) NULL,
                TransactionDate DATETIME NOT NULL DEFAULT GETDATE(),
                CreatedBy INT NULL,
                CONSTRAINT FK_stock_transactions_batches FOREIGN KEY (BatchID) REFERENCES medicine_batches(BatchID) ON DELETE CASCADE,
                CONSTRAINT FK_stock_transactions_users FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
            )
        `);
        console.log('Created: stock_transactions');

        // 5. reorder_forecasts
        await pool.request().query(`
            CREATE TABLE reorder_forecasts (
                ForecastID INT IDENTITY(1,1) PRIMARY KEY,
                MedicineID INT NOT NULL,
                CurrentStock INT NOT NULL,
                AverageMonthlyUsage DECIMAL(10,2) NOT NULL,
                ExpectedMonthlyConsumption DECIMAL(10,2) NOT NULL,
                SuggestedQuantity INT NOT NULL,
                SafetyFactor DECIMAL(5,2) NOT NULL DEFAULT 1.2,
                ReorderLevel INT NOT NULL,
                ForecastDate DATETIME NOT NULL DEFAULT GETDATE(),
                CONSTRAINT FK_reorder_forecasts_medicines FOREIGN KEY (MedicineID) REFERENCES medicines(MedicineID) ON DELETE CASCADE
            )
        `);
        console.log('Created: reorder_forecasts');

        // Seeding database tables
        console.log('Seeding new inventory tables...');

        const categories = [
            { name: "Vitamins", desc: "Essential dietary supplements for mother and fetal development", status: "Active" },
            { name: "Antibiotics", desc: "Used to treat bacterial infections", status: "Active" },
            { name: "Analgesics", desc: "Pain relief and management", status: "Active" },
            { name: "Antiseptics", desc: "Disinfectants and microbial inhibitors", status: "Active" },
            { name: "Hormones", desc: "Hormonal therapy and labor induction", status: "Active" },
            { name: "Supplements", desc: "Iron, Calcium, and other critical mineral supplements", status: "Active" }
        ];

        const catIdMap = {};
        for (const cat of categories) {
            const res = await pool.request()
                .input("name", sql.NVarChar(100), cat.name)
                .input("desc", sql.NVarChar(500), cat.desc)
                .input("status", sql.VarChar(10), cat.status)
                .query("INSERT INTO medicine_categories (CategoryName, Description, Status) OUTPUT INSERTED.CategoryID VALUES (@name, @desc, @status)");
            catIdMap[cat.name] = res.recordset[0].CategoryID;
        }

        const medicines = [
            { name: "Folic Acid 5mg", generic: "Folic Acid", cat: "Vitamins", unit: "Tablet", mfg: "Pfizer", price: 6.50, threshold: 300, desc: "Supplements fetal brain development", status: "Active" },
            { name: "Prenatal Multivitamins", generic: "Multivitamin", cat: "Vitamins", unit: "Capsule", mfg: "Bayer", price: 15.00, threshold: 400, desc: "Daily vitamins for pregnancy", status: "Active" },
            { name: "Amoxicillin 500mg", generic: "Amoxicillin", cat: "Antibiotics", unit: "Capsule", mfg: "GSK", price: 12.50, threshold: 250, desc: "Broad-spectrum antibiotic", status: "Active" },
            { name: "Ciprofloxacin 250mg", generic: "Ciprofloxacin", cat: "Antibiotics", unit: "Tablet", mfg: "Sandoz", price: 18.00, threshold: 150, desc: "UTI antibiotic", status: "Active" },
            { name: "Paracetamol 500mg", generic: "Acetaminophen", cat: "Analgesics", unit: "Tablet", mfg: "GSK", price: 3.50, threshold: 500, desc: "Pain and fever reducer", status: "Active" },
            { name: "Ibuprofen 400mg", generic: "Ibuprofen", cat: "Analgesics", unit: "Tablet", mfg: "Abbott", price: 6.00, threshold: 300, desc: "Anti-inflammatory pain reliever", status: "Active" },
            { name: "Povidone Iodine 10%", generic: "Povidone Iodine", cat: "Antiseptics", unit: "Bottle", mfg: "Betadine", price: 22.00, threshold: 80, desc: "Antiseptic skin cleanser", status: "Active" },
            { name: "Chlorhexidine Solution", generic: "Chlorhexidine Gluconate", cat: "Antiseptics", unit: "Bottle", mfg: "Hibiclens", price: 35.00, threshold: 100, desc: "Surgical scrub solution", status: "Active" },
            { name: "Iron Supplement 200mg", generic: "Ferrous Sulfate", cat: "Supplements", unit: "Tablet", mfg: "Nature Made", price: 8.00, threshold: 450, desc: "Treats gestational anemia", status: "Active" },
            { name: "Calcium Carbonate 500mg", generic: "Calcium Carbonate", cat: "Supplements", unit: "Tablet", mfg: "Tums", price: 9.50, threshold: 400, desc: "Calcium supplement for bone health", status: "Active" },
            { name: "Oxytocin 10 IU/mL", generic: "Oxytocin", cat: "Hormones", unit: "Injection", mfg: "Novartis", price: 55.00, threshold: 50, desc: "Used to induce labor", status: "Active" },
            { name: "Mifepristone 200mg", generic: "Mifepristone", cat: "Hormones", unit: "Tablet", mfg: "Danco", price: 120.00, threshold: 30, desc: "Progesterone receptor modulator", status: "Active" }
        ];

        const medIdMap = {};
        for (const med of medicines) {
            const catId = catIdMap[med.cat];
            const res = await pool.request()
                .input("name", sql.NVarChar(150), med.name)
                .input("generic", sql.NVarChar(150), med.generic)
                .input("catId", sql.Int, catId)
                .input("unit", sql.VarChar(50), med.unit)
                .input("mfg", sql.NVarChar(150), med.mfg)
                .input("price", sql.Decimal(10, 2), med.price)
                .input("threshold", sql.Int, med.threshold)
                .input("desc", sql.NVarChar(sql.MAX), med.desc)
                .input("status", sql.VarChar(10), med.status)
                .query(`
                    INSERT INTO medicines (MedicineName, GenericName, CategoryID, UnitType, Manufacturer, SellingPrice, ReorderLevel, Description, Status)
                    OUTPUT INSERTED.MedicineID
                    VALUES (@name, @generic, @catId, @unit, @mfg, @price, @threshold, @desc, @status)
                `);
            medIdMap[med.name] = res.recordset[0].MedicineID;
        }

        const batches = [
            { med: "Folic Acid 5mg", number: "FOL-ACT-01", mfg: "2025-01-10", exp: "2027-01-10", stock: 250, purchasePrice: 4.00, supplier: "Pfizer Wholesale", qtyReceived: 500 },
            { med: "Folic Acid 5mg", number: "FOL-EXP-01", mfg: "2023-01-10", exp: "2025-01-10", stock: 150, purchasePrice: 3.50, supplier: "Pfizer Wholesale", qtyReceived: 300 },
            { med: "Folic Acid 5mg", number: "FOL-NEX-01", mfg: "2024-08-01", exp: "2026-08-15", stock: 100, purchasePrice: 4.20, supplier: "Pfizer Wholesale", qtyReceived: 200 },

            { med: "Prenatal Multivitamins", number: "PMV-ACT-01", mfg: "2025-02-15", exp: "2027-02-15", stock: 900, purchasePrice: 10.00, supplier: "Bayer Meds", qtyReceived: 1500 },
            { med: "Prenatal Multivitamins", number: "PMV-EXP-01", mfg: "2023-02-15", exp: "2025-02-15", stock: 200, purchasePrice: 9.00, supplier: "Bayer Meds", qtyReceived: 500 },
            { med: "Prenatal Multivitamins", number: "PMV-NEX-01", mfg: "2024-07-20", exp: "2026-07-20", stock: 200, purchasePrice: 10.50, supplier: "Bayer Meds", qtyReceived: 500 },

            { med: "Amoxicillin 500mg", number: "AMX-ACT-01", mfg: "2025-03-20", exp: "2027-03-20", stock: 800, purchasePrice: 8.00, supplier: "GSK Distributors", qtyReceived: 1200 },
            { med: "Amoxicillin 500mg", number: "AMX-EXP-01", mfg: "2023-03-20", exp: "2025-03-20", stock: 100, purchasePrice: 7.50, supplier: "GSK Distributors", qtyReceived: 400 },
            { med: "Amoxicillin 500mg", number: "AMX-NEX-01", mfg: "2024-07-05", exp: "2026-07-15", stock: 200, purchasePrice: 8.20, supplier: "GSK Distributors", qtyReceived: 500 },

            { med: "Ciprofloxacin 250mg", number: "CIP-ACT-01", mfg: "2025-04-05", exp: "2027-04-05", stock: 600, purchasePrice: 12.00, supplier: "Sandoz Pharma", qtyReceived: 1000 },
            { med: "Ciprofloxacin 250mg", number: "CIP-EXP-01", mfg: "2023-04-05", exp: "2025-04-05", stock: 50, purchasePrice: 11.00, supplier: "Sandoz Pharma", qtyReceived: 300 },
            { med: "Ciprofloxacin 250mg", number: "CIP-NEX-01", mfg: "2024-07-10", exp: "2026-07-25", stock: 100, purchasePrice: 12.50, supplier: "Sandoz Pharma", qtyReceived: 300 },

            { med: "Paracetamol 500mg", number: "PAR-ACT-01", mfg: "2025-05-12", exp: "2028-05-12", stock: 1500, purchasePrice: 2.00, supplier: "Global Pharma", qtyReceived: 2500 },
            { med: "Paracetamol 500mg", number: "PAR-EXP-01", mfg: "2023-05-12", exp: "2025-05-12", stock: 300, purchasePrice: 1.80, supplier: "Global Pharma", qtyReceived: 800 },
            { med: "Paracetamol 500mg", number: "PAR-NEX-01", mfg: "2024-08-01", exp: "2026-08-10", stock: 300, purchasePrice: 2.10, supplier: "Global Pharma", qtyReceived: 500 },

            { med: "Ibuprofen 400mg", number: "IBU-ACT-01", mfg: "2025-06-18", exp: "2028-06-18", stock: 1000, purchasePrice: 3.50, supplier: "Global Pharma", qtyReceived: 1500 },
            { med: "Ibuprofen 400mg", number: "IBU-EXP-01", mfg: "2023-06-18", exp: "2025-06-18", stock: 150, purchasePrice: 3.00, supplier: "Global Pharma", qtyReceived: 400 },
            { med: "Ibuprofen 400mg", number: "IBU-NEX-01", mfg: "2024-08-05", exp: "2026-08-05", stock: 200, purchasePrice: 3.80, supplier: "Global Pharma", qtyReceived: 500 },

            { med: "Povidone Iodine 10%", number: "POV-ACT-01", mfg: "2025-07-22", exp: "2027-07-22", stock: 110, purchasePrice: 15.00, supplier: "Betadine Inc", qtyReceived: 200 },
            { med: "Povidone Iodine 10%", number: "POV-EXP-01", mfg: "2023-07-22", exp: "2025-07-22", stock: 80, purchasePrice: 14.00, supplier: "Betadine Inc", qtyReceived: 150 },
            { med: "Povidone Iodine 10%", number: "POV-NEX-01", mfg: "2024-07-01", exp: "2026-07-30", stock: 15, purchasePrice: 15.50, supplier: "Betadine Inc", qtyReceived: 100 },

            { med: "Chlorhexidine Solution", number: "CHL-ACT-01", mfg: "2025-08-30", exp: "2027-08-30", stock: 500, purchasePrice: 22.00, supplier: "Hibiclens Corp", qtyReceived: 800 },
            { med: "Chlorhexidine Solution", number: "CHL-EXP-01", mfg: "2023-08-30", exp: "2025-08-30", stock: 40, purchasePrice: 20.00, supplier: "Hibiclens Corp", qtyReceived: 200 },
            { med: "Chlorhexidine Solution", number: "CHL-NEX-01", mfg: "2024-08-15", exp: "2026-08-15", stock: 150, purchasePrice: 23.00, supplier: "Hibiclens Corp", qtyReceived: 300 },

            { med: "Iron Supplement 200mg", number: "IRO-ACT-01", mfg: "2025-09-10", exp: "2027-09-10", stock: 400, purchasePrice: 4.50, supplier: "Supplement Direct", qtyReceived: 800 },
            { med: "Iron Supplement 200mg", number: "IRO-EXP-01", mfg: "2023-09-10", exp: "2025-09-10", stock: 300, purchasePrice: 4.00, supplier: "Supplement Direct", qtyReceived: 500 },
            { med: "Iron Supplement 200mg", number: "IRO-NEX-01", mfg: "2024-07-05", exp: "2026-07-15", stock: 80, purchasePrice: 4.80, supplier: "Supplement Direct", qtyReceived: 200 },

            { med: "Calcium Carbonate 500mg", number: "CAL-ACT-01", mfg: "2025-10-01", exp: "2028-10-01", stock: 1200, purchasePrice: 5.50, supplier: "Tums Supply", qtyReceived: 2000 },
            { med: "Calcium Carbonate 500mg", number: "CAL-EXP-01", mfg: "2023-10-01", exp: "2025-10-01", stock: 200, purchasePrice: 5.00, supplier: "Tums Supply", qtyReceived: 500 },
            { med: "Calcium Carbonate 500mg", number: "CAL-NEX-01", mfg: "2024-08-10", exp: "2026-08-10", stock: 200, purchasePrice: 5.80, supplier: "Tums Supply", qtyReceived: 500 },

            { med: "Oxytocin 10 IU/mL", number: "OXY-ACT-01", mfg: "2025-11-15", exp: "2027-11-15", stock: 200, purchasePrice: 38.00, supplier: "Novartis Corp", qtyReceived: 400 },
            { med: "Oxytocin 10 IU/mL", number: "OXY-EXP-01", mfg: "2023-11-15", exp: "2025-11-15", stock: 30, purchasePrice: 35.00, supplier: "Novartis Corp", qtyReceived: 100 },
            { med: "Oxytocin 10 IU/mL", number: "OXY-NEX-01", mfg: "2024-07-20", exp: "2026-07-20", stock: 100, purchasePrice: 40.00, supplier: "Novartis Corp", qtyReceived: 200 },

            { med: "Mifepristone 200mg", number: "MIF-ACT-01", mfg: "2025-12-05", exp: "2027-12-05", stock: 150, purchasePrice: 85.00, supplier: "Danco Labs", qtyReceived: 300 },
            { med: "Mifepristone 200mg", number: "MIF-EXP-01", mfg: "2023-12-05", exp: "2025-12-05", stock: 20, purchasePrice: 80.00, supplier: "Danco Labs", qtyReceived: 100 },
            { med: "Mifepristone 200mg", number: "MIF-NEX-01", mfg: "2024-08-25", exp: "2026-08-25", stock: 100, purchasePrice: 90.00, supplier: "Danco Labs", qtyReceived: 200 }
        ];

        const batchIdMap = {};
        for (const b of batches) {
            const medId = medIdMap[b.med];
            const res = await pool.request()
                .input("medId", sql.Int, medId)
                .input("number", sql.VarChar(50), b.number)
                .input("qtyReceived", sql.Int, b.qtyReceived)
                .input("currentQty", sql.Int, b.stock)
                .input("mfg", sql.Date, new Date(b.mfg))
                .input("exp", sql.Date, new Date(b.exp))
                .input("purchasePrice", sql.Decimal(10, 2), b.purchasePrice)
                .input("supplier", sql.NVarChar(150), b.supplier)
                .query(`
                    INSERT INTO medicine_batches (MedicineID, BatchNumber, QuantityReceived, CurrentQuantity, ManufacturingDate, ExpiryDate, PurchasePrice, SupplierName)
                    OUTPUT INSERTED.BatchID
                    VALUES (@medId, @number, @qtyReceived, @currentQty, @mfg, @exp, @purchasePrice, @supplier)
                `);
            const batchId = res.recordset[0].BatchID;
            batchIdMap[b.number] = batchId;

            // Add RECEIVED transaction for the initial quantity
            await pool.request()
                .input("batchId", sql.Int, batchId)
                .input("qty", sql.Int, b.qtyReceived)
                .input("notes", sql.NVarChar(500), "Initial shipment received")
                .query("INSERT INTO stock_transactions (BatchID, TransactionType, Quantity, Notes) VALUES (@batchId, 'RECEIVED', @qty, @notes)");
        }

        console.log('Seeding stock dispense transactions over past 90 days...');
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

            // Insert DISPENSED transaction
            await pool.request()
                .input("batchId", sql.Int, batchId)
                .input("ward", sql.NVarChar(100), ward)
                .input("qty", sql.Int, -qty) // negative quantity for dispenses
                .input("dispenseDate", sql.DateTime, dispenseDate)
                .input("notes", sql.NVarChar(500), `Dispensed to ${ward}`)
                .query("INSERT INTO stock_transactions (BatchID, TransactionType, Quantity, PatientOrWardID, Notes, TransactionDate) VALUES (@batchId, 'DISPENSED', @qty, @ward, @notes, @dispenseDate)");
        }

        console.log('Tables created and seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

createTables();
