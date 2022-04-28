import { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../model/ticket';
const buildTickets = async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();
  return ticket;
};

it('fetches orders for an particular user', async () => {
  // Create three tickets
  const ticketOne = await buildTickets();
  const ticketTwo = await buildTickets();
  const ticketThree = await buildTickets();

  const userOne = global.signin();
  const userTwo = global.signin();

  // Create one order as User #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: (await ticketOne).id })
    .expect(201);

  // Create two orders as User #2
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: (await ticketTwo).id })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: (await ticketThree).id })
    .expect(201);

  // Make request to get orders for User #2
  const orders = await request(app).get('/api/orders').set('Cookie', userTwo);

  expect(orders.body.length).toEqual(2);
  expect(orders.body[0].id).toEqual(orderOne.id);
  expect(orders.body[1].id).toEqual(orderTwo.id);
  expect(orders.body[0].ticket.id).toEqual(ticketTwo.id);
});
