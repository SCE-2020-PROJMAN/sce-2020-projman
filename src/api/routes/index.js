import express from 'express';
import errorMiddleware from '../middleware/error';
import frontRoute from './front';
import authRoute from './auth';

const router = express.Router();

router.use('/front', frontRoute);
router.use('/auth', authRoute);

// Has to be last:
router.use(errorMiddleware);

export default router;
