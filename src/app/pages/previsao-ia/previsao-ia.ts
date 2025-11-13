import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

// Interfaces para os dados
interface ReposicaoUrgente {
  produto: string;
  estoque_atual: number;
  quantidade_sugerida: number;
  prioridade: string;
}

interface PrevisaoAcabar {
  produto: string;
  dias_estimados: number;
}

interface SugestaoCompra {
  produto: string;
  quantidade: number;
  motivo: string;
}

interface Previsoes {
  reposicao_urgente?: ReposicaoUrgente[];
  previsao_acabar?: PrevisaoAcabar[];
  sugestoes_compra?: SugestaoCompra[];
  baixa_rotatividade?: string[];
}

@Component({
  selector: 'app-previsao-ia',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './previsao-ia.html',
  styleUrls: ['./previsao-ia.scss']
})
export class PrevisaoIaComponent {
  isGenerating = false;
  previsoes?: Previsoes;
  produtos: any[] = []; // Inicialmente vazio

  // Dados mock para demonstração
  private mockPrevisoes: Previsoes = {
    reposicao_urgente: [
      {
        produto: 'Produto A',
        estoque_atual: 5,
        quantidade_sugerida: 50,
        prioridade: 'Alta'
      },
      {
        produto: 'Produto B',
        estoque_atual: 8,
        quantidade_sugerida: 30,
        prioridade: 'Média'
      }
    ],
    previsao_acabar: [
      {
        produto: 'Produto C',
        dias_estimados: 15
      },
      {
        produto: 'Produto D',
        dias_estimados: 22
      }
    ],
    sugestoes_compra: [
      {
        produto: 'Produto E',
        quantidade: 25,
        motivo: 'Estoque abaixo do nível de segurança'
      },
      {
        produto: 'Produto F',
        quantidade: 40,
        motivo: 'Aumento sazonal na demanda'
      }
    ],
    baixa_rotatividade: [
      'Produto G',
      'Produto H',
      'Produto I',
      'Produto J'
    ]
  };

  gerarPrevisoes() {
    if (this.isGenerating || this.produtos.length === 0) return;

    this.isGenerating = true;

    // Simula uma chamada de API
    setTimeout(() => {
      this.previsoes = this.mockPrevisoes;
      this.isGenerating = false;
    }, 2000);
  }
}