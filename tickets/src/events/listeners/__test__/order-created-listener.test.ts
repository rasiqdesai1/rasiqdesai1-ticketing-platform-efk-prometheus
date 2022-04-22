import { OrderCreatedEvent, OrderStatus } from '@sthub/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
  const ticket = Ticket.build({
    userId: new Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 10,
  });

  await ticket.save();

  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: new Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: 'aaa123123',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
    version: 0,
    userId: ticket.userId,
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, data, msg };
};

it('sets the userId of the ticket', async () => {
  const { ticket, listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toEqual(data.id);
});

it('acks the message ', async () => {
  const { ticket, listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event ', async () => {
  const { ticket, listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
