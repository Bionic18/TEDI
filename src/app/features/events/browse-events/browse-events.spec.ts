import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseEvents } from './browse-events';

describe('BrowseEvents', () => {
  let component: BrowseEvents;
  let fixture: ComponentFixture<BrowseEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrowseEvents],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowseEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
