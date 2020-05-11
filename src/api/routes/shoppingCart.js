import express from 'express';
import shoppingCartController from '../controller/shoppingCart';
import asyncWrapper from '../util/asyncWrapper';
import authenticatedMiddleware from '../middleware/authenticated';

const router = express.Router();

router.post('/', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const customerEmail = req.requestingUser.email;
    const storePlace = req.body.store;
    const productBarcode = req.body.barcode;
    const amount = req.body.amount;
    const controllerResponse = await shoppingCartController.add(customerEmail, storePlace, productBarcode, amount);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

router.delete('/:shoppingCartProductId', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const customerEmail = req.requestingUser.email;
    const controllerResponse = await shoppingCartController.remove(customerEmail, req.params.shoppingCartProductId);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

router.get('/', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const customerEmail = req.requestingUser.email;
    const controllerResponse = await shoppingCartController.get(customerEmail);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

export default router;
