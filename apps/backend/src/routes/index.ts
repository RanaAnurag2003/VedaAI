import { Router } from 'express';
import assignmentRoutes from './assignmentRoutes';

const router = Router();

router.use('/assignments', assignmentRoutes);

export default router;
