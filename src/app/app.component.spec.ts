import { AppComponent } from './app.component';
import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing' 
import { NO_ERRORS_SCHEMA } from '@angular/core';

fdescribe('AppComponent', () => {

  let appComponent: AppComponent;

  beforeEach(async (() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(AppComponent);
    appComponent = fixture.debugElement.componentInstance;
  });

  it('should create the app', () => {
    expect(appComponent).toBeTruthy();
  });
});
