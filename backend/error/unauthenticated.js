import { StatusCodes } from 'http-status-codes';
import CustomAPIError from './customAPIError.js';

export default class Unauthenticated extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}
