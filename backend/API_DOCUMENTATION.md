# API Documentation

## Base URL

```
http://localhost:3030/api/v1
```

## Authentication

### Authentication Endpoints

#### Login

```http
POST /auth/login
```

Request Body:

```json
{
  "email": "string",
  "password": "string"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "string",
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "student" | "teacher" | "admin"
    }
  }
}
```

#### Register

```http
POST /auth/register
```

Request Body:

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "student" | "teacher" | "admin",
  "studentId": "string" // required for students
}
```

Response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
}
```

## Dashboard

### Dashboard Endpoints

#### Get Student Dashboard

```http
GET /dashboard/student
```

Query Parameters:

```
semester: string (optional)
```

Response:

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "overview": {
      "totalCourses": "number",
      "totalQuizzes": "number",
      "completedQuizzes": "number",
      "averageGrade": "number"
    },
    "announcements": "Array<Announcement>",
    "todaysSchedule": "Array<Schedule>",
    "recentGrades": "Array<Grade>"
  }
}
```

#### Get Teacher Dashboard

```http
GET /dashboard/teacher
```

Query Parameters:

```
semester: string (optional)
```

Response:

```json
{
  "success": true,
  "message": "Teacher dashboard data retrieved successfully",
  "data": {
    "overview": {
      "totalCourses": "number",
      "totalStudents": "number",
      "totalQuizzes": "number",
      "pendingGrades": "number"
    },
    "courses": "Array<Course>",
    "recentQuizzes": "Array<Quiz>",
    "announcements": "Array<Announcement>",
    "pendingGrades": "Array<Grade>"
  }
}
```

## Courses

### Course Endpoints

#### Get All Courses

```http
GET /courses
```

Query Parameters:

```
semester: string (optional)
department: string (optional)
instructor: string (optional)
```

Response:

```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "_id": "string",
        "courseName": "string",
        "courseCode": "string",
        "department": "string",
        "instructor": "User",
        "students": "Array<User>",
        "semester": "string",
        "schedule": "Array<Schedule>",
        "description": "string"
      }
    ]
  }
}
```

#### Get Course By ID

```http
GET /courses/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "course": {
      "_id": "string",
      "courseName": "string",
      "courseCode": "string",
      "department": "string",
      "instructor": "User",
      "students": "Array<User>",
      "semester": "string",
      "schedule": "Array<Schedule>",
      "description": "string"
    }
  }
}
```

## Announcements

### Announcement Endpoints

#### Get Announcements

```http
GET /announcements
```

Query Parameters:

```
targetAudience: string (optional)
courseId: string (optional)
priority: string (optional)
author: string (optional)
```

Response:

```json
{
  "success": true,
  "data": {
    "announcements": [
      {
        "_id": "string",
        "title": "string",
        "content": "string",
        "author": "User",
        "targetAudience": "string",
        "priority": "low" | "medium" | "high",
        "course": "Course",
        "createdAt": "date",
        "expiresAt": "date"
      }
    ]
  }
}
```

## Schedule

### Schedule Endpoints

#### Get Schedule

```http
GET /schedule
```

Query Parameters:

```
semester: string (optional)
day: string (optional)
```

Response:

```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "_id": "string",
        "course": "Course",
        "instructor": "User",
        "day": "string",
        "startTime": "string",
        "endTime": "string",
        "room": "string",
        "semester": "string"
      }
    ]
  }
}
```

## Gradebook

### Gradebook Endpoints

#### Get Student Grades

```http
GET /gradebook/student
```

Query Parameters:

```
semester: string (optional)
courseId: string (optional)
gradeType: string (optional)
```

Response:

```json
{
  "success": true,
  "data": {
    "grades": [
      {
        "_id": "string",
        "student": "User",
        "course": "Course",
        "gradeType": "string",
        "grade": "number",
        "percentage": "number",
        "gradedBy": "User",
        "gradedAt": "date"
      }
    ]
  }
}
```

## Quiz

### Quiz Endpoints

#### Get Quizzes

```http
GET /quizzes
```

Query Parameters:

```
courseId: string (optional)
instructor: string (optional)
isActive: boolean (optional)
semester: string (optional)
```

Response:

```json
{
  "success": true,
  "data": {
    "quizzes": [
      {
        "_id": "string",
        "title": "string",
        "course": "Course",
        "instructor": "User",
        "startDate": "date",
        "endDate": "date",
        "duration": "number",
        "totalMarks": "number",
        "questions": "Array<Question>",
        "isActive": "boolean"
      }
    ]
  }
}
```

## Error Responses

### Common Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "string",
  "error": "Error details"
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

## Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limiting

API requests are rate limited to prevent abuse. The current limits are:

- 100 requests per IP per minute
- 1000 requests per IP per hour

## Data Types

### User

```typescript
{
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  studentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Course

```typescript
{
  _id: string;
  courseName: string;
  courseCode: string;
  department: string;
  instructor: User;
  students: User[];
  semester: string;
  schedule: Schedule[];
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Announcement

```typescript
{
  _id: string;
  title: string;
  content: string;
  author: User;
  targetAudience: string;
  priority: "low" | "medium" | "high";
  course?: Course;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Schedule

```typescript
{
  _id: string;
  course: Course;
  instructor: User;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  semester: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Grade

```typescript
{
  _id: string;
  student: User;
  course: Course;
  gradeType: string;
  grade: number;
  percentage: number;
  gradedBy: User;
  gradedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```
