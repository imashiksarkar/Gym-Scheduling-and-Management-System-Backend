# Gym-Scheduling-and-Management-System-Backend

Gym Class Scheduling &amp; Membership System with Admin, Trainer, and Trainee roles. Admins schedule up to 5 classes/day, assign trainers; trainees can book classes (max 10 per class) and manage profiles. Secure JWT authentication and error handling ensure smooth, role-based gym management.

## 📡 API Endpoints

---

### Auth Module

- [x] trainee can signup `POST /auth/signup`
- [x] trainee can signin `POST /auth/signin`
- [x] fetch own profile `GET /auth/profile`
- [x] refresh token `GET /auth/refresh`
- [x] signout `DELETE /auth/signout`
- [x] fetch all allowed roles `GET /auth/roles`

- **Role: Admin**
  - [x] fetch all users `GET /auth/users`
  - [x] fetch a single user `GET /auth/users/userId`

---

### Trainer Module

- **Role: Admin**
  - [x] create trainer `POST /trainers`
  - [x] list all trainers `GET /trainers`
  - [ ] delete trainer `DELETE /trainers/:trainerId`
  - [ ] list trainer schedules `DELETE /trainers/:trainerId/schedules`
  - [ ] list all the schedules of a trainer `GET /trainers/:trainerId/schedules`

---

### Schedule Module

- **Role: Trainee**

  - [ ] get available schedules `GET /schedules`
  - [ ] book schedule `POST /schedules/:id`
  - [ ] get own schedule `GET /schedules/me`
  - [ ] cancel schedule `DELETE /schedules/:id`

- **Role: Trainer**

  get own schedule `GET /schedules?as=trainer`

- **Role: Admin**

  create schedule `POST /schedules`
  list all schedules `GET /schedules`
  assign trainer to schedule `PUT /schedules/:id`

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
```
