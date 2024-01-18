import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { LoginService } from '_services';
import { OnboardingService } from '_services/onboarding.service';

@Component({
  selector: 'app-onboarding-register',
  templateUrl: './onboarding-register.component.html',
  styleUrls: ['./onboarding-register.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OnboardingRegisterComponent implements OnInit {
  assetsUrl = environment.assetsUrl;
  registerForm: FormGroup;
  constructor(
    private router: Router,
    private loginService: LoginService,
    private onboardingService: OnboardingService
  ) {}

  ngOnInit() {
    this.createRegisterForm();
    console.log('Register form');
  }
  createRegisterForm() {
    this.registerForm = new FormGroup({
      fullname: new FormControl(
        null /* , [Validators.required, Validators.minLength(6)] */
      ),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
      ]),
    });
  }

  registerUser() {
    this.onboardingService.registerUser(this.registerForm);
  }

  goToFacebookLogin() {
    window.location.href = environment.loginFacebookUrl;
  }

  goToGoogleLogin() {
    window.location.href = environment.loginGoogleUrl;
  }

  goToLogin() {
    this.loginService.loginDialog();
  }
}
