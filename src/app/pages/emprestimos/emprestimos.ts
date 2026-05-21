import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmprestimoService, Emprestimo } from '../../services/emprestimo.service';
import { AuthService } from '../../services/auth.service';
import { ProdutoService, Produto } from '../../services/produto.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/user.model';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-emprestimos',
  templateUrl: './emprestimos.html',
  styleUrls: ['./emprestimos.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent]
})
export class EmprestimosComponent implements OnInit {
  emprestimos: Emprestimo[] = [];
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  usuariosDisponiveis: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  carregando = false;
  mensagemErro = '';
  metricCards: any[] = [];
  emprestimosAtivos = 0;
  emprestimosAtrasados = 0;
  devolvidosMes = 0;
  totalEmprestimos = 0;
  emprestimosAtrasadosLista: any[] = [];
  filtroStatus = 'todos';
  filtroPesquisa = '';
  emprestimosFiltrados: any[] = [];
  isModalNovoEmprestimoAberto = false;
  novoEmprestimo: any = {};
  produtosDisponiveis: Produto[] = [];
  produtoModalSelecionado: Produto | null = null;
  isModalEditarEmprestimoAberto = false;
  emprestimoSelecionado: any = null;
  isModalDevolucaoAberto = false;
  emprestimoDevolucao: any = null;
  userLogado: any = null;
  produtoPesquisa = '';
  selecionadoProduto: Produto | null = null;
  mostrarDropdownProdutos = false;
  usuarioPesquisa = '';
  selecionadoUsuario: Usuario | null = null;
  mostrarDropdownUsuarios = false;

  constructor(
    private emprestimoService: EmprestimoService,
    private authService: AuthService,
    private produtoService: ProdutoService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userLogado = this.authService.getUsuarioLogado();
    this.carregarEmprestimos();
    this.carregarProdutos();
    this.carregarUsuarios();
  }

  carregarEmprestimos(): void {
    this.carregando = true;
    this.emprestimoService.listarEmprestimos().subscribe({
      next: (emprestimos) => {
        this.emprestimos = emprestimos || [];
        this.calcularMetricas();
        this.carregando = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar empréstimos:', err);
        this.mensagemErro = 'Erro ao carregar empréstimos';
        this.carregando = false;
      }
    });
  }

  abrirModalNovoEmprestimo(): void {
    this.novoEmprestimo = {
      data_pedido: new Date().toISOString(),
      valor_total: 0,
      status: 'ativo',
      observacoes: '',
      id_usuario: this.userLogado?.id_usuario || undefined,
      quantidade: 1,
      data_entrega: new Date().toISOString().split('T')[0],
      data_devolucao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    this.isModalNovoEmprestimoAberto = true;
  }

  fecharModalNovoEmprestimo(): void {
    this.isModalNovoEmprestimoAberto = false;
    this.novoEmprestimo = {};
    this.selecionadoProduto = null;
    this.selecionadoUsuario = null;
    this.produtoPesquisa = '';
    this.usuarioPesquisa = '';
  }

  cadastrarEmprestimo(emprestimo: any): void {
    if (!this.formValid()) {
      this.mensagemErro = 'Preencha todos os campos obrigatórios';
      return;
    }
    const emprestimoData = {
      ...emprestimo,
      id_patrimonio: this.selecionadoProduto?.id_patrimonio,
      id_usuario: this.selecionadoUsuario?.id_usuario
    };
    this.emprestimoService.criarEmprestimo(emprestimoData).subscribe({
      next: () => {
        this.fecharModalNovoEmprestimo();
        this.carregarEmprestimos();
      },
      error: (err: any) => {
        console.error('Erro ao criar empréstimo:', err);
        this.mensagemErro = 'Erro ao criar empréstimo';
      }
    });
  }

  devolverEmprestimo(id: number): void {
    if (confirm('Confirmar devolução do empréstimo?')) {
      this.emprestimoService.devolverEmprestimo(id).subscribe({
        next: () => {
          this.carregarEmprestimos();
        },
        error: (err: any) => {
          console.error('Erro ao devolver empréstimo:', err);
          this.mensagemErro = 'Erro ao devolver empréstimo';
        }
      });
    }
  }

  navegarParaNovoEmprestimo(): void {
    this.router.navigate(['/novo-emprestimo']);
  }

  carregarProdutos(): void {
    this.produtoService.listarProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos || [];
        this.produtosFiltrados = this.produtos;
        this.produtosDisponiveis = this.produtos.filter(p => p.estoque > 0);
      },
      error: (err: any) => {
        console.error('Erro ao carregar produtos:', err);
        this.mensagemErro = 'Erro ao carregar produtos';
      }
    });
  }

  onModalProdutoChange(): void {
    this.produtoModalSelecionado = this.produtosDisponiveis.find(p => p.id_patrimonio === this.novoEmprestimo.id_patrimonio) || null;
  }

  carregarUsuarios(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuariosDisponiveis = usuarios || [];
        this.usuariosFiltrados = this.usuariosDisponiveis;
      },
      error: (err: any) => {
        console.error('Erro ao carregar usuários:', err);
        this.mensagemErro = 'Erro ao carregar usuários';
      }
    });
  }

  calcularMetricas(): void {
    this.totalEmprestimos = this.emprestimos.length;
    this.emprestimosAtivos = this.emprestimos.filter(e => e.status === 'ativo').length;
    this.emprestimosAtrasados = this.emprestimos.filter(e => e.status === 'atrasado').length;
    this.devolvidosMes = this.emprestimos.filter(e => e.status === 'devolvido').length;
    this.emprestimosAtrasadosLista = this.emprestimos.filter(e => e.status === 'atrasado');
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    let filtrados = this.emprestimos;
    if (this.filtroStatus !== 'todos') {
      filtrados = filtrados.filter(e => e.status === this.filtroStatus);
    }
    if (this.filtroPesquisa.trim()) {
      const pesquisa = this.filtroPesquisa.toLowerCase();
      filtrados = filtrados.filter(e =>
        e.produto?.toLowerCase().includes(pesquisa) ||
        e.usuario?.toLowerCase().includes(pesquisa)
      );
    }
    this.emprestimosFiltrados = filtrados;
  }

  abrirModalEditarEmprestimo(emprestimo: any): void {
    this.emprestimoSelecionado = { ...emprestimo };
    this.isModalEditarEmprestimoAberto = true;
  }

  fecharModalEditarEmprestimo(): void {
    this.isModalEditarEmprestimoAberto = false;
    this.emprestimoSelecionado = null;
  }

  salvarAlteracoesEmprestimo(): void {
    if (this.emprestimoSelecionado) {
      this.emprestimoService.atualizarEmprestimo(this.emprestimoSelecionado.id_emprestimo!, this.emprestimoSelecionado).subscribe({
        next: () => {
          this.fecharModalEditarEmprestimo();
          this.carregarEmprestimos();
        },
        error: (err: any) => {
          console.error('Erro ao salvar alterações:', err);
          this.mensagemErro = 'Erro ao salvar alterações';
        }
      });
    }
  }

  abrirModalDevolucao(emprestimo: any): void {
    this.emprestimoDevolucao = emprestimo;
    this.isModalDevolucaoAberto = true;
  }

  fecharModalDevolucao(): void {
    this.isModalDevolucaoAberto = false;
    this.emprestimoDevolucao = null;
  }

  confirmarDevolucao(): void {
    if (this.emprestimoDevolucao) {
      this.emprestimoService.devolverEmprestimo(this.emprestimoDevolucao.id_emprestimo).subscribe({
