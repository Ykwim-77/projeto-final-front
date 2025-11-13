import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Produto } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';



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
  imports: [CommonModule, FormsModule, DecimalPipe, SidebarComponent]
})
export class ProdutosComponent implements OnInit {
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
    private router: Router
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
    try {
      const idToUpdate = this.produtoEditando ? 
        (this.produtoEditando.id_produto || (this.produtoEditando as any).id) : null;
      
      const payload = {
        nome: this.novoProduto.nome.trim(),
        descricao: this.novoProduto.descricao?.trim() || null,
        categoria: this.novoProduto.categoria?.trim() || null,
        codigo_publico: this.novoProduto.codigo_publico?.trim() || null,
        preco_unitario: Number(this.novoProduto.preco_unitario) || null,
        unidade_medida: this.novoProduto.unidade_medida?.trim() || null,
        id_fornecedor: this.novoProduto.id_fornecedor || null
      };
      
      const url = idToUpdate ? 
        `${environment.apiUrl}/produto/${idToUpdate}` : 
        `${environment.apiUrl}/produto`;
      
      const method = idToUpdate ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method: method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Erro ao salvar produto:', res.status, errorText);
        return;
      }
      
      const data = await res.json();
      console.log('✅ Produto salvo:', data);
      this.fecharCardCadastro();
      await this.carregarProdutos();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
    }
  }

  async excluirProduto(id: number) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }
    
    try {
      const res = await fetch(`${environment.apiUrl}/produto/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Erro ao excluir produto:', res.status, errorText);
        return;
      }
      
      console.log('✅ Produto excluído');
      await this.carregarProdutos();
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
    }
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
    const usuario = this.authService.getUsuarioLogado() as unknown as { nome?: string; email?: string } | null;

    if (usuario && typeof usuario === 'object') {
      this.usuarioNome = usuario?.nome ?? '';
      this.usuarioEmail = usuario?.email ?? '';
      this.usuarioIniciais = this.gerarIniciais(this.usuarioNome);
    }
  }

  private async carregarProdutos(): Promise<void> {
    console.log('🔄 Iniciando carregamento de produtos da API...');
    
    try {
      const res = await fetch(`${environment.apiUrl}/produto`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Erro ao carregar produtos:', res.status, errorText);
        this.produtos = [];
        this.produtosFiltrados = [];
        this.atualizarMetricas();
        this.initializeAlerts();
        this.initializeCategories();
        this.initializeLowStockProducts();
        return;
      }
      
      const produtos = await res.json();
      console.log('✅ Produtos carregados da API:', produtos);
      
      // Convertendo e normalizando campos
      this.produtos = (produtos || []).map((p: any) => ({
        ...p,
        id: p.id || p.id_produto,
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
      
    } catch (error) {
      console.error('❌ Erro ao carregar produtos da API:', error);
      this.produtos = [];
      this.produtosFiltrados = [];
      this.atualizarMetricas();
      this.initializeAlerts();
      this.initializeCategories();
      this.initializeLowStockProducts();
    }
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