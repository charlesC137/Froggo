import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { BookmarkComponent } from './bookmark/bookmark.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
  { path: 'profile', component: ProfileComponent },
  { path: 'bookmark', component: BookmarkComponent },
  { path: 'chat', component: ChatComponent },

  //set routes above
  { path: '**', redirectTo: '/error' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
