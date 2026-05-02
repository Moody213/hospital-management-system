# Hospital Management System — Full Documentation

> **Study Guide**: This document covers every layer of the system from the database up to the browser, how they talk to each other, and what each file is responsible for.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [How the Two Sides Connect](#3-how-the-two-sides-connect)
4. [Backend Deep Dive](#4-backend-deep-dive)
   - [Entry Point — Program.cs](#41-entry-point--programcs)
   - [Database Layer](#42-database-layer)
   - [Models (Database Tables)](#43-models-database-tables)
   - [DTOs (Data Transfer Objects)](#44-dtos-data-transfer-objects)
   - [Repositories (Data Access)](#45-repositories-data-access)
   - [Services (Business Logic)](#46-services-business-logic)
   - [Controllers (HTTP Endpoints)](#47-controllers-http-endpoints)
   - [Authentication System](#48-authentication-system)
   - [Background Jobs](#49-background-jobs)
5. [Frontend Deep Dive](#5-frontend-deep-dive)
   - [Entry Point — main.jsx & App.jsx](#51-entry-point--mainjsx--appjsx)
   - [API Layer](#52-api-layer)
   - [Auth Context](#53-auth-context)
   - [Pages](#54-pages)
   - [Components](#55-components)
   - [Styling — index.css](#56-styling--indexcss)
6. [Database Schema (All Tables)](#6-database-schema-all-tables)
7. [Complete API Endpoint Reference](#7-complete-api-endpoint-reference)
8. [Role-Based Access Control (RBAC)](#8-role-based-access-control-rbac)
9. [Authentication Flow (Step by Step)](#9-authentication-flow-step-by-step)
10. [Request Lifecycle (Full Example)](#10-request-lifecycle-full-example)

---

## 1. Project Overview

This is a full-stack **Hospital Management System** with:
- A **backend** REST API built with ASP.NET Core (.NET 8)
- A **frontend** Single Page Application (SPA) built with React + Vite
- A **SQLite** database stored as a single file (`hospital.db`)
- Three user roles: **Admin**, **Doctor**, **Patient**

| Component | Technology | Port |
|---|---|---|
| Backend API | ASP.NET Core 8 | `http://localhost:5001` |
| Frontend SPA | React 19 + Vite | `http://localhost:5173` |
| Database | SQLite (file) | `hospital.db` |

---

## 2. Technology Stack

### Backend
| Technology | Purpose |
|---|---|
| **ASP.NET Core 8** | Web framework — handles HTTP requests and routing |
| **Entity Framework Core 8** | ORM — translates C# objects to SQL queries |
| **SQLite** | Database engine — lightweight file-based database |
| **ASP.NET Identity** | User account management — passwords, roles, claims |
| **JWT (JSON Web Tokens)** | Stateless authentication tokens |
| **Hangfire** | Background job scheduler |
| **Swagger / OpenAPI** | Auto-generated API documentation at `/swagger` |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library — components, state, rendering |
| **Vite** | Build tool and dev server (replaces Create React App) |
| **React Router DOM v7** | Client-side routing between pages |
| **Axios** | HTTP client — sends requests to the backend |
| **Context API** | Global state management (auth state) |

---

## 3. How the Two Sides Connect

This is the most important concept. The frontend and backend are **completely separate processes** that talk to each other over HTTP.

```
Browser (localhost:5173)                Backend (localhost:5001)
─────────────────────────               ──────────────────────────
React App
  │
  │  1. User clicks "Login"
  │
  ├─► api/axios.js
  │     └─► Axios attaches the JWT         
  │           from localStorage            
  │                                        
  │  2. HTTP POST to /api/auth/login ──────►  AuthController
  │                                               └─► AuthenticationService
  │                                                     └─► ApplicationDbContext
  │                                                           └─► SQLite (hospital.db)
  │                                        
  │  3. Response: { accessToken, role } ◄──  200 OK with JSON
  │
  ├─► AuthContext.jsx
  │     └─► Saves tokens to localStorage
  │     └─► Calls /api/doctors/me or /api/patients/me
  │     └─► Sets user state
  │
  └─► React Router redirects to /dashboard
```

### The Key Files That Bridge Frontend ↔ Backend

| Frontend File | Backend Counterpart | What they share |
|---|---|---|
| `src/api/axios.js` | `Program.cs` CORS policy | Base URL, auth header |
| `src/api/auth.js` | `Controllers/AuthController.cs` | `/api/auth/*` endpoints |
| `src/api/doctors.js` | `Controllers/DoctorsController.cs` | `/api/doctors/*` endpoints |
| `src/api/patients.js` | `Controllers/PatientsController.cs` | `/api/patients/*` endpoints |
| `src/api/appointments.js` | `Controllers/AppointmentsController.cs` | `/api/appointments/*` endpoints |
| `src/api/medicalRecords.js` | `Controllers/MedicalRecordsController.cs` | `/api/medicalrecords/*` endpoints |
| `src/context/AuthContext.jsx` | `Authentication/JwtTokenService.cs` | JWT structure (role, userId) |

---

## 4. Backend Deep Dive

**Location**: `e:\full-stack-training\parts\hospital-management-system\`

The backend follows the **layered architecture** pattern:

```
HTTP Request
     │
     ▼
Controllers        ← receives HTTP, validates input, returns HTTP
     │
     ▼
Services           ← business logic, validation rules
     │
     ▼
Repositories       ← data access (reads/writes to DB)
     │
     ▼
ApplicationDbContext  ← EF Core (converts C# to SQL)
     │
     ▼
SQLite (hospital.db)  ← actual data storage
```

---

### 4.1 Entry Point — `Program.cs`

**File**: `Program.cs`  
**What it does**: This is where the entire backend application is configured and started. It runs once when the server boots.

Key sections in order:

#### Database Registration
```csharp
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=hospital.db")
);
```
Tells the app: "Use SQLite, and the database file is `hospital.db` in the project folder."

#### Identity Registration
```csharp
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();
```
Enables ASP.NET Identity — this gives the app user registration, login, password hashing, and role management for free.

#### JWT Authentication Setup
```csharp
builder.Services.AddAuthentication(...)
.AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = "HospitalManagementAPI",
        ValidAudience = "HospitalManagementAPIClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});
```
Tells the app how to validate every JWT token that arrives in request headers. If the token doesn't match these rules, the request gets a `401 Unauthorized`.

#### Dependency Injection (DI) Registration
```csharp
builder.Services.AddScoped<IDoctorRepository, DoctorRepository>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
// ... etc.
```
This is how C# connects interfaces to their implementations. When a Controller needs `IDoctorService`, the DI container automatically creates a `DoctorService` instance and injects it. The `AddScoped` means one instance per HTTP request.

#### CORS Policy
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});
// ...
app.UseCors("AllowAll");
```
**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism. Without this, the browser would block the React app (port 5173) from calling the backend API (port 5001) because they're on different ports. `AllowAnyOrigin` removes that restriction.

> **Important**: `app.UseCors("AllowAll")` must come **before** `app.UseHttpsRedirection()`. If it's after, the HTTPS redirect strips the CORS headers and the browser still blocks the request.

#### Middleware Pipeline Order
```csharp
app.UseCors("AllowAll");          // 1. CORS headers first
app.UseHttpsRedirection();         // 2. Redirect HTTP to HTTPS
app.UseAuthentication();           // 3. Read and validate JWT
app.UseAuthorization();            // 4. Check if user has the right role
app.MapControllers();              // 5. Route to the correct controller
```
Order matters. Authentication must come before Authorization.

#### Database Seeding
```csharp
context.Database.EnsureCreated();  // Creates hospital.db if it doesn't exist
// Creates Admin, Doctor, Patient roles
// Creates default admin: admin@hospital.com / Admin@123456
```
On every startup, the app checks if the database exists. If not, it creates it. It also makes sure the three roles and the default admin account always exist.

---

### 4.2 Database Layer

**File**: `Data/ApplicationDbContext.cs`

The `ApplicationDbContext` is the **bridge between C# objects and the SQLite database**. It inherits from `IdentityDbContext<ApplicationUser>`, which automatically adds all the Identity tables (users, roles, etc.).

```csharp
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<Doctor> Doctors { get; set; }
    public DbSet<Patient> Patients { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<MedicalRecord> MedicalRecords { get; set; }
    public DbSet<Scan> Scans { get; set; }
    public DbSet<Insurance> Insurances { get; set; }
    public DbSet<DoctorProfile> DoctorProfiles { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
}
```

Each `DbSet<T>` maps to a table in the database. When you write `_context.Doctors.ToListAsync()`, EF Core translates that to `SELECT * FROM Doctors`.

The `OnModelCreating` method defines **relationships** between tables:

| Relationship | Type | Delete Behaviour |
|---|---|---|
| Doctor ↔ DoctorProfile | One-to-One | Cascade (delete profile when doctor deleted) |
| Patient ↔ Insurance | One-to-One | SetNull (keep insurance when patient deleted) |
| Doctor → Appointments | One-to-Many | Restrict (can't delete doctor with appointments) |
| Patient → Appointments | One-to-Many | Cascade (delete appointments when patient deleted) |
| Patient → MedicalRecords | One-to-Many | Cascade |
| MedicalRecord → Scans | One-to-Many | Cascade |

---

### 4.3 Models (Database Tables)

**Location**: `Models/`  
Each model class = one database table. Each property = one column.

#### `ApplicationUser.cs`
Extends ASP.NET Identity's `IdentityUser`. Adds:
- `FirstName`, `LastName` — user's name
- `IsActive` — whether account is active
- This is the **identity table** — all logins use this

#### `Doctor.cs`
| Field | Type | Notes |
|---|---|---|
| `DoctorId` | int (PK) | Auto-incremented primary key |
| `FirstName`, `LastName` | string | Required |
| `LicenseNumber` | string | Required, max 20 chars |
| `Specialization` | string | Required |
| `Email` | string | Required |
| `PhoneNumber` | string | 10–15 digits |
| `YearsOfExperience` | int | |
| `IsActive` | bool | Default true |
| `UserId` | string (FK) | Links to `ApplicationUser.Id` |
| `DoctorProfileId` | int? (FK) | Optional, links to `DoctorProfile` |

#### `Patient.cs`
| Field | Type | Notes |
|---|---|---|
| `PatientId` | int (PK) | |
| `FirstName`, `LastName` | string | Required |
| `Age` | int | Range 1–150 |
| `Gender` | string | "M" or "F" |
| `Email` | string | |
| `PhoneNumber` | string | 10–15 digits |
| `Address` | string | |
| `BloodType` | string | |
| `EmergencyContactName` | string | |
| `EmergencyContactPhone` | string | |
| `UserId` | string (FK) | Links to `ApplicationUser.Id` |
| `InsuranceId` | int? (FK) | Optional |

#### `Appointment.cs`
| Field | Type | Notes |
|---|---|---|
| `AppointmentId` | int (PK) | |
| `DoctorId` | int (FK) | Links to `Doctor` |
| `PatientId` | int (FK) | Links to `Patient` |
| `AppointmentDate` | DateTime | Full date + time |
| `TimeSlot` | string | Auto-derived from AppointmentDate (e.g. "3:00 PM") |
| `Reason` | string | |
| `Status` | string | "Scheduled", "Completed", "Cancelled", "No-Show" |
| `Notes` | string | |
| `CreatedAt`, `UpdatedAt` | DateTime | Audit timestamps |

#### `MedicalRecord.cs`
| Field | Notes |
|---|---|
| `MedicalRecordId` (PK) | |
| `PatientId` (FK) | Links to `Patient` |
| `Diagnosis` | Required |
| `RecordDate` | |
| `Symptoms`, `Treatment`, `Prescriptions`, `Notes` | |

#### `DoctorProfile.cs`
Extended bio for a doctor — optional.
- `Bio`, `Qualifications`, `OfficeAddress`, `ClinicalInterests`
- `IsAvailableForTeleHealth`
- `DoctorId` (FK) — one profile per doctor

#### `Insurance.cs`
Patient's insurance information.
- `ProviderName`, `PolicyNumber`, `GroupNumber`
- `PolicyStartDate`, `PolicyEndDate`
- `CoverageAmount`, `Deductible`, `CoverageDetails`
- `PatientId` (FK)

#### `RefreshToken.cs`
Stores refresh tokens in the database.
- `UserId` (FK) — which user owns this token
- `Token` — the random token string
- `ExpiryDate` — expires after 7 days
- `IsRevoked` — set to true on logout

#### `Scan.cs`
Attached to a `MedicalRecord`. Represents a medical scan/image file.

---

### 4.4 DTOs (Data Transfer Objects)

**Location**: `DTOs/`  
DTOs are simple classes that define exactly what data goes **in and out of the API**. They are separate from the Model classes on purpose:

- **Models** represent the database structure
- **DTOs** represent what the HTTP request/response should look like

This means you can, for example, never expose a user's password hash in a response because it's simply not in the `ReadDto`.

| File | DTOs inside | Purpose |
|---|---|---|
| `AuthDtos.cs` | `RegisterRequestDto`, `LoginRequestDto`, `LoginResponseDto`, `AuthResponseDto` | Login/register data shapes |
| `DoctorDtos.cs` | `DoctorCreateDto`, `DoctorUpdateDto`, `DoctorReadDto` | Doctor CRUD |
| `PatientDtos.cs` | `PatientCreateDto`, `PatientUpdateDto`, `PatientReadDto` | Patient CRUD |
| `AppointmentDtos.cs` | `AppointmentCreateDto`, `AppointmentUpdateDto`, `AppointmentReadDto` | Appointment CRUD |
| `MedicalRecordDtos.cs` | `MedicalRecordCreateDto`, `MedicalRecordUpdateDto`, `MedicalRecordReadDto` | Records CRUD |
| `DoctorProfileDtos.cs` | `DoctorProfileCreateDto`, `DoctorProfileReadDto` | Doctor profile |
| `InsuranceDtos.cs` | `InsuranceCreateDto`, `InsuranceReadDto` | Patient insurance |

**Example** — the `AppointmentCreateDto` only asks for the data the client needs to send. The backend fills in the rest (`TimeSlot`, `Status`, `CreatedAt`):

```csharp
public class AppointmentCreateDto {
    public int DoctorId { get; set; }
    public int PatientId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string Reason { get; set; }
    public string Notes { get; set; }
    // TimeSlot is NOT here — the backend auto-derives it
}
```

---

### 4.5 Repositories (Data Access)

**Location**: `Repositories/`  
Repositories are responsible for **one thing only: reading and writing data**. No business logic here.

Each entity has:
1. An **interface** — defines what methods exist (e.g. `IDoctorRepository`)
2. An **implementation** — the actual code (e.g. `DoctorRepository`)

#### `GenericRepository<T>`
A base class that all repositories inherit from. Provides:
- `GetByIdAsync(id)` — SELECT by primary key
- `GetAllAsync()` — SELECT all
- `AddAsync(entity)` — INSERT
- `UpdateAsync(entity)` — UPDATE
- `DeleteAsync(entity)` — DELETE
- `SaveAsync()` — commits changes to DB (`SaveChangesAsync()`)

#### Specialised Repositories
Each entity's repository adds extra queries:

| Repository | Extra Methods |
|---|---|
| `DoctorRepository` | `GetDoctorWithProfileAsync(id)`, `GetDoctorsBySpecializationAsync(spec)`, `GetDoctorByUserIdAsync(userId)` |
| `PatientRepository` | `GetPatientWithInsuranceAsync(id)`, `GetPatientByUserIdAsync(userId)` |
| `AppointmentRepository` | `GetDoctorAppointmentsAsync(doctorId)`, `GetPatientAppointmentsAsync(patientId)`, `GetAppointmentWithDetailsAsync(id)` |
| `MedicalRecordRepository` | `GetPatientMedicalRecordsAsync(patientId)`, `GetMedicalRecordWithScansAsync(id)` |
| `RefreshTokenRepository` | `GetByTokenAsync(token)`, `RevokeTokenAsync(token)` |

---

### 4.6 Services (Business Logic)

**Location**: `Services/`  
Services sit between Controllers and Repositories. They contain the **"rules"** of the application.

Each service has an interface (e.g. `IDoctorService`) and an implementation (`DoctorService`).

#### `AppointmentService.cs` — key logic
- **Overlap check**: Before creating or editing an appointment, loads all of that doctor's non-cancelled appointment times. If any existing appointment is within 60 minutes of the requested time, throws `InvalidOperationException` with a message explaining the conflict.
- **Auto-derive TimeSlot**: Extracts the hour/minute from `AppointmentDate` (e.g. `3:00 PM`) and saves it as `TimeSlot`. The client never has to send a separate "time slot" value.

#### `DoctorService.cs`
- Maps between `Doctor` model ↔ `DoctorReadDto`
- Has `GetDoctorByUserIdAsync(userId)` — used by the `/doctors/me` endpoint to find which doctor record belongs to the currently logged-in user

#### `PatientService.cs`
- Similar to DoctorService
- Has `GetPatientByUserIdAsync(userId)` — used by `/patients/me`

#### `MedicalRecordService.cs`
- CRUD for medical records
- Handles scan attachments

---

### 4.7 Controllers (HTTP Endpoints)

**Location**: `Controllers/`  
Controllers are the **front door** of the API. They receive HTTP requests, call the service, and return HTTP responses.

Every controller has:
```csharp
[ApiController]          // Auto-validates model, auto-returns 400 on bad input
[Route("api/[controller]")]   // URL prefix: api/doctors, api/patients, etc.
[Authorize]              // All endpoints require a valid JWT by default
```

#### `AuthController.cs`
Base route: `POST /api/auth/`

| Method | Endpoint | Auth | What it does |
|---|---|---|---|
| POST | `/register` | None | Creates user + Patient/Doctor record |
| POST | `/login` | None | Returns JWT tokens |
| POST | `/refresh-token` | None | Exchanges refresh token for new access token |
| POST | `/logout` | Required | Revokes the refresh token |

#### `DoctorsController.cs`
Base route: `/api/doctors`

| Method | Endpoint | Auth | What it does |
|---|---|---|---|
| GET | `/` | Any logged-in | All doctors |
| GET | `/me` | Doctor only | Own profile |
| GET | `/{id}` | Any logged-in | Single doctor |
| GET | `/specialization/{spec}` | Any logged-in | Filter by specialization |
| POST | `/` | Admin only | Create doctor |
| PUT | `/{id}` | Admin only | Update doctor |
| DELETE | `/{id}` | Admin only | Delete doctor |
| GET | `/{id}/profile` | Any logged-in | Doctor's extended profile |
| POST | `/{id}/profile` | Admin only | Create extended profile |
| PUT | `/{id}/profile` | Admin only | Update extended profile |

#### `PatientsController.cs`
Base route: `/api/patients`

| Method | Endpoint | Auth | What it does |
|---|---|---|---|
| GET | `/` | Admin, Doctor | All patients |
| GET | `/me` | Patient only | Own profile |
| GET | `/{id}` | Admin, Doctor | Single patient |
| POST | `/` | Admin only | Create patient |
| PUT | `/{id}` | Admin only | Update patient |
| DELETE | `/{id}` | Admin only | Delete patient |

#### `AppointmentsController.cs`
Base route: `/api/appointments`

| Method | Endpoint | Auth | What it does |
|---|---|---|---|
| GET | `/` | Admin only | All appointments |
| GET | `/{id}` | Any logged-in | Single appointment |
| GET | `/doctor/{doctorId}` | Any logged-in | Doctor's appointments |
| GET | `/patient/{patientId}` | Any logged-in | Patient's appointments |
| POST | `/` | Admin, Patient | Schedule appointment (with overlap check) |
| PUT | `/{id}` | Admin, Doctor, Patient | Update (Doctor: status only) |
| DELETE | `/{id}` | Admin only | Delete |

#### `MedicalRecordsController.cs`
Base route: `/api/medicalrecords`

| Method | Endpoint | Auth | What it does |
|---|---|---|---|
| GET | `/patient/{patientId}` | Admin, Doctor, Patient (own) | Patient's records |
| GET | `/{id}` | Admin, Doctor | Single record |
| POST | `/` | Admin, Doctor | Create record |
| PUT | `/{id}` | Admin, Doctor | Update record |
| DELETE | `/{id}` | Admin only | Delete record |

---

### 4.8 Authentication System

**Location**: `Authentication/`

#### `AuthenticationService.cs`
This is where user registration and login actually happen.

**`RegisterAsync(request)`**:
1. Rejects if role is "Admin" (admins can't self-register)
2. Checks if email already exists
3. Creates the `ApplicationUser` (Identity user)
4. Creates the role if it doesn't exist
5. Assigns the role to the user
6. **Auto-creates** a linked `Patient` or `Doctor` record with placeholder data
7. Generates and returns JWT tokens

**`LoginAsync(request)`**:
1. Finds the user by email
2. Verifies the password using Identity's password hasher
3. **Auto-creates** a `Patient`/`Doctor` record if one doesn't exist (for accounts created before this logic was added)
4. Generates and returns JWT tokens

#### `JwtTokenService.cs`
Responsible for creating JWT tokens.

**`GenerateTokensAsync(user)`**:
1. Gets the user's roles from Identity
2. Calls `GenerateAccessToken` — creates a JWT valid for **15 minutes**
3. Calls `GenerateRefreshToken` — creates a random 64-byte token
4. Saves the refresh token to the `RefreshTokens` table
5. Returns both tokens + user email + role

**JWT Access Token contains these claims**:
- `ClaimTypes.NameIdentifier` = user's `Id` (GUID string)
- `ClaimTypes.Email` = user's email
- `ClaimTypes.Name` = full name
- `ClaimTypes.Role` = "Admin", "Doctor", or "Patient"

Controllers extract these claims like this:
```csharp
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
```

**Refresh Token Flow**:
- Access token expires every **15 minutes**
- Frontend automatically detects a `401` response
- Frontend sends the refresh token to `POST /api/auth/refresh-token`
- Backend verifies the refresh token exists in the DB and is not expired/revoked
- Backend issues a new access token and a new refresh token

---

### 4.9 Background Jobs

**File**: `Jobs/BackgroundJobService.cs`  
**Uses**: Hangfire (a job scheduling library)

Two scheduled jobs run automatically:

| Job | Schedule | What it does |
|---|---|---|
| `DeleteOldAppointmentsAsync` | Daily (midnight) | Deletes completed appointments older than 30 days |
| `SendAppointmentRemindersAsync` | Daily at 6 AM | Logs upcoming appointments (reminder logic placeholder) |

Registered in `Program.cs`:
```csharp
RecurringJob.AddOrUpdate("delete-old-appointments", 
    () => backgroundJobService.DeleteOldAppointmentsAsync(), 
    Cron.Daily);
```

---

## 5. Frontend Deep Dive

**Location**: `frontend/src/`

```
frontend/src/
├── main.jsx              ← App entry point
├── App.jsx               ← Route definitions
├── index.css             ← All styles
├── api/
│   ├── axios.js          ← Axios instance with auth interceptors
│   ├── auth.js           ← Auth API calls
│   ├── doctors.js        ← Doctor API calls
│   ├── patients.js       ← Patient API calls
│   ├── appointments.js   ← Appointment API calls
│   └── medicalRecords.js ← Medical record API calls
├── context/
│   └── AuthContext.jsx   ← Global auth state
├── components/
│   ├── Navbar.jsx        ← Navigation bar
│   └── ProtectedRoute.jsx ← Route guard
└── pages/
    ├── LandingPage.jsx
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── DashboardPage.jsx
    ├── DoctorsPage.jsx
    ├── PatientsPage.jsx
    ├── AppointmentsPage.jsx
    └── MedicalRecordsPage.jsx
```

---

### 5.1 Entry Point — `main.jsx` & `App.jsx`

**`main.jsx`**: The very first file React loads. Mounts the `<App />` component into the `<div id="root">` in `index.html`.

**`App.jsx`**: Defines all routes using React Router. Wraps everything in `<AuthProvider>` (the global auth context).

```
Route Table:
/                  → LandingPage       (public — redirects to /dashboard if logged in)
/login             → LoginPage         (public)
/register          → RegisterPage      (public)
/dashboard         → DashboardPage     (protected — requires login)
/doctors           → DoctorsPage       (protected)
/patients          → PatientsPage      (protected)
/appointments      → AppointmentsPage  (protected)
/medical-records   → MedicalRecordsPage(protected)
*                  → redirect to /     (catch-all)
```

Protected routes are wrapped in `<ProtectedRoute>` and `<Layout>`:
```jsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Layout><DashboardPage /></Layout>
  </ProtectedRoute>
} />
```

`Layout` just renders the `<Navbar />` on top of the page content.

---

### 5.2 API Layer

**Location**: `src/api/`

#### `axios.js` — The Core HTTP Client
This is the most important file in the API layer. It creates a configured Axios instance that all other API files use.

```javascript
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});
```

**Request Interceptor** — runs before every request:
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```
This automatically adds `Authorization: Bearer <token>` to every API call. You never have to manually add the auth header.

**Response Interceptor** — runs after every response:
```javascript
api.interceptors.response.use(
  (res) => res,   // success: pass through
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Access token expired — get a new one using the refresh token
      const res = await axios.post('/auth/refresh-token', { refreshToken });
      localStorage.setItem('accessToken', res.data.data.accessToken);
      // Retry the original failed request with the new token
      return api(originalRequest);
    }
    // If refresh fails → clear storage → redirect to /login
  }
);
```
This handles **automatic token refresh**. The user never gets logged out mid-session as long as their refresh token is still valid.

#### `auth.js`
```javascript
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);
export const logout   = (token) => api.post('/auth/logout', { refreshToken: token });
```

#### `doctors.js`
```javascript
export const getAllDoctors       = ()   => api.get('/doctors');
export const getDoctorById       = (id) => api.get(`/doctors/${id}`);
export const getMyDoctorProfile  = ()   => api.get('/doctors/me');
export const createDoctor        = (d)  => api.post('/doctors', d);
export const updateDoctor        = (id, d) => api.put(`/doctors/${id}`, d);
export const deleteDoctor        = (id) => api.delete(`/doctors/${id}`);
```

#### `appointments.js`
```javascript
export const getAllAppointments      = ()     => api.get('/appointments');
export const getDoctorAppointments   = (id)   => api.get(`/appointments/doctor/${id}`);
export const getPatientAppointments  = (id)   => api.get(`/appointments/patient/${id}`);
export const createAppointment       = (data) => api.post('/appointments', data);
export const updateAppointment       = (id, data) => api.put(`/appointments/${id}`, data);
export const deleteAppointment       = (id)   => api.delete(`/appointments/${id}`);
```

---

### 5.3 Auth Context

**File**: `src/context/AuthContext.jsx`

The **Auth Context** is the global state manager for authentication. It uses React's Context API so any component in the app can access the current user without prop drilling.

**What it stores** (in both React state and `localStorage`):
```javascript
user = {
  email: "patient@example.com",
  role: "Patient",          // "Admin" | "Doctor" | "Patient"
  token: "<JWT>",
  entityId: 5,              // PatientId or DoctorId (null for Admin)
  entityData: { ... }       // Full Patient or Doctor object
}
```

**Why `entityId` matters**: The backend stores appointments by `patientId` (integer). When a patient books an appointment, the frontend needs to know their `patientId` — that's what `entityId` is. It's fetched from `/doctors/me` or `/patients/me` immediately after login.

**Key functions**:
- `login(credentials)` — calls `/api/auth/login`, stores tokens, fetches entity profile
- `register(data)` — calls `/api/auth/register`, then same as login
- `logout()` — calls `/api/auth/logout`, clears `localStorage`, clears user state
- `fetchEntityProfile(role)` — calls `/doctors/me` or `/patients/me` to get the linked Doctor/Patient record

**Persistence**: On page reload, the context reads from `localStorage` to restore the session without requiring re-login.

---

### 5.4 Pages

**Location**: `src/pages/`

#### `LandingPage.jsx`
- **Public** — visible without login
- Shows hero section, feature highlights, role descriptions, CTA buttons
- If already logged in → auto-redirects to `/dashboard`

#### `LoginPage.jsx`
- **Public**
- Form: email + password
- Calls `login()` from AuthContext
- On success → redirects to `/dashboard`

#### `RegisterPage.jsx`
- **Public**
- Form: first name, last name, email, password, role (Doctor or Patient — Admin is not an option)
- Calls `register()` from AuthContext
- On success → redirects to `/dashboard`

#### `DashboardPage.jsx`
- **Protected**
- Shows different stats depending on role:
  - **Admin**: Total Doctors, Total Patients, Total Appointments + quick links to all sections
  - **Doctor**: Doctors count, Appointments count + links
  - **Patient**: Own appointments count + links to Appointments and Doctors

#### `DoctorsPage.jsx`
- **Protected**
- **Admin**: Full CRUD — can create, edit, delete any doctor
- **Doctor**: Can view all doctors, edit only their own row
- **Patient**: View-only list

#### `PatientsPage.jsx`
- **Protected**
- **Admin**: Full CRUD
- **Doctor**: View-only list
- **Patient**: Immediately redirected to `/dashboard` (patients can't view the patient list)

#### `AppointmentsPage.jsx`
- **Protected** — most complex page
- **Admin**: Sees all appointments, full edit, can delete
- **Doctor**: Sees own appointments (by `entityId`), can only update `status` and `notes`
- **Patient**: Sees own appointments (by `entityId`), can schedule new ones, can edit

- **Schedule Appointment modal** (Patient/Admin):
  - Doctor selector dropdown
  - Appointment Date & Time (datetime picker)
  - Reason, Notes
  - Backend enforces: no two appointments for the same doctor within 1 hour
  - `TimeSlot` is no longer a user input — it's auto-generated by the backend

#### `MedicalRecordsPage.jsx`
- **Protected**
- **Admin/Doctor**: Select patient from dropdown, then full CRUD on their records
- **Patient**: Auto-loads own records on mount, view-only (no add/edit/delete)

---

### 5.5 Components

**Location**: `src/components/`

#### `Navbar.jsx`
- Renders different navigation links based on `user.role` from AuthContext
- Highlights the currently active route
- Shows "Logout" button that calls `logout()` and redirects to `/login`

```javascript
const NAV_BY_ROLE = {
  Admin:   [Dashboard, Doctors, Patients, Appointments, Medical Records],
  Doctor:  [Dashboard, Doctors, Appointments, Medical Records],
  Patient: [Dashboard, Doctors, Appointments, Medical Records],
}
```

Patients and Doctors don't see the Patients list link because they'd either be blocked or redirected away.

#### `ProtectedRoute.jsx`
A wrapper component used in `App.jsx` to guard protected routes.

```jsx
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
```

Logic:
1. While auth state is loading from `localStorage` → show loading spinner
2. If no user logged in → redirect to `/login`
3. If user exists → render the page

---

### 5.6 Styling — `index.css`

All styles are in one file. Key CSS class groups:

| Class prefix | What it styles |
|---|---|
| `.navbar`, `.nav-link` | Top navigation bar |
| `.auth-container`, `.auth-card` | Login and register pages |
| `.page`, `.page-header` | All inner pages |
| `.card`, `.table` | Data display containers |
| `.btn`, `.btn-primary`, `.btn-danger` | Buttons |
| `.modal`, `.modal-overlay` | Popup dialogs |
| `.badge--scheduled`, `.badge--completed` | Status badges |
| `.form-group`, `.form-row` | Form inputs |
| `.landing-*` | All landing page styles |
| `.stats-grid`, `.dashboard-grid` | Dashboard layout |
| `.alert-error`, `.alert-success` | Notification banners |

---

## 6. Database Schema (All Tables)

The database is stored in a single file: `hospital.db` (SQLite).

### Tables from ASP.NET Identity (auto-created)
- `AspNetUsers` — all users (Admin, Doctor, Patient)
- `AspNetRoles` — the three roles
- `AspNetUserRoles` — which user has which role
- `AspNetUserClaims`, `AspNetRoleClaims`, `AspNetUserTokens`, `AspNetUserLogins` — Identity internals

### Custom Tables
```
Doctors
  ├─ DoctorId (PK)
  ├─ FirstName, LastName, LicenseNumber, Specialization
  ├─ Email, PhoneNumber, YearsOfExperience, IsActive
  └─ UserId (FK → AspNetUsers.Id)

DoctorProfiles
  ├─ DoctorProfileId (PK)
  ├─ Bio, Qualifications, OfficeAddress, ClinicalInterests
  ├─ IsAvailableForTeleHealth
  └─ DoctorId (FK → Doctors.DoctorId)

Patients
  ├─ PatientId (PK)
  ├─ FirstName, LastName, Age, Gender, Email
  ├─ PhoneNumber, Address, BloodType
  ├─ EmergencyContactName, EmergencyContactPhone
  ├─ InsuranceId (FK → Insurances.InsuranceId, nullable)
  └─ UserId (FK → AspNetUsers.Id)

Insurances
  ├─ InsuranceId (PK)
  ├─ ProviderName, PolicyNumber, GroupNumber
  ├─ PolicyStartDate, PolicyEndDate
  ├─ CoverageAmount, Deductible, CoverageDetails
  └─ PatientId (FK → Patients.PatientId, nullable)

Appointments
  ├─ AppointmentId (PK)
  ├─ DoctorId (FK → Doctors.DoctorId)
  ├─ PatientId (FK → Patients.PatientId)
  ├─ AppointmentDate, TimeSlot, Reason, Status, Notes
  └─ CreatedAt, UpdatedAt

MedicalRecords
  ├─ MedicalRecordId (PK)
  ├─ PatientId (FK → Patients.PatientId)
  ├─ Diagnosis, RecordDate
  └─ Symptoms, Treatment, Prescriptions, Notes

Scans
  ├─ ScanId (PK)
  ├─ MedicalRecordId (FK → MedicalRecords.MedicalRecordId)
  └─ (scan metadata/file references)

RefreshTokens
  ├─ RefreshTokenId (PK)
  ├─ UserId (FK → AspNetUsers.Id)
  ├─ Token (random string)
  ├─ ExpiryDate (7 days from creation)
  ├─ CreatedAt
  └─ IsRevoked
```

---

## 7. Complete API Endpoint Reference

All endpoints start with `http://localhost:5001/api/`

### Auth
```
POST   /auth/register          No auth required
POST   /auth/login             No auth required
POST   /auth/refresh-token     No auth required
POST   /auth/logout            JWT required
```

### Doctors
```
GET    /doctors                 Any role
GET    /doctors/me              Doctor only
GET    /doctors/{id}            Any role
GET    /doctors/specialization/{spec}  Any role
POST   /doctors                 Admin only
PUT    /doctors/{id}            Admin only
DELETE /doctors/{id}            Admin only
GET    /doctors/{id}/profile    Any role
POST   /doctors/{id}/profile    Admin only
PUT    /doctors/{id}/profile    Admin only
DELETE /doctors/{id}/profile    Admin only
```

### Patients
```
GET    /patients                Admin, Doctor
GET    /patients/me             Patient only
GET    /patients/{id}           Admin, Doctor
POST   /patients                Admin only
PUT    /patients/{id}           Admin only
DELETE /patients/{id}           Admin only
```

### Appointments
```
GET    /appointments                    Admin only
GET    /appointments/{id}               Any role
GET    /appointments/doctor/{doctorId}  Any role
GET    /appointments/patient/{patientId} Any role
POST   /appointments                    Admin, Patient
PUT    /appointments/{id}               Admin, Doctor, Patient
DELETE /appointments/{id}               Admin only
```

### Medical Records
```
GET    /medicalrecords/patient/{patientId}  Admin, Doctor, Patient (own)
GET    /medicalrecords/{id}                 Admin, Doctor
POST   /medicalrecords                      Admin, Doctor
PUT    /medicalrecords/{id}                 Admin, Doctor
DELETE /medicalrecords/{id}                 Admin only
```

---

## 8. Role-Based Access Control (RBAC)

The system enforces permissions at **three levels**:

### Level 1 — Backend Controller (`[Authorize(Roles = "...")]`)
The first line of defence. Even if a malicious user bypasses the frontend, the backend rejects unauthorized requests.

```csharp
[Authorize(Roles = "Admin")]          // Only Admins
[Authorize(Roles = "Admin,Doctor")]   // Admins or Doctors
[Authorize]                           // Any logged-in user
```

### Level 2 — Frontend Page Logic
Each page checks `user.role` and conditionally renders or hides UI elements.

```javascript
const role = user?.role;  // "Admin" | "Doctor" | "Patient"

// Example: only show Create button to Admin and Patient
const canCreate = role === 'Admin' || role === 'Patient';

// Example: patients are redirected away from the Patients page
useEffect(() => {
  if (role === 'Patient') navigate('/dashboard');
}, [role]);
```

### Level 3 — Navbar Filtering
The navigation links themselves are filtered by role, so users don't even see menu items they can't access.

### Permission Matrix

| Feature | Admin | Doctor | Patient |
|---|---|---|---|
| View all doctors | ✅ | ✅ | ✅ |
| Create/Edit/Delete doctor | ✅ | Own only | ❌ |
| View all patients | ✅ | ✅ | ❌ |
| Create/Edit/Delete patient | ✅ | ❌ | ❌ |
| View all appointments | ✅ | Own only | Own only |
| Schedule appointment | ✅ | ❌ | ✅ |
| Edit appointment (full) | ✅ | Status+Notes only | ✅ (own) |
| Delete appointment | ✅ | ❌ | ❌ |
| Create medical records | ✅ | ✅ | ❌ |
| View medical records | ✅ | ✅ | Own only |
| Delete medical records | ✅ | ❌ | ❌ |

---

## 9. Authentication Flow (Step by Step)

### Registration
```
1. User fills form (first name, last name, email, password, role: Doctor or Patient)
2. Frontend: RegisterPage calls register() in AuthContext
3. AuthContext calls POST /api/auth/register
4. Backend AuthenticationService.RegisterAsync():
   a. Blocks if role = "Admin"
   b. Creates ApplicationUser (hashed password stored by Identity)
   c. Creates the role if it doesn't exist
   d. Assigns role to user
   e. Creates a linked Patient or Doctor record (with placeholder data)
   f. Generates JWT access token (15 min) + refresh token (7 days)
   g. Saves refresh token to RefreshTokens table
   h. Returns { accessToken, refreshToken, email, role }
5. AuthContext receives tokens:
   a. Saves to localStorage
   b. Calls /doctors/me or /patients/me to get entityId
   c. Saves entityId + entityData to localStorage
   d. Sets user state → triggers re-render
6. React Router navigates to /dashboard
```

### Login
```
1. User enters email + password
2. POST /api/auth/login
3. Backend verifies password using Identity's PasswordHasher
4. Auto-creates Patient/Doctor record if missing (for legacy accounts)
5. Generates new JWT tokens
6. Frontend stores tokens, fetches entity profile, navigates to /dashboard
```

### Every Subsequent API Call
```
1. Component calls e.g. getPatientAppointments(entityId)
2. axios.js request interceptor adds: Authorization: Bearer <accessToken>
3. Backend middleware validates the JWT:
   - Checks signature (HMAC-SHA256 with secret key)
   - Checks expiry (must be < 15 minutes old)
   - Checks issuer + audience
4. [Authorize(Roles = "...")] checks the ClaimTypes.Role claim in the token
5. Controller method runs → returns data
```

### Token Refresh (automatic)
```
1. API call returns 401 (access token expired after 15 min)
2. axios.js response interceptor catches the 401
3. Sends POST /api/auth/refresh-token with the stored refreshToken
4. Backend validates the refresh token:
   - Must exist in RefreshTokens table
   - Must not be revoked
   - Must not be expired (7 days)
5. Issues new access token + new refresh token
6. axios.js updates localStorage and retries the original failed request
7. User never notices anything happened
```

### Logout
```
1. User clicks Logout in Navbar
2. POST /api/auth/logout with refreshToken
3. Backend sets RefreshToken.IsRevoked = true in DB
4. Frontend clears all localStorage entries
5. user state set to null → all ProtectedRoutes redirect to /login
```

---

## 10. Request Lifecycle (Full Example)

**Scenario**: A Patient books a doctor's appointment.

```
Patient clicks "+ Schedule Appointment"
    │
    ▼
AppointmentsPage.jsx — openCreate()
    Checks: role === 'Patient' && entityId exists (otherwise shows error)
    Sets form state: { doctorId: '', patientId: entityId, ... }
    Opens modal

Patient selects Doctor, picks date/time, enters reason, clicks "Schedule"
    │
    ▼
AppointmentsPage.jsx — handleCreate()
    Calls: createAppointment({ doctorId, patientId, appointmentDate, reason, notes })
    │
    ▼
src/api/appointments.js
    api.post('/appointments', data)
    │
    ▼
src/api/axios.js (request interceptor)
    Adds: Authorization: Bearer eyJhbGci...
    │
    ▼
HTTP POST http://localhost:5001/api/appointments
    Body: { "doctorId": 3, "patientId": 5, "appointmentDate": "2026-05-10T15:00", ... }
    Header: Authorization: Bearer <JWT>
    │
    ▼
ASP.NET Core Middleware Pipeline
    1. UseCors: adds CORS headers to response
    2. UseAuthentication: validates JWT, sets User principal
    3. UseAuthorization: checks [Authorize(Roles = "Admin,Patient")]
    │
    ▼
AppointmentsController.cs — CreateAppointment()
    ModelState validation passes
    Calls: _service.CreateAppointmentAsync(dto)
    │
    ▼
AppointmentService.cs — CreateAppointmentAsync()
    1. Loads all of doctor #3's non-cancelled appointment times from DB
    2. Checks: is any within 60 minutes of 3:00 PM?
       - NO conflict → continue
       - YES conflict → throw InvalidOperationException("...within 1 hour...")
    3. Creates Appointment object:
       AppointmentDate = 2026-05-10 15:00
       TimeSlot = "3:00 PM"   (auto-derived)
       Status = "Scheduled"
    4. _repository.AddAsync(appointment) → EF Core tracks the object
    5. _repository.SaveAsync() → EF Core runs:
       INSERT INTO Appointments (DoctorId, PatientId, ...) VALUES (3, 5, ...)
    6. Fetches the created record with Doctor + Patient includes
    7. Maps to AppointmentReadDto and returns it
    │
    ▼
AppointmentsController.cs
    Returns: 201 Created with AppointmentReadDto JSON
    │
    ▼
HTTP Response → Browser
    Body: { "appointmentId": 12, "doctorId": 3, "patientId": 5, ... }
    │
    ▼
AppointmentsPage.jsx — handleCreate() success
    setSuccess("Appointment created successfully.")
    closeModal()
    fetchAll() → reloads appointment list
    │
    ▼
User sees the new appointment in the table ✅
```

**If there was a conflict**:
```
AppointmentService throws InvalidOperationException
    │
    ▼
AppointmentsController catches it → returns 409 Conflict
    Body: { "message": "This doctor already has an appointment within 1 hour..." }
    │
    ▼
axios.js → rejected promise
    │
    ▼
AppointmentsPage.jsx — handleCreate() catch block
    setError("This doctor already has an appointment within 1 hour...")
    │
    ▼
Modal stays open, red error banner shows the message ❌
```

---

*End of Documentation*
