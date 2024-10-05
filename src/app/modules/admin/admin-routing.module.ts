import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginAdminComponent } from './login-admin/login-admin.component';
import { PostAdminComponent } from './post-admin/post-admin.component';

const routes: Routes = [
  { path: 'login', component: LoginAdminComponent },
  { path: 'post', component: PostAdminComponent },
  //define routes above
  { path: '**', redirectTo: '/error' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
