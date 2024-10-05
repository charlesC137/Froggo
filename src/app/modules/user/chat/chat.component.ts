import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { IsAuthService } from '../../../service/is-auth.service';
import { Socket } from 'ngx-socket-io';
import dayjs from 'dayjs';
import { Chat, DeleteForm } from '../../../interfaces/interface';
import { Router } from '@angular/router';
import { ErrorMessageService } from '../../../service/error-message.service';
import { ChatService } from '../../../service/chats.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnDestroy {
  constructor(
    private el: ElementRef,
    private isAuthService: IsAuthService,
    private socket: Socket,
    private router: Router,
    private errorMsgsrv: ErrorMessageService,
    private chatSrv: ChatService
  ) {}

  isAuth!: boolean | string;
  isLoading = true;
  mode: 'chat' | 'group' = 'chat';
  filter: 'all' | 'pinned' | 'archived' = 'all';
  reply!: Chat['messages'][number]['reply'];
  username!: string;
  deleteForm!: DeleteForm | undefined;
  currentRoomId: string | undefined = undefined;
  allUsers!: { id: string; username: string }[];
  allChats: Chat[] = [];
  chats: Chat[] = [];
  chatSearch: Chat[] = [];
  onlineUsers: string[] = [];
  modalMemory: any = {};
  groupChats: Chat[] = [];
  chatSub!: Subscription;
  onlineUsersSub!: Subscription;

  async ngOnInit(): Promise<void> {
    try {
      this.isAuth = await this.isAuthService.checkAuthStatus();
      if (this.isAuth === false) {
        this.router.navigate(['/']);
      }

      await this.getUsers();
      this.isAuthService.setAuthStatus(this.isAuth);

      await this.setUpSocket();
      this.setUpSubscriptions();
    } catch (error) {
      console.error(error);
      this.router.navigate(['/error']);
      this.errorMsgsrv.setErrorMessage('Error opening chat page');
    } finally {
      this.isLoading = false;
    }
  }

  scrollTo(top: number | null) {
    const container: HTMLDivElement =
      this.el.nativeElement.querySelector('.major-content');
    container.scrollTo({
      top: top === null ? container.scrollHeight + 500 : top,
      behavior: 'smooth',
    });
  }

  setUpSubscriptions() {
    this.onlineUsersSub = this.chatSrv.onlineUsers$.subscribe((users: any) => {
      this.onlineUsers = users;
    });
    this.chatSub = this.chatSrv.allChats$.subscribe((data: any) => {
      this.allChats = data;
      this.chats = data.filter((chat: Chat) => chat.chatType === 'chat');
      this.groupChats = data.filter((chat: Chat) => chat.chatType === 'group');
    });

    this.chatSrv.currentRoomId$.subscribe((id: any) => {
      this.currentRoomId = id;
    });

    this.chatSrv.deleteForm$.subscribe((form: any) => {
      this.deleteForm = form;
    });
  }

  async setUpSocket() {
    await this.chatSrv.socketListeners(this.isAuth.toString());
    this.socket.emit('chat-init', this.username);

    this.socket.fromEvent('new-message').subscribe((message: any) => {
      const chat =
        this.fetchChat(message.room, this.chats) ||
        this.fetchChat(message.room, this.groupChats);
      const index = chat?.deleted.indexOf(this.username)!;
      chat?.deleted.splice(index, 1);
      chat?.messages.push(message.messageBody);
      if (message.room === this.currentRoomId) {
        this.scrollTo(null);
        this.socket.emit('read-messages', {
          room: message.room,
          userId: this.isAuth,
        });
      }
      this.saveAllChats();
    });
  }

  getChatRecipient(recs: Chat['recipient']) {
    const rec = recs[0].id === this.isAuth ? recs[1] : recs[0];
    return rec;
  }

  onShowDeleteModal(state: boolean) {
    if (state) {
      this.showOrHideModal('clear-delete', 'show');
    }
  }
  setReceivedStatus() {
    this.onlineUsers.forEach((onlineUser) => {
      this.chats.forEach((chat) => {
        if (chat.recipient[0].username === onlineUser) {
          chat.messages.forEach((message) => {
            if (
              message.sender.id === this.isAuth &&
              message.sendStatus.status === 'sent'
            ) {
              message.sendStatus.status = 'received';
            }
          });
        }
      });
    });
  }

  getOnlineChats() {
    const onlineChats = this.chats.filter((chat) =>
      this.onlineUsers.includes(this.getChatRecipient(chat.recipient).username)
    );

    return onlineChats;
  }

  searchForChat() {
    const searchQuery = this.el.nativeElement.querySelector(
      '.tm-search-bar input'
    ).value;

    this.chatSearch = this.chats.filter(
      (chat) =>
        chat.recipient[0].username
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) && searchQuery
    );
  }

  setTypingStatus(form: 'add' | 'remove') {
    const chat =
      this.fetchChat(null, this.chats) || this.fetchChat(null, this.groupChats);

    const recipientIndex = chat?.recipient.findIndex(
      (r) => r.id === this.isAuth.toString()
    );

    this.socket.emit('typing-status', {
      form,
      room: this.currentRoomId,
      i: recipientIndex,
    });
  }

  sendMessage() {
    const inputElem = this.el.nativeElement.querySelector('.text-space input');
    if (inputElem.value) {
      const messageBody: Chat['messages'][number] = {
        id: Date.now() - Math.floor(Math.random() * 1000),
        message: inputElem.value,
        deleteState: { forMe: [], forEveryone: false },
        sender: { id: this.isAuth, name: this.username },
        sendStatus: {
          sendTime: dayjs().format('hh:mm A'),
          status: 'sent',
        },
        reply: this.reply,
      };

      this.socket.emit('send-message', {
        messageBody,
        room: this.currentRoomId,
      });

      const chat =
        this.fetchChat(null, this.chats) ||
        this.fetchChat(null, this.groupChats);
      chat?.messages.push(messageBody);
      this.showReplyMenu('hide');
      inputElem.value = '';
      this.scrollTo(null);
      this.setReceivedStatus();
      this.saveAllChats();
    }
  }

  async getUsers() {
    const response = await fetch('/api/get-all-users', {
      credentials: 'include',
    });

    if (!response) {
      this.router.navigate(['/error']);
      this.errorMsgsrv.setErrorMessage('Error fetching users');
      return;
    }

    const resJson = await response.json();

    this.allUsers = resJson.filter((user: any) => user.id !== this.isAuth);
    this.username = resJson.find(
      (user: any) => user.id === this.isAuth
    ).username;
  }

  selectNewChat(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const parentElem = target.closest('.search-result') as HTMLElement;

    if (parentElem) {
      const username = parentElem.getAttribute('data-username')!;
      this.modalMemory = this.allUsers.find(
        (user) => user.username === username
      )!;
    }

    this.el.nativeElement
      .querySelectorAll('.modal-new-chat .search-result')
      .forEach((searchDiv: HTMLDivElement) => {
        searchDiv.querySelector('.selected-status')?.classList.remove('show');
      });
    parentElem.querySelector('.selected-status')?.classList.add('show');
  }

  getOnlineGroupMembers(group: Chat) {
    const count = group.recipient.filter((recipient) =>
      this.onlineUsers.includes(recipient.username)
    ).length;

    return count;
  }

  newChat() {
    if (!this.modalMemory.username) {
      this.modalMemory = this.allUsers[0];
    }
    this.socket.emit('new-chat', {
      from: { id: this.isAuth, username: this.username },
      to: this.modalMemory,
    });
    const interval = setInterval(() => {
      const chat = this.chats.find(
        (chat) => chat.recipient[0].username === this.modalMemory.username
      );
      if (chat) {
        const sortedUsers = [this.username, this.modalMemory.username].sort();
        this.showOrHideModal('new-chat', 'hide');
        this.currentRoomId = `chat:${sortedUsers[0]}:${sortedUsers[1]}`;
        this.el.nativeElement
          .querySelectorAll('.chat-brief')
          .forEach((brief: HTMLDivElement) => {
            const id = brief.getAttribute('data-id');
            if (id) {
              brief.classList.add('chat-selected');
            } else {
              brief.classList.remove('chat-selected');
            }
          });
        clearInterval(interval);
        this.saveAllChats();
      }
    }, 100);
  }

  async createGroup() {
    const image = this.el.nativeElement.querySelector(
      '.modal-new-group .image-upload-label input'
    );
    const groupName = this.el.nativeElement.querySelector(
      '.modal-new-group .name-div input'
    );
    const groupDescription = this.el.nativeElement.querySelector(
      '.modal-new-group .description-div textarea'
    );
    const groupForm =
      !this.modalMemory || !this.modalMemory.groupForm
        ? 'public'
        : this.modalMemory.groupForm;
    const password = this.el.nativeElement.querySelector(
      '.modal-new-group .password-div input'
    );

    if (groupName) {
      const form = new FormData();

      form.append('image', image.files[0]);
      form.append('name', groupName.value);
      form.append('form', groupForm);

      if (groupForm === 'private' && password.value) {
        form.append('password', password.value);
      } else if (groupForm === 'private' && !password.value) {
        return this.errorMsgsrv.setErrorMessage(
          'Password required for private groups'
        );
      }

      if (
        groupDescription.value.trim().split(/\s+/).filter(Boolean).length <= 100
      ) {
        form.append('description', groupDescription.value);
      } else {
        return this.errorMsgsrv.setErrorMessage(
          'Description should not exceed a 100 words'
        );
      }

      const response = await fetch('/api/create-group', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });

      if (response.ok) {
        const resJson = await response.json();
        this.groupChats.unshift(resJson);
        this.showOrHideModal('new-group', 'hide');
        this.setMode('group');
        groupDescription.value = '';
        groupName.value = '';
        password.value = '';
        this.saveAllChats();
      } else {
        return this.errorMsgsrv.setErrorMessage('Error creating group');
      }
    } else {
      return this.errorMsgsrv.setErrorMessage('Group name required');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.modalMemory = {};
        this.modalMemory.currentImgSrc = reader.result;
      };

      reader.readAsDataURL(file);
    }
  }

  saveAllChats() {
    const allChats = [...this.chats, ...this.groupChats];
    this.chatSrv.saveChats(allChats);
  }

  deleteMessage(e: any) {
    const message = this.getSelectedMessageId(e)!;
    this.deleteForm = { message, form: 'msg', e };
    this.showOrHideModal('clear-delete', 'show');
  }

  deleteMessageForMe(e: any) {
    const message = this.getSelectedMessageId(e)!;
    this.deleteForm = { message, form: 'msg for me', e };
    this.showOrHideModal('clear-delete', 'show');
  }

  clearChat() {
    this.deleteForm = { message: null, form: 'clear chat', e: null };
    this.showOrHideModal('clear-delete', 'show');
  }

  deleteChat(roomId: string) {
    this.deleteForm = { message: null, form: 'delete chat', e: roomId };
    this.showOrHideModal('clear-delete', 'show');
  }

  pinnedLength(chatType: Chat[]) {
    const count = chatType.filter((chat) => {
      return chat.filter.pinned.includes(this.isAuth.toString());
    }).length;
    return count;
  }

  async setChatFilter(
    chatRoomId: string,
    filter: 'pinned' | 'archived',
    chatType: Chat[]
  ) {
    const filterObj = this.fetchChat(chatRoomId, chatType)?.filter!;
    const userId = this.isAuth.toString();

    const toggleFilter = (filterArray: string[], otherArray: string[]) => {
      const index = filterArray.indexOf(userId);
      const indexOther = otherArray.indexOf(userId);

      if (index > -1) {
        filterArray.splice(index, 1);
      } else {
        filterArray.push(userId);
      }

      if (indexOther > -1) {
        otherArray.splice(indexOther, 1);
      }
    };

    const originalPinnedArray = [...filterObj.pinned];
    const originalArchivedArray = [...filterObj.archived];

    const pinnedArray = filterObj.pinned;
    const archivedArray = filterObj.archived;

    try {
      if (filter === 'archived') {
        toggleFilter(archivedArray, pinnedArray);
      } else if (filter === 'pinned') {
        toggleFilter(pinnedArray, archivedArray);
      } else {
        return this.errorMsgsrv.setErrorMessage('Invalid filter type');
      }

      const response = await fetch(
        `/api/filter/${chatRoomId}/${filter}/${userId}`
      );

      if (!response.ok) {
        filterObj.pinned = originalPinnedArray;
        filterObj.archived = originalArchivedArray;
        return this.errorMsgsrv.setErrorMessage('Failed to update filter');
      }
      this.saveAllChats();
    } catch (error) {
      console.error('Error updating chat filter:', error);
      return this.errorMsgsrv.setErrorMessage('Error updating chat filter');
    }
  }

  joinGroup() {
    const groupIdInput = this.el.nativeElement.querySelector(
      '.modal-join-group .name-div input'
    );
    const passwordInput = this.el.nativeElement.querySelector(
      '.modal-join-group .password-div input'
    );

    let data;

    if (groupIdInput.value) {
      if (this.modalMemory.groupForm !== 'private') {
        data = { userId: this.isAuth, groupId: groupIdInput.value };
      } else if (
        this.modalMemory.groupForm === 'private' &&
        passwordInput.value
      ) {
        data = {
          userId: this.isAuth,
          groupId: groupIdInput.value,
          password: passwordInput.value,
        };
      } else if (
        this.modalMemory.groupForm === 'private' &&
        !passwordInput.value
      ) {
        return this.errorMsgsrv.setErrorMessage(
          'Password field should not be empty'
        );
      }
    } else {
      return this.errorMsgsrv.setErrorMessage(
        'Group id field should not be empty'
      );
    }

    if (data) {
      this.socket.emit('join-group', data);
      this.showOrHideModal('join-group', 'hide');
    }
  }

  async delete(e: any, message: Chat['messages'][number] | null) {
    if (this.deleteForm) {
      const chat =
        this.fetchChat(this.deleteForm.e || null, this.chats) ||
        this.fetchChat(this.deleteForm.e || null, this.groupChats);

      try {
        if (this.deleteForm.form === 'msg for me') {
          const response = await fetch(
            `/api/delete/for-user/${this.currentRoomId}/${message?.id}/${this.username}`
          );

          if (response.ok) {
            if (!message?.deleteState.forMe.includes(this.username)) {
              message?.deleteState.forMe.push(this.username);
            }
          }
        } else if (this.deleteForm.form === 'msg') {
          if (message) {
            message.deleteState.forEveryone = true;
            message.message = '';
          }
          this.socket.emit('delete-message', {
            message,
            room: this.currentRoomId,
          });
          this.showMenu(e, 'text-menu');
        } else if (this.deleteForm.form === 'clear chat') {
          const response = await fetch(
            `/api/delete/clear/${this.currentRoomId}/msg/${this.username}`
          );

          if (response.ok) {
            chat?.messages.forEach((message) => {
              if (!message.deleteState.forMe.includes(this.username)) {
                message.deleteState.forMe.push(this.username);
              }
            });
          }
        } else if (this.deleteForm.form === 'delete chat') {
          const response = await fetch(
            `/api/delete/delete-chat/${this.deleteForm.e}/msg/${this.username}`
          );

          if (response.ok) {
            chat?.messages.forEach((message) => {
              if (!message.deleteState.forMe.includes(this.username)) {
                message.deleteState.forMe.push(this.username);
              }
            });
            chat?.deleted.push(this.username);
            this.currentRoomId = undefined;
          }
        }
      } catch (error) {
        console.error(error);
        return this.errorMsgsrv.setErrorMessage(
          'an error has occured during deletion'
        );
      }

      this.showOrHideModal('clear-delete', 'hide');
      this.saveAllChats();
      this.chatSrv.setDeleteForm(undefined);
    }
  }

  searchInChat() {
    const search = this.el.nativeElement.querySelector(
      '.hr-search-bar input'
    ).value;
    if (search) {
      const chat =
        this.fetchChat(null, this.chats) ||
        this.fetchChat(null, this.groupChats);
      const messageSpec = chat?.messages.find((message) =>
        message.message.includes(search)
      );
      if (messageSpec) {
        this.el.nativeElement
          .querySelectorAll('.message-div-container')
          .forEach((message: HTMLDivElement) => {
            message.classList.remove('searched');
            if (
              parseInt(message.getAttribute('data.message-id')!) ===
              messageSpec.id
            ) {
              message.classList.add('searched');
              this.scrollTo(message.offsetTop - 200);
              setTimeout(() => {
                message.classList.remove('searched');
              }, 4000);
            }
          });
      }
    }
  }

  setCurrentRoom(e: MouseEvent, location: 'online-user' | 'chat-brief') {
    const target = e.target as HTMLElement;
    const parentElem = target.closest(`.${location}`) as HTMLElement;

    if (parentElem) {
      const id = parentElem.getAttribute('data-id');

      this.el.nativeElement
        .querySelectorAll('.chat-brief')
        .forEach((brief: HTMLDivElement) => {
          brief.classList.remove('chat-selected');
        });

      const chatBriefElem = target.closest('.chat-brief') as HTMLElement;
      if (chatBriefElem) {
        chatBriefElem.classList.add('chat-selected');
      }

      if (id) {
        this.currentRoomId = id;

        if (
          this.fetchChat(this.currentRoomId, this.chats)?.messages.length! > 0
        ) {
          this.fetchChat(this.currentRoomId, this.chats)?.messages.forEach(
            (message) => {
              if (message.sender.id !== this.isAuth) {
                message.sendStatus.status = 'read';
              }
            }
          );
          this.scrollTo(null);
          this.socket.emit('read-messages', {
            room: this.currentRoomId,
            userId: this.isAuth,
          });
        }
      }
    }
  }

  fetchChat(roomId: string | null, chatType: Chat[]) {
    return (
      chatType.find(
        (chat) => chat.chatRoomId === (roomId ?? this.currentRoomId)
      ) || null
    );
  }

  getSelectedMessageId(e: any) {
    const container = e.target.closest('.message-div-container');
    const id = parseInt(container.getAttribute('data.message-id')!);
    const chat =
      this.fetchChat(null, this.chats) || this.fetchChat(null, this.groupChats);
    const message = chat?.messages.find((message) => message.id === id);
    return message;
  }

  exitGroup() {
    this.socket.emit('exit-group', {
      userId: this.isAuth,
      room: this.currentRoomId,
    });
  }

  setReply(e: any) {
    const message = this.getSelectedMessageId(e)!;
    this.reply = {
      id: message.sender.id,
      message: message.message,
      time: message.sendStatus.sendTime,
      name: message.sender.name,
    };
  }

  setMode(key: 'chat' | 'group') {
    this.mode = key;
    this.setFilter('all');
  }

  setFilter(key: 'all' | 'pinned' | 'archived') {
    this.filter = key;
    this.chatSearch = [];
    this.showElement('.chat-filter-opts', 'toggle-chat-filter-opts', false);
  }

  showOrHideModal(
    key:
      | 'new-chat'
      | 'new-group'
      | 'clear-delete'
      | 'forward-message'
      | 'exit-group'
      | 'join-group',
    action: 'show' | 'hide'
  ) {
    if (action === 'show') {
      const modalClasses = [
        'new-chat',
        'new-group',
        'clear-delete',
        'forward-message',
        'exit-group',
        'join-group',
      ];

      modalClasses.forEach((modalClass) => {
        this.showElement(`.modal-${modalClass}`, 'show', false);
      });
      this.showElement('.modal-div', 'show', true);
      this.showElement(`.modal-${key}`, 'show', true);
    } else if (action === 'hide') {
      this.showElement('.modal-div', 'show', false);
      this.showElement(`.modal-${key}`, 'show', false);
      console.log(this.deleteForm);
      this.deleteForm = undefined;
      this.modalMemory = {};
    }
  }

  showElement(selector: string, className: string, add: boolean = true) {
    const element = this.el.nativeElement.querySelector(selector);
    if (element) {
      if (add) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
    }
  }

  toggleElementVisibility(selector: string, toggleClass: string) {
    const element = this.el.nativeElement.querySelector(selector);
    if (element) {
      element.classList.toggle(toggleClass);
    }
  }

  showSearchBar(key: string) {
    this.showElement(`.${key}-search-bar`, `show-${key}-search-bar`, true);
  }

  hideSearchBar(key: string) {
    this.showElement(`.${key}-search-bar`, `show-${key}-search-bar`, false);
    if (key === 'tm') {
      this.chatSearch = [];
    }
  }

  showTmDropdown(key: 'new' | 'filter') {
    const newChatOpts = '.new-chat-opts';
    const chatFilterOpts = '.chat-filter-opts';

    if (key === 'new') {
      this.showElement(chatFilterOpts, 'toggle-chat-filter-opts', false);
      this.toggleElementVisibility(newChatOpts, 'toggle-new-chat-opts');
    } else if (key === 'filter') {
      this.showElement(newChatOpts, 'toggle-new-chat-opts', false);
      this.toggleElementVisibility(chatFilterOpts, 'toggle-chat-filter-opts');
    }
  }

  showMenu(e: any, menuType: 'cb-dropdown' | 'text-menu') {
    e.stopPropagation();

    const menuSelector = `.${menuType}`;
    const menuClass = `show-${menuType}`;

    const parentElem =
      menuType === 'cb-dropdown'
        ? e.target.closest('.chat-brief')
        : e.target.parentElement;

    if (parentElem) {
      const currentMenu = parentElem.querySelector(menuSelector);

      if (currentMenu && currentMenu.classList.contains(menuClass)) {
        this.el.nativeElement
          .querySelectorAll(
            `.sidebar-info ${menuSelector}, .major-content ${menuSelector}`
          )
          .forEach((menu: HTMLDivElement) => {
            menu.classList.remove(menuClass);
          });
      } else {
        this.el.nativeElement
          .querySelectorAll(
            `.sidebar-info ${menuSelector}, .major-content ${menuSelector}`
          )
          .forEach((menu: HTMLDivElement) => {
            menu.classList.remove(menuClass);
          });

        if (currentMenu) {
          currentMenu.classList.add(menuClass);
        }
      }
    }
  }

  showReplyMenu(key: string, e?: any) {
    const replyMenu = '.major-text-input .reply';
    if (key === 'show') {
      setTimeout(() => {
        this.setReply(e);
      }, 600);
      this.showElement(replyMenu, 'show-reply', true);
      this.el.nativeElement
        .querySelectorAll('.major-content .text-menu')
        .forEach((menu: HTMLDivElement) => {
          menu.classList.remove('show-text-menu');
        });
    } else {
      this.showElement(replyMenu, 'show-reply', false);
      this.reply = undefined;
    }
  }

  showHrChatMenu() {
    this.toggleElementVisibility('.hr-chat-menu', 'show-hr-chat-menu');
  }

  closeChat() {
    this.el.nativeElement
      .querySelectorAll('.chat-brief')
      .forEach((brief: HTMLDivElement) => {
        brief.classList.remove('chat-selected');
      });
    this.showHrChatMenu();
    this.hideSearchBar('hr');
    this.currentRoomId = undefined;
  }

  togglePage(
    key: 'add' | 'remove',
    elem: 'info' | 'chat-major' | 'chat-minor'
  ) {
    this.showElement(`.${elem}`, 'show', key === 'add');

    if (elem === 'chat-major') {
      this.showElement('.chat-minor', 'show', true);
    } else if (elem === 'chat-minor') {
      this.showElement('.chat-major', 'show', true);
    }
  }

  ngOnDestroy(): void {
    this.chatSub.unsubscribe();
    this.onlineUsersSub.unsubscribe();
  }
}
