// import { Meta } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';
// import { LogUpdateService, UpdateSwService } from './_services';
import { filter, map } from 'rxjs/operators';
import { SeoService } from '_services/seo.service';
import { RoutingState } from '_shared/services';
import { LogUpdateService, UpdateSwService } from './_services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  schema = {
    '@context': 'https://schema.org',
    '@type': 'Corporation',
    name: 'aPrintis',
    legalName: 'aPrintis Inc.',
    url: 'https://www.aprintis.com',
    blog: 'https://blog.aprintis.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '4695 Chabot Dr, Ste 200',
      addressLocality: 'Pleasanton',
      addressRegion: 'CA',
      postalCode: '94588',
      addressCountry: 'USA',
    },
    logo: 'https://d1atm7a2stxxbt.cloudfront.net/logov2.svg',
    founders: [
      {
        '@type': 'Person',
        name: 'Vivek Garg',
        email: 'vgarg@aprintis.com',
        jobTitle: 'CEO',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '1-800-510-6596',
      contactType: 'customer service',
      areaServed: 'US',
      availableLanguage: 'en',
      email: 'info@aprintis.com',
    },
    sameAs: [
      'https://www.facebook.com/aPrintis/',
      'https://www.linkedin.com/company/aprintis/about/',
    ],
  };
  isBrowser = false;
  assetsUrl = environment.assetsUrl;

  constructor(
    private logSwUpdates: LogUpdateService,
    private checkSwUpdates: UpdateSwService,
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly seoService: SeoService,
    routingState: RoutingState,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.setupRouting();
    this.isBrowser = isPlatformBrowser(this.platformId);
    routingState.loadRouting();
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.router.events.pipe(untilDestroyed(this)).subscribe((evt) => {
        if (!(evt instanceof NavigationEnd)) {
          return;
        }
        window.scrollTo(0, 0);
      });
      this.checkSwUpdates.checkUpdates();
    }
  }

  private setupRouting() {
    this.router.events
      .pipe(untilDestroyed(this))
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === 'primary')
      )
      .pipe(untilDestroyed(this))
      .subscribe((route: ActivatedRoute) => {
        const seo = route.snapshot.data['seo'];
        const publication = route.snapshot.data['publication'];
        if (publication && !seo) {
          const title = 'aPrintis - ' + publication.publicationName;
          const image = publication.image
            ? publication.image
            : 'coming-soon.png';
          this.seoService.setTitle(title);
          const url = this.seoService.createLinkForCanonicalURL();
          this.seoService.setMainMetaTags(title, publication.description);
          this.seoService.setSocialMediaTags(
            url,
            title,
            publication.description,
            image,
            !publication.image
          );
        } else if (seo) {
          this.seoService.setTitle(seo.title);
          const url = this.seoService.createLinkForCanonicalURL();
          this.seoService.setMainMetaTags(seo.title, seo.description);
          this.seoService.setSocialMediaTags(
            url,
            seo.title,
            seo.description,
            seo.screenshot
          );
        }
      });
  }

  ngOnDestroy() {}
}
