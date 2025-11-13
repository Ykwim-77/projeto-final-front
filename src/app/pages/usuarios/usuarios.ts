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
    { title: 'Operadores', variation: '+12%', trend: 'positive' }
  ];

  // Valores reais para usuários
  totalUsers: number = 0;
  administradoresCount: number = 0;
  gerentesCount: number = 0;
  operadoresCount: number = 0;

  // Lista de usuários
  users: UserDisplay[] = [];

  // Controle do card de cadastro
  isCardCadastroAberto: boolean = false;
  isCarregando: boolean = false;
  mensagemErro: string = '';

  // Controle do modal de edição de permissões
  isModalEditarPermissoesAberto: boolean = false;
  usuarioSelecionado: UserDisplay | null = null;
  
  // Usuário logado
  userLogado: any = null;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) {}

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
        this.users = usuarios.map((u) => ({
          id_usuario: u.id_usuario,
          name: u.nome,
          email: u.email,
          since: 'nov/2025',
          permissions: this.getPermissionsDescription(u.tipo_usuario),
          role: this.normalizarRole(u.tipo_usuario),
          ativo: u.ativo
        }));
        this.atualizarContadores();
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
    
    switch(role) {
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
    switch(roleNormalizado) {
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
      tipo_usuario: usuarioData.perfil || 'O', // Padrão operador
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
    // Criar uma cópia do usuário para edição
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
   * Deleta um usuário
   */
  deletarUsuario(usuario: UserDisplay): void {
    if (!usuario.id_usuario) return;
    
    if (!confirm(`Tem certeza que deseja deletar o usuário ${usuario.name}?`)) {
      return;
    }

    this.usuarioService.deletarUsuario(usuario.id_usuario).subscribe({
      next: () => {
        this.carregarListaUsuarios();
        console.log('Usuário deletado');
      },
      error: (err) => {
        console.error('Erro ao deletar usuário:', err);
        this.mensagemErro = 'Erro ao deletar usuário';
      }
    });
  }

  /**
   * Desativa um usuário
   */
  desativarUsuario(usuario: UserDisplay): void {
    if (!usuario.id_usuario) return;
    
    this.usuarioService.desativarUsuario(usuario.id_usuario).subscribe({
      next: () => {
        this.carregarListaUsuarios();
        console.log('Usuário desativado');
      },
      error: (err) => {
        console.error('Erro ao desativar usuário:', err);
        this.mensagemErro = 'Erro ao desativar usuário';
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
    
    // Atualizar total
    this.totalUsers = this.users.length;

    // Atualizar os valores nos cards
    this.metricCards[0].value = this.totalUsers;
    this.metricCards[1].value = this.administradoresCount;
    this.metricCards[2].value = this.gerentesCount;
    this.metricCards[3].value = this.operadoresCount;
  }
}

