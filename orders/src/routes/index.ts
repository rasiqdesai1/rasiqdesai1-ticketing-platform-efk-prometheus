import { requireAuth, validateRequest } from '@sthub/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../model/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.currentUser?.id }).populate('ticket');
  res.send(orders);
});

export { router as indexOrderRouter };
