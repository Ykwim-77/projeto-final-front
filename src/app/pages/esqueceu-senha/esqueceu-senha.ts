import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // ✅ CORREÇÃO: services em vez de guards
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-esqueceu-senha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './esqueceu-senha.html',
  styleUrls: ['./esqueceu-senha.scss']
})
export class EsqueceuSenhaComponent {
  email: string = '';
  isLoading: boolean = false; // ✅ ADICIONADO
  errorMessage: string = '';
  currentStep = 0;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  onSubmit(event: Event): void {
    event.preventDefault();

    // Validação básica
    if (!this.email) {
      this.errorMessage = 'Por favor, preencha o campo de E-mail';
      return;
    }

    // Validação adicional de formato de e-mail (opcional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Por favor, insira um e-mail válido.';
      return;
    }
    // Quando for para a próxima página:
    this.currentStep = 1; // 👈 Atualiza indicador
    this.router.navigate(['/codigo-verificacao']);

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.esqueceuSenha(this.email).subscribe({
      next: (response: any) => {
        console.log('✅ E-mail de recuperação enviado');
        this.isLoading = false;

        // Redireciona para a página de código de verificação
        this.router.navigate(['/codigo-verificacao'], {
          queryParams: { email: this.email }
        });
      },
      error: (error: any) => {
        console.error('❌ Erro ao enviar e-mail:', error);
        this.isLoading = false;

        if (error && error.mensagem) {
          this.errorMessage = error.mensagem;
        } else {
          this.errorMessage = 'Erro ao enviar e-mail de recuperação. Tente novamente.';
        }
      }
    });
  }

  voltarParaLogin() {
    this.router.navigate(['/login']);
  }
}