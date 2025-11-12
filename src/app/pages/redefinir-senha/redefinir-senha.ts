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

    // Limpa mensagens de erro antigas
    this.errorMessage = '';

    // 1️⃣ Valida se todos os campos foram preenchidos
    if (!this.password1 || !this.password2) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return; // não vai para a próxima tela
    }

    // 2️⃣ Valida se as senhas coincidem
    if (this.password1 !== this.password2) {
      this.errorMessage = 'As senhas não coincidem';
      return; // não vai para a próxima tela
    }

    // 3️⃣ Se passou nas validações, mostra loading
    this.isLoading = true;

    // Simula delay de request ou chamada real ao AuthService
    setTimeout(() => {
      this.isLoading = false; // remove loading
      this.router.navigate(['/login']); // vai para a próxima página
    }, 1500); // aqui você pode usar o serviço real, se quiser
  }

}