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
    
    if (!this.email) {
      this.errorMessage = 'Por favor, informe seu email';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.router.navigate(['/codigo-verificacao']).then(() => {}).catch(() => {});
    } catch (error) {
      this.errorMessage = 'Erro ao enviar email. Tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  voltarParaLogin(): void {
    this.router.navigate(['/login']).then(() => {}).catch(() => {});
  }

  async navigateWithLoading(route: string): Promise<void> {
    this.isLoading = true;
    try {
      await Promise.all([
        this.router.navigate([route]),
        new Promise(resolve => setTimeout(resolve, 600))
      ]);
    } catch (error) {}
    finally {
      this.isLoading = false;
    }
  }
}
