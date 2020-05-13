import express from 'express';
import orderController from '../controller/order';
import asyncWrapper from '../util/asyncWrapper';
import authenticatedMiddleware from '../middleware/authenticated';

const router = express.Router();

router.get('/all', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await orderController.getAll(req.requestingUser);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

router.post('/', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await orderController.create(
        req.requestingUser.email,
        req.body.shippingTime,
        req.body.addressId,
    );
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

router.delete('/', authenticatedMiddleware, asyncWrapper(async (req, res) => {
    const controllerResponse = await orderController.destroy(
        req.requestingUser,
        req.body.orderCreationTime,
        req.body.orderCustomerEmail,
    );
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

router.get('/analytics', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await orderController.calculateAnalytics(req.requestingUser);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

export default router;
