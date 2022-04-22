import nats from 'node-nats-streaming';
import { TicketCreatedListener } from './events/ticket-created-listener';

// console.clear();

const stan = nats.connect('ticketing', Math.random().toString(16).slice(2), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener Connected to NATS');

  stan.on('close', () => {
    console.log('NATS Connection Closed');
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
