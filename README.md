# Gym-Scheduling-and-Management-System-Backend

Gym Class Scheduling &amp; Membership System with Admin, Trainer, and Trainee roles. Admins schedule up to 5 classes/day, assign trainers; trainees can book classes (max 10 per class) and manage profiles. Secure JWT authentication and error handling ensure smooth, role-based gym management.

## 📡 API Endpoints

---

### Auth Module

- [x] signup as trainee `POST /auth/signup`
- [x] user can signin `POST /auth/signin`
- [x] fetch own profile `GET /auth/profile`
- [x] refresh token `GET /auth/refresh`
- [x] signout `DELETE /auth/signout`
- [x] fetch all allowed roles `GET /auth/roles`

- **Role: Admin**
  - [x] fetch all users `GET /auth/users`
  - [x] fetch a single user `GET /auth/users/userId`

---

### Trainer Module

- [x] list all trainers `GET /trainers`
- [x] get a single trainer `GET /trainers/:trainerId`
- [x] list trainer schedules `GET /trainers/:trainerId/schedules`

- **Role: Admin**

  - [x] create trainer `POST /trainers`
  - [x] delete trainer `DELETE /trainers/:trainerId`

- **Role: Trainer**
  - [x] get own schedules as trainer `GET /trainers/schedules`

---

### Schedule Module

- [x] list all schedules `GET /schedules`
- [ ] list all available schedules `GET /schedules/available` <!-- also that is not booked by more that 10 trainees -->
- [x] get a single schedule `GET /schedules/:scheduleId`
- [ ] get trainees who booked the schedule `GET /schedules/:scheduleId/trainees`

- **Role: Admin**

  - [x] create schedule `POST /schedules`
  - [x] update trainer of a schedule `PATCH /schedules/:scheduleId`
  - [x] delete schedule `DELETE /schedules/:scheduleId`
  - [ ] get trainees who booked a schedule `GET /schedules/:scheduleId/trainees`

- **Role: Trainee**
  - [ ] check if schedule is full (trainee-side) `GET /schedules/:id/status`

---

### Booking Module

- **Role: Trainee**

  - [ ] book a schedule `POST /bookings` // max 10 trainee can book per schedule

  ```json
  // input payload
  {
    "scheduleId": "",
    "traineeId": ""
  }
  ```

  - list own bookings `GET /bookings`
  - [ ] get a single booking `GET /bookings/:bookingId`
  - [ ] cancel booking `DELETE /bookings/:id`

- **Role: Admin**
  - [ ] list all bookings `GET /bookings`
  - [ ] get a single booking `GET /bookings/:bookingId`

---

## Response Structures

```json
// success output
{
  "success": true,
  "code": 200,
  "status": "Ok",
  "data": {}, // object or array
  "message": [""], // optional
}

// error output
{
  "success": false,
  "code": 401,
  "status": "Unauthorized",
  "error": {
    "fields": { // optional
      "email": ["Email is required"], // optional
      "password": ["Password is required"]
      },
    "message": ["Invalid credentials"]
  }
}

{
  "success": false,
  "code": 409,
  "status": "Conflict",
  "error": {
    "message": [
      "You can't create more than 5 schedules per day."
    ]
  }
}
```
