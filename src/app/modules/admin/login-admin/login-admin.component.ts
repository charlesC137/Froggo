import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-admin',
  templateUrl: './login-admin.component.html',
  styleUrl: './login-admin.component.css',
})
export class LoginAdminComponent {
  constructor(private el: ElementRef, private router: Router) {}

  emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  usernameRegex = /^\w+/;
  passwordRegex = /^[@$!%*#?&a-zA-Z0-9._-]+$/;

  toggleView() {
    const eyeIcon = this.el.nativeElement.querySelector('.far');
    const passwordInput =
      this.el.nativeElement.querySelector('.password-input');

    if (eyeIcon.classList.contains('fa-eye')) {
      eyeIcon.classList.remove('fa-eye');
      eyeIcon.classList.add('fa-eye-slash');
      passwordInput.type = 'text';
    } else {
      eyeIcon.classList.add('fa-eye');
      eyeIcon.classList.remove('fa-eye-slash');
      passwordInput.type = 'password';
    }
  }

  async logIn() {
    const userInputValue =
      this.el.nativeElement.querySelector('.user-input').value;
    const passwordValue =
      this.el.nativeElement.querySelector('.password-input').value;
    const errorMsg = this.el.nativeElement.querySelector('.error-msg');

    if (
      this.passwordRegex.test(passwordValue) &&
      (this.emailRegex.test(userInputValue) ||
        this.usernameRegex.test(userInputValue))
    ) {
      errorMsg.textContent = '';

      const response = await fetch('/api/admin-log-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userInputValue,
          passwordValue,
        }),
      });

      if (response.status === 200) {
        this.router.navigate(['/admin/post']);
      } else {
        const responseJson = await response.json();
        errorMsg.textContent = responseJson;
      }
    } else {
      errorMsg.textContent = 'Invalid Input';
    }
  }
}
