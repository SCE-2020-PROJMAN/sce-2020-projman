import express from 'express';
import productController from '../controller/product';
import asyncWrapper from '../util/asyncWrapper';
import authenticatedMiddleware from '../middleware/authenticated';

const router = express.Router();

router.post('/', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await productController.create(
        req.requestingUser,
        req.body.barcode,
        req.body.category,
        req.body.freeText,
        req.body.price,
        req.body.brand,
        req.body.name,
        req.body.studentDiscount,
        req.body.storePlace,
    );
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

router.get('/search', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await productController.search(req.query.sort, req.query.search, req.query.page);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

export default router;
