import axios from 'axios';
import { safeGetItem, safeRemoveItem } from '../utils/localStorage';

const API_BASE_URL = 'http://localhost:3030/api/v1';

class ApiService {
  private axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = safeGetItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          safeRemoveItem('token');
          safeRemoveItem('user');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.axiosInstance.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.axiosInstance.post('/auth/login', credentials);
  }

  async register(userData: any) {
    return this.axiosInstance.post('/auth/register', userData);
  }

  async getAllUsers() {
    return this.axiosInstance.get('/auth');
  }

  // Dashboard endpoints
  async getStudentDashboard(semester?: string) {
    return this.axiosInstance.get('/dashboard/student', {
      params: { semester },
    });
  }

  async getTeacherDashboard(semester?: string) {
    return this.axiosInstance.get('/dashboard/teacher', {
      params: { semester },
    });
  }

  async getAdminDashboard(semester?: string) {
    return this.axiosInstance.get('/dashboard/admin', {
      params: { semester },
    });
  }

  // Schedule endpoints
  async getSchedule(params?: { semester?: string; day?: string }) {
    return this.axiosInstance.get('/schedule', { params });
  }

  async getTodaySchedule(semester?: string) {
    return this.axiosInstance.get('/schedule/today', {
      params: { semester },
    });
  }

  async getWeeklySchedule(semester?: string) {
    return this.axiosInstance.get('/schedule/weekly', {
      params: { semester },
    });
  }

  async getScheduleByDay(day: string, semester?: string) {
    return this.axiosInstance.get(`/schedule/day/${day}`, {
      params: { semester },
    });
  }

  async createSchedule(scheduleData: any) {
    return this.axiosInstance.post('/schedule', scheduleData);
  }

  async updateSchedule(id: string, scheduleData: any) {
    return this.axiosInstance.put(`/schedule/${id}`, scheduleData);
  }

  async deleteSchedule(id: string) {
    return this.axiosInstance.delete(`/schedule/${id}`);
  }

  // Course endpoints
  async getCourses(params?: {
    semester?: string;
    department?: string;
    instructor?: string;
  }) {
    return this.axiosInstance.get('/courses', { params });
  }

  async getCourseById(id: string) {
    return this.axiosInstance.get(`/courses/${id}`);
  }

  async getCoursesByDepartment(department: string, semester?: string) {
    return this.axiosInstance.get(`/courses/department/${department}`, {
      params: { semester },
    });
  }

  async getCourseSchedule(id: string, semester?: string) {
    return this.axiosInstance.get(`/courses/${id}/schedule`, {
      params: { semester },
    });
  }

  async createCourse(courseData: any) {
    return this.axiosInstance.post('/courses', courseData);
  }

  async updateCourse(id: string, courseData: any) {
    return this.axiosInstance.put(`/courses/${id}`, courseData);
  }

  async enrollStudent(courseId: string, studentId: string) {
    if (!courseId || !studentId) {
      throw new Error('Course ID and Student ID are required');
    }
    // Ensure the courseId is valid before making the request
    const sanitizedCourseId = courseId.trim();
    if (!sanitizedCourseId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid course ID format');
    }

    const response = await this.axiosInstance.post(
      `/courses/${sanitizedCourseId}/enroll`,
      { studentId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response;
  }

  async removeStudent(courseId: string, studentId: string) {
    return this.axiosInstance.post(`/courses/${courseId}/remove`, {
      studentId,
    });
  }

  async deleteCourse(id: string) {
    return this.axiosInstance.delete(`/courses/${id}`);
  }

  // Gradebook endpoints
  async getStudentGrades(params?: {
    semester?: string;
    courseId?: string;
    gradeType?: string;
  }) {
    return this.axiosInstance.get('/gradebook/student', { params });
  }

  async getStudentCourseGrades(courseId: string, semester?: string) {
    return this.axiosInstance.get(`/gradebook/student/course/${courseId}`, {
      params: { semester },
    });
  }

  async getCourseGrades(
    courseId: string,
    params?: {
      semester?: string;
      studentId?: string;
    }
  ) {
    return this.axiosInstance.get(`/gradebook/course/${courseId}`, { params });
  }

  async getGradeStatistics(courseId: string, semester?: string) {
    return this.axiosInstance.get(`/gradebook/course/${courseId}/statistics`, {
      params: { semester },
    });
  }

  async addGrade(gradeData: any) {
    return this.axiosInstance.post('/gradebook', gradeData);
  }

  async updateGrade(id: string, gradeData: any) {
    return this.axiosInstance.put(`/gradebook/${id}`, gradeData);
  }

  async deleteGrade(id: string) {
    return this.axiosInstance.delete(`/gradebook/${id}`);
  }

  // Performance endpoints
  async getStudentPerformance(semester?: string) {
    return this.axiosInstance.get('/performance/student', {
      params: { semester },
    });
  }

  async getCoursePerformance(courseId: string, semester?: string) {
    return this.axiosInstance.get(`/performance/course/${courseId}`, {
      params: { semester },
    });
  }

  async getPerformanceComparison(semester?: string) {
    return this.axiosInstance.get('/performance/comparison', {
      params: { semester },
    });
  }

  async getAttendancePerformance(semester?: string) {
    return this.axiosInstance.get('/performance/attendance', {
      params: { semester },
    });
  }

  async getPerformanceInsights(semester?: string) {
    return this.axiosInstance.get('/performance/insights', {
      params: { semester },
    });
  }

  // Announcement endpoints
  async getAnnouncements(params?: {
    targetAudience?: string;
    courseId?: string;
    priority?: string;
    author?: string;
  }) {
    return this.axiosInstance.get('/announcements', { params });
  }

  async getUnreadAnnouncements(params?: {
    targetAudience?: string;
    courseId?: string;
  }) {
    return this.axiosInstance.get('/announcements/unread', { params });
  }

  async getAnnouncementById(id: string) {
    return this.axiosInstance.get(`/announcements/${id}`);
  }

  async getAnnouncementStats(params?: {
    author?: string;
    courseId?: string;
    semester?: string;
  }) {
    return this.axiosInstance.get('/announcements/stats', { params });
  }

  async createAnnouncement(announcementData: any) {
    return this.axiosInstance.post('/announcements', announcementData);
  }

  async updateAnnouncement(id: string, announcementData: any) {
    return this.axiosInstance.put(`/announcements/${id}`, announcementData);
  }

  async markAnnouncementAsRead(id: string) {
    return this.axiosInstance.post(`/announcements/${id}/read`);
  }

  async deleteAnnouncement(id: string) {
    return this.axiosInstance.delete(`/announcements/${id}`);
  }

  // Quiz endpoints
  async getQuizzes(params?: {
    courseId?: string;
    instructor?: string;
    isActive?: boolean;
    semester?: string;
  }) {
    return this.axiosInstance.get('/quizzes', { params });
  }

  async getUpcomingQuizzes(days?: number) {
    return this.axiosInstance.get('/quizzes/upcoming', {
      params: { days },
    });
  }

  async getQuizById(id: string) {
    return this.axiosInstance.get(`/quizzes/${id}`);
  }

  async getQuizResults(id: string) {
    return this.axiosInstance.get(`/quizzes/${id}/results`);
  }

  async getQuizStatistics(id: string) {
    return this.axiosInstance.get(`/quizzes/${id}/statistics`);
  }

  async createQuiz(quizData: any) {
    return this.axiosInstance.post('/quizzes', quizData);
  }

  async submitQuizAttempt(id: string, answers: any) {
    return this.axiosInstance.post(`/quizzes/${id}/submit`, answers);
  }

  async updateQuiz(id: string, quizData: any) {
    return this.axiosInstance.put(`/quizzes/${id}`, quizData);
  }

  async deleteQuiz(id: string) {
    return this.axiosInstance.delete(`/quizzes/${id}`);
  }
}

export const apiService = new ApiService();
