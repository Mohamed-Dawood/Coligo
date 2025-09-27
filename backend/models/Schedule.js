import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide student'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please provide course'],
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: [true, 'Please provide day'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time'],
    },
    room: {
      type: String,
      required: [true, 'Please provide room'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide instructor'],
    },
    semester: {
      type: String,
      required: [true, 'Please provide semester'],
      default: 'Fall 2024',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
