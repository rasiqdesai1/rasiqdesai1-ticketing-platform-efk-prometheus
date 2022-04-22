import { OrderStatus } from '@sthub/common';
import { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe/stripe';

it('returns a 404 when purchasing an order does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: '11221321wsds',
      orderId: new Types.ObjectId().toHexString(),
    })
    .expect(404);
});
it('returns a 401 when purchasing an order does not belong to the user', async () => {
  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    price: 123,
    status: OrderStatus.Created,
    userId: new Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: '11221321wsds',
      orderId: order.id,
    })
    .expect(401);
});
it('returns a 401 when purchasing an cancelled order', async () => {
  const userId = new Types.ObjectId().toHexString();

  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    price: 123,
    status: OrderStatus.Cancelled,
    userId: userId,
    version: 0,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: '11221321wsds',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = new Types.ObjectId().toHexString();

  const price = Math.floor(Math.random() * 100000);
  console.log('price:', price);
  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    price: price,
    status: OrderStatus.Created,
    userId: userId,
    version: 0,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });
  expect(stripeCharge).toBeDefined();

  const charge = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge?.id,
  });

  expect(charge).toBeDefined();
});
