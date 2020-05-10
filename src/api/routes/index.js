import express from 'express';
import errorMiddleware from '../middleware/error';
import frontRoute from './front';
import authRoute from './auth';
import customerRoute from './customer';
import productRoute from './product';
import storeRoute from './store';

const router = express.Router();

router.use('/front', frontRoute);
router.use('/auth', authRoute);
router.use('/customer', customerRoute);
router.use('/product', productRoute);
router.use('/store', storeRoute);

// Has to be last:
router.use(errorMiddleware);

export default router;
