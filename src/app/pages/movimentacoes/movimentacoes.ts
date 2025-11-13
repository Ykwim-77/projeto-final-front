import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movimentacoes',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './movimentacoes.html',
  styleUrl: './movimentacoes.scss',
})
export class MovimentacoesComponent {
  constructor(
    private router: Router
  ) { }

  selectedOption: string = 'opcao1'; // começa selecionado na primeira

  // Dados do Menu
  menuItems: any[] = [];

  // Alertas
  lowStockAlert: string = '';
  lowStockCount: number = 0;


  // Cards de Métricas
  metricCards: any[] = [];

  // Dados individuais
  totalProducts: number = 0;
  produtosSaida: number = 0;
  produtosEntrada: number = 0;

  // Listas
  categories: any[] = [];
  lowStockProducts: any[] = [];
  topProducts: any[] = [];
  movimentacoes: any[] = [];

  // Usuário
  usuarioNome: string = '';
  usuarioEmail: string = '';
  usuarioIniciais: string = '';

  selectOption(option: string) {
    this.selectedOption = option;
  }


  private obterQuantidadeProduto(produto: any): number {
    const quantidade = produto.quantidade ?? produto.estoque ?? produto.quant ?? produto.stock ?? 0;
    const qtdNumero = Number(quantidade);
    return isNaN(qtdNumero) ? 0 : qtdNumero;
  }

  private initializeMetrics(): void {
    // Inicializar com valores padrão
    this.totalProducts = 0;
    this.produtosSaida = 0;
    this.produtosEntrada = 0;
    this.metricCards = [
      {
        title: 'Total de Produtos',
        value: 0,
        variation: '-',
        trend: 'neutral'
      },
      {
        title: 'Valor do Estoque',
        value: 'R$ 0,00',
        variation: '-',
        trend: 'neutral'
      },
      {
        title: 'Itens em Baixa',
        value: 0,
        variation: '-',
        trend: 'neutral'
      },
      {
        title: 'Saídas do Mês',
        value: 0,
        variation: '-',
        trend: 'neutral'
      }
    ];
    console.log('✅ Métricas inicializadas:', this.metricCards);
  }
}
