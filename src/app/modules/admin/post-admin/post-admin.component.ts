import { Component, ElementRef, OnInit } from '@angular/core';
import { IsAuthService } from '../../../service/is-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-admin',
  templateUrl: './post-admin.component.html',
  styleUrl: './post-admin.component.css',
})
export class PostAdminComponent implements OnInit {
  constructor(
    private el: ElementRef,
    private isAuthService: IsAuthService,
    private router: Router
  ) {}

  selectedCategory!: string;
  isLoading = true;
  categories!: string[];

  async ngOnInit(): Promise<void> {
    const status = await this.isAuthService.checkAdminStatus();

    if (!status) {
      this.router.navigate(['/']);
    }

    await this.fetchCategories();

    this.isLoading = false;
  }

  async addcategory() {
    const categoryName = this.el.nativeElement
      .querySelector('.add-cat-div input')
      .value.toString()
      .toLowerCase();

    const categoryImage = this.el.nativeElement.querySelector('#cat-img');

    if (categoryName && categoryImage) {
      const formData = new FormData();
      formData.append('name', categoryName);
      formData.append('image', categoryImage.files[0]);

      const response = await fetch('/api/add-category', {
        method: 'Post',
        body: formData,
      });

      if (!response.ok) {
        this.el.nativeElement.querySelector('.error-msg').textContent =
          'Error Adding Category';
        console.error('Error adding category');
      } else {
        this.el.nativeElement.querySelector('.add-cat-div input').value = '';
        categoryImage.value = '';
        this.el.nativeElement.querySelector('.error-msg').textContent = '';
        await this.fetchCategories();
      }
    }
  }

  async fetchCategories() {
    const categoriesJson = await fetch('/api/category-list');

    if (!categoriesJson.ok) {
      console.error('Error fetching categories');
    }
    this.categories = await categoriesJson.json();
  }

  async submit() {
    const postContent = this.el.nativeElement.querySelector(
      '.post-content textarea'
    );
    const category = this.el.nativeElement.querySelector(
      '.post-content select'
    );
    const title = this.el.nativeElement.querySelector('.title-input');
    const postImage = this.el.nativeElement.querySelector('#post-img');
    const featuredImage = this.el.nativeElement.querySelector('#featured-img');

    if (
      postContent.value &&
      category.value &&
      title.value &&
      postImage.value &&
      featuredImage.value
    ) {
      this.el.nativeElement.querySelector('.error-msg').textContent = '';

      const formData = new FormData();
      formData.append('postContent', postContent.value);
      formData.append('category', category.value);
      formData.append('title', title.value);
      formData.append('postImage', postImage.files[0]);
      formData.append('featuredImage', featuredImage.files[0]);

      const response = await fetch('/api/post-blog', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 200) {
        postContent.value = '';
        category.value = '';
        title.value = '';
        postImage.value = '';
        featuredImage.value = '';
      } else {
        this.el.nativeElement.querySelector('.error-msg').textContent =
          'Error Posting Blog';
        console.error('Error Posting Blog');
      }
    } else {
      this.el.nativeElement.querySelector('.error-msg').textContent =
        'Input Data In All Fields';
    }
  }
}
