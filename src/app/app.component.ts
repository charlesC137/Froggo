import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorMessageService } from './service/error-message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private errorMsgSrv: ErrorMessageService) {}

  title = 'Froggo';
  errorMsg!: string | null;
  errorMsgSub!: Subscription;

  ngOnInit() {
    this.errorMsgSub = this.errorMsgSrv.errorMsg$.subscribe(
      (msg) => (this.errorMsg = msg)
    );
  }

  ngOnDestroy(): void {
    this.errorMsgSub.unsubscribe();
  }
}
