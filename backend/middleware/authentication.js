import Unauthenticated from '../error/unauthenticated.js';
import { catchAsync } from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';

export const auth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new Unauthenticated('Authentication invalid'));
  }

  let token = authHeader.split(' ')[1];

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = { userId: decoded.userId, name: decoded.name };
    next();
  } catch (error) {
    return next(new Unauthenticated('Authentication invalid'));
  }
});
