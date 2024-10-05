import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './auth-pages/login/login.component';
import { SignupComponent } from './auth-pages/signup/signup.component';
import { PageErrorComponent } from './component-parts/page-error/page-error.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'blog',
    loadChildren: () =>
      import('./modules/blog/blog.module').then((m) => m.BlogModule),
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./modules/user/user.module').then((m) => m.UserModule),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
  },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'error', component: PageErrorComponent },
  //set routes above
  { path: '**', redirectTo: '/error' },
];
