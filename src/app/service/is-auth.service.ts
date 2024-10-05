import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IsAuthService {
  private isAuthSubject = new BehaviorSubject<boolean | string>(false);

  data$ = this.isAuthSubject.asObservable();

  setAuthStatus(status: boolean | string) {
    this.isAuthSubject.next(status);
  }

  async checkAuthStatus(): Promise<any> {
    try {
      const response = await fetch('/api/check-auth-status', {
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      console.error('Session check failed:', error);
    }
  }

  async checkAdminStatus(): Promise<any> {
    try {
      const response = await fetch('/api/check-admin-status', {
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      console.error('Session check failed:', error);
    }
  }
}
