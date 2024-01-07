import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from 'src/app/@core/services/auth.service';
import { AuthfakeauthenticationService } from 'src/app/@core/services/authfake.service';

import { OwlOptions } from 'ngx-owl-carousel-o';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { ApiService } from 'src/app/@graphql/services/api.service';
import { ILoginForm, IResultLogin } from 'src/app/@core/interfaces/login.interface';

import { basicAlert } from 'src/app/@shared/alert/toasts';
import { TYPE_ALERT } from 'src/app/@shared/alert/values.config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
/**
 * Login-2 component
 */
export class LoginComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthenticationService,
  ) { }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  loginForm: FormGroup;
  submitted = false;
  error = '';
  returnUrl: string;
  login: ILoginForm = {
    email: '',
    password: '',
    remember: false
  };

  // set the currenr year
  year: number = new Date().getFullYear();

  carouselOption: OwlOptions = {
    items: 1,
    loop: false,
    margin: 0,
    nav: false,
    dots: true,
    responsive: {
      680: {
        items: 1
      },
    }
  };

  ngOnInit(): void {
    document.body.classList.add('auth-body-bg');
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false],
    });
    this.authService.start();
    if (localStorage.remember && localStorage.remember !== '') {
      this.login.email = localStorage.getItem('email');
      this.login.remember = localStorage.getItem('remember') === 'true' ? true : false;
    } else {
      this.login.email = '';
      this.login.remember = false;
    }
  }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;
    this.lsRememberMe();
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } else {
      this.authService.login(this.f.email.value, this.f.password.value).subscribe((result: IResultLogin) => {
        if (result.status) {
          if (result.token !== null) {
            this.router.navigate(['/dashboard']);
            this.authService.setSession(result.token);
            this.authService.updateSession(result);
            basicAlert(TYPE_ALERT.SUCCESS, result.message);
            return;
          }
          basicAlert(TYPE_ALERT.WARNING, result.message);
          return;
        }
        basicAlert(TYPE_ALERT.INFO, result.message);
      });
    }
  }

  lsRememberMe(): void {
    if (this.f.remember && this.f.email.value !== '') {
      localStorage.setItem('email', this.f.email.value);
      localStorage.setItem('remember', this.f.remember.value);
    } else {
      localStorage.setItem('email', '');
      localStorage.setItem('remember', 'false');
    }
  }

  togglePasswordVisibility() {
    var passwordInput = document.getElementById("password") as HTMLInputElement;
    var toggleBtn = document.getElementById("password-addon");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      if (toggleBtn) {
        toggleBtn.textContent = "Ocultar";
      }
    } else {
      passwordInput.type = "password";
      if (toggleBtn) {
        toggleBtn.textContent = "Mostrar";
      }
    }
  }

}
