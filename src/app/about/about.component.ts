import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../component-parts/header/header.component';
import { FooterComponent } from '../component-parts/footer/footer.component';
import { IsAuthService } from '../service/is-auth.service';
import { LoadingComponent } from '../component-parts/loading/loading.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, LoadingComponent, CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit {
  constructor(private isAuthService: IsAuthService) {}

  isAuth!: boolean | string;
  isLoading = true;

  async ngOnInit(): Promise<void> {
    this.isAuth = await this.isAuthService.checkAuthStatus();
    this.isAuthService.setAuthStatus(this.isAuth);

    this.isLoading = false;
  }
}
