import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
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
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
    gradeType: {
      type: String,
      enum: ['quiz', 'assignment', 'exam', 'project', 'participation'],
      required: [true, 'Please provide grade type'],
    },
    title: {
      type: String,
      required: [true, 'Please provide grade title'],
    },
    pointsEarned: {
      type: Number,
      required: [true, 'Please provide points earned'],
      min: 0,
    },
    totalPoints: {
      type: Number,
      required: [true, 'Please provide total points'],
      min: 1,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    letterGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
    },
    feedback: {
      type: String,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide grader'],
    },
    gradedAt: {
      type: Date,
      default: Date.now,
    },
    semester: {
      type: String,
      required: [true, 'Please provide semester'],
    },
  },
  { versionKey: false, timestamps: true }
);

// Calculate percentage and letter grade before saving
gradeSchema.pre('save', function () {
  this.percentage = Math.round((this.pointsEarned / this.totalPoints) * 100);
  
  // Calculate letter grade based on percentage
  if (this.percentage >= 97) this.letterGrade = 'A+';
  else if (this.percentage >= 93) this.letterGrade = 'A';
  else if (this.percentage >= 90) this.letterGrade = 'A-';
  else if (this.percentage >= 87) this.letterGrade = 'B+';
  else if (this.percentage >= 83) this.letterGrade = 'B';
  else if (this.percentage >= 80) this.letterGrade = 'B-';
  else if (this.percentage >= 77) this.letterGrade = 'C+';
  else if (this.percentage >= 73) this.letterGrade = 'C';
  else if (this.percentage >= 70) this.letterGrade = 'C-';
  else if (this.percentage >= 67) this.letterGrade = 'D+';
  else if (this.percentage >= 65) this.letterGrade = 'D';
  else if (this.percentage >= 60) this.letterGrade = 'D-';
  else this.letterGrade = 'F';
});

const Grade = mongoose.model('Grade', gradeSchema);
export default Grade;
