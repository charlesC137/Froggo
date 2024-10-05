import { Component, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
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

  async signUp() {
    const emailValue =
      this.el.nativeElement.querySelector('.email-input').value;
    const usernameValue =
      this.el.nativeElement.querySelector('.username-input').value;
    const passwordValue =
      this.el.nativeElement.querySelector('.password-input').value;
    const errorMsg = this.el.nativeElement.querySelector('.error-msg');

    if (!this.emailRegex.test(emailValue)) {
      errorMsg.textContent = 'Invalid Email';
    } else if (!this.usernameRegex.test(usernameValue)) {
      errorMsg.textContent = 'Invalid Username';
    } else if (!this.passwordRegex.test(passwordValue)) {
      errorMsg.textContent = 'Invalid Password';
    } else {
      const response = await fetch('/api/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailValue, usernameValue, passwordValue }),
      });

      if (response.status === 200) {
        this.router.navigate(['/login']);
      } else {
        const responseJson = await response.json();
        errorMsg.textContent = responseJson;
      }
    }
  }
}
