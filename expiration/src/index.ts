import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  console.log('Starting Up...');

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

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
};

start();
