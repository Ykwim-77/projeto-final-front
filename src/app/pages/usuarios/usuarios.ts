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

// Interface para usuários
interface User {
  name: string;
  email: string;
  since: string;
  permissions: string;
  role?: string; // 'admin', 'gerente', 'operador', 'cliente'
  department?: string;
}

@Component({
  selector: 'app-dashboard-usuarios',
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss'],
  imports: [SidebarComponent, FormsModule, CommonModule]
})
export class UsuariosComponent implements OnInit {

  // Dados dos cards de métricas
  metricCards: MetricCard[] = [
    {
      title: 'Total de Usuários',
      variation: '+8%',
      trend: 'positive'
    },
    {
      title: 'Administradores', 
      variation: '+2%',
      trend: 'positive'
    },
    {
      title: 'Gerentes',
      variation: '+5%',
      trend: 'positive'
    },
    {
      title: 'Operadores',
      variation: '+12%',
      trend: 'positive'
    }
  ];

  // Valores reais para usuários
  totalUsers: number = 0;
  administradoresCount: number = 0;
  gerentesCount: number = 0;
  operadoresCount: number = 0;

  // Lista de usuários
  users: User[] = [];

  // Controle do card de cadastro
  isCardCadastroAberto: boolean = false;

  // Controle do modal de edição de permissões
  isModalEditarPermissoesAberto: boolean = false;
  usuarioSelecionado: User | null = null;
  
  // Simulação do usuário logado
  userLogado = { role: 'admin' };

  ngOnInit(): void {
    this.carregarDadosUsuarios();
    this.carregarListaUsuarios();
  }

  /**
   * Carrega os dados de usuários do dashboard
   */
  carregarDadosUsuarios(): void {
    // Simular chamada à API
    setTimeout(() => {
      this.totalUsers = 156;
      this.administradoresCount = 8;
      this.gerentesCount = 23;
      this.operadoresCount = 125;
      
      // Atualizar os valores nos cards
      this.metricCards[0].value = this.totalUsers;
      this.metricCards[1].value = this.administradoresCount;
      this.metricCards[2].value = this.gerentesCount;
      this.metricCards[3].value = this.operadoresCount;
    }, 1000);
  }

  /**
   * Carrega a lista de usuários (simulando dados do backend)
   */
  carregarListaUsuarios(): void {
    this.users = [
      {
        name: 'christian da rosa',
        email: 'christian.darosa0106@gmail.com',
        since: 'nov/2025',
        permissions: 'Visualiza e registra movimentações',
        role: 'operador'
      },
      {
        name: 'ramoosdaniely',
        email: 'ramoosdaniely@gmail.com',
        since: 'nov/2025',
        permissions: 'Visualiza e registra movimentações',
        role: 'operador'
      },
      {
        name: 'schimit.gustavo.silva',
        email: 'schimit.gustavo.silva@gmail.com',
        since: 'out/2025',
        permissions: 'Visualiza e registra movimentações',
        role: 'gerente'
      },
      {
        name: 'Rafael Luiz',
        email: 'rafaelpilonetto59@gmail.com',
        since: 'out/2025',
        permissions: 'Administrador',
        role: 'admin',
        department: 'voe'
      }
    ];

    // Atualizar contadores após carregar usuários
    this.atualizarContadores();
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
    
    switch(role) {
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
  cadastrarUsuario(usuarioData: any): void {
    console.log('Dados do usuário para cadastro:', usuarioData);
    
    // Simular adição de usuário
    const novoUsuario: User = {
      name: usuarioData.nome,
      email: usuarioData.email,
      since: new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      permissions: this.getPermissionsDescription(usuarioData.perfil),
      role: usuarioData.perfil,
      department: usuarioData.departamento
    };
    
    this.users.push(novoUsuario);
    this.atualizarContadores();
    this.fecharCardCadastro();
  }

  /**
   * Abre modal para editar permissões
   */
  abrirModalEditarPermissoes(usuario: User): void {
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
   * Salva as permissões alteradas
   */
  salvarPermissoes(): void {
    if (this.usuarioSelecionado) {
      // Encontrar e atualizar o usuário na lista
      const index = this.users.findIndex(u => u.email === this.usuarioSelecionado!.email);
      if (index !== -1) {
        // Atualizar usuário com novas permissões
        this.users[index] = { 
          ...this.usuarioSelecionado,
          permissions: this.getPermissionsDescription(this.usuarioSelecionado.role)
        };
        
        // Atualizar contadores
        this.atualizarContadores();
        
        console.log('Permissões atualizadas:', this.usuarioSelecionado);
      }
      
      this.fecharModalEditarPermissoes();
    }
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