import { Publisher, Subjects, TicketCreatedEvent } from '@sthub/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
