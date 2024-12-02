import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteConnectionComponent } from './delete-connection.component';

describe('DeleteConnectionComponent', () => {
  let component: DeleteConnectionComponent;
  let fixture: ComponentFixture<DeleteConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteConnectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
