# 🚀 Quick Start Guide

## Step-by-Step Setup Instructions

### 1. Prerequisites Check
```bash
# Check .NET version (should be 8.0 or later)
dotnet --version

# Check SQL Server LocalDB
sqllocaldb info mssqllocaldb
```

### 2. Project Setup

#### Using Command Line (Recommended)
```bash
# Navigate to project directory
cd path\to\HospitalManagementAPI

# Restore NuGet packages
dotnet restore

# Create database and apply migrations
dotnet ef database update

# Run the application
dotnet run
```

#### Using Visual Studio
1. Open `HospitalManagementAPI.sln`
2. Right-click project → "Manage NuGet Packages" → Update all
3. Tools → NuGet Package Manager → Package Manager Console
4. Run: `Update-Database`
5. Press F5 to run

### 3. Access the Application

```
API Base URL: https://localhost:5001
Swagger UI:   https://localhost:5001/swagger/ui/index.html
Hangfire:     https://localhost:5001/hangfire
```

### 4. Test Authentication Flow

#### In Swagger UI:
1. Try POST `/api/auth/register`
   ```json
   {
     "email": "admin@hospital.com",
     "password": "Admin@123456",
     "firstName": "John",
     "lastName": "Doe",
     "role": "Admin"
   }
   ```

2. Try POST `/api/auth/login`
   ```json
   {
     "email": "admin@hospital.com",
     "password": "Admin@123456"
   }
   ```

3. Copy the `accessToken` from response

4. Click "Authorize" button → Paste token with "Bearer " prefix
   ```
   Bearer eyJhbGciOiJIUzI1NiIs...
   ```

5. Now test protected endpoints like GET `/api/doctors`

### 5. Create Test Data

#### Create a Doctor (Admin Only)
```json
POST /api/doctors
{
  "firstName": "Jane",
  "lastName": "Smith",
  "licenseNumber": "LIC001",
  "specialization": "Cardiology",
  "email": "jane.smith@hospital.com",
  "phoneNumber": "1234567890",
  "yearsOfExperience": 15,
  "password": "Doctor@123456"
}
```

#### Register a Patient
```json
POST /api/patients
{
  "firstName": "Robert",
  "lastName": "Johnson",
  "age": 45,
  "gender": "M",
  "email": "robert@example.com",
  "phoneNumber": "9876543210",
  "address": "123 Main St, City",
  "bloodType": "O+",
  "emergencyContactName": "Sarah",
  "emergencyContactPhone": "9876543211",
  "password": "Patient@123456"
}
```

#### Create an Appointment
```json
POST /api/appointments
{
  "doctorId": 1,
  "patientId": 1,
  "appointmentDate": "2026-04-15T10:00:00",
  "timeSlot": "10:00 AM",
  "reason": "Regular checkup",
  "notes": "Patient reports mild headaches"
}
```

### 6. Monitor Background Jobs

Visit `https://localhost:5001/hangfire` to see:
- Daily job: Delete old appointments (30+ days)
- Daily job: Send appointment reminders (tomorrow's appointments)

### 7. Troubleshooting

**Issue**: "No connection string 'DefaultConnection' found"
```bash
# Solution: Check appsettings.json has ConnectionStrings section
```

**Issue**: Database migration fails
```bash
# Solution: Delete existing DB and retry
sqllocaldb delete mssqllocaldb
dotnet ef database update
```

**Issue**: Port 5001 already in use
```bash
# Solution: Change in launchSettings.json or use different port
application-url
```

**Issue**: Token invalid error
```bash
# Solution: Regenerate token, check secret key in appsettings.json
```

### 8. Key Files to Modify for Production

1. **appsettings.json**
   - Change `ConnectionString` to production database
   - Generate new JWT `SecretKey`
   - Update `Jwt:Issuer` and `Jwt:Audience`

2. **Hangfire Configuration**
   - Update job schedules in `Program.cs`
   - Add email/SMS integration for reminders

3. **CORS Settings**
   - Update allowed origins in `Program.cs`

4. **Environment Variables**
   - Use `appsettings.Production.json`
   - Store sensitive values in Azure Key Vault or similar

---

## 📊 Database Schema Quick Reference

```
Doctor
  ├─ DoctorId (PK)
  ├─ FirstName, LastName
  ├─ LicenseNumber (Unique)
  ├─ Specialization
  ├─ Email, PhoneNumber
  ├─ YearsOfExperience
  ├─ DoctorProfileId (FK) → DoctorProfile
  └─ Appointments (ICollection)

DoctorProfile
  ├─ DoctorProfileId (PK)
  ├─ Bio, Qualifications
  ├─ OfficeAddress
  ├─ IsAvailableForTeleHealth
  └─ DoctorId (FK) → Doctor

Patient
  ├─ PatientId (PK)
  ├─ FirstName, LastName
  ├─ Age, Gender
  ├─ Email, PhoneNumber
  ├─ Address, BloodType
  ├─ EmergencyContact*
  ├─ InsuranceId (FK) → Insurance
  ├─ Appointments (ICollection)
  └─ MedicalRecords (ICollection)

Insurance
  ├─ InsuranceId (PK)
  ├─ ProviderName, PolicyNumber
  ├─ PolicyStartDate, PolicyEndDate
  ├─ CoverageAmount, Deductible
  └─ PatientId (FK) → Patient

Appointment
  ├─ AppointmentId (PK)
  ├─ DoctorId (FK) → Doctor
  ├─ PatientId (FK) → Patient
  ├─ AppointmentDate, TimeSlot
  ├─ Reason, Status
  └─ CreatedAt, UpdatedAt

MedicalRecord
  ├─ MedicalRecordId (PK)
  ├─ PatientId (FK) → Patient
  ├─ Diagnosis, RecordDate
  ├─ Symptoms, Treatment
  ├─ Prescriptions, Notes
  └─ Scans (ICollection)

Scan
  ├─ ScanId (PK)
  ├─ MedicalRecordId (FK) → MedicalRecord
  ├─ ScanType, ScanDate
  ├─ FilePath, Diagnosis
  └─ Status

ApplicationUser (Identity)
  ├─ Id (PK)
  ├─ Email, UserName
  ├─ PasswordHash
  ├─ FirstName, LastName
  ├─ IsActive, CreatedAt
  └─ UserRoles, Claims

RefreshToken
  ├─ RefreshTokenId (PK)
  ├─ UserId (FK)
  ├─ Token
  ├─ ExpiryDate
  ├─ IsRevoked
  └─ CreatedAt
```

---

## 🎯 Common Tasks

### Enable HTTPS in Production
```csharp
// In Program.cs
app.UseHsts();
app.UseHttpsRedirection();
```

### Add Email Notifications
```csharp
// In BackgroundJobService.cs
public async Task SendAppointmentRemindersAsync()
{
    // Add EmailService injection and send actual emails
    foreach (var appointment in appointmentsToRemind)
    {
        await _emailService.SendReminderAsync(appointment.Patient.Email);
    }
}
```

### Add Pagination to Endpoints
```csharp
// In Repository
public async Task<IEnumerable<T>> GetPagedAsync(int pageNumber, int pageSize)
{
    return await _dbSet
        .AsNoTracking()
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();
}
```

### Add Logging
```csharp
// All controllers/services already use ILogger
private readonly ILogger<DoctorService> _logger;

_logger.LogInformation("Doctor created: {DoctorId}", doctor.DoctorId);
_logger.LogError("Database error: {Message}", ex.Message);
```

---

**Now your Hospital Management API is ready to use! 🏥**
