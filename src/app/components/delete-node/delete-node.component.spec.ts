import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteNodeComponent } from './delete-node.component';

describe('DeleteNodeComponent', () => {
  let component: DeleteNodeComponent;
  let fixture: ComponentFixture<DeleteNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
