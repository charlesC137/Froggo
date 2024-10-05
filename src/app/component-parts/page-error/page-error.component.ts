import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-error',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './page-error.component.html',
  styleUrl: './page-error.component.css',
})
export class PageErrorComponent {
  constructor(private router: Router) {}

  backToHome() {
    this.router.navigate(['/']);
  }
}
