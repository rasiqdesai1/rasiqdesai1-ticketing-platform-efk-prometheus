import { Publisher, Subjects, TicketUpdatedEvent } from '@sthub/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
