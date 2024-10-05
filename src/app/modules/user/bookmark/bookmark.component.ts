import { Component, OnInit } from '@angular/core';
import { IsAuthService } from '../../../service/is-auth.service';
import { SideDivService } from '../../../service/side-div.service';
import { Category, Post, TrendingPost } from '../../../interfaces/interface';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrl: './bookmark.component.css',
})
export class BookmarkComponent implements OnInit {
  constructor(
    private isAuthService: IsAuthService,
    private sideDivService: SideDivService
  ) {}

  isLoading = true;
  isAuth!: boolean | string;
  posts!: Post[];
  category!: String;
  sideDivCategories!: Category[];
  trendingPosts!: TrendingPost[];
  username!: string;
  itemsInBookmark = true;

  async ngOnInit(): Promise<void> {
    this.isAuth = await this.isAuthService.checkAuthStatus();
    this.isAuthService.setAuthStatus(this.isAuth);

    this.category = 'bookmarks';

    this.sideDivCategories = await this.sideDivService.fetchCategories();
    this.trendingPosts = await this.sideDivService.fetchTrendingPosts();

    this.isLoading = false;
  }

  onUsernameOutput(username: string) {
    this.username = username;
  }

  onPostOutput(posts: Post[]) {
    this.posts = posts;
  }

  onBookmarkItems(state: boolean) {
    this.itemsInBookmark = state;
  }
}
