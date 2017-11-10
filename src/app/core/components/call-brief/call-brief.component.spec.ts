import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallBriefComponent } from './call-brief.component';

describe('CalldetailsComponent', () => {
  let component: CallBriefComponent;
  let fixture: ComponentFixture<CalldetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallBriefComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallBriefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
