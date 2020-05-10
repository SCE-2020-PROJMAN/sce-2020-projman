import express from 'express';
import storeController from '../controller/store';
import asyncWrapper from '../util/asyncWrapper';
import authenticatedMiddleware from '../middleware/authenticated';

const router = express.Router();

router.get('/all', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await storeController.getAll(req.requestingUser);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

export default router;
