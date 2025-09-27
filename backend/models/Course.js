import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Please provide course code'],
      unique: true,
      uppercase: true,
    },
    courseName: {
      type: String,
      required: [true, 'Please provide course name'],
    },
    description: {
      type: String,
    },
    credits: {
      type: Number,
      required: [true, 'Please provide course credits'],
      min: 1,
      max: 6,
    },
    semester: {
      type: String,
      required: [true, 'Please provide semester'],
      default: 'Fall 2024',
    },
    department: {
      type: String,
      required: [true, 'Please provide department'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide instructor'],
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    schedule: {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      startTime: String,
      endTime: String,
      room: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
