import { Ticket } from '../ticket';

it('implement OCC ', async () => {
  const ticket = await Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance?.set({ price: 10 });
  secondInstance?.set({ price: 15 });

  await firstInstance?.save();

  try {
    await secondInstance?.save();
  } catch (err) {
    console.log(err);
    return;
  }
  throw new Error('Should not reach this point');
});

it('implement the version number on multiple saves ', async () => {
  const ticket = await Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
