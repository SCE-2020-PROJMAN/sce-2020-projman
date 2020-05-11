import express from 'express';
import orderController from '../controller/order';
import asyncWrapper from '../util/asyncWrapper';
import authenticatedMiddleware from '../middleware/authenticated';

const router = express.Router();

router.post('/', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await orderController.create(
        req.requestingUser.email,
        req.body.shoppingTime,
        req.body.addressId,
    );
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

export default router;
