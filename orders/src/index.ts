import { connect } from 'mongoose';
import { app } from './app';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listeners';
import { TicketCreatedListener } from './events/listeners/ticket-created-listeners';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listeners';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  console.log('Starting Up...');
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined!');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO URI must be defined!');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS client Id must be defined!');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS Clustered Id must be defined!');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS URI must be defined!');
  }

  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
    natsWrapper.client.on('close', () => {
      console.log('NATS Connection Closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    console.log('Trying to connect to Mongo DB');
    await connect(process.env.MONGO_URI);
    console.log('Connected to Mongo DB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('listening on port 3000!!');
  });
};

start();