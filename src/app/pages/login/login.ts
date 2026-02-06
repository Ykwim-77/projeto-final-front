import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../components/loading/loading';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Estados de validação individuais
  emailTouched: boolean = false;
  passwordTouched: boolean = false;
  formSubmitted: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Validação de email
  getEmailError(): string {
    if (!this.emailTouched && !this.formSubmitted) return '';
    
    if (!this.email) {
      return 'Email é obrigatório';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      return 'Formato de email inválido';
    }
    
    return '';
  }

  // Validação de senha
  getPasswordError(): string {
    if (!this.passwordTouched && !this.formSubmitted) return '';
    
    if (!this.password) {
      return 'Senha é obrigatória';
    }
    
    if (this.password.length < 6) {
      return 'Senha deve ter no mínimo 6 caracteres';
    }
    
    return '';
  }

  // Verifica se o formulário é válido
  isFormValid(): boolean {
    return !this.getEmailError() && !this.getPasswordError();
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    this.formSubmitted = true;
    this.emailTouched = true;
    this.passwordTouched = true;

    console.log('🔄 Iniciando login...', {
      email: this.email,
      password: this.password ? '*'.repeat(this.password.length) : 'vazio'
    });

    // Validação antes de enviar
    if (!this.isFormValid()) {
      console.log('❌ Validação falhou:', {
        emailError: this.getEmailError(),
        passwordError: this.getPasswordError()
      });
      return;
    }

    // Loading para o processo de login
    this.isLoading = true;
    this.errorMessage = '';

    console.log('⏳ Fazendo requisição de login...');

    const startTime = Date.now();
    const minLoadingTime = 1500;

    try {
      const response = await this.authService.login(this.email.trim(), this.password).toPromise();
      
      console.log('✅ Login bem-sucedido');
      
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      console.log(`⏰ Loading visível por mais ${remainingTime}ms`);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      this.isLoading = false;
      console.log('🏠 Navegando para home...');
      this.router.navigate(['/home']);
      
    } catch (error: any) {
      console.error('❌ Erro no login (LoginComponent):', error);
      
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      this.isLoading = false;
      
      if (error?.status === 401) {
        this.errorMessage = 'Email ou senha inválidos';
      } else if (error?.status === 0) {
        this.errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (error?.mensagem) {
        this.errorMessage = error.mensagem;
      } else if (error?.error?.mensagem) {
        this.errorMessage = error.error.mensagem;
      } else {
        this.errorMessage = 'Erro ao fazer login. Tente novamente.';
      }
    }
  }

  // 🔥 NOVO MÉTODO: Navegação com loading entre telas
  async navigateWithLoading(route: string): Promise<void> {
    console.log(`🔗 Navegando para ${route} com loading...`);
    
    this.isLoading = true;
    
    try {
      // Navegação com tempo mínimo de loading
      await Promise.all([
        this.router.navigate([route]),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
    } catch (error) {
      console.error('❌ Erro na navegação:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // 🔥 MODIFICADO: Agora usa navigateWithLoading
  navigateToEsqueceuSenha(): void {
    this.navigateWithLoading('/esqueceu-senha');
  }

  // Marcar campos como "touched" quando o usuário interagir
  onEmailInput(): void {
    this.emailTouched = true;
    this.clearErrors();
    
    if (this.email) {
      this.emailTouched = false;
      this.formSubmitted = false;
    }
  }

  onPasswordInput(): void {
    this.passwordTouched = true;
    this.clearErrors();
    
    if (this.password) {
      this.passwordTouched = false;
      this.formSubmitted = false;
    }
  }

  // Limpar erros quando o usuário começar a digitar
  clearErrors(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  // Métodos de blur para validação quando o campo perde o foco
  onEmailBlur(): void {
    this.emailTouched = true;
  }

  onPasswordBlur(): void {
    this.passwordTouched = true;
  }
}