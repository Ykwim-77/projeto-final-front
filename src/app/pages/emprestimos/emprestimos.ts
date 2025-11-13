import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmprestimoService } from '../../services/emprestimo.service';
import { AuthService } from '../../services/auth.service';

// Interface para os cards de métricas
interface MetricCard {
  title: string;
  value?: string | number;
  variation?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

// Interface para empréstimos
interface Emprestimo {
  id_movimentacao?: number;
  id_patrimonio: number;
  id_usuario: number;
  tipo_movimentacao: string;
  origem?: string;
  data_movimento: string;
  status?: string;
  observacao?: string;
  produto?: string;
  usuario?: string;
  dataEmprestimo?: string;
  dataDevolucao?: string;
  departamento?: string;
  contato?: string;
}

@Component({
  selector: 'app-emprestimos',
  templateUrl: './emprestimos.html',
  styleUrls: ['./emprestimos.scss'],
  imports: [SidebarComponent, FormsModule, CommonModule],
  standalone: true
})
export class EmprestimosComponent implements OnInit {

  // Dados dos cards de métricas
  metricCards: MetricCard[] = [
    { title: 'Empréstimos Ativos', variation: '+5%', trend: 'positive' },
    { title: 'Empréstimos Atrasados', variation: '+2%', trend: 'negative' },
    { title: 'Devolvidos Este Mês', variation: '+15%', trend: 'positive' },
    { title: 'Total de Empréstimos', variation: '+8%', trend: 'positive' }
  ];

  // Valores reais para empréstimos
  emprestimosAtivos: number = 0;
  emprestimosAtrasados: number = 0;
  devolvidosMes: number = 0;
  totalEmprestimos: number = 0;

  // Listas
  emprestimos: Emprestimo[] = [];
  emprestimosAtrasadosLista: Emprestimo[] = [];

  // Filtros
  filtroStatus: string = 'todos';
  filtroPesquisa: string = '';

  // Controle dos modais
  isModalNovoEmprestimoAberto: boolean = false;
  isModalEditarEmprestimoAberto: boolean = false;
  emprestimoSelecionado: Emprestimo | null = null;
  isCarregando: boolean = false;
  mensagemErro: string = '';
  
  // Usuário logado
  userLogado: any = null;

  // Dados para novo empréstimo
  novoEmprestimo: any = {
    produto: '',
    usuario: '',
    dataDevolucao: '',
    departamento: '',
    contato: ''
  };

  constructor(
    private emprestimoService: EmprestimoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarioLogado();
    this.carregarListaEmprestimos();
  }

  /**
   * Carrega dados do usuário logado
   */
  private carregarUsuarioLogado(): void {
    const usuario = this.authService.getUsuarioLogado();
    this.userLogado = usuario;
  }

  /**
   * Carrega a lista de empréstimos do backend
   */
  carregarListaEmprestimos(): void {
    this.isCarregando = true;
    this.mensagemErro = '';
    
    this.emprestimoService.listarEmprestimos().subscribe({
      next: (emprestimos: Emprestimo[]) => {
        this.emprestimos = emprestimos.map((e) => ({
          ...e,
          dataEmprestimo: this.formatarData(e.data_movimento),
          dataDevolucao: e.observacao || '',
          produto: e.origem || 'Sem descrição',
          usuario: e.id_usuario?.toString() || '',
          status: e.status || 'ativo'
        }));
        this.atualizarContadores();
        this.isCarregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar empréstimos:', err);
        this.mensagemErro = 'Erro ao carregar lista de empréstimos';
        this.isCarregando = false;
      }
    });
  }

  /**
   * Formata data para exibição
   */
  private formatarData(data: string): string {
    if (!data) return '';
    try {
      const d = new Date(data);
      return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', day: '2-digit' });
    } catch {
      return data;
    }
  }

  /**
   * Retorna a classe CSS para o status
   */
  getStatusClass(status: string | undefined): string {
    const s = status?.toLowerCase() || 'ativo';
    switch(s) {
      case 'ativo': return 'status-ativo';
      case 'atrasado': return 'status-atrasado';
      case 'devolvido': return 'status-devolvido';
      default: return 'status-default';
    }
  }

  /**
   * Retorna o ícone para o status
   */
  getStatusIcon(status: string | undefined): string {
    const s = status?.toLowerCase() || 'ativo';
    switch(s) {
      case 'ativo': return 'fas fa-box-open';
      case 'atrasado': return 'fas fa-exclamation-triangle';
      case 'devolvido': return 'fas fa-check-circle';
      default: return 'fas fa-question-circle';
    }
  }

  /**
   * Retorna a descrição do status
   */
  getStatusDescription(status: string | undefined): string {
    const s = status?.toLowerCase() || 'ativo';
    switch(s) {
      case 'ativo': return 'Empréstimo ativo';
      case 'atrasado': return 'Empréstimo em atraso';
      case 'devolvido': return 'Devolvido';
      default: return 'Status desconhecido';
    }
  }

  /**
   * Filtra os empréstimos baseado no status e pesquisa
   */
  get emprestimosFiltrados(): Emprestimo[] {
    return this.emprestimos.filter(emp => {
      const statusMatch = this.filtroStatus === 'todos' || emp.status === this.filtroStatus;
      const pesquisaMatch = this.filtroPesquisa === '' || 
        (emp.produto && emp.produto.toLowerCase().includes(this.filtroPesquisa.toLowerCase()));
      
      return statusMatch && pesquisaMatch;
    });
  }

  /**
   * Abre/fecha o modal de novo empréstimo
   */
  abrirModalNovoEmprestimo(): void {
    this.novoEmprestimo = {
      produto: '',
      usuario: '',
      dataDevolucao: '',
      departamento: '',
      contato: ''
    };
    this.isModalNovoEmprestimoAberto = true;
  }

  /**
   * Fecha o modal de novo empréstimo
   */
  fecharModalNovoEmprestimo(): void {
    this.isModalNovoEmprestimoAberto = false;
  }

  /**
   * Processa o cadastro de novo empréstimo
   */
  cadastrarEmprestimo(form: NgForm): void {
    if (!form.valid) {
      this.mensagemErro = 'Preencha todos os campos obrigatórios';
      return;
    }

    const novoEmprestimo: Partial<Emprestimo> = {
      id_patrimonio: form.value.id_patrimonio || 1,
      id_usuario: this.userLogado?.id_usuario || 1,
      tipo_movimentacao: 'emprestimo',
      origem: form.value.produto,
      data_movimento: new Date().toISOString(),
      status: 'ativo',
      observacao: form.value.dataDevolucao
    };

    this.mensagemErro = '';
    this.emprestimoService.criarEmprestimo(novoEmprestimo).subscribe({
      next: () => {
        this.carregarListaEmprestimos();
        this.fecharModalNovoEmprestimo();
        form.reset();
        console.log('Empréstimo criado com sucesso');
      },
      error: (err) => {
        console.error('Erro ao criar empréstimo:', err);
        this.mensagemErro = 'Erro ao criar empréstimo';
      }
    });
  }

  /**
   * Abre modal para editar empréstimo
   */
  abrirModalEditarEmprestimo(emprestimo: Emprestimo): void {
    this.emprestimoSelecionado = { ...emprestimo };
    this.isModalEditarEmprestimoAberto = true;
  }

  /**
   * Fecha modal de edição de empréstimo
   */
  fecharModalEditarEmprestimo(): void {
    this.isModalEditarEmprestimoAberto = false;
    this.emprestimoSelecionado = null;
  }

  /**
   * Marca empréstimo como devolvido
   */
  marcarComoDevolvido(emprestimo: Emprestimo): void {
    if (!emprestimo.id_movimentacao) return;
    
    this.emprestimoService.marcarComoDevolvido(emprestimo.id_movimentacao).subscribe({
      next: () => {
        this.carregarListaEmprestimos();
        console.log('Empréstimo marcado como devolvido');
      },
      error: (err) => {
        console.error('Erro ao marcar como devolvido:', err);
        this.mensagemErro = 'Erro ao marcar como devolvido';
      }
    });
  }

  /**
   * Renova um empréstimo
   */
  renovarEmprestimo(emprestimo: Emprestimo): void {
    if (!emprestimo.id_movimentacao) return;
    
    const novaData = new Date();
    novaData.setDate(novaData.getDate() + 7);
    
    this.emprestimoService.renovarEmprestimo(emprestimo.id_movimentacao, novaData.toISOString()).subscribe({
      next: () => {
        this.carregarListaEmprestimos();
        console.log('Empréstimo renovado');
      },
      error: (err) => {
        console.error('Erro ao renovar:', err);
        this.mensagemErro = 'Erro ao renovar empréstimo';
      }
    });
  }

  /**
   * Salva as alterações do empréstimo
   */
  salvarAlteracoesEmprestimo(): void {
    if (!this.emprestimoSelecionado || !this.emprestimoSelecionado.id_movimentacao) {
      return;
    }

    this.emprestimoService.atualizarEmprestimo(
      this.emprestimoSelecionado.id_movimentacao,
      {
        status: this.emprestimoSelecionado.status,
        observacao: this.emprestimoSelecionado.observacao
      }
    ).subscribe({
      next: () => {
        this.carregarListaEmprestimos();
        this.fecharModalEditarEmprestimo();
        console.log('Empréstimo atualizado');
      },
      error: (err) => {
        console.error('Erro ao atualizar:', err);
        this.mensagemErro = 'Erro ao salvar alterações';
      }
    });
  }

  /**
   * Manipula mudança de status no select
   */
  onStatusChange(newStatus: string): void {
    if (this.emprestimoSelecionado) {
      this.emprestimoSelecionado.status = newStatus;
    }
  }

  /**
   * Deleta um empréstimo
   */
  deletarEmprestimo(emprestimo: Emprestimo): void {
    if (!emprestimo.id_movimentacao) return;
    
    if (!confirm('Tem certeza que deseja deletar este empréstimo?')) {
      return;
    }

    this.emprestimoService.deletarEmprestimo(emprestimo.id_movimentacao).subscribe({
      next: () => {
        this.carregarListaEmprestimos();
        console.log('Empréstimo deletado');
      },
      error: (err) => {
        console.error('Erro ao deletar:', err);
        this.mensagemErro = 'Erro ao deletar empréstimo';
      }
    });
  }

  /**
   * Gera relatório
   */
  gerarRelatorio(): void {
    console.log('Gerando relatório de empréstimos...');
    // TODO: implementar exportação de relatório
  }

  /**
   * Atualiza os contadores de empréstimos
   */
  private atualizarContadores(): void {
    this.emprestimosAtivos = this.emprestimos.filter(emp => emp.status === 'ativo').length;
    this.emprestimosAtrasados = this.emprestimos.filter(emp => emp.status === 'atrasado').length;
    this.devolvidosMes = this.emprestimos.filter(emp => emp.status === 'devolvido').length;
    this.totalEmprestimos = this.emprestimos.length;

    // Atualizar lista de atrasados
    this.emprestimosAtrasadosLista = this.emprestimos.filter(emp => emp.status === 'atrasado');

    // Atualizar os valores nos cards
    this.metricCards[0].value = this.emprestimosAtivos;
    this.metricCards[1].value = this.emprestimosAtrasados;
    this.metricCards[2].value = this.devolvidosMes;
    this.metricCards[3].value = this.totalEmprestimos;
  }
}