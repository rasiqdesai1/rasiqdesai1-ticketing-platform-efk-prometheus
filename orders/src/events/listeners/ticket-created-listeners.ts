import { Listener, Subjects, TicketCreatedEvent } from '@sthub/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../model/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: { id: string; title: string; price: number; userId: string }, msg: Message) {
    const ticket = Ticket.build({
      id: data.id,
      title: data.title,
      price: data.price,
    });

    await ticket.save();

    msg.ack();
  }
}
