import { ExpirationCompleteEvent, Publisher, Subjects } from '@sthub/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
