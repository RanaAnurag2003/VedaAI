import { Request, Response, NextFunction } from 'express';
import {
  createAssignment,
  getAssignmentById,
  regenerateAssignment,
  listAssignments,
  deleteAssignment,
} from '../services/assignmentService';
import { getAssignmentStatus } from '../services/cacheService';
import { AppError } from '../middleware/errorHandler';

export async function createAssignmentHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await createAssignment(req.body, req.file);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getAssignmentHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = String(req.params.id);
    const result = await getAssignmentById(id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getAssignmentStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = String(req.params.id);
    const status = await getAssignmentStatus(id);
    if (!status) {
      throw new AppError(404, 'Status not found for assignment');
    }
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
}

export async function regenerateAssignmentHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = String(req.params.id);
    const result = await regenerateAssignment(id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listAssignmentsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await listAssignments();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteAssignmentHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = String(req.params.id);
    await deleteAssignment(id);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    next(err);
  }
}
