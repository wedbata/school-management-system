import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return sendError(res, 'Validation error', 400, errors);
      }
      return sendError(res, 'Internal validation error', 500);
    }
  };
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Unhandled Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return sendError(res, 'A record with this unique field already exists.', 409, err.meta);
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Record not found.', 404, err.meta);
    }
  }

  return sendError(
    res,
    err.message || 'Internal Server Error',
    err.statusCode || 500,
    err
  );
};
