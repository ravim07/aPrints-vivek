import { Component, OnInit } from '@angular/core';
import { PageService } from '_shared/services';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  panel = {
    'general': {
      show: false,
      questions: {}
    },
    'services': {
      show: false,
      questions: {},
    },
    'billing': {
      show: false,
      questions: {}
    }
  };

  constructor(private pageService: PageService) { }

  ngOnInit() {
    this.panel.general.show = true;
  }

  showQuestion(event: any) {
    this.pageService.toggleClassToParent(event.target, 'show');
  }

  showPanel(panelName: string) {
    Object.keys(this.panel).forEach(key => {
      if (key !== panelName) {
        this.panel[key].show = false;
      } else {
        this.panel[key].show = true;
      }
    });
  }
}
