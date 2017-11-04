import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallslistComponent } from './callslist.component';

describe('CallslistComponent', () => {
  let component: CallslistComponent;
  let fixture: ComponentFixture<CallslistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallslistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
