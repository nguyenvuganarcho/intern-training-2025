# RBAC AUTHORIZATION MATRIX
## Role Definitions
### USER
- Users with limited permissions
- Only view and create
- Can not update or delete
### ADMIN
- Admin with full permissions
- Full CRUD operations
- Access to admin only endpoints

## Endpoint Authorization Matrix
| Resource | Endpoint | Method | USER | ADMIN | Status if forbiddent |
|----------|----------|--------|------|-------|----------------------|
| **Auth** | /auth/register | POST | Yes | Yes | - |
| | /auth/login | POST | Yes | Yes | - |
| **Courses** | /courses | GET | Yes | Yes | - |
| | /courses/:id | GET | Yes | Yes | - |
| | /courses | POST | Yes | Yes | - |
| | /courses/:id | PUT | Yes | Yes | - |
| | /courses/:id | DELETE | No | Yes | 403 FORBIDDEN |
| **Students** | /students | GET | Yes | Yes | - |
| | /students/:id | GET | Yes | Yes | - |
| | /students | POST | Yes | Yes | - |
| | /students/:id | PUT | No | Yes | 403 FORBIDDEN |
| | /students/:id | DELETE | No | Yes | 403 FORBIDDEN |
| **Users** | /users/me | GET | Yes | Yes | - |
| **Admin** | /admin/stats | GET | No | Yes | 403 FORBIDDEN |

## HTTP Status Code Reference

### Success Codes
| Code | Name | When |
|------|------|------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |

### Client Error Codes
| Code | Name | Error Code | When |
|------|------|------------|------|
| 400 | Bad Request | VALIDATION_ERROR | Invalid input data |
| 401 | Unauthorized | UNAUTHORIZED | No token provided |
| 401 | Unauthorized | INVALID_TOKEN | Token invalid or malformed |
| 401 | Unauthorized | TOKEN_EXPIRED | Token has expired |
| 403 | Forbidden | FORBIDDEN | Valid token but insufficient permissions |
| 404 | Not Found | NOT_FOUND | Resource does not exist |
| 409 | Conflict | CONFLICT | Duplicate resource (e.g., email exists) |
| 429 | Too Many Requests | RATE_LIMIT_EXCEEDED | Rate limit exceeded |

### Server Error Codes
| Code | Name | Error Code | When |
|------|------|------------|------|
| 500 | Internal Server Error | INTERNAL_ERROR | Unexpected server error |

## Role-Based Access Rules

### ADMIN Allowed Endpoints
- All PUBLIC endpoints
- All USER endpoints
- DELETE /courses/:id
- PUT /students/:id
- DELETE /students/:id
- GET /admin/stats

### USER Allowed Endpoints
- POST /auth/register
- POST /auth/login
- GET /courses
- GET /courses/:id
- POST /courses
- PUT /courses/:id
- GET /students
- GET /students/:id
- POST /students
- GET /users/me