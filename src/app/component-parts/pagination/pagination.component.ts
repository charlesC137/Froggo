import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Post } from '../../interfaces/interface';
import { Router } from '@angular/router';
import { SearchStateService } from '../../service/search-state.service';
import { ErrorMessageService } from '../../service/error-message.service';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent implements AfterViewInit, OnChanges {
  constructor(
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private searchStateSrv: SearchStateService,
    private errorMsgSrv: ErrorMessageService
  ) {}

  loadingNewPage = true;
  currentPage = 1;
  pageCount!: number;
  posts!: Post[];

  @Input() category!: String;
  @Input() searchState!: Boolean;
  @Output() postsOutput: EventEmitter<Post[]> = new EventEmitter();
  @Output() usernameOutput: EventEmitter<string> = new EventEmitter();
  @Output() searchQueryOutput: EventEmitter<string> = new EventEmitter();
  @Output() bookmarkItemsOutput: EventEmitter<boolean> = new EventEmitter();

  async ngAfterViewInit(): Promise<void> {
    this.searchStateSrv.action$.subscribe(async () => {
      await this.setFetchFormat();
    });

    this.loadingNewPage = false;
    this.cdr.detectChanges();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['category']) {
      await this.fetchPage(1);
    }
  }

  async setFetchFormat() {
    if (this.searchState) {
      await this.fetchSearchResults(1);
    } else if (this.category === 'bookmarks') {
      await this.fetchBookmarks(1);
    } else {
      await this.fetchPage(1);
    }
  }

  async fetchPage(num: number) {
    this.loadingNewPage = true;
    this.cdr.detectChanges();
    const response = await fetch(`/api/page/${this.category}/${num}`);

    if (!response.ok) {
      this.errorMsgSrv.setErrorMessage('Error fetching page');
      console.error('Error Fetching Page');
    }

    const resJson = await response.json();
    this.pageCount = resJson.postPageCount;
    this.posts = resJson.posts;
    this.setInactive();
    this.postsOutput.emit(this.posts);
    this.loadingNewPage = false;
  }

  async fetchSearchResults(num: number) {
    this.loadingNewPage = true;
    this.cdr.detectChanges();

    try {
      const response = await fetch(`/api/fetch-search-results/${num}`, {
        credentials: 'include',
      });

      const resJson = await response.json();
      this.pageCount = resJson.postPageCount;
      this.posts = resJson.posts;
      this.setInactive();
      this.postsOutput.emit(this.posts);
      this.searchQueryOutput.emit(resJson.searchQuery);
      this.loadingNewPage = false;
    } catch (error) {
      this.errorMsgSrv.setErrorMessage('Error Getting Search Results');
      console.error('Error Getting Search Results');
    }
  }

  async fetchBookmarks(num: number) {
    this.loadingNewPage = true;
    this.cdr.detectChanges();

    try {
      const response = await fetch(`/api/bookmarks/${num}`, {
        credentials: 'include',
      });

      const resJson = await response.json();
      this.pageCount = resJson.postPageCount;
      this.posts = resJson.bookmarkPosts;

      this.setInactive();

      const bookmarkBoolean = this.posts.length > 0 ? true : false;

      this.bookmarkItemsOutput.emit(bookmarkBoolean);
      this.usernameOutput.emit(resJson.username);
      this.postsOutput.emit(this.posts);

      this.loadingNewPage = false;
    } catch (error) {
      this.errorMsgSrv.setErrorMessage('Error Getting Bookmarks');
      console.error('Error Getting Bookmarks');
    }
  }

  setInactive() {
    const startBtn = this.el.nativeElement.querySelector('.start-btn');
    const prevBtn = this.el.nativeElement.querySelector('.prev-btn');
    const nextBtn = this.el.nativeElement.querySelector('.next-btn');
    const endBtn = this.el.nativeElement.querySelector('.end-btn');

    if (this.pageCount < 1) {
      this.el.nativeElement
        .querySelectorAll('main button')
        .forEach((btn: HTMLElement) => {
          btn.classList.add('inactive');
        });
    } else {
      if (this.currentPage < 2) {
        startBtn.classList.add('inactive');
        prevBtn.classList.add('inactive');
      } else {
        startBtn.classList.remove('inactive');
        prevBtn.classList.remove('inactive');
      }

      if (this.currentPage === this.pageCount) {
        nextBtn.classList.add('inactive');
        endBtn.classList.add('inactive');
      } else {
        nextBtn.classList.remove('inactive');
        endBtn.classList.remove('inactive');
      }
    }

    if (this.searchState) {
      this.setBtnFunc(this.fetchSearchResults.bind(this));
    } else if (this.category === 'bookmark') {
      this.setBtnFunc(this.fetchBookmarks.bind(this));
    } else {
      this.setBtnFunc(this.fetchPage.bind(this));
    }
  }

  setBtnFunc(fetchFunc: (num: number) => void) {
    const buttonSelectors = [
      '.start-btn',
      '.prev-btn',
      '.next-btn',
      '.end-btn',
    ];

    const buttonFunctions = [
      () => {
        if (this.currentPage > 1) {
          fetchFunc(1);
          this.currentPage = 1;
        }
      },
      () => {
        if (this.currentPage - 1 > 0) {
          fetchFunc(this.currentPage - 1);
          this.currentPage--;
        }
      },
      () => {
        if (this.currentPage + 1 <= this.pageCount) {
          fetchFunc(this.currentPage + 1);
          this.currentPage++;
        }
      },
      () => {
        if (this.currentPage < this.pageCount) {
          fetchFunc(this.pageCount);
          this.currentPage = this.pageCount;
        }
      },
    ];

    buttonSelectors.forEach((selector, index) => {
      const button = this.el.nativeElement.querySelector(selector);
      const func = buttonFunctions[index];

      if (button && !button.classList.contains('inactive')) {
        button.addEventListener('click', func);
      }
    });
  }
}
