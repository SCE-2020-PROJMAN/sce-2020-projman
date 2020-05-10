import express from 'express';
import errorMiddleware from '../middleware/error';
import frontRoute from './front';
import authRoute from './auth';
import productRoute from './product';

const router = express.Router();

router.use('/front', frontRoute);
router.use('/auth', authRoute);
router.use('/product', productRoute);

// Has to be last:
router.use(errorMiddleware);

export default router;
