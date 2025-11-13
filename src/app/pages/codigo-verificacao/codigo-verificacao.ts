import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-codigo-verificacao',
  imports: [CommonModule, FormsModule],
  templateUrl: './codigo-verificacao.html',
  styleUrl: './codigo-verificacao.scss',
})
export class CodigoVerificacao implements AfterViewInit, OnDestroy {
  @ViewChildren('inputRef') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  codigo: string[] = ['', '', '', '', '', ''];
  errorMessage: string = '';
  podeReenviar: boolean = false;
  tempoRestante: number = 60;
  isLoading: boolean = false;
  private countdownInterval: any;
  currentStep = 1;

  constructor(private router: Router, private authService: AuthService) {
    this.iniciarCountdown();
  }

  ngAfterViewInit() {
    // Foca no primeiro input quando o componente carrega
    setTimeout(() => {
      const firstInput = this.inputs.toArray()[0]?.nativeElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }

  ngOnDestroy() {
    // Limpa o intervalo quando o componente é destruído
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  onInput(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Permite apenas números
    if (!/^\d*$/.test(value)) {
      input.value = '';
      this.codigo[index] = '';
      return;
    }

    this.currentStep = 1;
    this.router.navigate(['/codigo-verificacao']);

    // Atualiza o modelo com o valor digitado
    this.codigo[index] = value;

    // Se digitou um número, vai para o próximo input
    if (value && index < 5) {
      const nextInput = this.inputs.toArray()[index + 1]?.nativeElement;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }

    // Se está no último input e está preenchido, submete automaticamente
    if (index === 5 && value) {
      this.verificarCodigo();
    }

    // Limpa mensagem de erro quando o usuário começa a digitar
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    // Backspace - volta para o input anterior se estiver vazio
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = this.inputs.toArray()[index - 1]?.nativeElement;
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
      event.preventDefault();
    }

    // ArrowLeft - navega para esquerda
    if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = this.inputs.toArray()[index - 1]?.nativeElement;
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
      event.preventDefault();
    }

    // ArrowRight - navega para direita
    if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = this.inputs.toArray()[index + 1]?.nativeElement;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
      event.preventDefault();
    }

    // Delete - limpa o campo atual
    if (event.key === 'Delete') {
      input.value = '';
      this.codigo[index] = '';
      event.preventDefault();
    }

    // Ctrl + A - seleciona todo o texto
    if (event.key === 'a' && event.ctrlKey) {
      input.select();
      event.preventDefault();
    }
  }

  onFocus(event: any) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text').trim() || '';

    // Verifica se são apenas números e tem pelo menos 1 dígito
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('').slice(0, 6); // Pega no máximo 6 dígitos

      // Preenche os inputs com os dígitos colados
      digits.forEach((digit, index) => {
        if (index < 6) {
          this.codigo[index] = digit;
        }
      });

      // Atualiza os valores dos inputs na DOM
      setTimeout(() => {
        digits.forEach((digit, index) => {
          if (index < 6) {
            const input = this.inputs.toArray()[index]?.nativeElement;
            if (input) {
              input.value = digit;
            }
          }
        });

        // Foca no próximo input vazio ou no último
        const nextIndex = Math.min(digits.length, 5);
        const nextInput = this.inputs.toArray()[nextIndex]?.nativeElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 0);
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.verificarCodigo();
  }

  verificarCodigo() {
    // vai direto para a próxima página, sem validação e sem tempo de espera
    this.router.navigate(['/redefinir-senha']);
  }



  reenviarCodigo() {
    if (this.podeReenviar && !this.isLoading) {
      this.isLoading = true;

      console.log('Reenviando código...');

      // Método 1: Usando o AuthService
      this.authService.reenviarCodigo().subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log('Código reenviado com sucesso!');
          this.iniciarCountdown();
          this.mostrarMensagemSucesso('Código reenviado com sucesso!');
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = 'Erro ao reenviar código. Tente novamente.';
        }
      });

      // Método 2: Para teste rápido
      /*
      setTimeout(() => {
        this.isLoading = false;
        this.iniciarCountdown();
        this.mostrarMensagemSucesso('Código reenviado com sucesso!');
        console.log('Código reenviado!');
      }, 1000);
      */

      // Reinicia o countdown
      this.podeReenviar = false;
      this.tempoRestante = 60;
    }
  }

  private iniciarCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      this.tempoRestante--;

      if (this.tempoRestante <= 0) {
        this.podeReenviar = true;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  private mostrarMensagemSucesso(mensagem: string) {
    // Poderia implementar um toast ou alerta bonito aqui
    console.log(mensagem);
    // Exemplo com alert temporário
    const alertElement = document.createElement('div');
    alertElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 1000;
      font-family: Arial, sans-serif;
    `;
    alertElement.textContent = mensagem;
    document.body.appendChild(alertElement);

    setTimeout(() => {
      document.body.removeChild(alertElement);
    }, 3000);
  }

  limparCodigo() {
    this.codigo = ['', '', '', '', '', ''];

    // Limpa os valores dos inputs na DOM
    setTimeout(() => {
      this.inputs.forEach((input: { nativeElement: { value: string; }; }, index: any) => {
        input.nativeElement.value = '';
      });

      // Foca no primeiro input após limpar
      const firstInput = this.inputs.toArray()[0]?.nativeElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 0);
  }

  // Método para debug - preenche automaticamente com código de teste
  preencherCodigoTeste() {
    const codigoTeste = '123456';
    const digits = codigoTeste.split('');

    digits.forEach((digit, index) => {
      if (index < 6) {
        this.codigo[index] = digit;
        const input = this.inputs.toArray()[index]?.nativeElement;
        if (input) {
          input.value = digit;
        }
      }
    });

    // Foca no último input após preencher
    setTimeout(() => {
      const lastInput = this.inputs.toArray()[5]?.nativeElement;
      if (lastInput) {
        lastInput.focus();
      }
    }, 0);
  }

  // Método para verificar se todos os campos estão preenchidos
  todosCamposPreenchidos(): boolean {
    return this.codigo.every(digit => digit !== '');
  }

  // Método para obter o código completo como string
  getCodigoCompleto(): string {
    return this.codigo.join('');
  }
}