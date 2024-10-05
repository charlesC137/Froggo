import { ElementRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { BookmarkComponent } from './bookmark/bookmark.component';
import { ProfileComponent } from './profile/profile.component';
import { FooterComponent } from '../../component-parts/footer/footer.component';
import { PaginationComponent } from '../../component-parts/pagination/pagination.component';
import { HeaderComponent } from '../../component-parts/header/header.component';
import { LoadingComponent } from '../../component-parts/loading/loading.component';
import { SideDivComponent } from '../../component-parts/side-div/side-div.component';
import { PostComponent } from '../../component-parts/post-component/post-component.component';
import { ChatComponent } from './chat/chat.component';
import { SharedSocketModule } from '../shared-websocket/shared-websocket.module';
import { ChatService } from '../../service/chats.service';
import { ChatBriefComponent } from '../../component-parts/chat-brief/chat-brief.component';

@NgModule({
  declarations: [BookmarkComponent, ProfileComponent, ChatComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    FooterComponent,
    PaginationComponent,
    HeaderComponent,
    LoadingComponent,
    SideDivComponent,
    PostComponent,
    ChatBriefComponent,
    SharedSocketModule,
  ],
  providers: [ChatService],
})
export class UserModule {}
