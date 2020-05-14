import express from 'express';
import errorMiddleware from '../middleware/error';
import frontRoute from './front';
import authRoute from './auth';
import customerRoute from './customer';
import orderRoute from './order';
import productRoute from './product';
import shoppingCartRoute from './shoppingCart';
import storeRoute from './store';
import userRoute from './user';

const router = express.Router();

router.use('/front', frontRoute);
router.use('/auth', authRoute);
router.use('/customer', customerRoute);
router.use('/order', orderRoute);
router.use('/product', productRoute);
router.use('/shopping-cart', shoppingCartRoute);
router.use('/store', storeRoute);
router.use('/user', userRoute);

// Has to be last:
router.use(errorMiddleware);

export default router;
