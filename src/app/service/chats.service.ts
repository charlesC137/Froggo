import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Chat, DeleteForm } from '../interfaces/interface';
import { Socket } from 'ngx-socket-io';
import { ErrorMessageService } from './error-message.service';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(
    private socket: Socket,
    private errorMsgSrv: ErrorMessageService
  ) {}

  private allChats = new BehaviorSubject<Chat[] | null>(null);
  private onlineUsers = new BehaviorSubject<string[]>([]);
  private currentRoomId = new BehaviorSubject<string | undefined>(undefined);
  private deleteForm = new BehaviorSubject<DeleteForm | undefined>(undefined);

  allChats$ = this.allChats.asObservable();
  onlineUsers$ = this.onlineUsers.asObservable();
  currentRoomId$ = this.currentRoomId.asObservable();
  deleteForm$ = this.deleteForm.asObservable();

  async getAllChats(): Promise<Chat[] | null> {
    if (this.allChats.value === null) {
      const response = await fetch('/api/get-chats', {
        credentials: 'include',
      });

      const resJson = (await response.json()) || [];
      this.allChats.next(resJson);
    }
    return this.allChats.value;
  }

  saveChats(chats: Chat[]) {
    this.allChats.next(chats);
  }

  setDeleteForm(form: DeleteForm | undefined) {
    this.deleteForm.next(form);
  }

  getAllUnreadCount(chats: Chat[], userId: string) {
    let count = 0;

    chats.forEach((c) => {
      count += this.unreadMessagesCount(c.messages, userId);
    });
    console.log(count);
    return count;
  }

  unreadMessagesCount(messages: Chat['messages'], userId: string): number {
    const unreadCount = messages.filter(
      (message) =>
        (message.sendStatus.status === 'received' ||
          message.sendStatus.status === 'sent') &&
        message.sender.id !== userId
    ).length;
    return unreadCount;
  }

  async socketListeners(userId: string) {
    const chats = await this.getAllChats();

    const fetchChat = (roomId: string | null) => {
      return chats!.find((chat) => chat.chatRoomId === roomId) || null;
    };

    const setReceivedStatus = () => {
      this.onlineUsers.getValue().forEach((onlineUser) => {
        chats!.forEach((chat) => {
          if (chat.recipient[0].username === onlineUser) {
            chat.messages.forEach((message) => {
              if (
                message.sender.id === userId &&
                message.sendStatus.status === 'sent'
              ) {
                message.sendStatus.status = 'received';
              }
            });
          }
        });
      });
      this.saveChats(chats!);
    };

    this.socket.fromEvent('online-users').subscribe((users: any) => {
      this.onlineUsers.next(users);
      setReceivedStatus();
    });

    this.socket.fromEvent('deleted-message').subscribe((message: any) => {
      const chat = fetchChat(message.room);
      const deletedMessage = chat?.messages.find(
        (msg) => msg.id === message.id
      )!;

      deletedMessage.deleteState = message.deleteState;
      deletedMessage.message = message.message;
      this.saveChats(chats!);
    });

    this.socket.fromEvent('typing').subscribe((data: any) => {
      const chat = fetchChat(data.room);

      if (chat) {
        const recipientIndex = data.i ?? 0;
        const recipient = chat.recipient[recipientIndex];

        if (recipient) {
          recipient.typing = data.form === 'add';
        }
      }
    });

    this.socket.fromEvent('rcp-read-msg').subscribe((data: any) => {
      const chat = fetchChat(data.room);
      chat!.messages.forEach((message) => {
        if (message.sender.id !== data.userId) {
          message.sendStatus.status = 'read';
        }
      });
      this.saveChats(chats!);
    });

    this.socket.fromEvent('new-chat-rsp').subscribe((data: any) => {
      chats!.unshift(data);
      this.saveChats(chats!);
    });

    this.socket.fromEvent('exited-group').subscribe((data: any) => {
      const i = chats!.findIndex((c) => c.chatRoomId === data.room)!;
      chats!.splice(i, 1);
      this.currentRoomId.next(undefined);
      this.saveChats(chats!);
    });

    this.socket.fromEvent('user-exited-group').subscribe((data: any) => {
      const group = fetchChat(data.room);
      const i = group?.recipient.findIndex((r) => r.id === data.userId)!;
      group?.recipient.splice(i, 1);
      this.saveChats(chats!);
    });

    this.socket.fromEvent('joined-group').subscribe((data: any) => {
      chats!.unshift(data);
      this.saveChats(chats!);
    });

    this.socket.fromEvent('user-joined-group').subscribe((data: any) => {
      const group = fetchChat(data.roomId);
      group?.recipient.push(data.recDetails);
      this.saveChats(chats!);
    });

    this.socket.fromEvent('error').subscribe((msg: any) => {
      this.errorMsgSrv.setErrorMessage(msg);
    });
  }
}
