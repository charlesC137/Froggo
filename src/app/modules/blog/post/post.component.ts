import { Component, ElementRef, OnInit } from '@angular/core';
import { IsAuthService } from '../../../service/is-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../../interfaces/interface';
import { ErrorMessageService } from '../../../service/error-message.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrl: './post.component.css',
})
export class PostComponentMod implements OnInit {
  constructor(
    private isAuthService: IsAuthService,
    private route: ActivatedRoute,
    private router: Router,
    private el: ElementRef,
    private errorMsgSrv: ErrorMessageService
  ) {}

  isAuth!: boolean | string;
  isLoading = true;
  currentPost!: Post;
  postDivs!: string[];
  postSplitNum!: number;
  id!: string;
  isBookmarked!: boolean;
  isLiked!: boolean;

  async ngOnInit(): Promise<void> {
    this.isAuth = await this.isAuthService.checkAuthStatus();
    this.isAuthService.setAuthStatus(this.isAuth);

    await this.fetchPost();

    this.isLoading = false;
  }

  async fetchPost() {
    this.id = this.route.snapshot.paramMap.get('id')!;

    try {
      const response = await fetch(`/api/post/${this.id}`);
      this.currentPost = await response.json();

      if (this.isAuth) {
        const resIsBookmarked = await fetch(
          `/api/post-bookmark/${this.id}/includes`,
          { credentials: 'include' }
        );
        this.isBookmarked = await resIsBookmarked.json();

        const resIsLiked = await fetch(`/api/post-like/${this.id}/includes`, {
          credentials: 'include',
        });
        this.isLiked = await resIsLiked.json();
      }

      this.postDivs = this.currentPost.postContent.split(/\r?\n/);
      this.postSplitNum = Math.ceil(this.postDivs.length / 2);
    } catch (error) {
      console.error('Error Fetching Post', error);
      this.router.navigate(['/error']);
      this.errorMsgSrv.setErrorMessage('Error Fetching Posts');
    }
  }

  async postComment() {
    const commentInput = this.el.nativeElement.querySelector(
      '.post-btm-comment textarea'
    );

    // const errorMsg: HTMLDivElement =
    //   this.el.nativeElement.querySelector('.error-msg');

    if (commentInput.value) {
      this.errorMsgSrv.removeErrorMessage();
      try {
        const response = await fetch('/api/post-comment', {
          method: 'Post',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            comment: commentInput.value,
            postId: this.id,
          }),
          credentials: 'include',
        });
        const resJson = await response.json();

        if (response.status === 201) {
          this.currentPost.comments = resJson;
          commentInput.value = '';
        } else {
          this.errorMsgSrv.setErrorMessage(resJson);
        }
      } catch (error) {
        this.errorMsgSrv.setErrorMessage(
          'Error posting comment. Try again later'
        );
        console.error(error);
      }
    } else {
      this.errorMsgSrv.setErrorMessage('Comment field should not be empty');
    }
  }

  async utilIcons(icon: string) {
    const likeIcon: HTMLElement = this.el.nativeElement.querySelector(
      '.utils-div .fa-heart'
    );

    const bookmarkIcon: HTMLElement = this.el.nativeElement.querySelector(
      '.utils-div .fa-bookmark'
    );

    const selectedIcon = icon === 'like' ? likeIcon : bookmarkIcon;

    selectedIcon.classList.toggle('active');

    try {
      const response = await fetch(`/api/post-${icon}/${this.id}`, {
        credentials: 'include',
      });

      if (response.status === 201) {
        selectedIcon.classList.add('active');
      } else if (response.status === 200) {
        selectedIcon.classList.remove('active');
      } else {
        this.errorMsgSrv.setErrorMessage(`Error fetching ${icon} status`);
        console.error(`Error fetching ${icon} status`);
      }
    } catch (error) {
      this.errorMsgSrv.setErrorMessage('An Error Has Occured');
      console.error(error);
    }
  }
}
