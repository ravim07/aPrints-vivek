import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { MetaTag } from '_models';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private mainTitleMeta = 'title';
  private mainDescriptionMeta = 'description';
  private urlMeta = 'og:url';
  private titleMeta = 'og:title';
  private typeMeta = 'og:type';
  private descriptionMeta = 'og:description';
  private imageMeta = 'og:image';
  private secureImageMeta = 'og:image:secure_url';
  private twitterCardMeta = 'twitter:card';
  private twitterUrlMeta = 'twitter:url';
  private twitterTitleMeta = 'twitter:text:title';
  private twitterImageMeta = 'twitter:image';
  assetsUrl = environment.assetsUrl;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private doc
  ) {}

  public setTitle(title: string): void {
    this.titleService.setTitle(title);
  }

  createLinkForCanonicalURL() {
    const link: HTMLLinkElement = this.doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    this.doc.head.appendChild(link);
    link.setAttribute('href', this.doc.URL);
    return this.doc.URL;
  }

  public setSocialMediaTags(
    url: string,
    title: string,
    description: string,
    image: string,
    imageIsAsset = true
  ): void {
    let imageUrl = image;
    if (imageIsAsset) {
      imageUrl = `${this.assetsUrl}/${image}`;
    }
    const tags = [
      new MetaTag(this.urlMeta, url, true),
      new MetaTag(this.titleMeta, title, true),
      new MetaTag(this.typeMeta, 'website', true),
      new MetaTag(this.descriptionMeta, description, true),
      new MetaTag(this.imageMeta, imageUrl, true),
      new MetaTag(this.secureImageMeta, imageUrl, true),
      new MetaTag(this.twitterCardMeta, 'summary_large_image', false),
      new MetaTag(this.twitterUrlMeta, url, false),
      new MetaTag(this.twitterTitleMeta, title, false),
      new MetaTag(this.twitterImageMeta, imageUrl, false),
    ];
    this.setTags(tags);
  }

  public setMainMetaTags(title: string, description: string) {
    const tags = [
      new MetaTag(this.mainTitleMeta, title, false),
      new MetaTag(this.mainDescriptionMeta, description, false),
      new MetaTag('robots', 'index, follow, noarchive', false),
    ];
    this.setTags(tags);
  }

  private setTags(tags: MetaTag[]): void {
    tags.forEach((siteTag) => {
      const tag = siteTag.isFacebook
        ? this.metaService.getTag(`property='${siteTag.name}'`)
        : this.metaService.getTag(`name='${siteTag.name}'`);
      if (siteTag.isFacebook) {
        this.metaService.updateTag({
          property: siteTag.name,
          content: siteTag.value,
        });
      } else {
        this.metaService.updateTag({
          name: siteTag.name,
          content: siteTag.value,
        });
      }
    });
  }
}
