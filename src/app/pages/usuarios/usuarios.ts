import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/user.model';

// Interface para os cards de métricas
interface MetricCard {
  title: string;
  value?: string | number;
  variation?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

// Interface para usuários na tabela
interface UserDisplay {
  id_usuario?: number;
  name: string;
  email: string;
  since: string;
  permissions: string;
  role?: string;
  department?: string;
  ativo?: boolean;
  infoAdicional?: ClienteInfoAdicional;
}

// Interface para informações adicionais do cliente
interface ClienteInfoAdicional {
  telefone?: string;
  endereco?: string;
  cpf?: string;
  dataNascimento?: string;
  emprestimosAtivos?: number;
  totalEmprestimos?: number;
}

@Component({
  selector: 'app-dashboard-usuarios',
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss'],
  imports: [SidebarComponent, FormsModule, CommonModule],
  standalone: true
})
export class UsuariosComponent implements OnInit {

  // Dados dos cards de métricas
  metricCards: MetricCard[] = [
    { title: 'Total de Usuários', variation: '+8%', trend: 'positive' },
    { title: 'Administradores', variation: '+2%', trend: 'positive' },
    { title: 'Gerentes', variation: '+5%', trend: 'positive' },
    { title: 'Operadores', variation: '+12%', trend: 'positive' },
    { title: 'Clientes', variation: '+15%', trend: 'positive' }
  ];

  // Valores reais para usuários
  totalUsers: number = 0;
  administradoresCount: number = 0;
  gerentesCount: number = 0;
  operadoresCount: number = 0;
  clientesCount: number = 0;

  // Listas separadas
  users: UserDisplay[] = [];
  usuarios: UserDisplay[] = []; // Não clientes
  clientes: UserDisplay[] = []; // Apenas clientes

  // Controle do card de cadastro
  isCardCadastroAberto: boolean = false;
  isCarregando: boolean = false;
  mensagemErro: string = '';

  // Controle do modal de edição de permissões
  isModalEditarPermissoesAberto: boolean = false;
  usuarioSelecionado: UserDisplay | null = null;
  
  // Controle do modal de edição de usuário
  isModalEditarUsuarioAberto: boolean = false;
  usuarioSelecionadoParaEdicao: UserDisplay | null = null;
  novaSenha: string = '';

  // Controle do modal de detalhes do cliente
  isModalDetalhesClienteAberto: boolean = false;
  clienteSelecionado: UserDisplay | null = null;

  // Usuário logado
  userLogado: any = null;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.carregarUsuarioLogado();
    this.carregarListaUsuarios();
  }

  /**
   * Carrega dados do usuário logado
   */
  private carregarUsuarioLogado(): void {
    const usuario = this.authService.getUsuarioLogado();
    this.userLogado = usuario;
  }

  /**
   * Carrega a lista de usuários do backend
   */
  carregarListaUsuarios(): void {
    this.isCarregando = true;
    this.mensagemErro = '';

    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        // Mapeia os usuários do banco para o formato de exibição
        this.users = usuarios.map((usuario) => this.mapearUsuarioParaDisplay(usuario));
        
        this.atualizarContadores();
        this.filtrarListas();
        this.isCarregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
        this.mensagemErro = 'Erro ao carregar lista de usuários';
        this.isCarregando = false;
      }
    });
  }

  /**
   * Mapeia um usuário do banco para o formato de exibição
   */
  private mapearUsuarioParaDisplay(usuario: Usuario): UserDisplay {
    return {
      id_usuario: usuario.id_usuario,
      name: usuario.nome,
      email: usuario.email,
      since: this.gerarDataDesde(), // Gera data fictícia já que não temos data_cadastro
      permissions: this.getPermissionsDescription(usuario.tipo_usuario),
      role: this.normalizarRole(usuario.tipo_usuario),
      ativo: usuario.ativo,
      infoAdicional: this.gerarInfoAdicionalCliente(usuario)
    };
  }

  /**
   * Gera uma data "desde" fictícia baseada no ID do usuário
   */
  private gerarDataDesde(): string {
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const mes = meses[Math.floor(Math.random() * 12)];
    const ano = 2023 + Math.floor(Math.random() * 3); // 2023, 2024 ou 2025
    return `${mes}/${ano}`;
  }

  /**
   * Filtra as listas de usuários e clientes
   */
  private filtrarListas(): void {
    this.usuarios = this.users.filter(user => user.role !== 'cliente');
    this.clientes = this.users.filter(user => user.role === 'cliente');
  }

  /**
   * Gera informações adicionais para clientes (valores padrão)
   */
  private gerarInfoAdicionalCliente(usuario: Usuario): ClienteInfoAdicional {
    // Como não temos essas informações no banco, usamos valores padrão
    return {
      telefone: 'Não informado',
      endereco: 'Não informado',
      cpf: 'Não informado',
      dataNascimento: 'Não informada',
      emprestimosAtivos: 0,
      totalEmprestimos: 0
    };
  }

  /**
   * Normaliza tipo_usuario para role exibível
   */
  private normalizarRole(tipo: string | undefined): string {
    if (!tipo) return 'operador';
    switch (tipo.toLowerCase()) {
      case 'a': return 'admin';
      case 'g': return 'gerente';
      case 'o': return 'operador';
      case 'c': return 'cliente';
      default: return tipo;
    }
  }

  /**
   * Retorna a badge para a role do usuário
   */
  getRoleBadge(role?: string): string {
    if (!role) return 'U';

    switch (role) {
      case 'admin': return 'A';
      case 'gerente': return 'G';
      case 'operador': return 'O';
      case 'cliente': return 'C';
      default: return 'U';
    }
  }

  /**
   * Retorna a descrição das permissões baseado na role
   */
  getPermissionsDescription(role?: string): string {
    if (!role) return 'Permissões não definidas';

    const roleNormalizado = this.normalizarRole(role);
    switch (roleNormalizado) {
      case 'admin':
        return 'Acesso total ao sistema';
      case 'gerente':
        return 'Todas as funcionalidades e gerenciar usuários';
      case 'operador':
        return 'Gerenciar produtos e dar baixa em empréstimos';
      case 'cliente':
        return 'Apenas realizar empréstimos';
      default:
        return 'Permissões não definidas';
    }
  }

  /**
   * Abre modal para visualizar detalhes do cliente
   */
  abrirModalDetalhesCliente(cliente: UserDisplay): void {
    this.clienteSelecionado = { ...cliente };
    this.isModalDetalhesClienteAberto = true;
  }

  /**
   * Fecha modal de detalhes do cliente
   */
  fecharModalDetalhesCliente(): void {
    this.isModalDetalhesClienteAberto = false;
    this.clienteSelecionado = null;
  }

  /**
   * Abre modal para editar usuário
   */
  abrirModalEditarUsuario(usuario: UserDisplay): void {
    this.usuarioSelecionadoParaEdicao = {
      ...usuario,
      ativo: usuario.ativo !== undefined ? usuario.ativo : true
    };
    this.novaSenha = '';
    this.isModalEditarUsuarioAberto = true;
  }

  /**
   * Fecha modal de edição de usuário
   */
  fecharModalEditarUsuario(): void {
    this.isModalEditarUsuarioAberto = false;
    this.usuarioSelecionadoParaEdicao = null;
    this.novaSenha = '';
  }

  /**
   * Manipula mudança de role no select do modal de edição
   */
  onRoleChangeEditar(newRole: string): void {
    if (this.usuarioSelecionadoParaEdicao) {
      this.usuarioSelecionadoParaEdicao.role = newRole;
    }
  }

  /**
   * Salva as alterações do usuário no backend
   */
  salvarEdicaoUsuario(): void {
    if (!this.usuarioSelecionadoParaEdicao || !this.usuarioSelecionadoParaEdicao.id_usuario) {
      return;
    }

    // Converter role de volta para tipo_usuario (letra)
    const tipoMap: { [key: string]: string } = {
      'admin': 'A',
      'gerente': 'G',
      'operador': 'O',
      'cliente': 'C'
    };

    const novoTipo = tipoMap[this.usuarioSelecionadoParaEdicao.role || ''] || 'O';

    // Preparar os dados para atualização
    const dadosAtualizacao: any = {
      nome: this.usuarioSelecionadoParaEdicao.name,
      email: this.usuarioSelecionadoParaEdicao.email,
      tipo_usuario: novoTipo,
      ativo: this.usuarioSelecionadoParaEdicao.ativo
    };

    // Se a nova senha foi preenchida, adicionar ao objeto de atualização
    if (this.novaSenha && this.novaSenha.trim() !== '') {
      dadosAtualizacao.senha = this.novaSenha;
    }

    this.usuarioService.atualizarUsuario(this.usuarioSelecionadoParaEdicao.id_usuario, dadosAtualizacao).subscribe({
      next: () => {
        this.carregarListaUsuarios();
        this.fecharModalEditarUsuario();
        console.log('Usuário atualizado com sucesso');
      },
      error: (err) => {
        console.error('Erro ao atualizar usuário:', err);
        this.mensagemErro = 'Erro ao salvar alterações';
      }
    });
  }

  /**
   * Abre/fecha o card de cadastro de usuários
   */
  abrirCardCadastro(): void {
    this.isCardCadastroAberto = !this.isCardCadastroAberto;
  }

  /**
   * Fecha o card de cadastro
   */
  fecharCardCadastro(): void {
    this.isCardCadastroAberto = false;
  }

  /**
   * Processa o cadastro de novo usuário
   */
  cadastrarUsuario(form: NgForm): void {
    if (!form.valid) {
      this.mensagemErro = 'Preencha todos os campos obrigatórios';
      return;
    }

    const usuarioData = form.value;

    // Mapear para formato do backend
    const novoUsuario: Usuario = {
      nome: usuarioData.nome,
      email: usuarioData.email,
      senha: usuarioData.senha || Math.random().toString(36).substring(2, 15),
      tipo_usuario: usuarioData.perfil || 'O',
      ativo: true
    };

    this.mensagemErro = '';
    this.usuarioService.criarUsuario(novoUsuario).subscribe({
      next: () => {
        this.carregarListaUsuarios();
        this.fecharCardCadastro();
        form.reset();
        console.log('Usuário criado com sucesso');
      },
      error: (err) => {
        console.error('Erro ao criar usuário:', err);
        this.mensagemErro = 'Erro ao criar usuário';
      }
    });
  }

  /**
   * Abre modal para editar permissões
   */
  abrirModalEditarPermissoes(usuario: UserDisplay): void {
    this.usuarioSelecionado = { ...usuario };
    this.isModalEditarPermissoesAberto = true;
  }

  /**
   * Fecha modal de edição de permissões
   */
  fecharModalEditarPermissoes(): void {
    this.isModalEditarPermissoesAberto = false;
    this.usuarioSelecionado = null;
  }

  /**
   * Manipula mudança de role no select
   */
  onRoleChange(newRole: string): void {
    if (this.usuarioSelecionado) {
      this.usuarioSelecionado.role = newRole;
    }
  }

  /**
   * Salva as permissões alteradas no backend
   */
  salvarPermissoes(): void {
    if (!this.usuarioSelecionado || !this.usuarioSelecionado.id_usuario) {
      return;
    }

    // Converter role de volta para tipo_usuario (letra)
    const tipoMap: { [key: string]: string } = {
      'admin': 'A',
      'gerente': 'G',
      'operador': 'O',
      'cliente': 'C'
    };

    const novoTipo = tipoMap[this.usuarioSelecionado.role || ''] || 'O';

    const dadosAtualizacao: Partial<Usuario> = {
      tipo_usuario: novoTipo,
      ativo: this.usuarioSelecionado.ativo
    };

    this.usuarioService.atualizarUsuario(this.usuarioSelecionado.id_usuario, dadosAtualizacao).subscribe({
      next: () => {
        this.carregarListaUsuarios();
        this.fecharModalEditarPermissoes();
        console.log('Permissões atualizadas:', this.usuarioSelecionado);
      },
      error: (err) => {
        console.error('Erro ao atualizar usuário:', err);
        this.mensagemErro = 'Erro ao salvar alterações';
      }
    });
  }

  /**
   * Atualiza os contadores de usuários por role
   */
  private atualizarContadores(): void {
    this.administradoresCount = this.users.filter(user => user.role === 'admin').length;
    this.gerentesCount = this.users.filter(user => user.role === 'gerente').length;
    this.operadoresCount = this.users.filter(user => user.role === 'operador').length;
    this.clientesCount = this.users.filter(user => user.role === 'cliente').length;

    // Atualizar total
    this.totalUsers = this.users.length;

    // Atualizar os valores nos cards
    this.metricCards[0].value = this.totalUsers;
    this.metricCards[1].value = this.administradoresCount;
    this.metricCards[2].value = this.gerentesCount;
    this.metricCards[3].value = this.operadoresCount;
    this.metricCards[4].value = this.clientesCount;
  }
}