import { OrderCreatedEvent, Publisher, Subjects } from '@sthub/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
