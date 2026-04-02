# 🏥 Hospital Management System API

A production-ready ASP.NET Core Web API for comprehensive hospital management with clean architecture, JWT authentication, role-based authorization, and Hangfire background jobs.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Architecture & Structure](#architecture--structure)
4. [Features](#features)
5. [Getting Started](#getting-started)
6. [Database Setup](#database-setup)
7. [Authentication & Authorization](#authentication--authorization)
8. [API Endpoints](#api-endpoints)
9. [Configuration](#configuration)
10. [Security Best Practices](#security-best-practices)
11. [Background Jobs](#background-jobs)

---

## 🎯 Project Overview

This Hospital Management System API provides a complete solution for managing:
- **Doctors** with specializations and profiles
- **Patients** with medical histories and insurance
- **Appointments** between doctors and patients
- **Medical Records** with diagnostic information
- **Scans** and imaging data
- **Insurance** information management

The system implements enterprise-grade security with JWT tokens, refresh token rotation, and role-based access control.

---

## 💻 Technologies Used

| Technology | Purpose | Why Used |
|---|---|---|
| **ASP.NET Core 8.0** | Web API Framework | Modern, high-performance, cross-platform |
| **Entity Framework Core 8.0** | ORM (Database) | Powerful LINQ queries, automatic migrations, relationship management |
| **SQL Server LocalDB** | Database | Full-featured relational database, excellent for development |
| **JWT (JSON Web Tokens)** | Authentication | Stateless, scalable, industry-standard token-based auth |
| **ASP.NET Identity** | User Management | Built-in roles, claims, secure password hashing |
| **Swagger/OpenAPI** | API Documentation | Interactive API exploration and testing |
| **Hangfire** | Background Jobs | Reliable job scheduling and processing (deletes old records, sends reminders) |
| **LINQ** | Data Query Optimization | Efficient database queries with lazy loading prevention |

---

## 🏗 Architecture & Structure

```
HospitalManagementAPI/
├── Models/                    # Entity Models
│   ├── Doctor.cs
│   ├── Patient.cs
│   ├── Appointment.cs
│   ├── MedicalRecord.cs
│   ├── Scan.cs
│   ├── Insurance.cs
│   ├── DoctorProfile.cs      # One-to-One with Doctor
│   ├── RefreshToken.cs       # For token management
│   └── ApplicationUser.cs     # ASP.NET Identity User
├── Data/
│   └── ApplicationDbContext.cs # EF Core Database Context
├── DTOs/                      # Data Transfer Objects
│   ├── DoctorDtos.cs         # CreateDto, UpdateDto, ReadDto
│   ├── PatientDtos.cs
│   ├── AppointmentDtos.cs
│   ├── MedicalRecordDtos.cs
│   ├── ScanDtos.cs
│   ├── InsuranceDtos.cs
│   ├── DoctorProfileDtos.cs
│   └── AuthDtos.cs           # Login, Register, Token DTOs
├── Repositories/              # Data Access Layer
│   ├── IGenericRepository.cs
│   ├── GenericRepository.cs
│   ├── IDoctorRepository.cs
│   ├── DoctorRepository.cs
│   ├── IPatientRepository.cs
│   ├── PatientRepository.cs
│   ├── IAppointmentRepository.cs
│   ├── AppointmentRepository.cs
│   ├── IMedicalRecordRepository.cs
│   ├── MedicalRecordRepository.cs
│   ├── IRefreshTokenRepository.cs
│   └── RefreshTokenRepository.cs
├── Services/                  # Business Logic Layer
│   ├── IDoctorService.cs
│   ├── DoctorService.cs
│   ├── IPatientService.cs
│   ├── PatientService.cs
│   ├── IAppointmentService.cs
│   ├── AppointmentService.cs
│   ├── IMedicalRecordService.cs
│   └── MedicalRecordService.cs
├── Controllers/               # API Endpoints
│   ├── AuthController.cs      # Auth endpoints
│   ├── DoctorsController.cs
│   ├── PatientsController.cs
│   ├── AppointmentsController.cs
│   └── MedicalRecordsController.cs
├── Authentication/            # Auth Services
│   ├── JwtTokenService.cs
│   └── AuthenticationService.cs
├── Jobs/                      # Hangfire Background Jobs
│   └── BackgroundJobService.cs
├── Program.cs                 # DI Configuration, Middleware Setup
├── appsettings.json          # Configuration (JWT, DB Connection)
└── HospitalManagementAPI.csproj # Project file with NuGet packages
```

---

## ✨ Features

### 1. **Clean Layered Architecture**
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain all business logic
- **Repositories**: Abstract data access
- **DTOs**: Ensure entities are never exposed

### 2. **One-to-One Relationships** ✅
- Doctor ↔ DoctorProfile (Doctor bio, qualifications, office address)
- Patient ↔ Insurance (Insurance policy details)

### 3. **One-to-Many Relationships** ✅
- Doctor → Appointments (Doctor has many appointments)
- Patient → MedicalRecords (Patient has many medical records)
- MedicalRecord → Scans (Record has many scans)

### 4. **Many-to-Many Relationships** ✅
- Doctor ↔ Patient (Through Appointments) - Doctors see many patients, patients see many doctors

### 5. **JWT Authentication**
- Access tokens (15 minutes expiry)
- Refresh tokens (7 days expiry, stored in DB)
- Token revocation on logout
- Secure refresh token generation

### 6. **Role-Based Authorization** (RBAC)
```
Admin     → Full system access
Doctor    → Manage patients, appointments, medical records
Patient   → View own appointments and medical records
```

### 7. **Data Validation**
- `[Required]` - Mandatory fields
- `[MaxLength]` - String length limits
- `[MinLength]` - Minimum field length
- `[Range]` - Numeric constraints
- `[EmailAddress]` - Email validation
- `[RegularExpression]` - Custom validation patterns
- Returns **HTTP 400** for invalid requests

### 8. **LINQ Optimization**
- `Select()` for DTO projection (no full entity loading)
- `AsNoTracking()` for all read queries (memory efficiency)
- Eager loading with `Include()` to prevent N+1 queries
- Proper indexing on foreign keys

### 9. **Async/Await**
- All operations are async
- `ToListAsync()`, `FirstOrDefaultAsync()`, `SaveChangesAsync()`
- Non-blocking I/O operations

### 10. **Background Jobs (Hangfire)**
- Delete old appointments (daily)
- Send appointment reminders (daily at 6 AM)
- Reliable job scheduling
- Dashboard access at `/hangfire`

### 11. **Swagger Documentation**
- All endpoints documented
- JWT Bearer token field in UI
- Request/response examples
- Interactive testing

---

## 🚀 Getting Started

### Prerequisites
- **.NET 8 SDK** or later
- **SQL Server Express** or **SQL Server LocalDB**
- **Visual Studio 2022** or **VS Code**

### Step 1: Clone/Extract the Project
```bash
cd HospitalManagementAPI
```

### Step 2: Restore NuGet Packages
```bash
dotnet restore
```

### Step 3: Update Configuration
Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HospitalManagementDb;Trusted_Connection=true;"
  },
  "Jwt": {
    "SecretKey": "your-super-secret-jwt-key-that-is-at-least-32-characters-long-for-security-123",
    "Issuer": "HospitalManagementAPI",
    "Audience": "HospitalManagementAPIClient"
  }
}
```

### Step 4: Create and Seed Database
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

This will:
1. Create the SQL Server LocalDB database
2. Create all tables with relationships
3. Add indices for performance
4. Seed default roles (Admin, Doctor, Patient)

### Step 5: Run the Application
```bash
dotnet run
```

The API will start at: `https://localhost:5001`

Swagger UI: `https://localhost:5001/swagger/index.html`
Hangfire Dashboard: `https://localhost:5001/hangfire`

---

## 🗄 Database Setup

### Relationships Diagram

```
Doctor (One) ──────► DoctorProfile (One)
   │
   │ (One-to-Many)
   ├─────► Appointment ◄────── Patient
   │                  (Many-to-Many: Doctors ↔ Patients)
   │
   └─────► (Doctor has many appointments)

Patient (One) ──────► Insurance (One)
   │
   │ (One-to-Many)
   ├─────► Appointment
   │
   └─────► MedicalRecord
            │
            └─────► Scan (One-to-Many)
```

### Key Database Features
- **Cascading Deletes**: Deleting patient cascades to appointments and medical records
- **Foreign Key Constraints**: Data integrity enforced
- **Indices**: Created on foreign keys for query performance
- **Timestamps**: `CreatedAt`, `UpdatedAt` for audit trails

---

## 🔐 Authentication & Authorization

### How JWT Works

```
1. User logs in with email/password
   ↓
2. Server validates credentials
   ↓
3. Server generates:
   - AccessToken (short-lived, 15 minutes)
   - RefreshToken (long-lived, 7 days, stored in DB)
   ↓
4. Client stores both tokens
   ↓
5. Client includes AccessToken in Authorization header for every request
   ↓
6. When AccessToken expires, use RefreshToken to get new AccessToken
```

### Access Token Contents
```json
{
  "nameid": "user-id-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1711353600,
  "exp": 1711354500,
  "iss": "HospitalManagementAPI",
  "aud": "HospitalManagementAPIClient"
}
```

### Why HTTP-Only Cookies Are Industry Standard

**HTTP-Only Cookies Benefits:**
1. **XSS Protection**: JavaScript cannot access cookies (prevents token theft)
2. **CSRF Prevention**: Cookies automatically included, harder to forge
3. **Cross-Domain Safety**: Automatic domain restrictions
4. **Logout Control**: Server can invalidate on backend

**vs. LocalStorage (localStorage):**
- ❌ Vulnerable to XSS attacks
- ❌ Authorization header still needed (no auto-include)
- ✅ Easier for SPAs but less secure

**This Implementation:**
- Uses **Bearer tokens in Authorization header** (stateless JWT)
- Stores **RefreshToken in database** (can be revoked)
- Best practice: **Authorization header + server-side session** (implemented here)

### Authorization Policies

| Role | Access |
|---|---|
| **Admin** | Create/update/delete doctors, view all patients, system administration |
| **Doctor** | View own appointments, create/update medical records, manage scans |
| **Patient** | Book appointments, view own medical records, update profile |

### Example: Accessing Protected Endpoints

```bash
# 1. Login to get tokens
curl -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456"}'

# Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "abcd1234efgh5678...",
  "email": "test@example.com",
  "role": "Patient"
}

# 2. Use AccessToken for API calls
curl -X GET https://localhost:5001/api/patients/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# 3. When token expires, refresh it
curl -X POST https://localhost:5001/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"abcd1234efgh5678..."}'
```

---

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---|---|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login and get tokens |
| POST | `/api/auth/refresh-token` | None | Refresh access token |
| POST | `/api/auth/logout` | Bearer Token | Revoke refresh token |

### Doctor Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---|---|
| GET | `/api/doctors` | Authorized | Get all doctors |
| GET | `/api/doctors/{id}` | Authorized | Get doctor by ID |
| GET | `/api/doctors/specialization/{spec}` | Authorized | Filter by specialization |
| POST | `/api/doctors` | Admin | Create doctor |
| PUT | `/api/doctors/{id}` | Admin, Doctor | Update doctor |
| DELETE | `/api/doctors/{id}` | Admin | Delete doctor |

### Patient Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---|---|
| GET | `/api/patients` | Admin, Doctor | Get all patients |
| GET | `/api/patients/{id}` | Authorized | Get patient by ID |
| POST | `/api/patients` | None | Register patient |
| PUT | `/api/patients/{id}` | Admin, Patient | Update patient |
| DELETE | `/api/patients/{id}` | Admin | Delete patient |

### Appointment Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---|---|
| GET | `/api/appointments` | Admin | Get all appointments |
| GET | `/api/appointments/{id}` | Authorized | Get appointment by ID |
| GET | `/api/appointments/doctor/{id}` | Authorized | Doctor's appointments |
| GET | `/api/appointments/patient/{id}` | Authorized | Patient's appointments |
| POST | `/api/appointments` | Admin, Patient | Create appointment |
| PUT | `/api/appointments/{id}` | Admin, Doctor, Patient | Update appointment |
| DELETE | `/api/appointments/{id}` | Admin | Delete appointment |

### Medical Records Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---|---|
| GET | `/api/medicalrecords/{id}` | Authorized | Get record by ID |
| GET | `/api/medicalrecords/patient/{id}` | Authorized | Patient's records |
| POST | `/api/medicalrecords` | Admin, Doctor | Create record |
| PUT | `/api/medicalrecords/{id}` | Admin, Doctor | Update record |
| DELETE | `/api/medicalrecords/{id}` | Admin | Delete record |

---

## ⚙️ Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HospitalManagementDb;Trusted_Connection=true;"
  },
  "Jwt": {
    "SecretKey": "your-super-secret-key-min-32-chars",
    "Issuer": "HospitalManagementAPI",
    "Audience": "HospitalManagementAPIClient",
    "ExpirationMinutes": 15
  }
}
```

### Change Database Connection
Edit the connection string for:
- **Local Development**: `(localdb)\\mssqllocaldb`
- **SQL Server Express**: `localhost\\SQLEXPRESS`
- **Azure SQL**: `Server=your-server.database.windows.net;...`

### Change JWT Secret
⚠️ **IMPORTANT FOR PRODUCTION:**
```bash
# Generate a strong key
openssl rand -base64 32

# Or in PowerShell:
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## 🔒 Security Best Practices Implemented

1. **Passwords**: Hashed with bcrypt (ASP.NET Identity default)
2. **JWT Signing**: HS256 with 256-bit secret key
3. **Token Expiration**: AccessToken (15 min), RefreshToken (7 days)
4. **HTTPS Only**: Enforced in production
5. **CORS**: Configurable to specific domains
6. **Input Validation**: Data annotations on all DTOs
7. **SQL Injection**: Protected by EF Core LINQ
8. **XSS Prevention**: Returns JSON, not HTML
9. **Authorization**: Role-based access control on all endpoints
10. **Token Revocation**: Refresh tokens stored in DB, can be revoked on logout

---

## 🔄 Background Jobs (Hangfire)

### Configured Jobs

**1. Delete Old Appointments**
- **Schedule**: Daily at midnight
- **Action**: Deletes appointments older than 30 days with status "Completed"
- **Purpose**: Clean up old data, save storage

**2. Send Appointment Reminders**
- **Schedule**: Daily at 6 AM
- **Action**: Identifies tomorrow's appointments and logs reminders
- **Purpose**: Patient retention (in production, would send emails/SMS)

### Access Hangfire Dashboard
Navigate to: `https://localhost:5001/hangfire`

View:
- Active jobs
- Completed jobs
- Failed jobs
- Job history
- Retry failures

### Extending Jobs
To add more jobs in `Program.cs`:
```csharp
RecurringJob.AddOrUpdate("job-key", 
    () => backgroundJobService.YourMethodAsync(), 
    Cron.Daily(10)); // Run daily at 10 AM
```

---

## 📊 Performance Optimizations

1. **AsNoTracking()** - Read queries don't track entities
2. **Select() Projections** - Only fetch needed columns
3. **Eager Loading** - `Include()` to prevent N+1 queries
4. **Database Indices** - On foreign keys and frequently queried columns
5. **Async Operations** - Non-blocking I/O
6. **Connection Pooling** - EF Core manages connection pool

---

## 🧪 Testing with Postman

1. **Import Collection**: `PostmanCollection.json`
2. **Set Authorization**: Create environment with variables:
   ```
   access_token = <token from login>
   refresh_token = <token from login>
   ```
3. **Use Variables**: `{{access_token}}` in bearer token field
4. **Test Flow**:
   - Register → Login → Get Token
   - Test authorized endpoints
   - Try refresh token flow
   - Test role-based access (Admin vs Patient)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Database not found | Run `dotnet ef database update` |
| HTTPS certificate error | Use `dotnet dev-certs https --trust` |
| JWT token invalid | Check `SecretKey` in appsettings matches signing key |
| Unauthorized (401) | Verify token not expired, use refresh token |
| Forbidden (403) | Check user has required role |
| CORS errors | Verify domain in CORS policy |

---

## 📚 Dependencies

All packages are **free and open-source**:

```xml
<ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.4.0" />
    <PackageReference Include="Hangfire.AspNetCore" Version="1.7.36" />
    <PackageReference Include="Hangfire.SqlServer" Version="1.7.36" />
</ItemGroup>
```

---

## 📝 Project Quality Metrics

✅ **Clean Code** - Follows SOLID principles, minimal comments, self-documenting
✅ **Security** - JWT, refresh tokens, role-based authorization, input validation
✅ **Performance** - Async operations, query optimization, no N+1 queries
✅ **Scalability** - Layered architecture, dependency injection, background jobs
✅ **Production Ready** - Error handling, logging, Swagger docs, database migrations
✅ **Enterprise Standards** - Industry-best practices, comprehensive relationships

---

## 📄 License

This project is free to use for educational and commercial purposes.

---

## 👨‍💻 Author

Built with ❤️ as a comprehensive hospital management system demonstrating enterprise-grade ASP.NET Core development.

---

**Last Updated**: March 25, 2026
**Status**: Production Ready ✓
