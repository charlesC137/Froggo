import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogRoutingModule } from './blog-routing.module';
import { RouterLink } from '@angular/router';
import { CategoryComponent } from './category/category.component';
import { PostComponentMod } from './post/post.component';
import { PaginationComponent } from '../../component-parts/pagination/pagination.component';
import { LoadingComponent } from '../../component-parts/loading/loading.component';
import { HeaderComponent } from '../../component-parts/header/header.component';
import { FooterComponent } from '../../component-parts/footer/footer.component';
import { PostComponent } from '../../component-parts/post-component/post-component.component';
import { SideDivComponent } from '../../component-parts/side-div/side-div.component';
import { BriefPipe } from '../../pipes/brief.pipe';

@NgModule({
  declarations: [CategoryComponent, PostComponentMod],
  imports: [
    CommonModule,
    BlogRoutingModule,
    RouterLink,
    PaginationComponent,
    LoadingComponent,
    HeaderComponent,
    FooterComponent,
    PostComponent,
    SideDivComponent,
    BriefPipe,
  ],
})
export class BlogModule {}
