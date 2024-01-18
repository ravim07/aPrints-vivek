import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { PageService, FormUtilService, AlertService } from '_shared/services';
import { environment } from 'environments/environment';
import { User, UserData } from '_models';
import { UserService } from '_services';
import { AuthService } from 'auth/auth.service';
import { RepeatValidation } from '_shared/validators';
import { PwdConfirmDialogComponent } from '_shared/components';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  assetsUrl = environment.assetsUrl;
  _showPopup = false;
  popupClass = '';
  showErrorDatePicker = '';
  userForm: FormGroup;
  formStatusClass = '';
  formSubmitted = false;
  errorApi = '';
  loggedUser: UserData;
  private oldPwd: string;

  @Output()
  popupEvent = new EventEmitter<any>();

  @Output()
  triggerUpdate = new EventEmitter<boolean>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private pageService: PageService,
    private alertService: AlertService,
    public formUtil: FormUtilService,
    private dialog: MatDialog,
  ) {}

  @Input()
  set showPopup(val: boolean) {
    this._showPopup = val;
    if (this._showPopup) {
      this.createForm();
      this.popupClass = 'modal-show';
      this.pageService.addBodyClass('modal-open');
    } else {
      this.popupClass = '';
      this.pageService.removeBodyClass('modal-open');
    }
  }

  ngOnInit() {
    this.getUserData();
  }

  closePopup() {
    this._showPopup = false;
    this.popupClass = '';
    this.pageService.removeBodyClass('modal-open');
    this.popupEvent.emit({ type: 'popup.closed' });
  }

  getUserData() {
    this.loggedUser = new UserData().deserialize(this.authService.getCurrentUser());
  }

  createForm() {
    this.userForm = new FormGroup({
      'name': new FormControl(`${this.loggedUser.name}`, Validators.required),
      'lastName': new FormControl(`${this.loggedUser.lastName}`, Validators.required),
      'email': new FormControl(
        {value: `${this.loggedUser.email}`, disabled: this.loggedUser.loginProviders.length > 0},
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])
      ),
      'repeatEmail': new FormControl(
        {value: `${this.loggedUser.email}`, disabled: this.loggedUser.loginProviders.length > 0}),
      'password': new FormControl(
        {value: ``, disabled: this.loggedUser.loginProviders.length > 0},
        [Validators.minLength(10), Validators.maxLength(128)]),
      'repeatPassword': new FormControl(
        {value: ``, disabled: this.loggedUser.loginProviders.length > 0}),
    });
    this.repeatPassword.setValidators([RepeatValidation(this.password)]);
    this.repeatEmail.setValidators([RepeatValidation(this.email)]);
  }

  get email() {
    return this.userForm.get('email') as FormControl;
  }

  get repeatEmail() {
    return this.userForm.get('repeatEmail') as FormControl;
  }

  get password() {
    return this.userForm.get('password') as FormControl;
  }

  get repeatPassword() {
    return this.userForm.get('repeatPassword') as FormControl;
  }

  checkForUserChanges(formValues) {
    const user = Object.assign({}, formValues);
    if (user.name === this.loggedUser.name) { delete user.name; }
    if (user.lastName === this.loggedUser.lastName) { delete user.lastName; }
    if (user.email === this.loggedUser.email) { delete user.email; }
    if (user.password.length < 1 || user.password === '') { delete user.password; }
    delete user.repeatPassword; delete user.repeatEmail;
    const props = Object.getOwnPropertyNames(user);
    if (props.length > 0) { user.id = this.loggedUser.id; }
    return user;
  }

  checkIfSensitiveData(user) {
    return {email: !!user.email, password: !!user.password};
  }

  relogin (user) {
    delete user.id;
    this.authService.logout(false);
    this.userService.loginUser(user)
    .subscribe(
      (newUser: User) => {
        this.oldPwd = '';
        this.authService.login(newUser);
        this.getUserData();
        this.triggerUpdateInParent();
        this.closePopup();
        this.alertService.showAlertSuccess('Changes saved and relogged successfully! ');
      },
      (errorData: any) => {
        console.error('Error LoginUser', errorData);
        this.errorApi = this.alertService.errorApiToString(errorData);
        this.formStatusClass = '';
      }
    );
  }

  submitEdit (user, authCheck) {
    if (authCheck.password || authCheck.email) {
      const loginUser = new User();
      loginUser.email = this.loggedUser.email;
      loginUser.password = this.oldPwd;
      this.userService.loginUser(loginUser).subscribe(
        (data: User) => {
          if (data) {
            this.userService.edit(user)
            .subscribe(
              (editedUser) => {
                this.formStatusClass = '';
                if (authCheck.password) {
                  user.email = this.email.value;
                  this.relogin(user);
                } else if (authCheck.email) {
                  user.password = this.oldPwd;
                  this.relogin(user);
                } else {
                  this.updateUserData(editedUser);
                }
              },
              (errorData: any) => {
                this.alertService.showAlertDanger('An error ocurred! No changes were made!');
                this.errorApi = this.alertService.errorApiToString(errorData);
                this.formStatusClass = '';
              }
            );
          }
        },
        (errorData: any) => {
          this.alertService.showAlertDanger('Error while authenticating. You gave us an incorrect password !');
          this.errorApi = 'Error while authenticating. You gave us a wrong password.';
          this.formStatusClass = '';
        }
      );
    } else {
      this.userService.edit(user)
      .subscribe(
        (data) => {
          this.updateUserData(data);
        },
        (errorData: any) => {
          this.alertService.showAlertDanger('An error ocurred! No changes were made!');
          this.errorApi = this.alertService.errorApiToString(errorData);
          this.formStatusClass = '';
        }
      );
    }
  }

  updateUserData (obj) {
    const editedUser = new User().deserialize(obj);
    this.formStatusClass = '';
    this.userService.getUserMe(this.authService.getToken())
    .subscribe(
      (user) => {
        const finalUser = Object.assign(user, editedUser);
        this.authService.setCurrentUser(finalUser);
        this.getUserData();
        this.triggerUpdateInParent();
        this.closePopup();
        this.alertService.showAlertSuccess('Changes saved successfully!');
    });
  }

  triggerUpdateInParent () {
    this.triggerUpdate.emit(true);
  }

  save($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.formStatusClass = 'form-inprogress-submit';
    this.formSubmitted = true;
    this.repeatPassword.updateValueAndValidity();
    this.repeatEmail.updateValueAndValidity();
    if (this.userForm.valid) {
      let user = new User();
      user = this.checkForUserChanges(this.userForm.value);
      const authCheck = this.checkIfSensitiveData(user);
      if (!!user.id) {
        // ask for password always
        if (authCheck.password || authCheck.email) {
          this.dialog.open(
            PwdConfirmDialogComponent,
            { panelClass: 'confirm-dialog', data: {oldPwd: this.oldPwd}, width: '500px' }
          ).afterClosed()
          .pipe(untilDestroyed(this))
          .subscribe((result) => {
            if (!!result) {
              this.oldPwd = result;
              this.submitEdit(user, authCheck);
            } else {
              this.alertService.showAlertSuccess('No password given. No changes were made!');
              this.formStatusClass = '';
            }
          });
        } else {
          this.submitEdit(user, authCheck);
        }
      } else {
        this.alertService.showAlertSuccess('No changes were made!');
        this.formStatusClass = '';
        this.closePopup();
      }
    } else {
      this.formUtil.validateAllFormFields(this.userForm);
      this.formStatusClass = '';
    }
  }

  ngOnDestroy() {}
}
