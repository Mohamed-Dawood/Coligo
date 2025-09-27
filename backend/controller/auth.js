import { StatusCodes } from 'http-status-codes';
import { BadRequestError, Unauthenticated } from '../error/index.js';
import User from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({}).select('-password');

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Users retrieved successfully',
    data: users,
    meta: { count: users.length },
  });
});

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(
      new BadRequestError('Please provide name, email, and password')
    );
  }

  const user = await User.create({ name, email, password });
  const token = user.createJWT();

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        address: user.address
      },
      token,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Please provide email and password'));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new Unauthenticated('Invalid credentials'));
  }

  const isCorrectPassword = await user.comparePassword(password);
  if (!isCorrectPassword) {
    return next(new Unauthenticated('Invalid credentials'));
  }

  const token = user.createJWT();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'User logged in successfully',
    data: {
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        address: user.address
      },
      token,
    },
  });
});
