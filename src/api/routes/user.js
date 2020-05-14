import express from 'express';
import userController from '../controller/user';
import asyncWrapper from '../util/asyncWrapper';
import authenticatedMiddleware from '../middleware/authenticated';

const router = express.Router();

router.get('/all', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await userController.getAll(req.requestingUser);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

router.patch('/:email/type', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await userController.setType(req.requestingUser, req.params.email, req.body.isCustomer, req.body.isStudent, req.body.isAdmin, req.body.adminStores);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

export default router;
