import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Chat } from '../../interfaces/interface';
import { ErrorMessageService } from '../../service/error-message.service';
import { ChatService } from '../../service/chats.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-brief',
  templateUrl: './chat-brief.component.html',
  styleUrl: './chat-brief.component.css',
  standalone: true,
  imports: [CommonModule],
})
export class ChatBriefComponent {
  constructor(
    private el: ElementRef,
    private errorMsgSrv: ErrorMessageService,
    private chatSrv: ChatService
  ) {}

  @Input() brief!: Chat;
  @Input() isAuth!: string;
  @Input() onlineUsers!: string[];
  @Input() currentRoomId!: string | undefined;
  @Input() username!: string;
  @Input() chats!: Chat[];
  @Output() showDeleteModal: EventEmitter<boolean> = new EventEmitter();

  getChatRecipient(recs: Chat['recipient']) {
    const rec = recs[0].id === this.isAuth ? recs[1] : recs[0];
    return rec;
  }

  unreadMessagesCount(messages: Chat['messages']): number {
    const unreadCount = messages.filter(
      (message) =>
        (message.sendStatus.status === 'received' ||
          message.sendStatus.status === 'sent') &&
        message.sender.id !== this.isAuth
    ).length;
    return unreadCount;
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

  fetchChat(roomId: string | null, chatType: Chat[]) {
    return (
      chatType.find(
        (chat) => chat.chatRoomId === (roomId ?? this.currentRoomId)
      ) || null
    );
  }

  deleteChat(roomId: string) {
    this.chatSrv.setDeleteForm({
      message: null,
      form: 'delete chat',
      e: roomId,
    });
    this.showDeleteModal.emit(true);
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
        return this.errorMsgSrv.setErrorMessage('Invalid filter type');
      }

      const response = await fetch(
        `/api/filter/${chatRoomId}/${filter}/${userId}`
      );

      if (!response.ok) {
        filterObj.pinned = originalPinnedArray;
        filterObj.archived = originalArchivedArray;
        return this.errorMsgSrv.setErrorMessage('Failed to update filter');
      }
      this.chatSrv.saveChats(this.chats);
    } catch (error) {
      console.error('Error updating chat filter:', error);
      return this.errorMsgSrv.setErrorMessage('Error updating chat filter');
    }
  }

  getTypingUsers(roomId: string) {
    const chat = this.fetchChat(roomId, this.chats);

    const typingUsers = chat?.recipient.filter((r) => r.typing === true);

    return typingUsers || [];
  }

  getLastMessageDetails(messages: Chat['messages']): {
    message: string;
    sendTime: string;
    senderId: string | boolean;
    sendStatus?: Chat['messages'][number]['sendStatus'];
    sender?: string;
  } {
    if (!Array.isArray(messages) || messages.length === 0) {
      return { message: '', sendTime: '', senderId: '' };
    }

    const lastMessage = messages[messages.length - 1];

    if (!lastMessage) {
      return { message: '', sendTime: '', senderId: '' };
    }

    if (!lastMessage.message) {
      return { message: 'deleted', sendTime: '', senderId: '' };
    }

    if (!lastMessage.deleteState?.forMe?.includes(this.username)) {
      return {
        message: lastMessage.message,
        sendTime: lastMessage.sendStatus.sendTime ?? '',
        senderId: lastMessage.sender.id,
        sendStatus: lastMessage.sendStatus,
        sender: lastMessage.sender.name,
      };
    } else {
      const nonDeletedMessage = [...messages]
        .reverse()
        .find((msg) => !msg.deleteState?.forMe?.includes(this.username));

      return {
        message: nonDeletedMessage?.message ?? '',
        sendTime: nonDeletedMessage?.sendStatus.sendTime ?? '',
        senderId: nonDeletedMessage?.sender.id ?? '',
        sendStatus: nonDeletedMessage?.sendStatus,
        sender: nonDeletedMessage?.sender.name ?? '',
      };
    }
  }
}
