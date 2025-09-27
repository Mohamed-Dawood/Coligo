import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Quiz as QuizIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { useLocation } from 'react-router-dom';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  courseId: string;
  course?: {
    courseCode: string;
    courseName: string;
  };
  questions: Array<{
    _id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    points: number;
  }>;
  timeLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalPoints: number;
}

interface QuizAttempt {
  quizId: string;
  answers: string[];
  timeSpent: number;
  score?: number;
  percentage?: number;
}

export const Quizzes: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [takeQuizDialogOpen, setTakeQuizDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    courseId: '',
    timeLimit: 60,
    startDate: '',
    endDate: '',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
      }
    ],
  });

  useEffect(() => {
    fetchQuizzes();
  }, [location.pathname]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (location.pathname === '/quizzes/available') {
        response = await apiService.getQuizzes({ isActive: true });
      } else if (location.pathname === '/quizzes/results') {
        response = await apiService.getQuizzes();
      } else {
        response = await apiService.getQuizzes();
      }

      setQuizzes(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async () => {
    try {
      const totalPoints = newQuiz.questions.reduce((sum, q) => sum + q.points, 0);
      await apiService.createQuiz({
        ...newQuiz,
        totalPoints,
      });
      setCreateDialogOpen(false);
      setNewQuiz({
        title: '',
        description: '',
        courseId: '',
        timeLimit: 60,
        startDate: '',
        endDate: '',
        questions: [
          {
            question: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            points: 1,
          }
        ],
      });
      fetchQuizzes();
    } catch (err: any) {
      console.error('Failed to create quiz:', err);
      setError('Failed to create quiz');
    }
  };

  const handleTakeQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setAnswers(new Array(quiz.questions.length).fill(''));
    setCurrentQuestionIndex(0);
    setTakeQuizDialogOpen(true);
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      const timeSpent = 45; // Mock time spent
      await apiService.submitQuizAttempt(selectedQuiz._id, {
        answers,
        timeSpent,
      });
      setTakeQuizDialogOpen(false);
      setSelectedQuiz(null);
      fetchQuizzes();
    } catch (err: any) {
      console.error('Failed to submit quiz:', err);
      setError('Failed to submit quiz');
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const addQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [
        ...newQuiz.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          points: 1,
        }
      ],
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions,
    });
  };

  const getPageTitle = () => {
    if (location.pathname === '/quizzes/available') {
      return 'Available Quizzes';
    } else if (location.pathname === '/quizzes/create') {
      return 'Create Quiz';
    } else if (location.pathname === '/quizzes/results') {
      return 'Quiz Results';
    }
    return 'Quizzes';
  };

  const canCreateQuiz = () => {
    return (user?.role === 'teacher' || user?.role === 'admin') && 
           location.pathname === '/quizzes/create';
  };

  const isQuizActive = (quiz: Quiz) => {
    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);
    return now >= startDate && now <= endDate && quiz.isActive;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {getPageTitle()}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {location.pathname === '/quizzes/available' 
            ? 'Take available quizzes and assessments'
            : location.pathname === '/quizzes/create'
            ? 'Create new quizzes for your students'
            : 'View quiz results and performance'
          }
        </Typography>
      </Box>

      {quizzes.length === 0 ? (
        <Box textAlign="center" py={8}>
          <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No quizzes found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {location.pathname === '/quizzes/available' 
              ? 'No quizzes are currently available.'
              : location.pathname === '/quizzes/create'
              ? 'Create your first quiz to get started.'
              : 'No quiz results available yet.'
            }
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} md={6} lg={4} key={quiz._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="h2" fontWeight="bold">
                      {quiz.title}
                    </Typography>
                    <Chip 
                      label={isQuizActive(quiz) ? 'Active' : 'Inactive'} 
                      color={isQuizActive(quiz) ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {quiz.description}
                  </Typography>
                  
                  {quiz.course && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {quiz.course.courseCode} - {quiz.course.courseName}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip 
                      icon={<TimerIcon />} 
                      label={`${quiz.timeLimit} min`} 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      icon={<AssignmentIcon />} 
                      label={`${quiz.questions.length} questions`} 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={`${quiz.totalPoints} points`} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Available: {new Date(quiz.startDate).toLocaleDateString()} - {new Date(quiz.endDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  {user?.role === 'student' && isQuizActive(quiz) && (
                    <Button 
                      variant="contained" 
                      startIcon={<QuizIcon />}
                      onClick={() => handleTakeQuiz(quiz)}
                    >
                      Take Quiz
                    </Button>
                  )}
                  {user?.role === 'student' && !isQuizActive(quiz) && (
                    <Button disabled>
                      Not Available
                    </Button>
                  )}
                  {user?.role !== 'student' && (
                    <Button size="small">
                      View Results
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Quiz Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Quiz</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Quiz Title"
              value={newQuiz.title}
              onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={newQuiz.description}
              onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Course ID"
              value={newQuiz.courseId}
              onChange={(e) => setNewQuiz({ ...newQuiz, courseId: e.target.value })}
              fullWidth
            />
            <TextField
              label="Time Limit (minutes)"
              type="number"
              value={newQuiz.timeLimit}
              onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: parseInt(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Start Date"
              type="datetime-local"
              value={newQuiz.startDate}
              onChange={(e) => setNewQuiz({ ...newQuiz, startDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="datetime-local"
              value={newQuiz.endDate}
              onChange={(e) => setNewQuiz({ ...newQuiz, endDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <Typography variant="h6" sx={{ mt: 2 }}>
              Questions
            </Typography>
            
            {newQuiz.questions.map((question, index) => (
              <Box key={index} sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 1 }}>
                <TextField
                  label={`Question ${index + 1}`}
                  value={question.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                
                {question.options.map((option, optionIndex) => (
                  <TextField
                    key={optionIndex}
                    label={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...question.options];
                      newOptions[optionIndex] = e.target.value;
                      updateQuestion(index, 'options', newOptions);
                    }}
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Correct Answer</InputLabel>
                  <Select
                    value={question.correctAnswer}
                    onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                  >
                    {question.options.map((option, optionIndex) => (
                      <MenuItem key={optionIndex} value={option}>
                        Option {optionIndex + 1}: {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Points"
                  type="number"
                  value={question.points}
                  onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                  size="small"
                />
              </Box>
            ))}
            
            <Button onClick={addQuestion} variant="outlined">
              Add Question
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateQuiz} variant="contained">Create Quiz</Button>
        </DialogActions>
      </Dialog>

      {/* Take Quiz Dialog */}
      <Dialog open={takeQuizDialogOpen} onClose={() => setTakeQuizDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedQuiz?.title}
          {selectedQuiz && (
            <Chip 
              label={`Question ${currentQuestionIndex + 1} of ${selectedQuiz.questions.length}`}
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedQuiz && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedQuiz.questions[currentQuestionIndex]?.question}
              </Typography>
              
              <FormControl component="fieldset">
                <RadioGroup
                  value={answers[currentQuestionIndex] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                >
                  {selectedQuiz.questions[currentQuestionIndex]?.options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                >
                  Previous
                </Button>
                <Button
                  disabled={currentQuestionIndex === selectedQuiz.questions.length - 1}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTakeQuizDialogOpen(false)}>Cancel</Button>
          {selectedQuiz && currentQuestionIndex === selectedQuiz.questions.length - 1 && (
            <Button onClick={handleSubmitQuiz} variant="contained">
              Submit Quiz
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Create Quiz */}
      {canCreateQuiz() && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setCreateDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

