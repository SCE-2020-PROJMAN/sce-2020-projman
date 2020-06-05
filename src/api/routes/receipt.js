import express from 'express';
import authenticatedMiddleware from '../middleware/authenticated';
import asyncWrapper from '../util/asyncWrapper';
import receiptController from '../controller/receipt';

const router = express.Router();

router.get('/detailsOfPurchases',authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await receiptController.detailsOfPurchases(req.requestingUser);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));
router.get('/orderCreationTime',authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await receiptController.detailsOfPurchases(req.requestingUser);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

export default router;
