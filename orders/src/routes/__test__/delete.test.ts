import { OrderStatus } from '@sthub/common';
import { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../model/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('Cancel the order', async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });

  await ticket.save();
  const userOne = global.signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app).delete(`/api/orders/${order.id}`).set('Cookie', userOne).expect(204);

  const { body: cancelledOrder } = await request(app).get(`/api/orders/${order.id}`).set('Cookie', userOne).expect(200);

  expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled);
});

it('Emits an order cancelled event', async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });

  await ticket.save();
  const userOne = global.signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app).delete(`/api/orders/${order.id}`).set('Cookie', userOne).expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
