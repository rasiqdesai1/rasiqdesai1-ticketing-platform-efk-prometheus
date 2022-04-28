import { connect } from 'mongoose';
import { app } from './app';

const start = async () => {
  console.log('Starting Up...');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined!');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO URI must be defined!');
  }

  try {
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
