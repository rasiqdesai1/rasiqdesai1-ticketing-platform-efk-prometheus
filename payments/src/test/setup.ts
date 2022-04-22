import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, connection, Types } from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

let mongo: any;

process.env.STRIPE_KEY =
  'sk_test_51KRyt5HFXXNaLEcrxloHXkSVTj5Knwzd0Eom9DsZ6cQByxGUAvVBzgCJDU8WVZCi1j65jccxEtk3tvbpi1kwL3Su00LrW8Jzf3';

beforeAll(async () => {
  process.env.JWT_KEY = 'test key';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await connection.db.collections();
  for (let collection of collections) {
    collection.deleteMany({});
  }
});

afterAll(async () => {
  await connection.close();
  await mongo.stop();
});

global.signin = (id?: string) => {
  // Build a JWT Payload. {id, email}
  const payload = {
    id: id || new Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };
  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build a session {jwt: MY_JWT}
  const session = {
    jwt: token,
  };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string that the cookie with the encoded data
  return [`session=${base64}`];
};
