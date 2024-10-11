import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { IsAuthService } from '../../service/is-auth.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchStateService } from '../../service/search-state.service';
import { ChatService } from '../../service/chats.service';
import { SharedSocketModule } from '../../modules/shared-websocket/shared-websocket.module';
import { Socket } from 'ngx-socket-io';
import { ErrorMessageService } from '../../service/error-message.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, SharedSocketModule],
  providers: [ChatService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private isAuthService: IsAuthService,
    private el: ElementRef,
    private ren: Renderer2,
    private router: Router,
    private searchStateSrv: SearchStateService,
    private chatSrv: ChatService,
    private socket: Socket,
    private errorMsgSrv: ErrorMessageService
  ) {}

  isAuth!: boolean | string;
  isAuthSubscription!: Subscription;
  unreadCount!: number;
  username!: string;

  async ngOnInit(): Promise<void> {
    this.isAuthSubscription = this.isAuthService.data$.subscribe((data) => {
      this.isAuth = data;
    });

    if (this.isAuth) {
      try {
        const response = await fetch(
          `/api/fetch-profile/${this.isAuth}/username`
        );

        this.username = await response.json();
        await this.chatSrv.socketListeners(this.isAuth.toString());
        this.socket.emit('chat-init', this.username);

        this.socket.fromEvent('new-message').subscribe((message: any) => {
          this.chatSrv.getAllChats().then((chats) => {
            if (chats) {
              const chat = chats.find((c) => c.chatRoomId === message.room);
              if (chat) {
                const index = chat.deleted.indexOf(this.username);
                if (index !== -1) {
                  chat.deleted.splice(index, 1);
                }

                chat.messages.push(message.messageBody);

                this.chatSrv.saveChats(chats);

                this.unreadCount = this.chatSrv.getAllUnreadCount(
                  chats,
                  this.isAuth.toString()
                );
              }
            }
          });
        });
      } catch (error) {
        console.error(error);
        this.errorMsgSrv.setErrorMessage('Error fetching username');
      }
    }
  }

  ngAfterViewInit(): void {
    this.el.nativeElement
      .querySelector('.search-div input')
      .addEventListener('keyup', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          this.search();
        }
      });
  }

  toggleSearchBar() {
    const searchBar = this.el.nativeElement.querySelector('.search-div');
    if (searchBar.classList.contains('show-search-bar')) {
      this.ren.removeClass(searchBar, 'show-search-bar');
    } else {
      this.ren.addClass(searchBar, 'show-search-bar');
    }
  }

  showMenuMobile() {
    const menuMobile = this.el.nativeElement.querySelector('.menu-mobile');
    this.ren.addClass(menuMobile, 'show-menu-mobile');
  }

  hideMenuMobile() {
    const menuMobile = this.el.nativeElement.querySelector('.menu-mobile');
    this.ren.removeClass(menuMobile, 'show-menu-mobile');
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  async search() {
    const searchInput =
      this.el.nativeElement.querySelector('.search-div input');
    if (searchInput.value) {
      const response = await fetch(
        `/api/search/?keyword=${encodeURIComponent(searchInput.value)}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok || response.status !== 201) {
        this.router.navigate(['/error']);
      } else {
        this.searchStateSrv.triggerAction();
        this.router.navigate(['/blog/search']);
      }
    }
  }

  ngOnDestroy(): void {
    this.isAuthSubscription.unsubscribe();
  }
}
