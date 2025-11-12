
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DecimalPipe } from '@angular/common';
import { Produto, ProdutoService } from '../../services/produto.service';
import { environment } from '../../environments/environment';



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
  imports: [CommonModule, FormsModule, RouterLink, DecimalPipe]
})
export class ProdutosComponent implements OnInit {
  
categoriasUnicas: string[] = [];
limparFiltroPreco() {
  this.filtros.precoMin = null;
  this.filtros.precoMax = null;
  this.aplicarFiltros();
}
toggleFiltro(campo: string) {
  this.filtroAberto = this.filtroAberto === campo ? null : campo;
  this.aplicarFiltros();
}

aplicarFiltros() {
  this.ngOnInit(); {  
    this.carregarProdutos();
  }
  this.produtosFiltrados = this.produtos.filter(p => {
    const produto: any = p;
    const nomeMatch = !this.filtros.nome || (p.nome || '').toLowerCase().includes(this.filtros.nome.toLowerCase());
    const skuMatch = !this.filtros.sku || ((p.sku || produto.codigo_publico || '') + '').toLowerCase().includes(this.filtros.sku.toLowerCase());
    const categoriaMatch = !this.filtros.categoria || (p.categoria || '') === this.filtros.categoria;
    const precoMinMatch = !this.filtros.precoMin || (p.preco_unitario || 0) >= Number(this.filtros.precoMin);
    const precoMaxMatch = !this.filtros.precoMax || (p.preco_unitario || 0) <= Number(this.filtros.precoMax);
    const estoqueMinMatch = !this.filtros.estoqueMin || (p.quantidade || 0) >= Number(this.filtros.estoqueMin);
    return nomeMatch && skuMatch && categoriaMatch && precoMinMatch && precoMaxMatch && estoqueMinMatch;
  });
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

  // Dados de interface
  menuItems: MenuItem[] = [];
  lowStockCount: number = 0;
  lowStockAlert: string = '';

  // Cards de Métricas
  metricCards: MetricCard[] = [];
  // Dados individuais
  totalProducts: number = 0;
  stockValue: string = '';

  // Listas
  categories: Category[] = [];
  lowStockProducts: LowStockProduct[] = [];

  // Usuário
  usuarioNome: string = '';
  usuarioEmail: string = '';
  usuarioIniciais: string = '';
produtosFiltrados: Produto[] = [];
filtros: any = {
  nome: '',
  sku: '',
  categoria: '',
  precoMin: null,
  precoMax: null,
  estoqueMin: 0
};
filtroAberto: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private produtoService: ProdutoService
  ) {}

  // Inicialização
  ngOnInit() {
    this.carregarDadosUsuario();
    this.initializeMenu();
    this.carregarProdutos();
    this.initializeMetrics();
    this.initializeCategories();
    this.initializeLowStockProducts();
  }

  // 🔧 MÉTODOS DO CRUD

  // Abrir card de cadastro
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

  // Editar produto
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

  // Salvar produto (criar ou atualizar)
  async salvarProduto() {
    // Detecta ID do produto que será atualizado (suporta id_produto ou id)
    const idToUpdate = this.produtoEditando ? (this.produtoEditando.id_produto || (this.produtoEditando as any).id) : null;
    
    try {
      if (idToUpdate) {
        // Atualizar produto existente
        const payload = {
          nome: this.novoProduto.nome.trim(),
          descricao: this.novoProduto.descricao?.trim() || null,
          categoria: this.novoProduto.categoria?.trim() || null,
          codigo_publico: this.novoProduto.codigo_publico?.trim() || null,
          preco_unitario: Number(this.novoProduto.preco_unitario) || null,
          unidade_medida: this.novoProduto.unidade_medida?.trim() || null,
          id_fornecedor: this.novoProduto.id_fornecedor || null
        };
        
        const res = await fetch(`${environment.apiUrl}/produto/${idToUpdate}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Erro ao atualizar produto:', res.status, errorText);
          return;
        }
        
        const data = await res.json();
        console.log('✅ Produto atualizado:', data);
        this.fecharCardCadastro();
        await this.carregarProdutos();
      } else {
        // Criar novo produto
        const payload = {
          nome: this.novoProduto.nome.trim(),
          descricao: this.novoProduto.descricao?.trim() || null,
          categoria: this.novoProduto.categoria?.trim() || null,
          codigo_publico: this.novoProduto.codigo_publico?.trim() || null,
          preco_unitario: Number(this.novoProduto.preco_unitario) || null,
          unidade_medida: this.novoProduto.unidade_medida?.trim() || null,
          id_fornecedor: this.novoProduto.id_fornecedor || null
        };
        
        const res = await fetch(`${environment.apiUrl}/produto`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Erro ao criar produto:', res.status, errorText);
          return;
        }
        
        const data = await res.json();
        console.log('✅ Produto criado:', data);
        this.fecharCardCadastro();
        await this.carregarProdutos();
      }
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
    }
  }

  // Excluir produto
  async excluirProduto(id: number) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }
  
      // this.produtoService.deletarProduto(id).subscribe({
      //              next: () => {
      //           this.messageService.add({
      //               severity: 'success',
      //               summary: 'Sucesso',
      //               detail: 'Conta deletada com sucesso'
      //           });
      //           this.carregarProdutos();
      //       },
      //       error: () => {
      //           this.messageService.add({
      //               severity: 'error',
      //               summary: 'Erro',
      //               detail: 'Erro ao deletar conta'
      //           });
      //       }
      // })
  } 
  // Fechar card de cadastro
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

  // Mudar entre visualização grade/tabela
  mudarVisualizacao(tipo: 'grade' | 'tabela') {
    this.visualizacao = tipo;
  }

  // Atualizar métricas
  atualizarMetricas() {
    this.totalProducts = this.produtos.length;
    
    const valorTotal = this.produtos.reduce((total, produto) => 
      total + ((produto.preco_unitario || 0) * (produto.estoque || 0)), 0
    );
    
    this.stockValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valorTotal);

    this.lowStockCount = this.produtos.filter(p => (p.estoque || 0) < 5).length;

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

    if (usuario !== null && typeof usuario === 'object') {
      this.usuarioNome = usuario.nome || 'Usuário';
      this.usuarioEmail = usuario.email || '';
      this.usuarioIniciais = this.gerarIniciais(this.usuarioNome);
    }
  }

  private async carregarProdutos(): Promise<void> {
    console.log('🔄 Iniciando carregamento de produtos da API...');
    
      
       this.produtoService.listarProdutos().subscribe({
            next: (produtos) => {
                this.produtos = produtos;
            },
            error: (error) => {
              console.error('❌ Erro ao carregar produtos:', error);
              this.produtos = [];
              this.atualizarMetricas();
              this.initializeAlerts();
              this.initializeCategories();
              this.initializeLowStockProducts();
            }
        });
  

      // Ajusta nomes conflitantes retornados pela API
    //   this.produtos = (produtos || []).map((p: any) => ({
    //     ...p,
    //     nome: p.nome || p.name,
    //     id: p.id || p.id_produto,
    //     preco: p.preco || p.preco_unitario || 0,
    //     quantidade: p.quantidade ?? p.estoque ?? p.quantidade_atual ?? 0,
    //     sku: p.sku || p.codigo_publico || ''
    //   }));
      
    //   // Extrair categorias únicas
    //   this.categoriasUnicas = [...new Set(this.produtos.map(p => p.categoria).filter(c => c))];
      
    //   // Aplicar filtros após carregar produtos
    //   this.aplicarFiltros();
      
    //   this.atualizarMetricas();
    //   this.initializeAlerts();
    //   this.initializeCategories();
    //   this.initializeLowStockProducts();
    // } catch (error) {
    //   console.error('❌ Erro ao carregar produtos da API:', error);
    //   this.produtos = [];
    //   this.produtosFiltrados = [];
    //   this.categoriasUnicas = [];
    //   this.atualizarMetricas();
    //   this.initializeAlerts();
    //   this.initializeCategories();
    //   this.initializeLowStockProducts();
    // }
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