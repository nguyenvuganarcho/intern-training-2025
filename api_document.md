# Secure Student-Course API Documentation

## Overview
RESTful API for managing students, courses, and enrollments with JWT authentication and role-based access control.

**Base URL:** `http://localhost:3000/api/v1`

**Authentication:** Bearer Token (JWT)

---

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Admin](#admin)
4. [Students](#students)
5. [Courses](#courses)
6. [Enrollments](#enrollments)
7. [Error Codes](#error-codes)

---

## Authentication

### Register User
**POST** `/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "username": "mason",
  "email": "mason@example.com",
  "password": "123456",
  "role": "USER"
}
```

**Validation:**
- `username`: 4-30 characters, alphanumeric only
- `email`: Valid email format
- `password`: 6-100 characters
- `role`: Optional, "USER" or "ADMIN" (default: "USER")

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "mason",
    "email": "mason@example.com",
    "role": "USER",
    "createdAt": "2025-12-30T10:00:00.000Z",
    "updatedAt": "2025-12-30T10:00:00.000Z"
  },
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/auth/register"
}
```

**Errors:**
- 400: Validation failed
- 409: Email or username already exists

---

### Login
**POST** `/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "username": "mason",
  "password": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "...",
    "user": {
      "id": 1,
      "username": "mason",
      "email": "mason@example.com",
      "role": "USER",
      "createdAt": "2025-12-30T10:00:00.000Z",
      "updatedAt": "2025-12-30T10:00:00.000Z"
    }
  },
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/auth/login"
}
```

**Errors:**
- 401: Invalid credentials
- 429: Too many login attempts

**JWT Token:**
- Expires in: 1 hour (configurable)
- Include in subsequent requests: `Authorization: Bearer <token>`

---

## Users

### Get Current User Info
**GET** `/users/me`

**Access:** Authenticated (USER or ADMIN)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User info retrieved",
  "data": {
    "id": 1,
    "username": "mason",
    "email": "mason@example.com",
    "role": "USER"
  },
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/users/me"
}
```

**Errors:**
- 401: No token or invalid token

---

## Admin

### Get Admin Statistics
**GET** `/admin/stats`

**Access:** ADMIN only

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admin stats retrieved",
  "data": {
    "totalUsers": 100,
    "totalCourses": 50,
    "totalStudents": 200,
    "activeUsers": 75
  },
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/admin/stats"
}
```

**Errors:**
- 401: Not authenticated
- 403: Insufficient permissions (USER role)

---

## Students

### List Students (with Pagination & Search)
**GET** `/students?page=1&size=10&search=john`

**Access:** Authenticated (USER or ADMIN)

**Query Parameters:**
- `page`: Page number (default: 1)
- `size`: Items per page (default: 10, max: 100)
- `search`: Search by name or email (optional)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "students": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2025-12-30T10:00:00.000Z",
        "updatedAt": "2025-12-30T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 10,
    "totalPages": 1
  },
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/students"
}
```

---

### Get Student by ID
**GET** `/students/:id`

**Access:** Authenticated (USER or ADMIN)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-12-30T10:00:00.000Z",
    "updatedAt": "2025-12-30T10:00:00.000Z"
  },
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/students/1"
}
```

**Errors:**
- 404: Student not found

---

### Create Student
**POST** `/students`

**Access:** Authenticated (USER or ADMIN)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Validation:**
- `name`: 3-100 characters
- `email`: Valid email format, unique

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-12-30T10:00:00.000Z",
    "updatedAt": "2025-12-30T10:00:00.000Z"
  },
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/students"
}
```

**Errors:**
- 400: Validation failed
- 409: Email already exists

---

### Update Student
**PUT** `/students/:id`

**Access:** ADMIN only

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.new@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john.new@example.com",
    "createdAt": "2025-12-30T10:00:00.000Z",
    "updatedAt": "2025-12-30T10:05:00.000Z"
  },
  "timestamp": "2025-12-30T10:05:00.000Z",
  "path": "/api/v1/students/1"
}
```

**Errors:**
- 403: Insufficient permissions (USER role)
- 404: Student not found

---

### Delete Student
**DELETE** `/students/:id`

**Access:** ADMIN only

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student deleted successfully",
  "data": null,
  "timestamp": "2025-12-30T10:06:00.000Z",
  "path": "/api/v1/students/1"
}
```

**Errors:**
- 403: Insufficient permissions (USER role)
- 404: Student not found

---

## Courses

### List Courses (with Pagination & Search)
**GET** `/courses?page=1&size=10&search=spring`

**Access:** Authenticated (USER or ADMIN)

**Query Parameters:**
- `page`: Page number (default: 1)
- `size`: Items per page (default: 10, max: 100)
- `search`: Search by name (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": {
    "courses": [
      {
        "id": 1,
        "name": "Spring Boot Advanced",
        "duration": 40,
        "createdAt": "2025-12-30T10:00:00.000Z",
        "updatedAt": "2025-12-30T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 10,
    "totalPages": 1
  },
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/courses"
}
```

---

### Get Course by ID
**GET** `/courses/:id`

**Access:** Authenticated (USER or ADMIN)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Course retrieved successfully",
  "data": {
    "id": 1,
    "name": "Spring Boot Advanced",
    "duration": 40,
    "createdAt": "2025-12-30T10:00:00.000Z",
    "updatedAt": "2025-12-30T10:00:00.000Z"
  },
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/courses/1"
}
```

### Create Course
**POST** `/courses`

**Access:** ADMIN only

**Request Body:**
```json
{
  "name": "Spring Boot Advanced",
  "duration": 40
}
```

**Validation:**
- `name`: 3-100 characters, unique
- `duration`: 1-1000 hours

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": 1,
    "name": "Spring Boot Advanced",
    "duration": 40,
    "createdAt": "2025-12-30T10:00:00.000Z",
    "updatedAt": "2025-12-30T10:00:00.000Z"
  },
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/courses"
}
```

**Errors:**
- 403: Insufficient permissions (USER role)
- 409: Course name already exists

---

### Update Course
**PUT** `/courses/:id`

**Access:** ADMIN only

**Request Body:**
```json
{
  "name": "Spring Boot Pro",
  "duration": 50
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "id": 1,
    "name": "Spring Boot Pro",
    "duration": 50,
    "createdAt": "2025-12-30T10:00:00.000Z",
    "updatedAt": "2025-12-30T10:05:00.000Z"
  },
  "timestamp": "2025-12-30T10:05:00.000Z",
  "path": "/api/v1/courses/1"
}
```

---

### Delete Course
**DELETE** `/courses/:id`

**Access:** ADMIN only

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Course deleted successfully",
  "data": null,
  "timestamp": "2025-12-30T10:06:00.000Z",
  "path": "/api/v1/courses/1"
}
```

---

## Enrollments

### Enroll Student in Course
**POST** `/students/:id/enroll`

**Access:** Authenticated (USER or ADMIN)

**Request Body:**
```json
{
  "courseId": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student enrolled successfully",
  "data": {
    "id": 1,
    "studentId": 1,
    "courseId": 1,
    "courseName": "Spring Boot Advanced",
    "enrolledAt": "2025-12-30T10:00:00.000Z"
  },
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/students/1/enroll"
}
```

**Errors:**
- 404: Student or course not found
- 409: Student already enrolled in this course

---

### Get Student Enrollments
**GET** `/students/:id/enrollments`

**Access:** Authenticated (USER or ADMIN)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student enrollments retrieved",
  "data": {
    "studentId": 1,
    "studentName": "John Doe",
    "enrollments": [
      {
        "id": 1,
        "studentId": 1,
        "courseId": 1,
        "courseName": "Spring Boot Advanced",
        "enrolledAt": "2025-12-30T10:00:00.000Z"
      }
    ],
    "totalEnrollments": 1
  },
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/students/1/enrollments"
}
```

---

### Unenroll Student from Course
**DELETE** `/students/:id/enroll/:courseId`

**Access:** Authenticated (USER or ADMIN)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student unenrolled successfully",
  "data": null,
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/students/1/enroll/1"
}
```

**Errors:**
- 404: Student, course, or enrollment not found

---

## Error Codes

### HTTP Status Codes

| Code | Name | When |
|------|------|------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  },
  "timestamp": "2025-12-30T10:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```

### Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| VALIDATION_ERROR | 400 | Input validation failed |
| UNAUTHORIZED | 401 | No token or invalid token |
| INVALID_TOKEN | 401 | Token malformed |
| TOKEN_EXPIRED | 401 | Token has expired |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Duplicate resource |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Authorization Matrix

| Resource | Method | Path | USER | ADMIN |
|----------|--------|------|------|-------|
| Auth | POST | /auth/register | ✅ | ✅ |
| Auth | POST | /auth/login | ✅ | ✅ |
| Users | GET | /users/me | ✅ | ✅ |
| Admin | GET | /admin/stats | ❌ | ✅ |
| Students | GET | /students | ✅ | ✅ |
| Students | GET | /students/:id | ✅ | ✅ |
| Students | POST | /students | ✅ | ✅ |
| Students | PUT | /students/:id | ❌ | ✅ |
| Students | DELETE | /students/:id | ❌ | ✅ |
| Courses | GET | /courses | ✅ | ✅ |
| Courses | GET | /courses/:id | ✅ | ✅ |
| Courses | POST | /courses | ❌ | ✅ |
| Courses | PUT | /courses/:id | ❌ | ✅ |
| Courses | DELETE | /courses/:id | ❌ | ✅ |
| Enrollments | POST | /students/:id/enroll | ✅ | ✅ |
| Enrollments | GET | /students/:id/enrollments | ✅ | ✅ |
| Enrollments | DELETE | /students/:id/enroll/:courseId | ✅ | ✅ |

---

## Security

1. **Always use HTTPS in production**
2. **Store JWT_SECRET in environment variables**
3. **Use strong passwords (min 6 characters)**
4. **Token expiry: 1 hour (configurable)**
5. **Rate limiting on login endpoint**
6. **Generic error messages (don't reveal system details)**
7. **Validate all inputs**
8. **Use RBAC for authorization**

---

## Testing with Postman

### Setup Environment Variables
```
base_url = http://localhost:3000/api/v1
user_token = <set after login>
admin_token = <set after admin login>
```

### Test Flow
1. Register USER and ADMIN
2. Login both users → Save tokens
3. Test all endpoints with both tokens
4. Verify RBAC (USER cannot access ADMIN routes)
5. Test error cases (no token, invalid token, etc.)

---

## Tech Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** Joi

---

## Project Structure
```
src/
├── modules/
│   ├── auth/
│   ├── student/
│   ├── course/
|   ├── admin/
|   ├── user/
│   └── enrollment/
|
├── middlewares/
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── common/
│   ├── apiResponse.ts
│   └── errors.ts
├── routes/
│   └── index.ts
├── app.ts
└── index.ts
```

---

## Environment Variables
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=fallback-secret-key
JWT_EXPIRES_IN=3600
```