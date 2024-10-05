import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IsAuthService } from '../../service/is-auth.service';
import { Post } from '../../interfaces/interface';
import { RouterLink } from '@angular/router';
import { BriefPipe } from '../../pipes/brief.pipe';

@Component({
  selector: 'app-post-component',
  standalone: true,
  imports: [CommonModule, RouterLink, BriefPipe],
  templateUrl: './post-component.component.html',
})
export class PostComponent implements OnInit, OnDestroy {
  constructor(private isAuthService: IsAuthService) {}

  isAuth!: boolean | string;
  isAuthSubscription!: Subscription;
  @Input() useHomeStyle!: boolean;
  @Input() post!: Post;

  ngOnInit(): void {
    this.isAuthSubscription = this.isAuthService.data$.subscribe((data) => {
      this.isAuth = data;
    });
  }

  ngOnDestroy(): void {
    this.isAuthSubscription.unsubscribe();
  }
}
