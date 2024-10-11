import { Component, OnInit } from '@angular/core';
import { IsAuthService } from '../../../service/is-auth.service';
import { Category, Post, TrendingPost } from '../../../interfaces/interface';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { SideDivService } from '../../../service/side-div.service';
import { Subscription } from 'rxjs';
import { SearchStateService } from '../../../service/search-state.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit {
  constructor(
    private isAuthService: IsAuthService,
    private route: ActivatedRoute,
    private sideDivService: SideDivService,
    private router: Router,
    private searchStateSrv: SearchStateService
  ) {}

  isLoading = true;
  isAuth!: boolean | string;
  posts: Post[] = [];
  category!: string;
  sideDivCategories!: Category[];
  trendingPosts!: TrendingPost[];
  routerSub!: Subscription;
  searchState = false;
  searchQuery!: string;

  async ngOnInit(): Promise<void> {
    this.isAuth = await this.isAuthService.checkAuthStatus();
    this.isAuthService.setAuthStatus(this.isAuth);

    this.category = this.route.snapshot.paramMap.get('category')!;

    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.category = this.route.snapshot.paramMap.get('category')!;
      }
    });

    this.searchStateSrv.setSearchValid(!this.category);

    this.searchState = this.searchStateSrv.getSearchValid();

    this.sideDivCategories = await this.sideDivService.fetchCategories();
    this.trendingPosts = await this.sideDivService.fetchTrendingPosts();

    this.isLoading = false;
  }

  onPostOutput(posts: Post[]) {
    this.posts = posts;
  }

  onSQOutput(searchQuery: string) {
    this.searchQuery = searchQuery;
  }
}
