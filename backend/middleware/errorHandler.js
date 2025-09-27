import { StatusCodes } from 'http-status-codes';
import CustomAPIError from '../error/customAPIError.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({
      success: false,
      msg: err.message,
    });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    msg: `Something went wrong, Please try again ${err}`,
  });
};
