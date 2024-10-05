import { Component, ElementRef, OnInit } from '@angular/core';
import { IsAuthService } from '../../../service/is-auth.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UserProfile } from '../../../interfaces/interface';
import { ErrorMessageService } from '../../../service/error-message.service';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  constructor(
    private isAuthService: IsAuthService,
    private router: Router,
    private route: ActivatedRoute,
    private el: ElementRef,
    private errorMsgSrv: ErrorMessageService,
    private socket: Socket
  ) {}

  isEditing = false;
  id!: string;
  isCurrentUser = true;
  isLoading = true;
  isAuth!: boolean | string;
  user!: UserProfile;
  updatingProfile = false;
  hasUploadPic!: boolean;

  async ngOnInit(): Promise<void> {
    this.isAuth = await this.isAuthService.checkAuthStatus();
    this.isAuthService.setAuthStatus(this.isAuth);

    this.route.queryParamMap.subscribe(async (params: ParamMap) => {
      this.id = params.get('id')!;
      await this.fetchProfile(this.id);
    });

    this.isLoading = false;
  }

  async fetchProfile(id: string) {
    const response = await fetch(`/api/fetch-profile/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      this.router.navigate(['/error']);
    }

    const resJson = await response.json();
    this.user = resJson.userResponse;
    this.isCurrentUser = resJson.isCurrentUser;
  }

  async updateProfile() {
    // const errorMsg: HTMLDivElement =
    //   this.el.nativeElement.querySelector('.error-msg');
    const genderRadio = this.el.nativeElement.querySelector(
      'input[name="gender"]:checked'
    );
    const bioInput = this.el.nativeElement.querySelector('#bio-input');
    const locationInput =
      this.el.nativeElement.querySelector('#location-input');
    const profilePicInput: HTMLInputElement =
      this.el.nativeElement.querySelector('#profile-pic-upload');

    const status = this.runValidation(genderRadio, bioInput);

    this.errorMsgSrv.setErrorMessage(status.msg);

    if (status.status) {
      this.updatingProfile = true;

      const formData = new FormData();
      formData.append('gender', genderRadio.value);
      formData.append('bio', bioInput.value);
      formData.append('location', locationInput.value);
      formData.append('profile-pic', profilePicInput.files![0]);

      const response = await fetch('/api/update-profile', {
        method: 'Post',
        body: formData,
        credentials: 'include',
      });

      if (response.status === 200) {
        await this.fetchProfile(this.id);
        this.updatingProfile = false;
        this.isEditing = false;
      } else {
        this.errorMsgSrv.setErrorMessage(
          'Error Updating Profile. Please try again later'
        );
      }
    }
  }

  edit() {
    this.isEditing = true;
  }

  exitEdit() {
    this.isEditing = false;
  }

  runValidation(genderRadio: HTMLInputElement, bioInput: HTMLTextAreaElement) {
    let status;
    const bioLength =
      bioInput.textLength > 10 && bioInput.textLength < 100 ? true : false;

    if (!genderRadio.value) {
      status = { status: false, msg: 'Select A Gender' };
    } else if (!bioLength) {
      status = { status: false, msg: 'Bio should be between 10 - 100 words' };
    } else {
      status = { status: true, msg: '' };
    }

    return status;
  }

  onPicChange(event: any) {
    const file = event.target.files[0];

    this.hasUploadPic = file ? true : false;
  }

  async logout() {
    const response = await fetch('/api/log-out', {
      credentials: 'include',
    });

    if (!response.ok) {
      this.errorMsgSrv.setErrorMessage('Error logging user out');
    } else {
      this.socket.disconnect();
      this.router.navigate(['/']);
    }
  }
}
