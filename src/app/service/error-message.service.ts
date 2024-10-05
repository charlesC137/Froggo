import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorMessageService {
  private errorSubject = new BehaviorSubject<string | null>(null);

  errorMsg$ = this.errorSubject.asObservable();

  setErrorMessage(msg: string) {
    this.errorSubject.next(msg);
    setTimeout(() => {
      this.errorSubject.next(null);
    }, 10000);
  }

  removeErrorMessage() {
    this.errorSubject.next(null);
  }
}
