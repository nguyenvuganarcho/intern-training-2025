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

CREATE TABLE Course (
	Id INT IDENTITY PRIMARY KEY,
	CourseName NVARCHAR(200)
);
GO

CREATE TABLE Enrollments (
	Id INT IDENTITY PRIMARY KEY,
	StudentId INT,
	CourseId INT,
	FOREIGN KEY (StudentId) REFERENCES Students(Id),
	FOREIGN KEY (CourseId) REFERENCES Course(Id)
);
GO

SELECT s.Id, s.Name, c.CourseName
FROM Students s
INNER JOIN Enrollments e ON s.Id = e.StudentId
INNER JOIN Course c ON e.CourseId = c.Id
ORDER BY s.Name, c.CourseName

SELECT s.Id, s.Name, s.Age
FROM Students s
LEFT JOIN Enrollments e ON s.Id = e.StudentId
WHERE e.Id IS NULL
ORDER BY s.Id

SELECT TOP 1
c.Id, c.CourseName, COUNT(e.Id) AS StudentCount
FROM Course c
LEFT JOIN Enrollments e ON c.Id = e.CourseId
GROUP BY c.Id, c.CourseName

SELECT TOP 5
s.Id, s.Name, Count(e.Id) AS CourseCount
FROM Students s
LEFT JOIN Enrollments e ON s.Id = e.StudentId
GROUP BY s.Id, s.Name
ORDER BY CourseCount DESC

SELECT LEFT(Name, 1) AS FirstLetter, AVG(Age) AS AverageAge, COUNT(*) AS StudentCount
FROM Students
GROUP BY LEFT(Name, 1)
ORDER BY FirstLetter;

SELECT SUBSTRING(Email, CHARINDEX('@', Email) + 1, LEN(Email)) AS EmailDomain, COUNT(*) AS StudentCount
FROM Students
GROUP BY SUBSTRING(Email, CHARINDEX('@', Email) + 1, LEN(Email))
ORDER BY StudentCount DESC;

SELECT c.Id, c.CourseName, COUNT(e.Id) AS StudentCount
FROM Course c
LEFT JOIN Enrollments e ON c.Id = e.CourseId
GROUP BY c.Id, c.CourseName
HAVING COUNT(e.Id) >= 10
ORDER BY StudentCount DESC;
GO

CREATE PROCEDURE sp_AddStudent
    @name NVARCHAR(100),
    @age INT,
    @email NVARCHAR(150)
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Students WHERE Email = @email)
    BEGIN
        PRINT N'Lỗi: Email đã tồn tại!';
        RETURN; 
    END
    
    INSERT INTO Students (Name, Age, Email)
    VALUES (@name, @age, @email);
    
    PRINT N'Thêm sinh viên thành công!';
END
GO

EXEC sp_AddStudent 
    @name = N'Test User',
    @age = 20,
    @email = N'test@example.com';

EXEC sp_AddStudent 
    @name = N'Test User 2',
    @age = 21,
    @email = N'test@example.com'; 

GO

CREATE PROCEDURE sp_SearchStudentsByName
    @keyword NVARCHAR(100),
    @sortOrder NVARCHAR(4) = 'ASC' 
AS
BEGIN
    IF @sortOrder = 'DESC'
    BEGIN
        SELECT Id, Name, Age, Email
        FROM Students
        WHERE Name LIKE N'%' + @keyword + '%'
        ORDER BY Age DESC;
    END
    ELSE
    BEGIN
        SELECT Id, Name, Age, Email
        FROM Students
        WHERE Name LIKE N'%' + @keyword + '%'
        ORDER BY Age ASC;
    END
END
GO

EXEC sp_SearchStudentsByName @keyword = N'Nguyễn'
GO

CREATE PROCEDURE sp_DeleteStudent
    @studentId INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Students WHERE Id = @studentId)
    BEGIN
        PRINT N'Không tìm thấy sinh viên với ID = ' + CAST(@studentId AS NVARCHAR);
        RETURN;
    END
    
    DELETE FROM Enrollments WHERE StudentId = @studentId;
    

    DELETE FROM Students WHERE Id = @studentId;
    
    PRINT N'Xóa sinh viên thành công, ID = ' + CAST(@studentId AS NVARCHAR);
END
GO


EXEC sp_DeleteStudent @studentId = 10;

EXEC sp_DeleteStudent @studentId = 999;  
GO

CREATE VIEW v_StudentCourses AS
SELECT 
    s.Id AS StudentId,
    s.Name AS StudentName,
    c.Id AS CourseId,
    c.CourseName
FROM Students s
INNER JOIN Enrollments e ON s.Id = e.StudentId
INNER JOIN Course c ON e.CourseId = c.Id;
GO


SELECT * FROM v_StudentCourses;

