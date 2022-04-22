import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from '@sthub/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
  const orderId = new Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    userId: new Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 10,
  });
  ticket.set({ orderId });

  await ticket.save();

  const listener = new OrderCancelledListener(natsWrapper.client);

  const data: OrderCancelledEvent['data'] = {
    id: new Types.ObjectId().toHexString(),
    ticket: {
      id: ticket.id,
    },
    version: 0,
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, data, msg, orderId };
};

it('updates the ticket, publishes, and acks', async () => {
  const { ticket, listener, data, msg, orderId } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toEqual(undefined);

  expect(msg.ack).toHaveBeenCalled();
  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(ticketUpdatedData.orderId).toEqual(undefined);
});
