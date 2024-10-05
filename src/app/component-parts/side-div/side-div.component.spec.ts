import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideDivComponent } from './side-div.component';

describe('SideDivComponent', () => {
  let component: SideDivComponent;
  let fixture: ComponentFixture<SideDivComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideDivComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SideDivComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
