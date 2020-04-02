import path from 'path';
import express from 'express';

const router = express.Router();

router.use('/', express.static(path.join(__dirname, 'front')));

export default router;
