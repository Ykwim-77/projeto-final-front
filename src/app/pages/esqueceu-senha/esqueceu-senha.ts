import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  isLoading: boolean = false;
  errorMessage: string = '';
  currentStep: number = 0;

  constructor(private router: Router) {}

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    console.log('🔄 Iniciando envio de email...');
    
    if (!this.email) {
      this.errorMessage = 'Por favor, informe seu email';
      console.log('❌ Email não informado');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('📤 Enviando email para:', this.email);
      
      // Simular envio de email (substitua pela sua lógica real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Email enviado com sucesso');
      console.log('🔄 Navegando para /codigo-verificacao...');
      
      // 🔥 CORREÇÃO: Navegar para a tela de código de verificação
      this.router.navigate(['/codigo-verificacao']).then(success => {
        console.log('✅ Navegação bem-sucedida:', success);
      }).catch(error => {
        console.error('❌ Erro na navegação:', error);
      });
      
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      this.errorMessage = 'Erro ao enviar email. Tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  // Método para voltar para login
  voltarParaLogin(): void {
    console.log('🔗 Voltando para login...');
    this.router.navigate(['/login']).then(success => {
      console.log('✅ Navegação para login bem-sucedida:', success);
    }).catch(error => {
      console.error('❌ Erro na navegação para login:', error);
    });
  }

  // 🔥 MÉTODO ADICIONADO: Navegação com loading (opcional)
  async navigateWithLoading(route: string): Promise<void> {
    console.log(`🔗 Navegando para ${route} com loading...`);
    
    this.isLoading = true;
    
    try {
      await Promise.all([
        this.router.navigate([route]),
        new Promise(resolve => setTimeout(resolve, 600))
      ]);
    } catch (error) {
      console.error('❌ Erro na navegação:', error);
    } finally {
      this.isLoading = false;
    }
  }
}