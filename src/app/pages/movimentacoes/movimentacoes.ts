import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { ProdutoService, Produto } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { MovimentacaoService, Movimentacao as MovimentacaoBackend } from '../../services/movimentacao.service';

// Interface para Movimentação (UI)
export interface Movimentacao {
  id: number;
  produtoNome: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  data: string;
  usuario?: string;
  id_movimentacao?: number;
  id_patrimonio?: number;
  id_usuario?: number;
  tipo_movimentacao?: string;
  origem?: string;
  data_movimento?: string;
  status?: string;
  observacao?: string | null;
  patrimonio?: any;
}

@Component({
  selector: 'app-movimentacoes',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './movimentacoes.html',
  styleUrls: ['./movimentacoes.scss']
})
export class MovimentacoesComponent implements OnInit {
  
  constructor(
    private router: Router,
    private produtoService: ProdutoService,
    private authService: AuthService,
    private movimentacaoService: MovimentacaoService
  ) { }

  // Dados principais
  selectedOption: string = 'opcao1';
  totalProducts: number = 0;
  produtosSaida: number = 0;
  produtosEntrada: number = 0;
  movimentacoes: Movimentacao[] = [];
  filteredMovimentacoes: Movimentacao[] = [];
  loading: boolean = true;
  produtos: Produto[] = [];

  // Cards estáticos
  metricCards = [
    { title: 'Total de Movimentações' },
    { title: 'Entradas' },
    { title: 'Saídas' }
  ];

  ngOnInit(): void {
    this.carregarDados();
  }

  selectOption(option: string): void {
    this.selectedOption = option;
    this.filtrarMovimentacoes();
  }

  private carregarDados(): void {
    this.loading = true;
    
    // Carrega movimentações do backend
    this.movimentacaoService.listarMovimentacoes().subscribe({
      next: (movis: MovimentacaoBackend[]) => {
        this.movimentacoes = this.mapearMovimentacoes(movis);
        this.calcularMetricas();
        this.filtrarMovimentacoes();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar movimentações:', error);
        this.loading = false;
        // Fallback: carregar produtos se movimentação falhar
        this.carregarMovimentacoesFromProdutos();
      }
    });
  }

  /**
   * Mapeia movimentações do backend para o formato da UI
   */
  private mapearMovimentacoes(movis: MovimentacaoBackend[]): Movimentacao[] {
    return movis.map((movi, idx) => ({
      id: movi.id_movimentacao || idx,
      id_movimentacao: movi.id_movimentacao,
      id_patrimonio: movi.id_patrimonio,
      id_usuario: movi.id_usuario,
      tipo_movimentacao: movi.tipo_movimentacao,
      origem: movi.origem,
      data_movimento: movi.data_movimento,
      status: movi.status,
      observacao: movi.observacao,
      produtoNome: movi.patrimonio?.nome || 'Sem descrição',
      tipo: (movi.tipo_movimentacao === 'entrada' ? 'entrada' : 'saida') as 'entrada' | 'saida',
      quantidade: 1,  // Backend não tem quantidade específica de forma clara
      data: movi.data_movimento,
      usuario: movi.usuario?.nome || 'Sistema'
    }));
  }

  private carregarMovimentacoesFromProdutos(): void {
    // Fallback para carregar produtos e simular movimentações
    this.produtoService.listarProdutos().subscribe({
      next: (produtos: Produto[]) => {
        this.produtos = produtos;
        this.calcularMetricas();
        this.movimentacoes = this.simularMovimentacoesFromProdutos();
        this.filtrarMovimentacoes();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar produtos:', error);
        this.loading = false;
        this.carregarDadosMock();
      }
    });
  }

  private calcularMetricas(): void {
    // Calcula métricas baseadas nos produtos
    this.totalProducts = this.produtos.length;
    
    // Soma todo o estoque atual como "entradas"
    this.produtosEntrada = this.produtos.reduce((total, produto) => {
      return total + (produto.estoque || 0);
    }, 0);
    
    // Para saídas, vamos calcular baseado em uma estimativa
    // Isso seria substituído por dados reais de movimentações em produção
    this.produtosSaida = Math.floor(this.produtosEntrada * 0.3); // 30% das entradas como saída estimada
  }

  private simularMovimentacoesFromProdutos(): Movimentacao[] {
    const movimentacoes: Movimentacao[] = [];
    let idCounter = 1;
    const usuarioLogado = this.authService.getUsuarioLogado();
    const nomeUsuario = usuarioLogado?.nome || 'Sistema';
    
    // Para cada produto, cria movimentações simuladas
    this.produtos.forEach(produto => {
      // Entrada do produto (simulação)
      if (produto.estoque && produto.estoque > 0) {
        movimentacoes.push({
          id: idCounter++,
          produtoNome: produto.nome,
          tipo: 'entrada',
          quantidade: produto.estoque,
          data: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 7 dias
          usuario: nomeUsuario
        });
      }
      
      // Saída simulada (se tiver estoque suficiente)
      if (produto.estoque && produto.estoque > 5) {
        const saidaQuantidade = Math.floor((produto.estoque * 0.3) + 1); // 30% do estoque
        movimentacoes.push({
          id: idCounter++,
          produtoNome: produto.nome,
          tipo: 'saida',
          quantidade: saidaQuantidade,
          data: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 3 dias
          usuario: nomeUsuario
        });
      }
    });
    
    // Ordena por data (mais recente primeiro)
    return movimentacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  private filtrarMovimentacoes(): void {
    switch (this.selectedOption) {
      case 'opcao1': // Total
        this.filteredMovimentacoes = this.movimentacoes;
        break;
      case 'opcao2': // Entradas
        this.filteredMovimentacoes = this.movimentacoes.filter(m => m.tipo === 'entrada');
        break;
      case 'opcao3': // Saídas
        this.filteredMovimentacoes = this.movimentacoes.filter(m => m.tipo === 'saida');
        break;
      default:
        this.filteredMovimentacoes = this.movimentacoes;
    }
  }

  getTipoClass(tipo: string): string {
    return tipo === 'entrada' ? 'entrada' : 'saida';
  }

  formatarData(data: string): string {
    const date = new Date(data);
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = meses[date.getMonth()];
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    
    return `${dia} de ${mes} às ${horas}:${minutos}`;
  }

  // Método para desenvolvimento - REMOVER em produção quando tiver endpoint real
  private carregarDadosMock(): void {
    const usuarioLogado = this.authService.getUsuarioLogado();
    const nomeUsuario = usuarioLogado?.nome || 'Admin';
    
    this.movimentacoes = [
      {
        id: 1,
        produtoNome: 'Teclado Mecânico',
        tipo: 'entrada',
        quantidade: 1000,
        data: '2024-11-02T18:59:00',
        usuario: nomeUsuario
      },
      {
        id: 2,
        produtoNome: 'Mouse Gamer',
        tipo: 'saida',
        quantidade: 50,
        data: '2024-11-02T14:30:00',
        usuario: nomeUsuario
      },
      {
        id: 3,
        produtoNome: 'Monitor 24"',
        tipo: 'entrada',
        quantidade: 200,
        data: '2024-11-01T10:20:00',
        usuario: nomeUsuario
      },
      {
        id: 4,
        produtoNome: 'Headphone Bluetooth',
        tipo: 'saida',
        quantidade: 25,
        data: '2024-10-31T16:45:00',
        usuario: nomeUsuario
      }
    ];
    
    this.totalProducts = this.movimentacoes.length;
    this.produtosEntrada = this.movimentacoes
      .filter(m => m.tipo === 'entrada')
      .reduce((sum, m) => sum + m.quantidade, 0);
    this.produtosSaida = this.movimentacoes
      .filter(m => m.tipo === 'saida')
      .reduce((sum, m) => sum + m.quantidade, 0);
    
    this.filtrarMovimentacoes();
  }
}