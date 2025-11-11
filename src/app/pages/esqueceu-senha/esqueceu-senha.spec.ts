import { ComponentFixture, TestBed, fakeAsync, tick  } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { EsqueceuSenhaComponent } from './esqueceu-senha';

describe('EsqueceuSenhaComponent', () => {
  let component: EsqueceuSenhaComponent;
  let fixture: ComponentFixture<EsqueceuSenhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsqueceuSenhaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EsqueceuSenhaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
