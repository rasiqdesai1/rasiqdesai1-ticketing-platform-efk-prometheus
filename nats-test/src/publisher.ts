import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

// console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const data = {
    id: '12312',
    title: 'concert',
    price: 20,
  };

  const ticketCreatedPublisher = new TicketCreatedPublisher(stan);
  await ticketCreatedPublisher.publish(data);

  // stan.publish('ticket:created', data, () => {
  //   console.log('Event Pubished');
  // });
});
