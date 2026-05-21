import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';

@Component({
  selector: 'app-redefinir-senha',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './redefinir-senha.html',
  styleUrls: ['./redefinir-senha.scss'],
})
export class RedefinirSenha {
  password1: string = '';
  password2: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  currentStep = 2;

  constructor(
    private router: Router  ) { }

  onSubmit(event: Event): void {
    event.preventDefault();

    this.errorMessage = '';

    if (!this.password1 || !this.password2) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    if (this.password1 !== this.password2) {
      this.errorMessage = 'As senhas não coincidem';
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/login']);
    }, 1500);
  }

}
