import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmprestimoService, Emprestimo } from '../../services/emprestimo.service';
import { ProdutoService, Produto } from '../../services/produto.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

// Interface para os cards de métricas
interface MetricCard {
  title: string;
  value?: string | number;
  variation?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

// Tipo `Emprestimo` importado de `emprestimo.service.ts` para evitar conflitos de tipos entre arquivos.

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
  // Backwards-compatible aliases used by template
  emprestimosAtrasados: number = 0;
  devolvidosMes: number = 0;
  emprestimosAtrasadosLista: Emprestimo[] = [];

  // Filtros
  filtroStatus: string = 'todos';
  filtroPesquisa: string = '';

  // Controle dos modais
  isModalNovoEmprestimoAberto: boolean = false;
  isModalEditarEmprestimoAberto: boolean = false;
  isModalDevolucaoAberto: boolean = false;
  emprestimoSelecionado: Emprestimo | null = null;
  emprestimoDevolucao: Emprestimo | null = null;
  isCarregando: boolean = false;
  mensagemErro: string = '';
  
  // Usuário logado
  userLogado: any = null;

  // Dados para novo empréstimo (usar modelo correto do backend)
  novoEmprestimo: Partial<Emprestimo> = {
    data_pedido: new Date().toISOString(),
    valor_total: 0,
    status: 'ativo',
    observacoes: '',
    id_usuario: 1,
    quantidade: 1
  };

  // Lista de produtos para seleção no modal
  produtosDisponiveis: Produto[] = [];
  usuariosDisponiveis: Usuario[] = [];
  produtoModalSelecionado: Produto | null = null;

  constructor(
    private emprestimoService: EmprestimoService,
    private authService: AuthService
    , private produtoService: ProdutoService
    , private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarioLogado();
    this.carregarListaEmprestimos();
    // carregar itens de seleção do modal imediatamente
    this.carregarProdutosDisponiveis();
    this.carregarUsuariosDisponiveis();
  }

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
        // Map backend fields to UI-compatible fields for the template
        this.emprestimos = emprestimos.map(e => ({
          ...e,
          // Compatibility aliases used by existing template
          id_movimentacao: e.id_emprestimo,
          produto: e.patrimonio?.nome || 'Sem produto',
          usuario: e.usuario?.nome || 'Sem usuário',
          dataEmprestimo: this.formatarData(e.data_pedido),
          dataDevolucao: e.data_recebimento ? this.formatarData(e.data_recebimento) : null,
          observacao: e.observacoes || null,
          departamento: 'Geral',  // Placeholder se não houver no backend
          contato: e.usuario?.email || ''  // Usar email do usuário como contato
        } as Emprestimo));
        this.atualizarContadores();
        this.isCarregando = false;
          // carregar produtos para seleção no modal
          this.produtoService.listarProdutos().subscribe({
            next: (p) => this.produtosDisponiveis = p || [],
            error: (err) => console.warn('Não foi possível carregar produtos para seleção:', err)
          });
          // carregar usuarios para seleção no modal
          this.usuarioService.listarUsuarios().subscribe({
            next: (u) => this.usuariosDisponiveis = u || [],
            error: (err) => console.warn('Não foi possível carregar usuários para seleção:', err)
          });
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
      data_pedido: new Date().toISOString(),
      valor_total: 0,
      status: 'ativo',
      observacoes: '',
      id_usuario: this.userLogado?.id_usuario || undefined,
      quantidade: 1
    };
    this.isModalNovoEmprestimoAberto = true;
  }

  onModalProdutoChange(): void {
    const id = this.novoEmprestimo.id_patrimonio;
    this.produtoModalSelecionado = this.produtosDisponiveis.find(p => p.id_patrimonio === id) || null;
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
  cadastrarEmprestimo(novoEmprestimoForm: any): void {
    // Validação básica: precisa de usuário e produto selecionados
    if (!this.novoEmprestimo.id_patrimonio || !this.novoEmprestimo.id_usuario) {
      this.mensagemErro = 'Selecione usuário e produto.';
      return;
    }

    // Construir payload compatível com o backend (modelo `emprestimo`)
    const payload: Partial<Emprestimo> = {
      data_pedido: new Date().toISOString(),
      valor_total: novoEmprestimoForm.value.valor_total || 0,
      status: novoEmprestimoForm.value.status || 'ativo',
      observacoes: novoEmprestimoForm.value.observacoes || '',
      id_usuario: this.novoEmprestimo.id_usuario || this.userLogado?.id_usuario || 1,
      id_patrimonio: this.novoEmprestimo.id_patrimonio,
      quantidade: this.novoEmprestimo.quantidade || 1
    };

    // Validação adicional: se produto selecionado tem estoque
    if (this.produtoModalSelecionado && (payload.quantidade || 1) > (this.produtoModalSelecionado.estoque ?? 0)) {
      this.mensagemErro = 'Quantidade excede o estoque disponível do produto selecionado.';
      return;
    }

    this.mensagemErro = '';
    this.emprestimoService.criarEmprestimo(payload).subscribe({
      next: () => {
        this.carregarListaEmprestimos();
        this.fecharModalNovoEmprestimo();
        novoEmprestimoForm.resetForm();
        console.log('Empréstimo criado com sucesso');
      },
      error: (err) => {
        console.error('Erro ao criar empréstimo:', err);
        console.error('Resposta do servidor:', err.error);
        // Preferir a mensagem do servidor quando disponível
        this.mensagemErro = err.error?.mensagem || err.error?.dados || err.message || 'Erro ao criar empréstimo';
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
   * Abre modal de devolução ao fazer duplo-clique
   */
  abrirModalDevolucao(emprestimo: Emprestimo): void {
    this.emprestimoDevolucao = { ...emprestimo };
    this.isModalDevolucaoAberto = true;
  }

  /**
   * Fecha modal de devolução
   */
  fecharModalDevolucao(): void {
    this.isModalDevolucaoAberto = false;
    this.emprestimoDevolucao = null;
  }

  /**
   * Confirma devolução do empréstimo
   */
  confirmarDevolucao(): void {
    if (!this.emprestimoDevolucao) return;

    const id = this.emprestimoDevolucao.id_movimentacao || this.emprestimoDevolucao.id_emprestimo;
    if (!id) return;

    // Marcar como devolvido
    this.emprestimoService.atualizarEmprestimo(id, {
      status: 'devolvido',
      data_recebimento: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.carregarListaEmprestimos();
        this.fecharModalDevolucao();
        console.log('Empréstimo marcado como devolvido');
      },
      error: (err) => {
        console.error('Erro ao marcar como devolvido:', err);
        this.mensagemErro = 'Erro ao marcar como devolvido';
      }
    });
  }

  /**
   * Marca empréstimo como devolvido
   */
  marcarComoDevolvido(emprestimo: Emprestimo): void {
    const id = emprestimo.id_movimentacao || emprestimo.id_emprestimo;
    if (!id) return;

    // Marcar como recebido no novo modelo
    this.emprestimoService.atualizarEmprestimo(id, {
      status: 'recebido',
      data_recebimento: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.carregarListaEmprestimos();
        console.log('Empréstimo marcado como recebido');
      },
      error: (err) => {
        console.error('Erro ao marcar como recebido:', err);
        this.mensagemErro = 'Erro ao marcar como recebido';
      }
    });
  }

  /**
   * Renova um empréstimo
   */
  renovarEmprestimo(emprestimo: Emprestimo): void {
    const id = emprestimo.id_movimentacao || emprestimo.id_emprestimo;
    if (!id) return;

    const novaData = new Date();
    novaData.setDate(novaData.getDate() + 7);

    // Usar campo data_recebimento como aproximação para renovação/atualização
    this.emprestimoService.atualizarEmprestimo(id, { data_recebimento: novaData.toISOString() }).subscribe({
      next: () => {
        this.carregarListaEmprestimos();
        console.log('Empréstimo renovado (data_recebimento atualizada)');
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
    if (!this.emprestimoSelecionado) return;

    const id = this.emprestimoSelecionado.id_movimentacao || this.emprestimoSelecionado.id_emprestimo;
    if (!id) return;

    this.emprestimoService.atualizarEmprestimo(
      id,
      {
        status: this.emprestimoSelecionado.status,
        observacoes: (this.emprestimoSelecionado as any).observacoes ?? (this.emprestimoSelecionado as any).observacao,
        id_patrimonio: (this.emprestimoSelecionado as any).id_patrimonio,
        quantidade: (this.emprestimoSelecionado as any).quantidade || 1
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
    const id = emprestimo.id_movimentacao || emprestimo.id_emprestimo;
    if (!id) return;

    if (!confirm('Tem certeza que deseja deletar este empréstimo?')) {
      return;
    }

    this.emprestimoService.deletarEmprestimo(id).subscribe({
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
    this.emprestimosPendentes = this.emprestimos.filter(emp => emp.status === 'pendente').length;
    this.emprestimosAtivos = this.emprestimos.filter(emp => emp.status === 'ativo').length;
    this.emprestimosRecebidos = this.emprestimos.filter(emp => emp.status === 'recebido').length;
    this.totalEmprestimos = this.emprestimos.length;

    // Atualizar lista de pendentes
    this.emprestimosPendentesLista = this.emprestimos.filter(emp => emp.status === 'pendente');

    // Back-compat aliases
    this.emprestimosAtrasados = this.emprestimosPendentes;
    this.devolvidosMes = this.emprestimosRecebidos;
    this.emprestimosAtrasadosLista = this.emprestimosPendentesLista;

    // Atualizar os valores nos cards
    this.metricCards[0].value = this.emprestimosPendentes;
    this.metricCards[1].value = this.emprestimosAtivos;
    this.metricCards[2].value = this.emprestimosRecebidos;
    this.metricCards[3].value = this.totalEmprestimos;
  }
}