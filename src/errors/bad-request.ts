import { StatusCodes } from 'http-status-codes';
import CustomAPIError from './custom-api';

class BadRequestError extends CustomAPIError {
    constructor(message: string) {
        super(message, StatusCodes.BAD_REQUEST); // Pass the status code to the super constructor
    }
}

export default BadRequestError;
