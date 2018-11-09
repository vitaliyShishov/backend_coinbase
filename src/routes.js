import * as currency from './business/currency';
import express from 'express';

const router = express.Router();

router.post('/currency', currency.add);
router.get('/currency/getList', currency.getList);
router.get('/currency/:id', currency.getOne);

export default router;