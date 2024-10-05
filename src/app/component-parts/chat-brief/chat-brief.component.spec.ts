import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatBriefComponent } from './chat-brief.component';

describe('ChatBriefComponent', () => {
  let component: ChatBriefComponent;
  let fixture: ComponentFixture<ChatBriefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatBriefComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatBriefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
