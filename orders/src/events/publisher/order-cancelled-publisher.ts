import { OrderCancelledEvent, Publisher, Subjects } from '@sthub/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
