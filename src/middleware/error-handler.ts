import CustomAPIError from '../errors/custom-api';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

const errorHandlerMiddleware = (err: any, req: Request, res: Response) => {
  console.log(err);
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
};

export default errorHandlerMiddleware;
