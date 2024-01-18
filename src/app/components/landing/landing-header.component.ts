import { Component, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { PageHeaderComponent } from '_shared/partials';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { LoginService } from '_services';
import { MatDialog } from '@angular/material';
import { MatDialogRef } from '@angular/material/dialog/typings/dialog-ref';

@Component({
  selector: 'app-landing-header',
  templateUrl: './landing-header.component.html',
  styleUrls: ['./landing-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  // providers: [{ provide: OverlayContainer, useClass: FullscreenOverlayContainer }],
})
export class LandingHeaderComponent extends PageHeaderComponent
  implements OnInit {
  isHome = false;
  @ViewChild('mobileMenu', { static: true }) mobileMenu;
  dialogRef: MatDialogRef<any>;
  designMenuOpened: boolean;

  constructor(protected router: Router,
              protected authService: AuthService,
              protected loginService: LoginService,
              private renderer: Renderer2,
              private matDialog: MatDialog) {
    super(router, authService, loginService);
  }

  ngOnInit() {
    this.isHome = this.router.url === '/home';
  }

  showMobileMenu() {
    this.dialogRef = this.matDialog.open(this.mobileMenu, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100%',
      maxHeight: '100%',
      hasBackdrop: false,
      panelClass: [
        'dark',
        'animate__fadeIn',
        'animate__animated'
      ]
    });
  }

  menuItemClick($event) {
    this.closePopup();
  }

  closePopup() {
    if (this.dialogRef) {
      this.renderer.addClass((this.dialogRef as any)._overlayRef._pane, 'animate__fadeOut');

      setTimeout(() => {
        this.dialogRef.close();
      }, 1000);
    }
  }
}
