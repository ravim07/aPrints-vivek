import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
})
export class LogoComponent {
  @Input() url = '/';
  @Input() aColor = '#35CCD1';
  @Input() printisColor = '#292929';
  @Input() tooltipText = 'Home';

  constructor(private router: Router) {}

  goTo() {
    this.router.navigate([this.url]);
  }
}
