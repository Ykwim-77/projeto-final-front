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

@Component({
  selector: 'app-dashboard-usuarios',
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss'],
  imports: [SidebarComponent, FormsModule, CommonModule]
})
export class UsuariosComponent implements OnInit {

  // Dados dos cards de métricas - ATUALIZADO PARA USUÁRIOS
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

  // Valores reais para usuários (poderiam vir de um serviço)
  totalUsers: number = 0;
  administradoresCount: number = 0;
  gerentesCount: number = 0;
  operadoresCount: number = 0;

  // Controle do card de cadastro
  isCardCadastroAberto: boolean = false;

  ngOnInit(): void {
    // Simular carregamento de dados
    this.carregarDadosUsuarios();
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
   * Abre/fecha o card de cadastro de usuários
   */
  abrirCardCadastro(): void {
    this.isCardCadastroAberto = !this.isCardCadastroAberto;
    console.log('Card de cadastro:', this.isCardCadastroAberto ? 'Aberto' : 'Fechado');
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
    
    // Exemplo de implementação com serviço:
    // this.usuarioService.cadastrar(usuarioData).subscribe({
    //   next: (response) => {
    //     console.log('Usuário cadastrado com sucesso:', response);
    //     this.fecharCardCadastro();
    //     this.mostrarMensagemSucesso('Usuário cadastrado com sucesso!');
    //     this.carregarDadosUsuarios(); // Recarregar dados
    //   },
    //   error: (error) => {
    //     console.error('Erro ao cadastrar usuário:', error);
    //     this.mostrarMensagemErro('Erro ao cadastrar usuário');
    //   }
    // });
  }

  /**
   * Atualiza os dados do dashboard
   */
  atualizarDashboard(): void {
    this.carregarDadosUsuarios();
  }

  /**
   * Calcula estatísticas adicionais (exemplo)
   */
  calcularEstatisticas(): void {
    // Exemplo: calcular porcentagens
    const porcentagemAdmins = ((this.administradoresCount / this.totalUsers) * 100).toFixed(1);
    const porcentagemGerentes = ((this.gerentesCount / this.totalUsers) * 100).toFixed(1);
    const porcentagemOperadores = ((this.operadoresCount / this.totalUsers) * 100).toFixed(1);
    
    console.log('Estatísticas:', {
      admins: `${porcentagemAdmins}%`,
      gerentes: `${porcentagemGerentes}%`,
      operadores: `${porcentagemOperadores}%`
    });
  }

  /**
   * Filtra usuários por tipo (exemplo)
   */
  filtrarUsuariosPorTipo(tipo: string): void {
    console.log(`Filtrando usuários do tipo: ${tipo}`);
    
    // Exemplo de implementação:
    // this.usuarioService.filtrarPorTipo(tipo).subscribe(usuarios => {
    //   console.log(`Usuários ${tipo}:`, usuarios);
    // });
  }
}