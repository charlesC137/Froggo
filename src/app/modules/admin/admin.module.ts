import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { PostAdminComponent } from './post-admin/post-admin.component';
import { LoginAdminComponent } from './login-admin/login-admin.component';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../component-parts/loading/loading.component';

@NgModule({
  declarations: [PostAdminComponent, LoginAdminComponent],
  imports: [CommonModule, AdminRoutingModule, FormsModule, LoadingComponent],
})
export class AdminModule {}
