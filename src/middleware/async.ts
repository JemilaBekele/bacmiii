import { Request, Response, NextFunction } from 'express';

const asyncWrapper = (fun: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fun(req, res, next);
        } catch (error) {
            next(error);
        }
    }
}

export default asyncWrapper;
