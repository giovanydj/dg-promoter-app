import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImpressaoPage } from './impressao.page';

describe('ImpressaoPage', () => {
  let component: ImpressaoPage;
  let fixture: ComponentFixture<ImpressaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpressaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
