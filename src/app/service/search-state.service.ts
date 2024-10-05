import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchStateService {
  private searchValid: boolean = false;
  private actionSubject = new BehaviorSubject<void>(undefined);

  action$ = this.actionSubject.asObservable();

  triggerAction() {
    this.actionSubject.next();
  }

  setSearchValid(value: boolean): void {
    this.searchValid = value;
  }

  getSearchValid(): boolean {
    return this.searchValid;
  }
}
