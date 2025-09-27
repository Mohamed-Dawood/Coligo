import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide announcement title'],
    },
    content: {
      type: String,
      required: [true, 'Please provide announcement content'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide author'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'teachers', 'specific_course'],
      default: 'all',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
    attachments: [
      {
        filename: String,
        fileUrl: String,
        fileSize: Number,
      },
    ],
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
