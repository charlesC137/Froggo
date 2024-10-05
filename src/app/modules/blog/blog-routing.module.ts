import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryComponent } from './category/category.component';
import { PostComponentMod } from './post/post.component';
import { PageErrorComponent } from '../../component-parts/page-error/page-error.component';
import { SearchRedirectGuard } from '../../guards/search.guard';

const routes: Routes = [
  { path: 'category/:category', component: CategoryComponent },
  { path: 'post/:id', component: PostComponentMod },
  {
    path: 'search',
    component: CategoryComponent,
    canActivate: [SearchRedirectGuard],
  },
  { path: 'error', component: PageErrorComponent },
  //define routes above
  { path: '**', redirectTo: '/error' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlogRoutingModule {}
