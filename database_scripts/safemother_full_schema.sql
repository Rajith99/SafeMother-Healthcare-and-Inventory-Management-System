CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    ContactNumber VARCHAR(15) NOT NULL,
    Address NVARCHAR(500) NOT NULL,
    DateOfBirth DATE NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    Role VARCHAR(10) NOT NULL DEFAULT 'MOTHER'
        CONSTRAINT CHK_Users_Role CHECK (Role IN ('MOTHER', 'MIDWIFE', 'DOCTOR', 'ADMIN')),
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    PasswordResetToken NVARCHAR(255) NULL,
    PasswordResetExpires DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO


CREATE TABLE Pregnancies (
    PregnancyID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    LmpDate DATE NOT NULL,
    CycleLength INT NOT NULL DEFAULT 28
        CONSTRAINT CHK_Pregnancies_CycleLength CHECK (CycleLength >= 21 AND CycleLength <= 35),
    IsFirstPregnancy BIT NOT NULL DEFAULT 0,
    BloodGroup NVARCHAR(10) NULL,
    MedicalConditions NVARCHAR(MAX) NULL,       
    Allergies NVARCHAR(MAX) NULL,                
    PreviousComplications NVARCHAR(MAX) NULL,    
    ComplicationNotes NVARCHAR(MAX) NULL,
    
    EddDate DATE NULL,
    GestationalAgeWeeks INT NULL,
    GestationalAgeDays INT NULL,
    Trimester VARCHAR(10) NULL
        CONSTRAINT CHK_Pregnancies_Trimester CHECK (Trimester IN ('FIRST', 'SECOND', 'THIRD')),
    PregnancyWeekNumber INT NULL,
    PercentageComplete DECIMAL(5,2) NULL,
    
    Status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE'
        CONSTRAINT CHK_Pregnancies_Status CHECK (Status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    DoctorID INT NULL,
    MidwifeID INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Pregnancies_User FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT FK_Pregnancies_Doctor FOREIGN KEY (DoctorID) REFERENCES Users(UserID),
    CONSTRAINT FK_Pregnancies_Midwife FOREIGN KEY (MidwifeID) REFERENCES Users(UserID)
);
GO


CREATE TABLE Chats (
    ChatID INT IDENTITY(1,1) PRIMARY KEY,
    PregnancyID INT NULL,
    IsReadOnly BIT NOT NULL DEFAULT 0,
    LastMessage NVARCHAR(MAX) NULL,
    LastMessageAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Chats_Pregnancy FOREIGN KEY (PregnancyID) REFERENCES Pregnancies(PregnancyID)
);
GO


CREATE TABLE ChatParticipants (
    ChatID INT NOT NULL,
    UserID INT NOT NULL,
    PRIMARY KEY (ChatID, UserID),
    CONSTRAINT FK_ChatParticipants_Chat FOREIGN KEY (ChatID) REFERENCES Chats(ChatID),
    CONSTRAINT FK_ChatParticipants_User FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
GO


CREATE TABLE Messages (
    MessageID INT IDENTITY(1,1) PRIMARY KEY,
    ChatID INT NOT NULL,
    SenderID INT NOT NULL,
    Text NVARCHAR(2000) NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    ReadAt DATETIME NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Messages_Chat FOREIGN KEY (ChatID) REFERENCES Chats(ChatID),
    CONSTRAINT FK_Messages_Sender FOREIGN KEY (SenderID) REFERENCES Users(UserID)
);
GO


CREATE TABLE Appointments (
    AppointmentID INT IDENTITY(1,1) PRIMARY KEY,
    PregnancyID INT NOT NULL,
    MotherID INT NOT NULL,
    MidwifeID INT NOT NULL,
    AppointmentDate DATETIME NOT NULL,
    PreferredDateTime DATETIME NOT NULL,
    ConfirmedDateTime DATETIME NULL,
    Status VARCHAR(25) NOT NULL DEFAULT 'PENDING'
        CONSTRAINT CHK_Appointments_Status CHECK (Status IN ('PENDING', 'APPROVED', 'REJECTED', 'CONFIRMED', 'RESCHEDULE_REQUESTED', 'CANCELLED')),
    RejectionReason NVARCHAR(500) NULL,
    RescheduleReason NVARCHAR(500) NULL,
    PulseRate DECIMAL(6,2) NULL,
    Temperature DECIMAL(5,2) NULL,
    BloodPressure VARCHAR(20) NULL,
    SpecialMedicalConditions NVARCHAR(MAX) NULL,  
    AppointmentNotes NVARCHAR(MAX) NULL,
    IsCompleted BIT NOT NULL DEFAULT 0,
    CompletedAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Appointments_Pregnancy FOREIGN KEY (PregnancyID) REFERENCES Pregnancies(PregnancyID),
    CONSTRAINT FK_Appointments_Mother FOREIGN KEY (MotherID) REFERENCES Users(UserID),
    CONSTRAINT FK_Appointments_Midwife FOREIGN KEY (MidwifeID) REFERENCES Users(UserID)
);
GO




CREATE INDEX IX_Messages_ChatId_CreatedAt ON Messages (ChatID, CreatedAt DESC);
CREATE INDEX IX_Appointments_PregnancyMotherMidwife ON Appointments (PregnancyID, MotherID, MidwifeID);
CREATE INDEX IX_Appointments_Status_Date ON Appointments (Status, AppointmentDate);
CREATE INDEX IX_Appointments_Mother_CreatedAt ON Appointments (MotherID, CreatedAt DESC);
CREATE INDEX IX_Appointments_Midwife_CreatedAt ON Appointments (MidwifeID, CreatedAt DESC);
CREATE INDEX IX_Users_Email ON Users (Email);
CREATE INDEX IX_Pregnancies_UserID ON Pregnancies (UserID);
CREATE INDEX IX_Pregnancies_DoctorID ON Pregnancies (DoctorID);
CREATE INDEX IX_Pregnancies_MidwifeID ON Pregnancies (MidwifeID);
GO






CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL UNIQUE,
    Description VARCHAR(255)
);
GO


CREATE TABLE Medicines (
    MedicineID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryID INT NOT NULL,
    MedicineName VARCHAR(150) NOT NULL,
    MinSafetyThreshold INT NOT NULL CONSTRAINT CHK_MinSafetyThreshold CHECK (MinSafetyThreshold >= 0),
    UnitPrice DECIMAL(10, 2) NOT NULL CONSTRAINT CHK_UnitPrice CHECK (UnitPrice >= 0),
    CONSTRAINT FK_Medicines_Categories FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);
GO


CREATE TABLE Batches (
    BatchID INT IDENTITY(1,1) PRIMARY KEY,
    MedicineID INT NOT NULL,
    BatchNumber VARCHAR(50) NOT NULL UNIQUE,
    ManufacturingDate DATE NOT NULL,
    ExpiryDate DATE NOT NULL,
    CurrentStock INT NOT NULL CONSTRAINT CHK_CurrentStock CHECK (CurrentStock >= 0),
    CONSTRAINT FK_Batches_Medicines FOREIGN KEY (MedicineID) REFERENCES Medicines(MedicineID),
    CONSTRAINT CHK_Dates CHECK (ExpiryDate > ManufacturingDate)
);
GO


CREATE TABLE DispenseLogs (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    BatchID INT NOT NULL,
    PatientOrWardID VARCHAR(100) NOT NULL,
    QuantityDispensed INT NOT NULL CONSTRAINT CHK_QuantityDispensed CHECK (QuantityDispensed > 0),
    DispenseDate DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_DispenseLogs_Batches FOREIGN KEY (BatchID) REFERENCES Batches(BatchID)
);
GO





INSERT INTO Categories (CategoryName, Description) VALUES
('Antibiotics', 'Used to treat bacterial infections'),
('Analgesics', 'Painkillers to relieve pain'),
('Antipyretics', 'Drugs used to reduce fever'),
('Vitamins', 'Dietary supplements'),
('Antiseptics', 'Substances that prevent the growth of disease-causing microorganisms');

INSERT INTO Medicines (CategoryID, MedicineName, MinSafetyThreshold, UnitPrice) VALUES
(1, 'Amoxicillin 500mg', 500, 15.50),
(1, 'Ciprofloxacin 250mg', 300, 25.00),
(2, 'Paracetamol 500mg', 1000, 5.00),
(2, 'Ibuprofen 400mg', 800, 8.50),
(3, 'Aspirin 75mg', 400, 4.25),
(4, 'Vitamin C 1000mg', 600, 12.00),
(4, 'Folic Acid 5mg', 300, 6.75),
(5, 'Chlorhexidine Solution', 100, 45.00),
(1, 'Azithromycin 250mg', 200, 30.00),
(2, 'Diclofenac 50mg', 500, 10.00);

INSERT INTO Batches (MedicineID, BatchNumber, ManufacturingDate, ExpiryDate, CurrentStock) VALUES
(1, 'AMX-2023-01', '2023-01-10', '2025-01-10', 1000),
(2, 'CIP-2023-02', '2023-02-15', '2025-02-15', 600),
(3, 'PAR-2023-03', '2023-03-20', '2026-03-20', 2000),
(4, 'IBU-2023-04', '2023-04-05', '2026-04-05', 1500),
(5, 'ASP-2023-05', '2023-05-12', '2025-05-12', 800),
(6, 'VIT-2023-06', '2023-06-18', '2024-06-18', 1200),
(7, 'FOL-2023-07', '2023-07-22', '2025-07-22', 500),
(8, 'CHL-2023-08', '2023-08-30', '2025-08-30', 250),
(9, 'AZI-2023-09', '2023-09-10', '2025-09-10', 400),
(10, 'DIC-2023-10', '2023-10-01', '2024-10-01', 900);

INSERT INTO DispenseLogs (BatchID, PatientOrWardID, QuantityDispensed, DispenseDate) VALUES
(1, 'Ward-A', 50, DATEADD(day, -25, GETDATE())),
(1, 'Patient-102', 10, DATEADD(day, -20, GETDATE())),
(3, 'Ward-B', 100, DATEADD(day, -15, GETDATE())),
(4, 'Patient-205', 20, DATEADD(day, -10, GETDATE())),
(6, 'Ward-C', 30, DATEADD(day, -5, GETDATE())),
(2, 'Ward-A', 40, DATEADD(day, -2, GETDATE())),
(8, 'ICU', 5, DATEADD(day, -1, GETDATE())),
(10, 'Ward-D', 25, GETDATE()),
(5, 'Patient-308', 15, DATEADD(day, -12, GETDATE())),
(7, 'Ward-Maternity', 50, DATEADD(day, -8, GETDATE()));
GO





CREATE TRIGGER trg_UpdateBatchStock
ON DispenseLogs
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE B
    SET B.CurrentStock = B.CurrentStock - I.QuantityDispensed
    FROM Batches B
    INNER JOIN inserted I ON B.BatchID = I.BatchID;
END;
GO

CREATE TRIGGER trg_PreventExpiredDispense
ON DispenseLogs
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1 FROM inserted I
        INNER JOIN Batches B ON I.BatchID = B.BatchID
        WHERE B.ExpiryDate < GETDATE()
    )
    BEGIN
        RAISERROR ('Cannot dispense medication from an expired batch.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    IF EXISTS (
        SELECT 1 FROM inserted I
        INNER JOIN Batches B ON I.BatchID = B.BatchID
        WHERE B.CurrentStock < I.QuantityDispensed
    )
    BEGIN
        RAISERROR ('Insufficient stock in the selected batch.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    INSERT INTO DispenseLogs (BatchID, PatientOrWardID, QuantityDispensed, DispenseDate)
    SELECT BatchID, PatientOrWardID, QuantityDispensed, ISNULL(DispenseDate, GETDATE())
    FROM inserted;
END;
GO





CREATE FUNCTION fn_CalculateCategoryValue (@CategoryID INT)
RETURNS DECIMAL(18, 2)
AS
BEGIN
    DECLARE @TotalValue DECIMAL(18, 2);
    SELECT @TotalValue = SUM(B.CurrentStock * M.UnitPrice)
    FROM Batches B
    INNER JOIN Medicines M ON B.MedicineID = M.MedicineID
    WHERE M.CategoryID = @CategoryID AND B.CurrentStock > 0 AND B.ExpiryDate >= GETDATE();
    RETURN ISNULL(@TotalValue, 0);
END;
GO

CREATE FUNCTION fn_GetAverageDailyConsumption (@MedicineID INT)
RETURNS DECIMAL(10, 2)
AS
BEGIN
    DECLARE @AvgConsumption DECIMAL(10, 2);
    SELECT @AvgConsumption = CAST(ISNULL(SUM(DL.QuantityDispensed), 0) AS DECIMAL(10,2)) / 30.0
    FROM DispenseLogs DL
    INNER JOIN Batches B ON DL.BatchID = B.BatchID
    WHERE B.MedicineID = @MedicineID
      AND DL.DispenseDate >= DATEADD(day, -30, GETDATE());
    RETURN ISNULL(@AvgConsumption, 0);
END;
GO





CREATE VIEW vw_CriticalStock
AS
SELECT 
    M.MedicineID, M.MedicineName, C.CategoryName, M.MinSafetyThreshold,
    ISNULL(SUM(B.CurrentStock), 0) AS TotalActiveStock
FROM Medicines M
INNER JOIN Categories C ON M.CategoryID = C.CategoryID
LEFT JOIN Batches B ON M.MedicineID = B.MedicineID AND B.ExpiryDate >= GETDATE()
GROUP BY M.MedicineID, M.MedicineName, C.CategoryName, M.MinSafetyThreshold
HAVING ISNULL(SUM(B.CurrentStock), 0) < M.MinSafetyThreshold;
GO

CREATE VIEW vw_ExpiringSoon
AS
SELECT 
    B.BatchID, B.BatchNumber, M.MedicineName, B.CurrentStock, B.ExpiryDate,
    DATEDIFF(day, GETDATE(), B.ExpiryDate) AS DaysToExpiry
FROM Batches B
INNER JOIN Medicines M ON B.MedicineID = M.MedicineID
WHERE B.CurrentStock > 0 AND B.ExpiryDate >= GETDATE() AND B.ExpiryDate <= DATEADD(day, 90, GETDATE());
GO





CREATE PROCEDURE sp_ProcessIncomingShipment
    @MedicineID INT, @BatchNumber VARCHAR(50), @ManufacturingDate DATE,
    @ExpiryDate DATE, @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        IF @Quantity <= 0 RAISERROR ('Quantity must be greater than zero.', 16, 1);
        INSERT INTO Batches (MedicineID, BatchNumber, ManufacturingDate, ExpiryDate, CurrentStock)
        VALUES (@MedicineID, @BatchNumber, @ManufacturingDate, @ExpiryDate, @Quantity);
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE PROCEDURE sp_GenerateMonthlyAudit @Year INT, @Month INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @StartDate DATETIME = DATEFROMPARTS(@Year, @Month, 1);
    DECLARE @EndDate DATETIME = EOMONTH(@StartDate);
    SELECT M.MedicineName, C.CategoryName,
        SUM(B.CurrentStock) + ISNULL(Dispensed.TotalDispensed, 0) AS StartingStockApprox,
        ISNULL(Dispensed.TotalDispensed, 0) AS TotalDispensed,
        SUM(B.CurrentStock) AS EndingStock
    FROM Medicines M
    INNER JOIN Categories C ON M.CategoryID = C.CategoryID
    INNER JOIN Batches B ON M.MedicineID = B.MedicineID
    LEFT JOIN (
        SELECT B.MedicineID, SUM(DL.QuantityDispensed) AS TotalDispensed
        FROM DispenseLogs DL INNER JOIN Batches B ON DL.BatchID = B.BatchID
        WHERE DL.DispenseDate >= @StartDate AND DL.DispenseDate <= @EndDate
        GROUP BY B.MedicineID
    ) Dispensed ON M.MedicineID = Dispensed.MedicineID
    GROUP BY M.MedicineName, C.CategoryName, Dispensed.TotalDispensed;
END;
GO

CREATE PROCEDURE sp_DemandForecastingAndReorder
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @LastMonthStart DATETIME = DATEADD(month, -1, GETDATE());
    DECLARE @TwoMonthsAgoStart DATETIME = DATEADD(month, -2, GETDATE());
    DECLARE @ThreeMonthsAgoStart DATETIME = DATEADD(month, -3, GETDATE());
    WITH MonthlyDispense AS (
        SELECT B.MedicineID,
            SUM(CASE WHEN DL.DispenseDate >= @LastMonthStart THEN DL.QuantityDispensed ELSE 0 END) AS Month1,
            SUM(CASE WHEN DL.DispenseDate >= @TwoMonthsAgoStart AND DL.DispenseDate < @LastMonthStart THEN DL.QuantityDispensed ELSE 0 END) AS Month2,
            SUM(CASE WHEN DL.DispenseDate >= @ThreeMonthsAgoStart AND DL.DispenseDate < @TwoMonthsAgoStart THEN DL.QuantityDispensed ELSE 0 END) AS Month3
        FROM DispenseLogs DL INNER JOIN Batches B ON DL.BatchID = B.BatchID
        WHERE DL.DispenseDate >= @ThreeMonthsAgoStart
        GROUP BY B.MedicineID
    ),
    Forecast AS (
        SELECT MedicineID, (Month1 + Month2 + Month3) / 3 AS ForecastedDemand
        FROM MonthlyDispense
    )
    SELECT M.MedicineID, M.MedicineName,
        ISNULL(CS.TotalActiveStock, (SELECT ISNULL(SUM(CurrentStock), 0) FROM Batches WHERE MedicineID = M.MedicineID AND ExpiryDate >= GETDATE())) AS CurrentStock,
        M.MinSafetyThreshold, ISNULL(F.ForecastedDemand, 0) AS ForecastedDemand,
        CASE 
            WHEN CS.MedicineID IS NOT NULL OR (ISNULL(F.ForecastedDemand, 0) > ISNULL(CS.TotalActiveStock, 0)) THEN 
                ((M.MinSafetyThreshold + ISNULL(F.ForecastedDemand, 0)) - 
                ISNULL(CS.TotalActiveStock, (SELECT ISNULL(SUM(CurrentStock), 0) FROM Batches WHERE MedicineID = M.MedicineID AND ExpiryDate >= GETDATE())))
            ELSE 0
        END AS RecommendedOrderQuantity
    FROM Medicines M
    LEFT JOIN Forecast F ON M.MedicineID = F.MedicineID
    LEFT JOIN vw_CriticalStock CS ON M.MedicineID = CS.MedicineID
    WHERE CS.MedicineID IS NOT NULL 
        OR ISNULL(F.ForecastedDemand, 0) > ISNULL(CS.TotalActiveStock, (SELECT ISNULL(SUM(CurrentStock), 0) FROM Batches WHERE MedicineID = M.MedicineID AND ExpiryDate >= GETDATE()));
END;
GO
