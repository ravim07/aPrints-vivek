import { Component, HostListener, OnInit } from '@angular/core';
import { environment } from 'environments/environment';
import { OnboardingService } from '_services/onboarding.service'; 
import { LoginService } from '_services/login.service';
import { AuthService } from 'auth/auth.service';
import { Observable } from 'rxjs';
import { role, User } from '_models';
@Component({
  selector: 'app-onboarding-main',
  templateUrl: './onboarding-main.component.html',
  styleUrls: ['./onboarding-main.component.scss'],
  providers:[LoginService]
})
export class OnboardingMainComponent implements OnInit {
  isAdmin = false;
  isAuthenticated$: Observable<boolean>;
  currentUser: User;
  enableMobile: boolean;
  constructor(
    protected authService: AuthService,
    private onboardingService: OnboardingService,   
    private loginService: LoginService) {
    this.enableMobile = window.innerWidth < 1370;
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isRole(role.admin);

  }
  assetsUrl = environment.assetsUrl;

  images = {
    managingEditor: `${this.assetsUrl}/images/new-design/managing-editor.png`,
    editorialStaff: `${this.assetsUrl}/images/new-design/editorial-staff.png`,
    contributor: `${this.assetsUrl}/images/new-design/writer.png`,
  };

  roles = [
    {
      image: `${this.assetsUrl}/images/new-design/managing-editor.png`,
      title: 'Managing Editor',
      description:
        'Set up your team, publication specs and fundraising options, and invite writers to contribute.',
      actionCaption: 'Set up your publication',
      func: 'managingEditor',
    },
    {
      image: `${this.assetsUrl}/images/new-design/editorial-staff.png`,
      title: 'Editorial Staff',
      description:
        'Design and edit your publication, and run fundraising drives.',
      actionCaption: 'Edit your publication',
      func: 'editorialStaff',
    },
    {
      image: `${this.assetsUrl}/images/new-design/writer.png`,
      title: 'Writers',
      description:
        'Create articles online or upload drafts, and iterate with graphic designers.',
      actionCaption: 'Submit an article',
      func: 'contributor',
    },
  ];

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.enableMobile = window.innerWidth < 1370;
  }

  ngOnInit() {
    this.onboardingService.reset();
  }

  callFunc(strCase: string) {
    switch (strCase) {
      case 'managingEditor':
        this.managingEditor();
        break;
      case 'editorialStaff':
        this.editorialStaff();
        break;
      case 'contributor':
        this.contributor();
        break;
    }
  }

  managingEditor() {
    console.log('managingEditor');
    this.onboardingService.managingEditor();
  }
  editorialStaff() {
    console.log('editorialStaff');
    this.onboardingService.editorialStaff();
  }
  contributor() {
    console.log('contributor');
    this.onboardingService.contributor();
  }
  fundraising() {
    // this.onboardingService.managingEditor();
  }
  login(){
    this.loginService.loginDialog();
  }
}
