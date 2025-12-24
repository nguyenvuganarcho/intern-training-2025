USE hoa_don;
GO

CREATE TABLE Company (
	Id INT IDENTITY(1,1) PRIMARY KEY,
	CompanyName NVARCHAR(200) NOT NULL,
	Address NVARCHAR(200) NOT NULL,
	Phone VARCHAR(15) NOT NULL
);
GO

INSERT INTO Company (CompanyName, Address, Phone) VALUES
(N'Công ty ABC', N'123 Đường Láng, Đống Đa, Hà Nội', N'024-1234-5678');

CREATE TABLE Customer (
	Id INT IDENTITY(1,1) PRIMARY KEY,
	CustomerName NVARCHAR(200) NOT NULL,
	Phone VARCHAR(15) NOT NULL
);
GO

INSERT INTO Customer (CustomerName, Phone) VALUES
(N'Nguyễn Văn An', N'0987654321'),
(N'Trần Thị Bình', N'0912345678'),
(N'Lê Văn Cường', N'0923456789'),
(N'Phạm Thị Dung', N'0934567890'),
(N'Hoàng Văn Thụ', N'0945678901');

CREATE TABLE Products (
	Id INT IDENTITY(1,1) PRIMARY KEY,
	ProductName NVARCHAR(200) NOT NULL,
	Price DECIMAL(10,2) NOT NULL
);
GO

INSERT INTO Products (ProductName, Price) VALUES
(N'Laptop Dell XPS 13', 25000000),
(N'iPhone 15 Pro Max', 35000000),
(N'Samsung Galaxy S24', 22000000),
(N'iPad Pro 12.9', 28000000);

CREATE TABLE Orders (
	Id INT IDENTITY(1,1) PRIMARY KEY,
	CompanyId INT NOT NULL,
	CustomerId INT NOT NULL,
	ProductId INT NOT NULL,
	Quantity INT NOT NULL,

	FOREIGN KEY (CompanyId) REFERENCES Company(Id),
	FOREIGN KEY (CustomerId) REFERENCES Customer(Id),
	FOREIGN KEY (ProductId) REFERENCES Products(Id),
	OrderDate DATETIME DEFAULT GETDATE()
);

INSERT INTO Orders (CompanyId, CustomerId, ProductId, Quantity)
VALUES (1, 1, 1, 1);

SELECT 
    o.Id AS OrderId,
    o.OrderDate,
    c.CompanyName,
    c.Address AS CompanyAddress,
    c.Phone AS CompanyPhone,
    cust.CustomerName,
    cust.Phone AS CustomerPhone,
    p.ProductName,
    p.Price AS UnitPrice,
    o.Quantity,
    (o.Quantity * p.Price) AS TotalPrice
FROM Orders o
INNER JOIN Company c ON o.CompanyId = c.Id
INNER JOIN Customer cust ON o.CustomerId = cust.Id
INNER JOIN Products p ON o.ProductId = p.Id
ORDER BY o.OrderDate, o.Id;