import { Component, OnInit, Inject , ViewChild , Input , Output, EventEmitter , AfterViewInit} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pwd-confirm-dialog',
  templateUrl: './pwd-confirm-dialog.component.html',
  styleUrls: ['./pwd-confirm-dialog.component.scss']
})
export class PwdConfirmDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PwdConfirmDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
