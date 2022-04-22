import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listeners';
import { TicketCreatedEvent } from '@sthub/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../model/ticket';

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // create a fake event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new Types.ObjectId().toHexString(),
    title: 'price',
    price: 10,
    userId: new Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it('creates and save a ticket', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data Object + message object
  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket?.title).toEqual(data.title);
  expect(ticket?.price).toEqual(data.price);
  // expect(msg.ack).toHaveBeenCalled();

  // write assertions to sure a ticket was created!
});
it('acks the messsage', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data Object + message object
  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket?.title).toEqual(data.title);
  expect(ticket?.price).toEqual(data.price);
  expect(msg.ack).toHaveBeenCalled();
});
