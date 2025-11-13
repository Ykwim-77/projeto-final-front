import { ComponentFixture, TestBed, fakeAsync, tick  } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { RedefinirSenha } from './redefinir-senha';

describe('RedefinirSenha', () => {
  let component: RedefinirSenha;
  let fixture: ComponentFixture<RedefinirSenha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedefinirSenha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedefinirSenha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});