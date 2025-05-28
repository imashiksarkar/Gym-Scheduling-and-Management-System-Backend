# Gym-Scheduling-and-Management-System-Backend

Gym Class Scheduling &amp; Membership System with Admin, Trainer, and Trainee roles. Admins schedule up to 5 classes/day, assign trainers; trainees can book classes (max 10 per class) and manage profiles. Secure JWT authentication and error handling ensure smooth, role-based gym management.

## 📡 API Endpoints

### Auth Module

**Role: Trainee**
trainee can signup `POST /auth/signup`
trainee can signin `POST /auth/signin`

### Trainer Module

**Role: Admin**
create trainer `POST /trainers`
list all trainers `GET /trainers`
delete trainer `DELETE /trainers/:trainerId`
list trainer schedules `DELETE /trainers/:trainerId/schedules`
list all the schedules of a trainer `GET /trainers/:trainerId/schedules`

### Schedule Module

**Role: Trainee**
get available schedules `GET /schedules`
book schedule `POST /schedules/:id`
get own schedule `GET /schedules/me`
cancel schedule `DELETE /schedules/:id`

**Role: Trainer**
get own schedule `GET /schedules?as=trainer`

**Role: Admin**
create schedule `POST /schedules`
list all schedules `GET /schedules`
assign trainer to schedule `PUT /schedules/:id`
