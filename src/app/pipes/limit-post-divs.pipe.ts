import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitPostDivs',
  standalone: true
})
export class LimitPostDivsPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
