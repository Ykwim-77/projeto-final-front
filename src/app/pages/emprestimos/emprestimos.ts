import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmprestimoService, Emprestimo } from '../../services/emprestimo.service';
import { ProdutoService, Produto } from '../../services/produto.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

interface MetricCard {
  title: string;
  value?: string | number;
  variation?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

@Component({
  selector: 'app-emprestimos',
  templateUrl: './emprestimos.html',
  styleUrls: ['./emprestimos.scss'],
  imports: [SidebarComponent, FormsModule, CommonModule],
  standalone: true
})
export class EmprestimosComponent implements OnInit {
onBlurProduto() {
throw new Error('Method not implemented.');
}
mostrarDropdownProdutos: any;
selecionarUsuario(_t71: any) {
throw new Error('Method not implemented.');
}
onBlurUsuario() {
throw new Error('Method not implemented.');
}
mostrarDropdownUsuarios: any;
filtrarProdutos() {
throw new Error('Method not implemented.');
}
produtoPesquisa: any;
produtosFiltrados: any;
selecionarProduto(_t38: any) {
throw new Error('Method not implemented.');
}
removerProduto() {
throw new Error('Method not implemented.');
}
filtrarUsuarios() {
throw new Error('Method not implemented.');
}
usuariosFiltrados: any;
usuarioPesquisa: any;
removerUsuario() {
throw new Error('Method not implemented.');
}

  // ===== VARIÁVEIS DO CARD DE NOVO EMPRÉSTIMO =====
  showCardCadastro = false;
  carregando = false;
  mensagemErro = '';

  // Dados do formulário do card
  novoEmprestimo: any = {
    id_usuario: undefined,
    id_patrimonio: undefined,
    quantidade: 1,
    status: 'ativo',
    observacoes: '',
    data_devolucao: '',
    prazo_dias: 7
  };

  selecionadoProduto: Produto | null = null;

  // ===== VARIÁVEIS EXISTENTES =====
  metricCards: MetricCard[] = [
    { title: 'Empréstimos Pendentes', variation: '+5%', trend: 'positive' },
    { title: 'Empréstimos Ativos', variation: '+2%', trend: 'neutral' },
    { title: 'Empréstimos Recebidos', variation: '+15%', trend: 'positive' },
    { title: 'Total de Empréstimos', variation: '+8%', trend: 'positive' }
  ];

  // Valores reais para empréstimos
  emprestimosPendentes: number = 0;
  emprestimosAtivos: number = 0;
  emprestimosRecebidos: number = 0;
  totalEmprestimos: number = 0;

  // Listas
  emprestimos: Emprestimo[] = [];
  emprestimosPendentesLista: Emprestimo[] = [];
  emprestimosAtrasados: number = 0;
  devolvidosMes: number = 0;
  emprestimosAtrasadosLista: Emprestimo[] = [];

  // Filtros
  filtroStatus: string = 'todos';
  filtroPesquisa: string = '';

  // Controle do modal de devolução
  isModalDevolucaoAberto: boolean = false;
  emprestimoDevolucao: Emprestimo | null = null;
  isCarregando: boolean = false;
  
  // Usuário logado
  userLogado: any = null;

  // Lista de produtos para seleção
  produtosDisponiveis: Produto[] = [];
  usuariosDisponiveis: Usuario[] = [];
selecionadoUsuario: any;

  constructor(
    private emprestimoService: EmprestimoService,
    private authService: AuthService,
    private produtoService: ProdutoService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarioLogado();
    this.carregarListaEmprestimos();
    this.carregarProdutosDisponiveis();
    this.carregarUsuariosDisponiveis();
  }

  // ===== MÉTODOS DO CARD DE NOVO EMPRÉSTIMO =====

  abrirCardCadastro(): void {
    this.showCardCadastro = true;
    this.limparFormulario();
  }

  fecharCardCadastro(): void {
    this.showCardCadastro = false;
    this.limparFormulario();
  }

  onProdutoChange(): void {
    const id = this.novoEmprestimo.id_patrimonio;
    this.selecionadoProduto = this.produtosDisponiveis.find(p => p.id_patrimonio === id) || null;
    
    if (this.selecionadoProduto && this.novoEmprestimo.quantidade > this.selecionadoProduto.estoque) {
      this.mensagemErro = `Quantidade solicitada maior que estoque disponível (${this.selecionadoProduto.estoque})`;
    } else {
      this.mensagemErro = '';
    }
  }

  onQuantidadeChange(): void {
    if (this.selecionadoProduto && this.novoEmprestimo.quantidade > this.selecionadoProduto.estoque) {
      this.mensagemErro = `Quantidade solicitada maior que estoque disponível (${this.selecionadoProduto.estoque})`;
    } else {
      this.mensagemErro = '';
    }
  }

  calcularDataDevolucao(): void {
    if (this.novoEmprestimo.prazo_dias) {
      const data = new Date();
      data.setDate(data.getDate() + this.novoEmprestimo.prazo_dias);
      this.novoEmprestimo.data_devolucao = data.toISOString().split('T')[0];
    }
  }

  formValid(): boolean {
    return !!this.novoEmprestimo.id_usuario && 
           !!this.novoEmprestimo.id_patrimonio && 
           this.novoEmprestimo.quantidade > 0 &&
           (!this.selecionadoProduto || this.novoEmprestimo.quantidade <= this.selecionadoProduto.estoque);
  }

  salvarEmprestimo(): void {
    if (!this.formValid()) {
      this.mensagemErro = 'Preencha todos os campos obrigatórios corretamente';
      return;
    }

    this.mensagemErro = '';
    this.carregando = true;

    const payload: Partial<Emprestimo> = {
      data_pedido: new Date().toISOString(),
      valor_total: 0,
      status: this.novoEmprestimo.status,
      observacoes: this.novoEmprestimo.observacoes,
      id_usuario: this.novoEmprestimo.id_usuario,
      id_patrimonio: this.novoEmprestimo.id_patrimonio,
      quantidade: this.novoEmprestimo.quantidade || 1,
      data_recebimento: this.novoEmprestimo.data_devolucao || undefined
    };

    this.emprestimoService.criarEmprestimo(payload).subscribe({
      next: () => {
        this.carregando = false;
        this.fecharCardCadastro();
        this.carregarListaEmprestimos();
      },
      error: (err) => {
        console.error('Erro ao criar empréstimo:', err);
        this.mensagemErro = err?.error?.mensagem || err?.message || 'Erro ao criar empréstimo';
        this.carregando = false;
      }
    });
  }

  limparFormulario(): void {
    this.novoEmprestimo = {
      id_usuario: undefined,
      id_patrimonio: undefined,
      quantidade: 1,
      status: 'ativo',
      observacoes: '',
      data_devolucao: '',
      prazo_dias: 7
    };
    this.selecionadoProduto = null;
    this.mensagemErro = '';
  }

  // ===== MÉTODOS EXISTENTES =====

  carregarProdutosDisponiveis(): void {
    this.produtoService.listarProdutos().subscribe({
      next: (p) => this.produtosDisponiveis = p || [],
      error: (err) => console.warn('Não foi possível carregar produtos para seleção:', err)
    });
  }

  carregarUsuariosDisponiveis(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (u) => this.usuariosDisponiveis = u || [],
      error: (err) => console.warn('Não foi possível carregar usuários para seleção:', err)
    });
  }

  private carregarUsuarioLogado(): void {
    const usuario = this.authService.getUsuarioLogado();
    this.userLogado = usuario;
  }

  carregarListaEmprestimos(): void {
    this.isCarregando = true;
    
    this.emprestimoService.listarEmprestimos().subscribe({
      next: (emprestimos: Emprestimo[]) => {
        this.emprestimos = emprestimos.map(e => ({
          ...e,
          id_movimentacao: e.id_emprestimo,
          produto: e.patrimonio?.nome || 'Sem produto',
          usuario: e.usuario?.nome || 'Sem usuário',
          dataEmprestimo: this.formatarData(e.data_pedido),
          dataDevolucao: e.data_recebimento ? this.formatarData(e.data_recebimento) : null,
          observacao: e.observacoes || null,
          departamento: 'Geral',
          contato: e.usuario?.email || ''
        } as Emprestimo));
        this.atualizarContadores();
        this.isCarregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar empréstimos:', err);
        this.isCarregando = false;
      }
    });
  }

  private formatarData(data: string): string {
    if (!data) return '';
    try {
      const d = new Date(data);
      return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', day: '2-digit' });
    } catch {
      return data;
    }
  }

  getStatusClass(status: string | undefined): string {
    const s = status?.toLowerCase() || 'ativo';
    switch(s) {
      case 'ativo': return 'status-ativo';
      case 'atrasado': return 'status-atrasado';
      case 'devolvido': return 'status-devolvido';
      default: return 'status-default';
    }
  }

  getStatusIcon(status: string | undefined): string {
    const s = status?.toLowerCase() || 'ativo';
    switch(s) {
      case 'ativo': return 'fas fa-box-open';
      case 'atrasado': return 'fas fa-exclamation-triangle';
      case 'devolvido': return 'fas fa-check-circle';
      default: return 'fas fa-question-circle';
    }
  }

  getStatusDescription(status: string | undefined): string {
    const s = status?.toLowerCase() || 'ativo';
    switch(s) {
      case 'ativo': return 'Empréstimo ativo';
      case 'atrasado': return 'Empréstimo em atraso';
      case 'devolvido': return 'Devolvido';
      default: return 'Status desconhecido';
    }
  }

  get emprestimosFiltrados(): Emprestimo[] {
    return this.emprestimos.filter(emp => {
      const statusMatch = this.filtroStatus === 'todos' || emp.status === this.filtroStatus;
      const pesquisaMatch = this.filtroPesquisa === '' || 
        (emp.produto && emp.produto.toLowerCase().includes(this.filtroPesquisa.toLowerCase()));
      
      return statusMatch && pesquisaMatch;
    });
  }

  // ===== MÉTODOS DE AÇÕES =====

  editarEmprestimo(emprestimo: Emprestimo): void {
    // Implementar edição se necessário
    console.log('Editar empréstimo:', emprestimo);
  }

  abrirModalDevolucao(emprestimo: Emprestimo): void {
    this.emprestimoDevolucao = { ...emprestimo };
    this.isModalDevolucaoAberto = true;
  }

  fecharModalDevolucao(): void {
    this.isModalDevolucaoAberto = false;
    this.emprestimoDevolucao = null;
  }

  confirmarDevolucao(): void {
    if (!this.emprestimoDevolucao) return;

    const id = this.emprestimoDevolucao.id_movimentacao || this.emprestimoDevolucao.id_emprestimo;
    if (!id) return;

    this.emprestimoService.atualizarEmprestimo(id, {
      status: 'devolvido',
      data_recebimento: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.carregarListaEmprestimos();
        this.fecharModalDevolucao();
      },
      error: (err) => {
        console.error('Erro ao marcar como devolvido:', err);
      }
    });
  }

  marcarComoDevolvido(emprestimo: Emprestimo): void {
    const id = emprestimo.id_movimentacao || emprestimo.id_emprestimo;
    if (!id) return;

    this.emprestimoService.atualizarEmprestimo(id, {
      status: 'recebido',
      data_recebimento: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.carregarListaEmprestimos();
      },
      error: (err) => {
        console.error('Erro ao marcar como recebido:', err);
      }
    });
  }

  renovarEmprestimo(emprestimo: Emprestimo): void {
    const id = emprestimo.id_movimentacao || emprestimo.id_emprestimo;
    if (!id) return;

    const novaData = new Date();
    novaData.setDate(novaData.getDate() + 7);

    this.emprestimoService.atualizarEmprestimo(id, { data_recebimento: novaData.toISOString() }).subscribe({
      next: () => {
        this.carregarListaEmprestimos();
      },
      error: (err) => {
        console.error('Erro ao renovar:', err);
      }
    });
  }

  gerarRelatorio(): void {
    console.log('Gerando relatório de empréstimos...');
  }

  private atualizarContadores(): void {
    this.emprestimosPendentes = this.emprestimos.filter(emp => emp.status === 'pendente').length;
    this.emprestimosAtivos = this.emprestimos.filter(emp => emp.status === 'ativo').length;
    this.emprestimosRecebidos = this.emprestimos.filter(emp => emp.status === 'recebido').length;
    this.totalEmprestimos = this.emprestimos.length;

    this.emprestimosPendentesLista = this.emprestimos.filter(emp => emp.status === 'pendente');

    this.emprestimosAtrasados = this.emprestimosPendentes;
    this.devolvidosMes = this.emprestimosRecebidos;
    this.emprestimosAtrasadosLista = this.emprestimosPendentesLista;

    this.metricCards[0].value = this.emprestimosPendentes;
    this.metricCards[1].value = this.emprestimosAtivos;
    this.metricCards[2].value = this.emprestimosRecebidos;
    this.metricCards[3].value = this.totalEmprestimos;
  }
}