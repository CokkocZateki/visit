import { Message } from './message';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'systemName'
})
export class SystemNamePipe implements PipeTransform {

  transform(messages: Message[], system: string): Message[] {
    return messages.filter(message => message.system === system).reverse();
  }

}
