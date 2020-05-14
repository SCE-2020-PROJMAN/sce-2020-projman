import express from 'express';
import customerController from '../controller/customer';
import asyncWrapper from '../util/asyncWrapper';
import authenticatedMiddleware from '../middleware/authenticated';

const router = express.Router();

router.get('/address', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await customerController.getAddresses(req.requestingUser.email);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

router.post('/address', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await customerController.setAddresses(req.requestingUser.email, req.body.addresses);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

export default router;
