# 📬 Example API Requests

Complete collection of example requests for testing the Hospital Management System API.

---

## 🔐 Authentication Examples

### 1. Register as Admin

**Request:**
```http
POST /api/auth/register HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "Admin@123456",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Admin"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "X5hZ8k2mN9pQ4vL7jR1sT6wU3xY9zB2c...",
    "email": "admin@hospital.com",
    "role": "Admin"
  }
}
```

---

### 2. Register as Doctor

**Request:**
```http
POST /api/auth/register HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{
  "email": "doctor@hospital.com",
  "password": "Doctor@123456",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "Doctor"
}
```

---

### 3. Register as Patient

**Request:**
```http
POST /api/auth/register HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "Patient@123456",
  "firstName": "Robert",
  "lastName": "Johnson",
  "role": "Patient"
}
```

---

### 4. Login

**Request:**
```http
POST /api/auth/login HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "Admin@123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "X5hZ8k2mN9pQ4vL7jR1sT6wU3xY9zB2c...",
    "email": "admin@hospital.com",
    "role": "Admin"
  }
}
```

---

### 5. Refresh Access Token

**Request:**
```http
POST /api/auth/refresh-token HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{
  "refreshToken": "X5hZ8k2mN9pQ4vL7jR1sT6wU3xY9zB2c..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "newRefreshTokenValue...",
    "email": "admin@hospital.com",
    "role": "Admin"
  }
}
```

---

### 6. Logout

**Request:**
```http
POST /api/auth/logout HTTP/1.1
Host: localhost:5001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "refreshToken": "X5hZ8k2mN9pQ4vL7jR1sT6wU3xY9zB2c..."
}
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

## 👨‍⚕️ Doctor Endpoints

### 1. Create Doctor (Admin Only)

**Request:**
```http
POST /api/doctors HTTP/1.1
Host: localhost:5001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

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

**Response (201 Created):**
```json
{
  "doctorId": 1,
  "firstName": "Jane",
  "lastName": "Smith",
  "specialization": "Cardiology",
  "email": "jane.smith@hospital.com",
  "phoneNumber": "1234567890",
  "yearsOfExperience": 15,
  "isActive": true,
  "doctorProfile": null
}
```

---

### 2. Get All Doctors

**Request:**
```http
GET /api/doctors HTTP/1.1
Host: localhost:5001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
[
  {
    "doctorId": 1,
    "firstName": "Jane",
    "lastName": "Smith",
    "specialization": "Cardiology",
    "email": "jane.smith@hospital.com",
    "phoneNumber": "1234567890",
    "yearsOfExperience": 15,
    "isActive": true,
    "doctorProfile": null
  },
  {
    "doctorId": 2,
    "firstName": "John",
    "lastName": "Wilson",
    "specialization": "Neurology",
    "email": "john.wilson@hospital.com",
    "phoneNumber": "9876543210",
    "yearsOfExperience": 20,
    "isActive": true,
    "doctorProfile": null
  }
]
```

---

### 3. Get Doctor by ID

**Request:**
```http
GET /api/doctors/1 HTTP/1.1
Host: localhost:5001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "doctorId": 1,
  "firstName": "Jane",
  "lastName": "Smith",
  "specialization": "Cardiology",
  "email": "jane.smith@hospital.com",
  "phoneNumber": "1234567890",
  "yearsOfExperience": 15,
  "isActive": true,
  "doctorProfile": {
    "doctorProfileId": 1,
    "bio": "Experienced cardiologist with focus on preventive care",
    "qualifications": "MD, Board Certified",
    "officeAddress": "123 Medical Plaza, Suite 100",
    "clinicalInterests": "Preventive cardiology, heart disease management",
    "isAvailableForTeleHealth": true,
    "doctorId": 1
  }
}
```

---

### 4. Filter Doctors by Specialization

**Request:**
```http
GET /api/doctors/specialization/Cardiology HTTP/1.1
Host: localhost:5001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 5. Update Doctor

**Request:**
```http
PUT /api/doctors/1 HTTP/1.1
Host: localhost:5001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "yearsOfExperience": 16,
  "phoneNumber": "1234567891"
}
```

---

### 6. Delete Doctor

**Request:**
```http
DELETE /api/doctors/1 HTTP/1.1
Host: localhost:5001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (204 No Content)**

---

## 👥 Patient Endpoints

### 1. Register Patient

**Request:**
```http
POST /api/patients HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{
  "firstName": "Robert",
  "lastName": "Johnson",
  "age": 45,
  "gender": "M",
  "email": "robert.johnson@example.com",
  "phoneNumber": "9876543210",
  "address": "123 Main St, Springfield, IL 62701",
  "bloodType": "O+",
  "emergencyContactName": "Sarah Johnson",
  "emergencyContactPhone": "9876543211",
  "password": "Patient@123456"
}
```

**Response (201 Created):**
```json
{
  "patientId": 1,
  "firstName": "Robert",
  "lastName": "Johnson",
  "age": 45,
  "gender": "M",
  "email": "robert.johnson@example.com",
  "phoneNumber": "9876543210",
  "address": "123 Main St, Springfield, IL 62701",
  "bloodType": "O+",
  "emergencyContactName": "Sarah Johnson",
  "emergencyContactPhone": "9876543211",
  "insurance": null
}
```

---

### 2. Get All Patients (Admin/Doctor Only)

**Request:**
```http
GET /api/patients HTTP/1.1
Host: localhost:5001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3. Get Patient by ID

**Request:**
```http
GET /api/patients/1 HTTP/1.1
Host: localhost:5001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 4. Update Patient Profile

**Request:**
```http
PUT /api/patients/1 HTTP/1.1
Host: localhost:5001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "phoneNumber": "9876543212",
  "address": "456 Oak Ave, Springfield, IL 62702",
  "emergencyContactPhone": "9876543213"
}
```

---

## 📅 Appointment Endpoints

### 1. Create Appointment

**Request:**
```http
POST /api/appointments HTTP/1.1
Host: localhost:5001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "doctorId": 1,
  "patientId": 1,
  "appointmentDate": "2026-04-15T10:00:00",
  "timeSlot": "10:00 AM",
  "reason": "Regular checkup",
  "notes": "Patient has been experiencing mild headaches"
}
```

**Response (201 Created):**
```json
{
  "appointmentId": 1,
  "doctorId": 1,
  "patientId": 1,
  "appointmentDate": "2026-04-15T10:00:00",
  "timeSlot": "10:00 AM",
  "reason": "Regular checkup",
  "status": "Scheduled",
  "notes": "Patient has been experiencing mild headaches",
  "createdAt": "2026-03-25T14:30:00",
  "updatedAt": null,
  "doctor": null,
  "patient": null
}
```

---

### 2. Get Doctor's Appointments

**Request:**
```http
GET /api/appointments/doctor/1 HTTP/1.1
Host: localhost:5001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3. Get Patient's Appointments

**Request:**
```http
GET /api/appointments/patient/1 HTTP/1.1
Host: localhost:5001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 4. Update Appointment Status

**Request:**
```http
PUT /api/appointments/1 HTTP/1.1
Host: localhost:5001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "status": "Completed",
  "notes": "Patient examined. Blood pressure normal. No symptoms."
}
```

---

## 📋 Medical Records Endpoints

### 1. Create Medical Record (Doctor Only)

**Request:**
```http
POST /api/medicalrecords HTTP/1.1
Host: localhost:5001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "patientId": 1,
  "diagnosis": "Hypertension",
  "recordDate": "2026-03-25T14:30:00",
  "symptoms": "High blood pressure readings (150/95)",
  "treatment": "Prescribed antihypertensive medication",
  "prescriptions": "Lisinopril 10mg once daily, Amlodipine 5mg once daily",
  "notes": "Patient to follow up in 2 weeks. Monitor blood pressure daily."
}
```

**Response (201 Created):**
```json
{
  "medicalRecordId": 1,
  "patientId": 1,
  "diagnosis": "Hypertension",
  "recordDate": "2026-03-25T14:30:00",
  "symptoms": "High blood pressure readings (150/95)",
  "treatment": "Prescribed antihypertensive medication",
  "prescriptions": "Lisinopril 10mg once daily, Amlodipine 5mg once daily",
  "notes": "Patient to follow up in 2 weeks. Monitor blood pressure daily.",
  "scans": []
}
```

---

### 2. Get Patient's Medical Records

**Request:**
```http
GET /api/medicalrecords/patient/1 HTTP/1.1
Host: localhost:5001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
[
  {
    "medicalRecordId": 1,
    "patientId": 1,
    "diagnosis": "Hypertension",
    "recordDate": "2026-03-25T14:30:00",
    "symptoms": "High blood pressure readings",
    "treatment": "Prescribed antihypertensive medication",
    "prescriptions": "Lisinopril 10mg, Amlodipine 5mg",
    "notes": "Follow up in 2 weeks",
    "scans": [
      {
        "scanId": 1,
        "medicalRecordId": 1,
        "scanType": "CT Scan - Chest",
        "scanDate": "2026-03-25T15:00:00",
        "filePath": "/scans/2026/03/ct_chest_001.dcm",
        "diagnosis": "No abnormalities detected",
        "status": "Completed"
      }
    ]
  }
]
```

---

### 3. Update Medical Record

**Request:**
```http
PUT /api/medicalrecords/1 HTTP/1.1
Host: localhost:5001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "treatment": "Continue current medication, increase monitoring",
  "notes": "Patient shows improvement. Blood pressure stabilizing."
}
```

---

## 🖼️ Scan Endpoints

### 1. Add Scan to Medical Record

**Note**: Scans are typically added through medical records but can be managed separately.

---

## ❌ Error Response Examples

### 400 Bad Request (Validation Error)

**Request** (missing required field):
```http
POST /api/patients HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{
  "firstName": "John",
  "age": 30
}
```

**Response (400):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "LastName": ["The LastName field is required."],
    "Gender": ["The Gender field is required."],
    "Email": ["The Email field is required."]
  }
}
```

---

### 401 Unauthorized (No Token)

**Response (401):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7235#section-3.1",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Authorization header with JWT token is required."
}
```

---

### 403 Forbidden (Insufficient Permissions)

**Request** (non-admin trying to create doctor):
```http
POST /api/doctors HTTP/1.1
Host: localhost:5001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Patient token)

{...}
```

**Response (403):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403,
  "detail": "You do not have permission to access this resource."
}
```

---

### 404 Not Found

**Response (404):**
```json
null
```

---

## 🧪 Testing Workflow

1. **Register**: POST `/api/auth/register` → Get tokens
2. **Login**: POST `/api/auth/login` → Get tokens
3. **Create Doctor**: POST `/api/doctors` (Admin)
4. **Register Patient**: POST `/api/patients`
5. **Create Appointment**: POST `/api/appointments`
6. **Create Medical Record**: POST `/api/medicalrecords` (Doctor)
7. **Update Status**: PUT `/api/appointments/1` → Mark as completed
8. **View Records**: GET `/api/medicalrecords/patient/1`
9. **Refresh Token**: POST `/api/auth/refresh-token` when expired
10. **Logout**: POST `/api/auth/logout` → Revoke refresh token

---

## 📨 Using Postman

1. Import `PostmanCollection.json`
2. Create environment with variables:
   ```
   access_token = (from login response)
   refresh_token = (from login response)
   doctor_id = 1
   patient_id = 1
   appointment_id = 1
   ```
3. Use `{{variable_name}}` in requests
4. Update variables from responses automatically

---

**All requests tested and working! ✅**
