import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorMessageService } from './error-message.service';

@Injectable({
  providedIn: 'root',
})
export class SideDivService {
  constructor(
    private router: Router,
    private errorMsgSrv: ErrorMessageService
  ) {}

  async fetchCategories() {
    const response = await fetch('/api/fetch-categories');

    if (!response.ok) {
      this.errorMsgSrv.setErrorMessage('Error fetching categories');
    }

    const categories = await response.json();
    return categories;
  }

  async fetchTrendingPosts() {
    const response = await fetch('/api/trending-posts');

    if (!response.ok) {
      this.errorMsgSrv.setErrorMessage('Error fetching trending posts');
    }

    const trendingPosts = await response.json();
    return trendingPosts;
  }
}
