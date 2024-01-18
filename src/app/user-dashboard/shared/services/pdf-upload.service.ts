import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { Draft } from '_models';
import { Issue } from '_models/issue.model';

export interface BtnProgress {
  show?: boolean;
  label?: string;
  style?: {
    width?: string;
    background?: string;
  };
}

interface SimpleBtn {
  label: string;
  stepClass: string;
}

interface PubEvent {
  dialogCloseAll?: boolean;
  setIssueInfo?: Issue;
  openDialogStatus?: boolean;
}

@Injectable({ providedIn: UserDashboardModule })
export class PdfUploadService {
  public draftSubject: Subject<Draft> = new Subject<Draft>();
  public btnProgressSubject: BehaviorSubject<BtnProgress>;
  public events: Subject<PubEvent> = new Subject<PubEvent>();

  constructor() {
    this.btnProgressSubject = new BehaviorSubject<BtnProgress>({
      show: false,
      label: '',
      style: {
        width: '0%',
        background: '#15b6c2',
      },
    });
  }

  updateDraft(draft: Draft) {
    this.draftSubject.next(draft);
  }

  updateBtnProgress(btn: BtnProgress) {
    const currentValue = this.btnProgressSubject.getValue();
    const newValue = Object.assign(currentValue, btn);
    this.btnProgressSubject.next(newValue);
  }

  emitPubEvent(evt: PubEvent) {
    this.events.next(evt);
  }
}
