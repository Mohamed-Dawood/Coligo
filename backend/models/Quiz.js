import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide quiz title'],
    },
    description: {
      type: String,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please provide course'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide instructor'],
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: [String],
        correctAnswer: {
          type: String,
          required: true,
        },
        points: {
          type: Number,
          default: 1,
        },
      },
    ],
    totalPoints: {
      type: Number,
      default: 0,
    },
    timeLimit: {
      type: Number, // in minutes
      default: 60,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attempts: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        answers: [String],
        score: Number,
        submittedAt: Date,
        timeSpent: Number, // in minutes
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

// Calculate total points before saving
quizSchema.pre('save', function () {
  this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
});

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
