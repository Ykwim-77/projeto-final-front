import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  fazerLogin() {
    throw new Error('Method not implemented.');
  }
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    
    console.log('🔄 Iniciando login...', {
      email: this.email,
      password: this.password ? '*' : 'vazio'
    });

    // Validação básica
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        console.log('✅ Login bem-sucedido - Navegando para home');
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (error: any) => {
        console.error('❌ Erro no login (LoginComponent):', error, JSON.stringify(error));
        this.isLoading = false;
        
        if (error?.mensagem) {
          this.errorMessage = error.mensagem;
        } else if (error?.error?.mensagem) {
          this.errorMessage = error.error.mensagem;
        } else if (typeof error === 'string') {
          this.errorMessage = error;
        } else if (error?.error) {
          this.errorMessage = JSON.stringify(error.error);
        } else {
          this.errorMessage = 'Erro desconhecido no login. Veja detalhes no console do navegador.';
        }
        console.log('📢 Mensagem de erro para usuário:', this.errorMessage);
      }
    });
  }

  // Limpar erro ao alterar campos
  onInputChange(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  // ✅ MÉTODO ADICIONADO: Navegação programática como fallback
  navigateToEsqueceuSenha(): void {
    console.log('🔗 Navegando para esqueceu-senha...');
    this.router.navigate(['/esqueceu-senha']).then(success => {
      console.log('✅ Navegação bem-sucedida:', success);
    }).catch(error => {
      console.error('❌ Erro na navegação:', error);
    });
  }
}