import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Interface para os cards de métricas
interface MetricCard {
  title: string;
  value?: string | number;
  variation?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

// Interface para empréstimos
interface Emprestimo {
  id: number;
  produto: string;
  usuario: string;
  dataEmprestimo: string;
  dataDevolucao: string;
  status: 'ativo' | 'atrasado' | 'devolvido';
  departamento?: string;
  contato?: string;
}

@Component({
  selector: 'app-emprestimos',
  templateUrl: './emprestimos.html',
  styleUrls: ['./emprestimos.scss'],
  imports: [SidebarComponent, FormsModule, CommonModule]
})
export class EmprestimosComponent implements OnInit {

  // Dados dos cards de métricas
  metricCards: MetricCard[] = [
    {
      title: 'Empréstimos Ativos',
      variation: '+5%',
      trend: 'positive'
    },
    {
      title: 'Empréstimos Atrasados', 
      variation: '+2%',
      trend: 'negative'
    },
    {
      title: 'Devolvidos Este Mês',
      variation: '+15%',
      trend: 'positive'
    },
    {
      title: 'Total de Empréstimos',
      variation: '+8%',
      trend: 'positive'
    }
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
  
  // Simulação do usuário logado
  userLogado = { role: 'admin' };

  // Dados para formulários
  novoEmprestimo = {
    produto: '',
    usuario: '',
    dataDevolucao: '',
    departamento: '',
    contato: ''
  };

  ngOnInit(): void {
    this.carregarDadosEmprestimos();
    this.carregarListaEmprestimos();
  }

  /**
   * Carrega os dados dos cards de métricas
   */
  carregarDadosEmprestimos(): void {
    // Simular chamada à API
    setTimeout(() => {
      this.emprestimosAtivos = 24;
      this.emprestimosAtrasados = 3;
      this.devolvidosMes = 45;
      this.totalEmprestimos = 156;
      
      // Atualizar os valores nos cards
      this.metricCards[0].value = this.emprestimosAtivos;
      this.metricCards[1].value = this.emprestimosAtrasados;
      this.metricCards[2].value = this.devolvidosMes;
      this.metricCards[3].value = this.totalEmprestimos;
    }, 1000);
  }

  /**
   * Carrega a lista de empréstimos (simulando dados do backend)
   */
  carregarListaEmprestimos(): void {
    this.emprestimos = [
      {
        id: 1,
        produto: 'Notebook Dell Inspiron',
        usuario: 'Christian da Rosa',
        dataEmprestimo: '15/nov/2024',
        dataDevolucao: '22/nov/2024',
        status: 'ativo',
        departamento: 'TI',
        contato: 'christian.darosa0106@gmail.com'
      },
      {
        id: 2,
        produto: 'Projetor Epson',
        usuario: 'Ramoos Daniely',
        dataEmprestimo: '10/nov/2024',
        dataDevolucao: '17/nov/2024',
        status: 'atrasado',
        departamento: 'Marketing',
        contato: 'ramoosdaniely@gmail.com'
      },
      {
        id: 3,
        produto: 'Tablet Samsung',
        usuario: 'Gustavo Schimit',
        dataEmprestimo: '05/nov/2024',
        dataDevolucao: '12/nov/2024',
        status: 'devolvido',
        departamento: 'Vendas',
        contato: 'schimit.gustavo.silva@gmail.com'
      },
      {
        id: 4,
        produto: 'Câmera Canon T7i',
        usuario: 'Rafael Luiz',
        dataEmprestimo: '18/nov/2024',
        dataDevolucao: '25/nov/2024',
        status: 'ativo',
        departamento: 'Design',
        contato: 'rafaelpilonetto59@gmail.com'
      }
    ];

    // Atualizar contadores após carregar empréstimos
    this.atualizarContadores();
  }

  /**
   * Retorna a classe CSS para o status
   */
  getStatusClass(status: string): string {
    switch(status) {
      case 'ativo': return 'status-ativo';
      case 'atrasado': return 'status-atrasado';
      case 'devolvido': return 'status-devolvido';
      default: return 'status-default';
    }
  }

  /**
   * Retorna o ícone para o status
   */
  getStatusIcon(status: string): string {
    switch(status) {
      case 'ativo': return 'fas fa-box-open';
      case 'atrasado': return 'fas fa-exclamation-triangle';
      case 'devolvido': return 'fas fa-check-circle';
      default: return 'fas fa-question-circle';
    }
  }

  /**
   * Retorna a descrição do status
   */
  getStatusDescription(status: string): string {
    switch(status) {
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
        emp.produto.toLowerCase().includes(this.filtroPesquisa.toLowerCase()) ||
        emp.usuario.toLowerCase().includes(this.filtroPesquisa.toLowerCase());
      
      return statusMatch && pesquisaMatch;
    });
  }

  /**
   * Abre/fecha o modal de novo empréstimo
   */
  abrirModalNovoEmprestimo(): void {
    this.isModalNovoEmprestimoAberto = true;
    // Resetar formulário
    this.novoEmprestimo = {
      produto: '',
      usuario: '',
      dataDevolucao: '',
      departamento: '',
      contato: ''
    };
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
  cadastrarEmprestimo(emprestimoData: any): void {
    // Simular adição de empréstimo
    const novoEmprestimo: Emprestimo = {
      id: this.emprestimos.length + 1,
      produto: emprestimoData.produto,
      usuario: emprestimoData.usuario,
      dataEmprestimo: new Date().toLocaleDateString('pt-BR'),
      dataDevolucao: emprestimoData.dataDevolucao,
      status: 'ativo',
      departamento: emprestimoData.departamento,
      contato: emprestimoData.contato
    };
    
    this.emprestimos.push(novoEmprestimo);
    this.atualizarContadores();
    this.fecharModalNovoEmprestimo();
  }

  /**
   * Abre modal para editar empréstimo
   */
  abrirModalEditarEmprestimo(emprestimo: Emprestimo): void {
    // Criar uma cópia do empréstimo para edição
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
    const index = this.emprestimos.findIndex(emp => emp.id === emprestimo.id);
    if (index !== -1) {
      this.emprestimos[index].status = 'devolvido';
      this.atualizarContadores();
    }
  }

  /**
   * Renova um empréstimo
   */
  renovarEmprestimo(emprestimo: Emprestimo): void {
    const index = this.emprestimos.findIndex(emp => emp.id === emprestimo.id);
    if (index !== -1) {
      const novaData = new Date();
      novaData.setDate(novaData.getDate() + 7); // Adiciona 7 dias
      this.emprestimos[index].dataDevolucao = novaData.toLocaleDateString('pt-BR');
      this.emprestimos[index].status = 'ativo';
    }
  }

  /**
   * Gera relatório
   */
  gerarRelatorio(): void {
    console.log('Gerando relatório de empréstimos...');
    // Implementar geração de relatório
  }

  /**
   * Salva as alterações do empréstimo
   */
  salvarAlteracoesEmprestimo(): void {
    if (this.emprestimoSelecionado) {
      // Encontrar e atualizar o empréstimo na lista
      const index = this.emprestimos.findIndex(emp => emp.id === this.emprestimoSelecionado!.id);
      if (index !== -1) {
        this.emprestimos[index] = { ...this.emprestimoSelecionado };
        this.atualizarContadores();
      }
      
      this.fecharModalEditarEmprestimo();
    }
  }

  /**
   * Manipula mudança de status no select
   */
  onStatusChange(newStatus: string): void {
    if (this.emprestimoSelecionado) {
      this.emprestimoSelecionado.status = newStatus as 'ativo' | 'atrasado' | 'devolvido';
    }
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