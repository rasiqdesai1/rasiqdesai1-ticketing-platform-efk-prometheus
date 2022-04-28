import { PaymentCreatedEvent, Publisher, Subjects } from '@sthub/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
