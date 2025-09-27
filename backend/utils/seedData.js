import User from '../models/User.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Announcement from '../models/Announcement.js';
import Grade from '../models/Grade.js';
import Schedule from '../models/Schedule.js';

export const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Quiz.deleteMany({});
    await Announcement.deleteMany({});
    await Grade.deleteMany({});
    await Schedule.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create Users
    const users = await User.create([
      // Admin
      {
        name: 'Admin User',
        email: 'admin@university.edu',
        password: 'password123',
        role: 'admin',
        department: 'Administration',
        phone: '+1234567890',
        address: '123 Admin St, University City',
      },
      // Teachers
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        password: 'password123',
        role: 'teacher',
        department: 'Computer Science',
        phone: '+1234567891',
        address: '456 Teacher Ave, University City',
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@university.edu',
        password: 'password123',
        role: 'teacher',
        department: 'Mathematics',
        phone: '+1234567892',
        address: '789 Professor Blvd, University City',
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@university.edu',
        password: 'password123',
        role: 'teacher',
        department: 'Physics',
        phone: '+1234567893',
        address: '321 Science St, University City',
      },
      // Students
      {
        name: 'John Smith',
        email: 'john.smith@student.university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU001',
        semester: 'Fall 2024',
        department: 'Computer Science',
        phone: '+1234567894',
        address: '654 Student St, University City',
      },
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@student.university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU002',
        semester: 'Fall 2024',
        department: 'Computer Science',
        phone: '+1234567895',
        address: '987 College Ave, University City',
      },
      {
        name: 'Bob Wilson',
        email: 'bob.wilson@student.university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU003',
        semester: 'Fall 2024',
        department: 'Mathematics',
        phone: '+1234567896',
        address: '147 University Dr, University City',
      },
      {
        name: 'Carol Davis',
        email: 'carol.davis@student.university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU004',
        semester: 'Fall 2024',
        department: 'Physics',
        phone: '+1234567897',
        address: '258 Campus Rd, University City',
      },
      {
        name: 'David Brown',
        email: 'david.brown@student.university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU005',
        semester: 'Fall 2024',
        department: 'Computer Science',
        phone: '+1234567898',
        address: '369 Student Pl, University City',
      },
    ]);

    console.log('👥 Created users');

    // Create Courses
    const courses = await Course.create([
      {
        courseCode: 'CS101',
        courseName: 'Introduction to Programming',
        description: 'Basic programming concepts using Python',
        credits: 3,
        semester: 'Fall 2024',
        department: 'Computer Science',
        instructor: users[1]._id, // Dr. Sarah Johnson
        students: [users[4]._id, users[5]._id, users[8]._id], // John, Alice, David
        schedule: {
          day: 'Monday',
          startTime: '09:00',
          endTime: '10:30',
          room: 'CS101',
        },
      },
      {
        courseCode: 'CS201',
        courseName: 'Data Structures and Algorithms',
        description: 'Advanced programming concepts and data structures',
        credits: 4,
        semester: 'Fall 2024',
        department: 'Computer Science',
        instructor: users[1]._id, // Dr. Sarah Johnson
        students: [users[4]._id, users[5]._id, users[8]._id], // John, Alice, David
        schedule: {
          day: 'Wednesday',
          startTime: '11:00',
          endTime: '12:30',
          room: 'CS201',
        },
      },
      {
        courseCode: 'MATH101',
        courseName: 'Calculus I',
        description: 'Introduction to differential and integral calculus',
        credits: 4,
        semester: 'Fall 2024',
        department: 'Mathematics',
        instructor: users[2]._id, // Prof. Michael Chen
        students: [users[6]._id, users[7]._id], // Bob, Carol
        schedule: {
          day: 'Tuesday',
          startTime: '10:00',
          endTime: '11:30',
          room: 'MATH101',
        },
      },
      {
        courseCode: 'PHYS101',
        courseName: 'General Physics I',
        description: 'Mechanics, thermodynamics, and waves',
        credits: 4,
        semester: 'Fall 2024',
        department: 'Physics',
        instructor: users[3]._id, // Dr. Emily Rodriguez
        students: [users[6]._id, users[7]._id], // Bob, Carol
        schedule: {
          day: 'Thursday',
          startTime: '14:00',
          endTime: '15:30',
          room: 'PHYS101',
        },
      },
    ]);

    console.log('📚 Created courses');

    // Create Schedules
    const schedules = await Schedule.create([
      // CS101 Schedule
      {
        student: users[4]._id, // John Smith
        course: courses[0]._id, // CS101
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'CS101',
        instructor: users[1]._id, // Dr. Sarah Johnson
        semester: 'Fall 2024',
      },
      {
        student: users[5]._id, // Alice Johnson
        course: courses[0]._id, // CS101
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'CS101',
        instructor: users[1]._id, // Dr. Sarah Johnson
        semester: 'Fall 2024',
      },
      {
        student: users[8]._id, // David Brown
        course: courses[0]._id, // CS101
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'CS101',
        instructor: users[1]._id, // Dr. Sarah Johnson
        semester: 'Fall 2024',
      },
      // CS201 Schedule
      {
        student: users[4]._id, // John Smith
        course: courses[1]._id, // CS201
        day: 'Wednesday',
        startTime: '11:00',
        endTime: '12:30',
        room: 'CS201',
        instructor: users[1]._id, // Dr. Sarah Johnson
        semester: 'Fall 2024',
      },
      {
        student: users[5]._id, // Alice Johnson
        course: courses[1]._id, // CS201
        day: 'Wednesday',
        startTime: '11:00',
        endTime: '12:30',
        room: 'CS201',
        instructor: users[1]._id, // Dr. Sarah Johnson
        semester: 'Fall 2024',
      },
      {
        student: users[8]._id, // David Brown
        course: courses[1]._id, // CS201
        day: 'Wednesday',
        startTime: '11:00',
        endTime: '12:30',
        room: 'CS201',
        instructor: users[1]._id, // Dr. Sarah Johnson
        semester: 'Fall 2024',
      },
      // MATH101 Schedule
      {
        student: users[6]._id, // Bob Wilson
        course: courses[2]._id, // MATH101
        day: 'Tuesday',
        startTime: '10:00',
        endTime: '11:30',
        room: 'MATH101',
        instructor: users[2]._id, // Prof. Michael Chen
        semester: 'Fall 2024',
      },
      {
        student: users[7]._id, // Carol Davis
        course: courses[2]._id, // MATH101
        day: 'Tuesday',
        startTime: '10:00',
        endTime: '11:30',
        room: 'MATH101',
        instructor: users[2]._id, // Prof. Michael Chen
        semester: 'Fall 2024',
      },
      // PHYS101 Schedule
      {
        student: users[6]._id, // Bob Wilson
        course: courses[3]._id, // PHYS101
        day: 'Thursday',
        startTime: '14:00',
        endTime: '15:30',
        room: 'PHYS101',
        instructor: users[3]._id, // Dr. Emily Rodriguez
        semester: 'Fall 2024',
      },
      {
        student: users[7]._id, // Carol Davis
        course: courses[3]._id, // PHYS101
        day: 'Thursday',
        startTime: '14:00',
        endTime: '15:30',
        room: 'PHYS101',
        instructor: users[3]._id, // Dr. Emily Rodriguez
        semester: 'Fall 2024',
      },
    ]);

    console.log('📅 Created schedules');

    // Create Quizzes
    const quizzes = await Quiz.create([
      {
        title: 'Python Basics Quiz',
        description: 'Quiz covering basic Python programming concepts',
        course: courses[0]._id, // CS101
        instructor: users[1]._id, // Dr. Sarah Johnson
        questions: [
          {
            question: 'What is the correct way to create a variable in Python?',
            options: ['var x = 5', 'x = 5', 'int x = 5', 'x := 5'],
            correctAnswer: 'x = 5',
            points: 2,
          },
          {
            question: 'Which keyword is used to define a function in Python?',
            options: ['function', 'def', 'func', 'define'],
            correctAnswer: 'def',
            points: 2,
          },
          {
            question: 'What is the output of print(3 + 2 * 4)?',
            options: ['20', '11', '14', 'Error'],
            correctAnswer: '11',
            points: 3,
          },
        ],
        timeLimit: 30,
        startDate: new Date('2024-12-01T09:00:00Z'),
        endDate: new Date('2024-12-01T11:00:00Z'),
      },
      {
        title: 'Data Structures Quiz',
        description: 'Quiz on arrays, linked lists, and stacks',
        course: courses[1]._id, // CS201
        instructor: users[1]._id, // Dr. Sarah Johnson
        questions: [
          {
            question: 'What is the time complexity of accessing an element in an array?',
            options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
            correctAnswer: 'O(1)',
            points: 2,
          },
          {
            question: 'Which data structure follows LIFO principle?',
            options: ['Queue', 'Stack', 'Array', 'Linked List'],
            correctAnswer: 'Stack',
            points: 2,
          },
        ],
        timeLimit: 45,
        startDate: new Date('2024-12-05T10:00:00Z'),
        endDate: new Date('2024-12-05T12:00:00Z'),
      },
      {
        title: 'Calculus Derivatives Quiz',
        description: 'Quiz on basic derivative rules and applications',
        course: courses[2]._id, // MATH101
        instructor: users[2]._id, // Prof. Michael Chen
        questions: [
          {
            question: 'What is the derivative of x²?',
            options: ['x', '2x', 'x²', '2x²'],
            correctAnswer: '2x',
            points: 3,
          },
          {
            question: 'What is the derivative of sin(x)?',
            options: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'],
            correctAnswer: 'cos(x)',
            points: 3,
          },
        ],
        timeLimit: 60,
        startDate: new Date('2024-12-03T10:00:00Z'),
        endDate: new Date('2024-12-03T12:00:00Z'),
      },
    ]);

    console.log('📝 Created quizzes');

    // Create Announcements
    const announcements = await Announcement.create([
      {
        title: 'Welcome to Fall 2024 Semester!',
        content: 'Welcome all students to the Fall 2024 semester. Please check your schedules and course materials.',
        author: users[0]._id, // Admin
        targetAudience: 'all',
        priority: 'high',
        expiresAt: new Date('2024-12-31T23:59:59Z'),
      },
      {
        title: 'CS101 Assignment Due',
        content: 'Your first programming assignment is due next Friday. Please submit through the online portal.',
        author: users[1]._id, // Dr. Sarah Johnson
        course: courses[0]._id, // CS101
        targetAudience: 'specific_course',
        priority: 'medium',
        expiresAt: new Date('2024-12-15T23:59:59Z'),
      },
      {
        title: 'Midterm Exam Schedule',
        content: 'Midterm exams will be held from December 10-15. Please check your individual schedules.',
        author: users[0]._id, // Admin
        targetAudience: 'students',
        priority: 'high',
        expiresAt: new Date('2024-12-20T23:59:59Z'),
      },
      {
        title: 'Library Hours Extended',
        content: 'The university library will have extended hours during exam period: 7 AM - 11 PM.',
        author: users[0]._id, // Admin
        targetAudience: 'all',
        priority: 'low',
        expiresAt: new Date('2024-12-20T23:59:59Z'),
      },
    ]);

    console.log('📢 Created announcements');

    // Create Grades
    const grades = await Grade.create([
      // John Smith's grades
      {
        student: users[4]._id, // John Smith
        course: courses[0]._id, // CS101
        gradeType: 'assignment',
        title: 'Python Basics Assignment',
        pointsEarned: 85,
        totalPoints: 100,
        feedback: 'Good work! Pay attention to variable naming conventions.',
        gradedBy: users[1]._id, // Dr. Sarah Johnson
        semester: 'Fall 2024',
      },
      {
        student: users[4]._id, // John Smith
        course: courses[1]._id, // CS201
        gradeType: 'quiz',
        title: 'Data Structures Quiz 1',
        pointsEarned: 18,
        totalPoints: 20,
        feedback: 'Excellent understanding of data structures!',
        gradedBy: users[1]._id, // Dr. Sarah Johnson
        semester: 'Fall 2024',
      },
      // Alice Johnson's grades
      {
        student: users[5]._id, // Alice Johnson
        course: courses[0]._id, // CS101
        gradeType: 'assignment',
        title: 'Python Basics Assignment',
        pointsEarned: 92,
        totalPoints: 100,
        feedback: 'Outstanding work! Very clean and efficient code.',
        gradedBy: users[1]._id, // Dr. Sarah Johnson
        semester: 'Fall 2024',
      },
      {
        student: users[5]._id, // Alice Johnson
        course: courses[1]._id, // CS201
        gradeType: 'quiz',
        title: 'Data Structures Quiz 1',
        pointsEarned: 19,
        totalPoints: 20,
        feedback: 'Perfect! Great understanding of algorithms.',
        gradedBy: users[1]._id, // Dr. Sarah Johnson
        semester: 'Fall 2024',
      },
      // Bob Wilson's grades
      {
        student: users[6]._id, // Bob Wilson
        course: courses[2]._id, // MATH101
        gradeType: 'quiz',
        title: 'Calculus Quiz 1',
        pointsEarned: 15,
        totalPoints: 20,
        feedback: 'Good effort. Review the chain rule for next time.',
        gradedBy: users[2]._id, // Prof. Michael Chen
        semester: 'Fall 2024',
      },
      {
        student: users[6]._id, // Bob Wilson
        course: courses[3]._id, // PHYS101
        gradeType: 'assignment',
        title: 'Mechanics Problem Set',
        pointsEarned: 78,
        totalPoints: 100,
        feedback: 'Good understanding of concepts. Check your calculations.',
        gradedBy: users[3]._id, // Dr. Emily Rodriguez
        semester: 'Fall 2024',
      },
      // Carol Davis's grades
      {
        student: users[7]._id, // Carol Davis
        course: courses[2]._id, // MATH101
        gradeType: 'quiz',
        title: 'Calculus Quiz 1',
        pointsEarned: 18,
        totalPoints: 20,
        feedback: 'Excellent work! Very clear solutions.',
        gradedBy: users[2]._id, // Prof. Michael Chen
        semester: 'Fall 2024',
      },
      {
        student: users[7]._id, // Carol Davis
        course: courses[3]._id, // PHYS101
        gradeType: 'assignment',
        title: 'Mechanics Problem Set',
        pointsEarned: 95,
        totalPoints: 100,
        feedback: 'Outstanding! Perfect understanding of physics principles.',
        gradedBy: users[3]._id, // Dr. Emily Rodriguez
        semester: 'Fall 2024',
      },
      // David Brown's grades
      {
        student: users[8]._id, // David Brown
        course: courses[0]._id, // CS101
        gradeType: 'assignment',
        title: 'Python Basics Assignment',
        pointsEarned: 88,
        totalPoints: 100,
        feedback: 'Good work! Consider adding more comments to your code.',
        gradedBy: users[1]._id, // Dr. Sarah Johnson
        semester: 'Fall 2024',
      },
      {
        student: users[8]._id, // David Brown
        course: courses[1]._id, // CS201
        gradeType: 'quiz',
        title: 'Data Structures Quiz 1',
        pointsEarned: 16,
        totalPoints: 20,
        feedback: 'Good attempt. Review time complexity concepts.',
        gradedBy: users[1]._id, // Dr. Sarah Johnson
        semester: 'Fall 2024',
      },
    ]);

    console.log('📊 Created grades');

    console.log('✅ Data seeding completed successfully!');
    console.log(`👥 Created ${users.length} users`);
    console.log(`📚 Created ${courses.length} courses`);
    console.log(`📅 Created ${schedules.length} schedules`);
    console.log(`📝 Created ${quizzes.length} quizzes`);
    console.log(`📢 Created ${announcements.length} announcements`);
    console.log(`📊 Created ${grades.length} grades`);

    return {
      users,
      courses,
      schedules,
      quizzes,
      announcements,
      grades,
    };
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

export default seedData;
