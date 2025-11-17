import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Produto, ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';



interface MenuItem {
  name: string;
  active?: boolean;
}

interface MetricCard {
  title: string;
  value: string | number;
  variation: string;
  trend: 'positive' | 'negative' | 'neutral';
}

interface Category {
  name: string;
  percentage: string;
}

interface LowStockProduct {
  name: string;
  category: string;
}




@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.html',
  styleUrls: ['./produtos.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent]
})
export class ProdutosComponent implements OnInit {
abrirModalNovoEmprestimo() {
throw new Error('Method not implemented.');
}
emprestimosAtrasadosLista: any;
gerarRelatorio() {
throw new Error('Method not implemented.');
}
filtroPesquisa: any;
filtroStatus: any;
devolvidosMes: any;
emprestimosAtrasados: any;
emprestimosAtivos: any;
totalEmprestimos: any;
getStatusClass(arg0: any) {
throw new Error('Method not implemented.');
}
abrirModalDevolucao(_t90: any) {
throw new Error('Method not implemented.');
}
getStatusIcon(arg0: any) {
throw new Error('Method not implemented.');
}
marcarComoDevolvido(_t90: any) {
throw new Error('Method not implemented.');
}
abrirModalEditarEmprestimo(_t90: any) {
throw new Error('Method not implemented.');
}
userLogado: any;
getStatusDescription(arg0: any) {
throw new Error('Method not implemented.');
}
emprestimosFiltrados: any;
fecharModalNovoEmprestimo() {
throw new Error('Method not implemented.');
}
cadastrarEmprestimo(_t141: NgForm) {
throw new Error('Method not implemented.');
}
onModalProdutoChange() {
throw new Error('Method not implemented.');
}
isModalEditarEmprestimoAberto: any;
novoEmprestimo: any;
usuariosDisponiveis: any;
produtoModalSelecionado: any;
salvarAlteracoesEmprestimo() {
throw new Error('Method not implemented.');
}
produtosDisponiveis: any;
onStatusChange($event: any) {
throw new Error('Method not implemented.');
}
emprestimoSelecionado: any;
fecharModalEditarEmprestimo() {
throw new Error('Method not implemented.');
}
emprestimoDevolucao: any;
isModalDevolucaoAberto: any;
fecharModalDevolucao() {
throw new Error('Method not implemented.');
}
confirmarDevolucao() {
throw new Error('Method not implemented.');
}
  // Controle de exibição
  showCardCadastro: boolean = false;
  produtoEditando: Produto | null = null;
  visualizacao: 'grade' | 'tabela' = 'grade';

  // Produto em cadastro/edição
  novoProduto = {
    nome: '',
    codigo_publico: '',
    categoria: '',
    preco_unitario: 0,
    unidade_medida: '',
    descricao: '',
    id_fornecedor: null as number | null
  };

  // Lista de produtos
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];

  // Filtros
  filtros: any = {
    pesquisaGeral: '',
    nome: '',
    sku: '',
    categoria: '',
    precoMin: null,
    precoMax: null,
    estoqueMin: 0
  };
  filtroAberto: string | null = null;
  categoriasUnicas: string[] = [];

  // Dados de interface
  menuItems: any[] = [];
  lowStockCount: number = 0;
  lowStockAlert: string = '';

  // Cards de Métricas
  metricCards: any[] = [];
  
  // Dados individuais
  totalProducts: number = 0;
  stockValue: string = '';

  // Listas
  categories: any[] = [];
  lowStockProducts: any[] = [];

  // Usuário
  usuarioNome: string = '';
  usuarioEmail: string = '';
  usuarioIniciais: string = '';





  constructor(
    private authService: AuthService,
    private router: Router,
    private produtoService:ProdutoService
  ) {}

  ngOnInit() {
    console.log('🚀 ProdutosComponent ngOnInit iniciado');
    this.carregarDadosUsuario();
    this.initializeMenu();
    this.initializeAlerts();
    this.initializeMetrics();
    this.initializeCategories();
    this.initializeLowStockProducts();
    this.carregarProdutos();
  }

  // 🔧 MÉTODOS DO CRUD

  abrirCardCadastro() {
    this.produtoEditando = null;
    this.novoProduto = {
      nome: '',
      codigo_publico: '',
      categoria: '',
      preco_unitario: 0,
      unidade_medida: '',
      descricao: '',
      id_fornecedor: null
    };
    this.showCardCadastro = true;
  }

  fecharCardCadastro() {
    this.showCardCadastro = false;
    this.produtoEditando = null;
    this.novoProduto = {
      nome: '',
      codigo_publico: '',
      categoria: '',
      preco_unitario: 0,
      unidade_medida: '',
      descricao: '',
      id_fornecedor: null
    };
  }

  editarProduto(produto: Produto) {
    this.produtoEditando = produto;
    this.novoProduto = {
      nome: produto.nome || produto.name || '',
      codigo_publico: produto.sku || (produto as any).codigo_publico || '',
      categoria: produto.categoria || '',
      preco_unitario: produto.preco_unitario || (produto as any).preco_unitario || 0,
      unidade_medida: (produto as any).unidade_medida || '',
      descricao: produto.descricao || '',
      id_fornecedor: (produto as any).id_fornecedor || null
    };
    this.showCardCadastro = true;
  }

  async salvarProduto() {
    const produto = {
      nome: this.novoProduto.nome,
      descricao: this.novoProduto.descricao,
      categoria: this.novoProduto.categoria,
      codigo_publico: this.novoProduto.codigo_publico,
      preco_unitario: this.novoProduto.preco_unitario,
      unidade_medida: this.novoProduto.unidade_medida,
      id_fornecedor: this.novoProduto.id_fornecedor ?? undefined, // 👈 converte null → undefined
    };
  
    if (this.produtoEditando) {
      // Atualizar
      const idParaAtualizar = (this.produtoEditando as any).id_produto ?? (this.produtoEditando as any).id ?? (this.produtoEditando as any).id_patrimonio;

      this.produtoService.atualizarProduto(idParaAtualizar, produto).subscribe({
        next: () => {
          console.log('Produto atualizado com sucesso!');
          this.fecharCardCadastro();
          this.carregarProdutos();
        },
        error: (err) => console.error('Erro ao atualizar produto:', err)
      });
    } else {
      // Criar
      this.produtoService.criarProduto(produto).subscribe({
        next: () => {
          console.log('Produto criado com sucesso!');
          this.fecharCardCadastro();
          this.carregarProdutos();
        },
        error: (err) => console.error('Erro ao criar produto:', err)
      });
    }
  }
  
  excluirProduto(id: number) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  
    this.produtoService.deletarProduto(id).subscribe({
      next: () => {
        console.log('Produto excluído com sucesso!');
        this.carregarProdutos();
      },
      error: (err) => console.error('Erro ao excluir produto:', err)
    });
  }
  
  // 🔧 MÉTODOS DE VISUALIZAÇÃO E FILTROS

  mudarVisualizacao(tipo: 'grade' | 'tabela') {
    this.visualizacao = tipo;
    if (tipo === 'tabela' && this.produtosFiltrados.length === 0) {
      this.produtosFiltrados = [...this.produtos];
    }
  }

  toggleFiltro(campo: string) {
    this.filtroAberto = this.filtroAberto === campo ? null : campo;
  }

  aplicarFiltros() {
    this.produtosFiltrados = this.produtos.filter(produto => {
      // Pesquisa geral (nome, sku ou categoria)
      if (this.filtros.pesquisaGeral) {
        const termo = this.filtros.pesquisaGeral.toLowerCase();
        const nomeMatch = produto.nome?.toLowerCase().includes(termo);
        const skuMatch = produto.codigo_publico?.toLowerCase().includes(termo);
        const categoriaMatch = produto.categoria?.toLowerCase().includes(termo);
        if (!nomeMatch && !skuMatch && !categoriaMatch) {
          return false;
        }
      }

      // Filtro por nome
      if (this.filtros.nome &&
          !produto.nome?.toLowerCase().includes(this.filtros.nome.toLowerCase())) {
        return false;
      }

      // Filtro por SKU
      if (this.filtros.sku &&
          !produto.codigo_publico?.toLowerCase().includes(this.filtros.sku.toLowerCase())) {
        return false;
      }

      // Filtro por categoria
      if (this.filtros.categoria &&
          produto.categoria !== this.filtros.categoria) {
        return false;
      }

      // Filtro por preço mínimo
      if (this.filtros.precoMin !== null &&
          (produto.preco_unitario || 0) < this.filtros.precoMin) {
        return false;
      }

      // Filtro por preço máximo
      if (this.filtros.precoMax !== null &&
          (produto.preco_unitario || 0) > this.filtros.precoMax) {
        return false;
      }

      // Filtro por estoque mínimo
      if (this.filtros.estoqueMin > 0 &&
          (produto.quantidade || 0) < this.filtros.estoqueMin) {
        return false;
      }

      return true;
    });
  }

  limparFiltroPreco() {
    this.filtros.precoMin = null;
    this.filtros.precoMax = null;
    this.aplicarFiltros();
  }

  // 🔧 MÉTODOS AUXILIARES

  private initializeMenu(): void {
    this.menuItems = [
      { name: 'Dashboard' },
      { name: 'Produtos', active: true },
      { name: 'Movimentações' },
      { name: 'Relatórios' },
      { name: 'Previsão IA' },
      { name: 'Planos' },
      { name: 'Configurações' },
      { name: 'Usuários' }
    ];
  }

  private initializeAlerts(): void {
    this.lowStockCount = this.produtos.filter(p => (p.estoque || 0) < 5).length;
    if (this.lowStockCount > 0) {
      this.lowStockAlert = `Atenção! Você tem ${this.lowStockCount} produto(s) com estoque baixo.`;
    } else if (this.produtos.length === 0) {
      this.lowStockAlert = 'Nenhum produto cadastrado.';
    } else {
      this.lowStockAlert = 'Estoque em dia! Todos os produtos estão com quantidade adequada.';
    }
  }

  private initializeMetrics(): void {
    this.atualizarMetricas();
  }

  private initializeCategories(): void {
    this.categories = [
      { name: 'Periféricos', percentage: '45%' },
      { name: 'Eletrônicos', percentage: '20%' },
      { name: 'Informática', percentage: '15%' },
      { name: 'Acessórios', percentage: '20%' }
    ];
  }

  private initializeLowStockProducts(): void {
    this.lowStockProducts = this.produtos
      .filter(p => (p.estoque || 0) < 5)
      .map(p => ({
        name: p.name || '',
        category: p.categoria
      }));
  }

  private carregarDadosUsuario(): void {
    
  }

  private async carregarProdutos(): Promise<void> {
    console.log('🔄 Iniciando carregamento de produtos da API...');
    
    // Usar o serviço centralizado (já envia cookies com `withCredentials`)
    this.produtoService.listarProdutos().subscribe({
      next: (produtos: any[]) => {
        console.log('✅ Produtos carregados da API (service):', produtos);

        // Convertendo e normalizando campos
        this.produtos = (produtos || []).map((p: any) => ({
          ...p,
          // padroniza IDs: API pode retornar `id_produto`, `id` ou `id_patrimonio`
          id_produto: p.id_produto ?? p.id ?? p.id_patrimonio,
          id: p.id ?? p.id_produto ?? p.id_patrimonio,
          nome: p.nome || p.name || '',
          name: p.name || p.nome || '',
          preco: p.preco || p.preco_unitario || 0,
          quantidade: (typeof p.quantidade === 'number' ? p.quantidade : (p.quantidade ?? p.estoque ?? p.quantidade_atual ?? 0)),
          categoria: p.categoria || 'Sem categoria'
        }));

        // Inicializar produtos filtrados
        this.produtosFiltrados = [...this.produtos];

        // Extrair categorias únicas para os filtros
        this.categoriasUnicas = [...new Set(this.produtos
          .map(p => p.categoria)
          .filter(cat => cat && cat !== 'Sem categoria')
        )];

        this.atualizarMetricas();
        this.initializeAlerts();
        this.initializeCategories();
        this.initializeLowStockProducts();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar produtos via service:', error);
        this.produtos = [];
        this.produtosFiltrados = [];
        this.atualizarMetricas();
        this.initializeAlerts();
        this.initializeCategories();
        this.initializeLowStockProducts();
      }
    });
  }

  private atualizarMetricas(): void {
    this.totalProducts = this.produtos.length;
    
    const valorTotal = this.produtos.reduce((total, produto) => 
      total + ((produto.preco_unitario || 0) * (produto.quantidade || 0)), 0
    );
    
    this.stockValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valorTotal);

    this.lowStockCount = this.produtos.filter(p => (p.quantidade || 0) < 5).length;

    // Atualizar metricCards
    this.metricCards = [
      {
        title: 'Total de Produtos',
        value: this.totalProducts,
        variation: this.totalProducts > 0 ? '+12% este mês' : '-',
        trend: this.totalProducts > 0 ? 'positive' : 'neutral'
      },
      {
        title: 'Valor do Estoque',
        value: this.stockValue,
        variation: valorTotal > 0 ? '+8.2%' : '-',
        trend: valorTotal > 0 ? 'positive' : 'neutral'
      },
      {
        title: 'Itens em Baixa',
        value: this.lowStockCount,
        variation: this.lowStockCount > 0 ? 'atenção' : 'tudo ok',
        trend: this.lowStockCount > 0 ? 'negative' : 'positive'
      },
      {
        title: 'Saídas do Mês',
        value: 0,
        variation: '-',
        trend: 'neutral'
      }
    ];
  }

  private gerarIniciais(nome: string): string {
    const palavras = nome.trim().split(' ');
    if (palavras.length >= 2) {
      return (palavras[0][0] + palavras[palavras.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}