import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import { LoadingComponent } from '../component-parts/loading/loading.component';
import { RouterLink } from '@angular/router';
import { IsAuthService } from '../service/is-auth.service';
import { HeaderComponent } from '../component-parts/header/header.component';
import { PaginationComponent } from '../component-parts/pagination/pagination.component';
import { FooterComponent } from '../component-parts/footer/footer.component';
import { Category, Post, TrendingPost } from '../interfaces/interface';
import { PostComponent } from '../component-parts/post-component/post-component.component';
import { BriefPipe } from '../pipes/brief.pipe';
import { SideDivComponent } from '../component-parts/side-div/side-div.component';
import { SideDivService } from '../service/side-div.service';
import { ErrorMessageService } from '../service/error-message.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    HeaderComponent,
    RouterLink,
    PaginationComponent,
    FooterComponent,
    PostComponent,
    BriefPipe,
    SideDivComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  constructor(
    private el: ElementRef,
    private isAuthService: IsAuthService,
    private sideDivService: SideDivService,
    private errorMsgSrv: ErrorMessageService
  ) {}

  isLoading = true;
  slides!: NodeListOf<HTMLElement>;
  currentSlide = 0;
  intervalId!: any;
  isAuth!: boolean | string;
  posts!: Post[];
  categories!: Category[];
  trendingPosts!: TrendingPost[];

  async ngOnInit(): Promise<void> {
    this.isAuth = await this.isAuthService.checkAuthStatus();
    this.isAuthService.setAuthStatus(this.isAuth);
    this.categories = await this.sideDivService.fetchCategories();
    this.trendingPosts = await this.sideDivService.fetchTrendingPosts();

    this.isLoading = false;
  }

  startSlideshow() {
    this.showSlide(this.currentSlide);
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  resetSlideshow() {
    clearInterval(this.intervalId);
    this.startSlideshow();
  }

  showSlide(n: number) {
    this.slides.forEach((slide: HTMLElement, index: number) => {
      if (index === n) {
        slide.style.transform = 'translateX(0)';
      } else if (index < n) {
        slide.style.transform = 'translateX(-100%)';
      } else {
        slide.style.transform = 'translateX(100%)';
      }
    });
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.showSlide(this.currentSlide);
    this.resetSlideshow();
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.slides.length) % this.slides.length;

    this.showSlide(this.currentSlide);
    this.resetSlideshow();
  }

  onPostOutput(posts: Post[]) {
    this.posts = posts;
    this.slides = this.el.nativeElement.querySelectorAll('.slide');
    this.startSlideshow();
  }
}
