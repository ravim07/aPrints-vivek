import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { NewPdfViewerComponent } from '_shared/components';
import { SharedModule } from '_shared/shared.module';

@Injectable({ providedIn: SharedModule })
export class PdfViewerService {
  viewerComponent: NewPdfViewerComponent;
  private overlayRef: OverlayRef;

  constructor(private overlay: Overlay) {
    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
      width: '100%',
      height: '100%',
    });
  }

  showPdf(pdfDocument) {
    this.overlayRef.hasAttached();
    {
      this.overlayRef.detach();
    }
    const portal = new ComponentPortal(NewPdfViewerComponent);
    const component = this.overlayRef.attach(portal);
    this.viewerComponent = component.instance;
    this.viewerComponent.pdfDocument = pdfDocument;
    this.viewerComponent.lightBox = true;
    this.viewerComponent.showPopup = true;

    this.viewerComponent.closePopupEvent.subscribe(() => {
      this.overlayRef.detach();
    });
  }
}
