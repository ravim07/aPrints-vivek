import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-why',
  templateUrl: './why.component.html',
  styleUrls: ['./why.component.scss'],
})
export class WhyComponent implements OnInit {
  assetsUrl = environment.assetsUrl;

  content = [
    {
      img: `${this.assetsUrl}/images/new-design/print-quality-main.png`,
      icon: `${this.assetsUrl}/images/new-design/print-quality-icon.png`,
      title: 'Stunning Print Quality',
      text: 'Our online platform makes it easy to create beautiful full-color, glossy magazines that capture the attention of your community members and stakeholders, as well as potential advertisers. ',
    },
    {
      img: `${this.assetsUrl}/images/new-design/affordable-main.png`,
      icon: `${this.assetsUrl}/images/new-design/affordable.png`,
      title: 'Affordable and Fast',
      text: 'Our volume pricing is designed specifically to make it possible for schools and small communities to publish high-quality, compelling publications at a fraction of the price of traditional printing houses — with rapid turnaround times.',
    },
    {
      img: `${this.assetsUrl}/images/new-design/templates-main.png`,
      icon: `${this.assetsUrl}/images/new-design/templates.png`,
      title: 'Ready-made InDesign Templates',
      text: 'Choose from our extensive library of Adobe InDesign templates, and upload content in a few clicks to automatically flow into the template. Or, create your own design and use our platform for printing, fundraising, social promotion and more!',
    },
    {
      img: `${this.assetsUrl}/images/new-design/crowd-sourced-main.png`,
      icon: `${this.assetsUrl}/images/new-design/crowd-sourced.png`,
      title: 'Crowd-sourced Community Content',
      text: 'With aPrintis, students and community members instantly become published authors! The platform makes it easy for individuals to write and organize a rough draft, upload it with a few clicks, and collaborate with designers to finalize the design.',
    },
    {
      img: `${this.assetsUrl}/images/new-design/fundraising-main.png`,
      icon: `${this.assetsUrl}/images/new-design/fundraising.png`,
      title: 'Fundraising, Simplified',
      text: 'Our incredibly low printing prices are just the beginning! aPrintis makes fundraising fast and easy, too. Simply send a link to members of your community, and they can donate directly through the aPrintis site. aPrintis customers have raised ample funds to cover print costs, with money to spare.',
    },
    {
      img: `${this.assetsUrl}/images/new-design/brand-main.png`,
      icon: `${this.assetsUrl}/images/new-design/brand.png`,
      title: 'Build Your Brand',
      text: 'Publishing a print magazine is a collaborative endeavor that brings everyone in the community together. It helps build a sense of identity and connection, as people work to create a product that represents their community’s unique characteristics and values. In essence, the magazine becomes the school’s brand — a one-of-a-kind creation that belongs to and captures the essence and heart of the community.',
    },
  ];

  constructor() {}

  ngOnInit() {}
}
