import express from 'express';
import errorMiddleware from '../middleware/error';
import frontRoute from './front';

const router = express.Router();

router.use('/front', frontRoute);

router.get('/', (req, res) => {
    res.status(200).send('Ok');
});

// Has to be last:
router.use(errorMiddleware);

export default router;
