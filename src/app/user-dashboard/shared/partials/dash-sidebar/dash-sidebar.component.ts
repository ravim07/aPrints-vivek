import { Component, OnInit, Output, EventEmitter, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { AuthService } from 'auth/auth.service';
import { User, role, permission, AccessRequest } from '_models';
import { Publication } from '_models/publication.model';
import { UserPublicationsService, PublicationUrlService } from 'user-dashboard/shared/services';
import { environment } from 'environments/environment';
import { UserService, PublicationService } from '_services';
import { MatExpansionPanel } from '@angular/material';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-dash-sidebar',
  templateUrl: './dash-sidebar.component.html',
  styleUrls: ['./dash-sidebar.component.scss']
})
export class DashSidebarComponent implements OnInit, OnDestroy {
  @ViewChild('expansionPanel', {static: false}) private expansionPanel: MatExpansionPanel;

  issueStatus;
  currentUser: User;
  roles: Array<string>;
  noRoles = false;
  managingEditor = false;
  editorialStaff = false;
  contributor = false;
  subscriber = false;
  advertiser = false;
  menu = [];
  menuPendingRequests = [];
  currentPublicationId: string;
  currentIssueId: string;
  prevUrl: string;
  menuAllOpen = false;
  showPopupProfileEdit = false;
  assetsUrl = environment.assetsUrl;
  loading = true;
  actionWord = 'Show';
  mobile = false;
  opened = false;

  constructor(
    private authService: AuthService,
    private publicationService: PublicationService,
    private userPublicationService: UserPublicationsService,
    private publicationUrlService: PublicationUrlService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.checkDeviceWidth();
    this.updateUserData();
  }

  initSidebar() {
    this.publicationService.getPublications()
      .subscribe(
        (publications: Publication[]) => {
          // console.log('pubs sub', publications);
          this.menu = [];
          publications.forEach(pub => {
            this.menu.push({
              publication: pub,
              show: this.checkPermission(pub),
              menuClass: ''
            });
          });
          this.setActivePublication();
        }
      );
    this.userPublicationService.getAccessRequests()
      .subscribe(
        (requests: AccessRequest[]) => {
          // console.log(requests);
          this.userService.updateUserRoles(this.authService.getToken()).subscribe(() => {});
          this.menuPendingRequests = [];
          requests.filter(e => e.status === 'pending').forEach(request => {
            this.menuPendingRequests.push({
              request: request,
              menuClass: ''
            });
            // console.log(this.menuPendingRequests);
          });
        }
      );
      this.router.events.pipe(untilDestroyed(this)).subscribe(async(evt) => {
        if (evt instanceof NavigationEnd) {
          this.subscribeActivatedRoute();
        }
      });
      this.subscribeActivatedRoute();
  }

  updateUserData () {
    /// this.userService.getUserMe()
    const me = this.authService.getCurrentUser(); // console.log(me);
    this.userService.getUserMe(me.accessToken).subscribe( data => {
      this.loading = false;
      this.currentUser = data;
      this.roles = this.currentUser.roles;
      this.noRoles = !this.roles.length; console.log(![].length, ![1].length);
      this.managingEditor = this.currentUser.roles.indexOf('managingEditor') > -1;
      this.editorialStaff = this.currentUser.roles.indexOf('editorialStaff') > -1;
      this.contributor = this.currentUser.roles.indexOf('contributor') > -1;
      this.subscriber = this.currentUser.roles.indexOf('subscriber') > -1;
      this.advertiser = this.currentUser.roles.indexOf('advertiser') > -1;
      this.initSidebar();
      // console.log(this.roles, this.managingEditor, this.editorialStaff, this.contributor, this.subscriber, this.advertiser);
    });
    return;
  }

  triggerUpdate($event) {
    if ($event) { this.updateUserData(); }
  }

  private checkPermission(pub: Publication) {
    const ret = {
      showEditPub: role.hasPermission(pub.role, permission.editPublication),
      showCreateIssue: role.hasPermission(pub.role, permission.createIssue),
      showEditIssue: role.hasPermission(pub.role, permission.editIssue),
      advertiser: role.hasPermission(pub.role, permission.advertising),
      // subscriber: pub.role === 'subscriber',
      issueMenu: ['managingEditor', 'editorialStaff', 'contributor', 'advertiser'].includes(pub.role)
    };
    return ret;
  }

  private subscribeActivatedRoute() {
    // console.log(this.route);
    this.route.firstChild.firstChild.paramMap.pipe(untilDestroyed(this)).subscribe(params => {
      // console.log(params);
      this.currentPublicationId = params.get('publicationId');
      this.currentIssueId = params.get('issueId');
      if (!this.currentIssueId) {
        this.route.firstChild.firstChild.queryParamMap.pipe(untilDestroyed(this)).subscribe(qParams => {
          this.currentIssueId = qParams.get('issueId');
          this.setActivePublication();
        });
      } else {
        this.setActivePublication();
      }
    });
  }

  private setActivePublication() {
    if (this.currentPublicationId) {
      if (this.menuAllOpen) {
        this.closeMenu();
      }
      this.openMenuPublication(this.currentPublicationId);
    } else if (this.router.url === '/dashboard') {
      this.openMenu();
    } else {
      this.closeMenu();
    }
  }

  private closeMenu() {
    this.menuAllOpen = false;
    this.menu.forEach(menuItem => {
      menuItem.menuClass = '';
    });
  }

  private openMenu() {
    this.menuAllOpen = true;
    this.menu.forEach(menuItem => {
      menuItem.menuClass = 'menu-open';
    });
  }

  private openMenuPublication(pubId: string) {
    this.menu.forEach(menuItem => {
      if (menuItem.publication.id === pubId) {
        if (menuItem.menuClass === '') {
          menuItem.menuClass = 'menu-open';
        }
      }
    });
  }

  toggleMenuPublication(selectedMenuItem: any, e: any) {
    this.menu.forEach(menuItem => {
      if (menuItem.publication.id !== selectedMenuItem.publication.id) {
        menuItem.menuClass = '';
      } else {
        if (menuItem.menuClass === '') {
          menuItem.menuClass = 'menu-open';
        } else {
          menuItem.menuClass = '';
        }
      }
    });
  }

  getIfSubscriber(pubId: string) {

  }

  closeExpansionMenu() {
    if (this.mobile) {
      this.expansionPanel.close();
    }
  }

  goToEditPublication(pub: Publication, $event) {
    $event.stopPropagation();
    this.router.navigateByUrl(this.publicationUrlService.getLinkEditPublication(pub));
  }

  goToIssue(pub: Publication, issueId: string) {
    this.closeExpansionMenu();
    this.router.navigateByUrl(this.publicationUrlService.getLinkViewIssue(pub, issueId, 'messages'));
  }

  goToEditIssue(pub: Publication, issueId: string, $event) {
    $event.stopPropagation();
    this.router.navigateByUrl(this.publicationUrlService.getLinkEditIssue(pub, issueId));
  }

  goToAddIssue(pub: Publication) {
    this.closeExpansionMenu();
    this.router.navigateByUrl(this.publicationUrlService.getLinkCreateIssue(pub));
  }

  goToCreatePublication() {
    this.closeExpansionMenu();
    this.router.navigateByUrl(this.publicationUrlService.getLinkCreatePublication());
  }

  goToSubscription(_pubId: string) {
    this.closeExpansionMenu();
    this.router.navigateByUrl(this.publicationUrlService.getLinkViewPublicationSubscription(_pubId));
  }

  goToAdResources(pub: Publication, issueId: string) {
    this.closeExpansionMenu();
    const url = this.publicationUrlService.getLinkViewPublicationAdResources(pub, issueId); console.log(url);
    this.router.navigateByUrl(url);
  }

  logout() {
    this.closeExpansionMenu();
    this.authService.logout();
  }

  popupProfileEdit() {
    this.showPopupProfileEdit = true;
  }

  onPopupProfileEditEvent(evt: any) {
    if (evt.type === 'popup.closed') {
      this.showPopupProfileEdit = false;
    }
  }

  showSubscription(selectedMenuItem: any, e: any) {
    e.stopPropagation();
    this.goToSubscription(selectedMenuItem.publication.id);
  }

  openedExpansion () {
    this.actionWord = 'Hide';
    this.opened = true;
  }

  closedExpansion () {
    this.actionWord = 'Show';
    this.opened = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkDeviceWidth();
  }

  checkDeviceWidth() {
    if (window.innerWidth <= 900) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }
  }

  ngOnDestroy() {}
}
