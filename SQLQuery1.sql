USE training_db;
GO

Create Table Students (
Id INT IDENTITY(1,1) PRIMARY KEY,
Name NVARCHAR(100) NOT NULL,
Age INT CHECK (Age BETWEEN 16 AND 60),
Email VARCHAR(100) UNIQUE,
CreatedAt DATETIME DEFAULT GETDATE()
);

Create Table Teachers (
Id INT IDENTITY(1,1) PRIMARY KEY,
Name NVARCHAR(100) NOT NULL,
Email VARCHAR(100) UNIQUE,
Phone VARCHAR(15) UNIQUE,
CreatedAt DATETIME DEFAULT GETDATE()
);
GO

SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;

INSERT INTO Students (Name, Age, Email) VALUES
(N'Vũ Khôi Nguyên', 19, 'nguyen@gmail.com'),
(N'Nguyễn Đình Bắc', 22, 'bac@gmail.com'),
(N'Nguyễn Thái Sơn', 21, 'son@gmail.com'),
(N'Đỗ Minh Quân', 20, 'quan@gmail.com'),
(N'Phạm Đức Khải', 20, 'khai@gmail.com'),
(N'Đỗ Văn Tiến', 19, 'tien@gmail.com'),
(N'Lê Hoàng Minh', 21, 'minh@gmail.com'),
(N'Đỗ Thùy Linh', 19, 'ling@gmail.com'),
(N'Tạ Minh Đăng', 23, 'dang@gmail.com'),
(N'Vũ Phương Anh', 18, 'anh@gmail.com');

SELECT * FROM Students;

ALTER TABLE Teachers
ALTER COLUMN Phone VARCHAR(15);


INSERT INTO Teachers (Name, Email, Phone) VALUES
(N'Nguyễn Thị Mai', 'mai@gmail.com', N'0987654321'),
(N'Trần Văn Nam', 'nam@gmail.com', N'0912345678'),
(N'Lê Thị Oanh', 'oanh@gmail.com', N'0923456789'),
(N'Phạm Văn Phúc', 'phuc@gmail.com', N'0934567890'),
(N'Hoàng Thị Quỳnh', 'quynh@gmail.com', N'0945678901'),
(N'Đặng Văn Rộng', 'rong@gmail.com', N'0956789012'),
(N'Vũ Thị Sương', 'suong@gmaiil.com', N'0967890123'),
(N'Bùi Văn Tú', 'tu@gmail.com', N'0978901234'),
(N'Đỗ Thị Uyên', 'uyen@gmail.com', N'0989012345'),
(N'Ngô Văn Việt', 'viet@gmail.com', N'0990123456');

SELECT * FROM Teachers;

SELECT Name, Age, Email
FROM Students
WHERE AGE > 20;

SELECT Name, Age, Email
FROM Students
WHERE Name LIKE N'%ng%';

SELECT Name, Age, Email
FROM Students
ORDER BY Name ASC;

UPDATE Students
SET Age = 25
WHERE Id = 9;

SELECT Name, Age, Email
FROM Students
WHERE Id = 9;

DELETE FROM Students
WHERE Id = 13;

INSERT INTO Students (Id, Name, Age, Email) VALUES
(1, N'Vũ Khôi Nguyên', 19, 'nguyenvu@gmail.com');