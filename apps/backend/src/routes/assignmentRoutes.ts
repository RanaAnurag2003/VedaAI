import { Router } from 'express';
import {
  createAssignmentHandler,
  getAssignmentHandler,
  getAssignmentStatusHandler,
  regenerateAssignmentHandler,
  listAssignmentsHandler,
  deleteAssignmentHandler,
  updateAssignmentPaperHandler,
} from '../controllers/assignmentController';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

router.get('/', listAssignmentsHandler);

router.post('/create', (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) return next(err);
    return createAssignmentHandler(req, res, next);
  });
});

router.get('/:id/status', getAssignmentStatusHandler);
router.post('/:id/regenerate', regenerateAssignmentHandler);
router.get('/:id', getAssignmentHandler);
router.delete('/:id', deleteAssignmentHandler);
router.patch('/:id/paper', updateAssignmentPaperHandler);


export default router;
