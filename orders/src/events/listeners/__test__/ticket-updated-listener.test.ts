import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listeners';
import { TicketCreatedEvent, TicketUpdatedEvent } from '@sthub/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../model/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listeners';

const setup = async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    price: 10,
    title: 'concert',
  });

  await ticket.save();

  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create a fake event
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: ticket.title,
    price: 20,
    userId: new Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it('updates a ticket', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data Object + message object
  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);

  // write assertions to sure a ticket was created!
  expect(ticket).toBeDefined();
  expect(ticket?.title).toEqual(data.title);
  expect(ticket?.price).toEqual(data.price);
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

it('does not call ack if the event has a skipped version number', async () => {
  const { listener, data, msg } = await setup();

  data.version = 10;

  try {
    // call the onMessage function with the data Object + message object
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
