import { permission } from './permission.model';

class Role {
  admin = 'admin';
  managingEditor = 'managingEditor';
  editorialStaff = 'editorialStaff';
  contributor = 'contributor';
  sponsor = 'sponsor';
  subscriber = 'subscriber';
  advertiser = 'advertiser';
  permissions = {};

  constructor() {
    this.permissions[permission.editPublication] = [
      this.managingEditor,
      this.editorialStaff,
    ];
    this.permissions[permission.createIssue] = [
      this.managingEditor,
      this.editorialStaff,
    ];
    this.permissions[permission.editIssue] = [
      this.managingEditor,
      this.editorialStaff,
    ];
    this.permissions[permission.removeIssue] = [this.managingEditor];
    this.permissions[permission.manageManagingEditors] = [this.managingEditor];
    this.permissions[permission.manageEditors] = [this.managingEditor];
    this.permissions[permission.manageContributors] = [
      this.managingEditor,
      this.editorialStaff,
    ];
    this.permissions[permission.deleteMembers] = [
      this.managingEditor,
    ];
    this.permissions[permission.viewContributions] = [
      this.managingEditor,
      this.contributor,
      this.editorialStaff,
    ];
    this.permissions[permission.manageAdvertisers] = [
      this.managingEditor,
    ];
    this.permissions[permission.viewAdvertisements] = [
      this.managingEditor,
      this.advertiser,
    ];
    this.permissions[permission.addMembers] = [
      this.managingEditor,
      this.editorialStaff,
    ];
    this.permissions[permission.publishingFlow] = [
      this.managingEditor,
      this.editorialStaff,
    ];
    this.permissions[permission.hasPermissionManagingEditor] = [
      this.managingEditor,
    ];
    this.permissions[permission.transfers] = [this.managingEditor];
    this.permissions[permission.fundraisingViewPreview] = [
      this.managingEditor,
      this.editorialStaff,
    ];
    this.permissions[permission.fundraisingSendInvites] = [
      this.managingEditor,
      this.editorialStaff,
    ];
    this.permissions[permission.fundraisingReport] = [
      this.managingEditor,
      this.editorialStaff,
    ];
    this.permissions[permission.fundraisingViewLevels] = [
      this.managingEditor,
      this.editorialStaff,
    ];
    this.permissions[permission.fundraisingCreateLevel] = [this.managingEditor];
    this.permissions[permission.advertising] = [
      this.managingEditor,
      this.editorialStaff,
    ];
    this.permissions[permission.advertisingInvites] = [
      this.managingEditor,
      this.editorialStaff,
    ];
    this.permissions[permission.advertisingMatrix] = [this.managingEditor];
    this.permissions[permission.advertisingReport] = [this.managingEditor];
    this.permissions[permission.advertisingResources] = [
      this.managingEditor,
      this.editorialStaff,
    ];

    this.permissions[permission.canEditShare] = [this.managingEditor];
    this.permissions[permission.canManageInvoices] = [this.managingEditor];
  }

  // tslint:disable-next-line:no-shadowed-variable
  toUriString(role: string) {
    switch (role) {
      case this.managingEditor:
        return 'me';
      case this.editorialStaff:
        return 'editor';
      case this.contributor:
        return 'contributor';
      case this.sponsor:
        return 'sponsor';
      case this.subscriber:
        return 'subscriber';
      case this.advertiser:
        return 'advertiser';
      default:
        return '';
    }
  }

  // tslint:disable-next-line:no-shadowed-variable
  hasPermission(currentRole: string, permission: string) {
    if (
      this.permissions[permission] &&
      this.permissions[permission].indexOf(currentRole) >= 0
    ) {
      return true;
    }
    return false;
  }

  getAvailableRoles(currentRole: string) {
    if (currentRole === this.managingEditor) {
      return [this.managingEditor, this.editorialStaff, this.contributor];
    } else if (currentRole === this.editorialStaff) {
      return [this.contributor];
    }
  }

  // tslint:disable-next-line:no-shadowed-variable
  getStrRole(role: string) {
    switch (role) {
      case this.managingEditor:
        return 'Managing Editor';
      case this.editorialStaff:
        return 'Editor';
      case this.contributor:
        return 'Contributor';
      case this.sponsor:
        return 'Sponsor';
      case this.subscriber:
        return 'Subscriber';
      case this.advertiser:
        return 'Advertiser';
      default:
        return '';
    }
  }

  // tslint:disable-next-line:no-shadowed-variable
  encodeUriString(role: string) {
    switch (role) {
      case this.managingEditor:
        return 'me';
      case this.editorialStaff:
        return 'e';
      case this.contributor:
        return 'c';
      case this.sponsor:
        return 'sp';
      case this.subscriber:
        return 'subs';
      case this.advertiser:
        return 'adv';
      default:
        return '';
    }
  }

  // tslint:disable-next-line:no-shadowed-variable
  decodeUriString(role: string) {
    switch (role) {
      case 'me':
        return 'Managing Editor';
      case 'e':
        return 'Editor';
      case 'c':
        return 'Contributor';
      case 'sp':
        return 'Sponsor';
      case 'subs':
        return 'Subscriber';
      case 'adv':
        return 'Advertiser';
      default:
        return '';
    }
  }
}

export const role = new Role();
