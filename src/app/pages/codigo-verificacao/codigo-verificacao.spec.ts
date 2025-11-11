import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodigoVerificacao } from './codigo-verificacao';

describe('CodigoVerificacao', () => {
  let component: CodigoVerificacao;
  let fixture: ComponentFixture<CodigoVerificacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodigoVerificacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodigoVerificacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
