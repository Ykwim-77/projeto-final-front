import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/user.model';

interface MetricCard {
  title: string;
  value?: string | number;
  variation?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

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

  metricCards: MetricCard[] = [
    { title: 'Total de Usuários', variation: '+8%', trend: 'positive' },
    { title: 'Administradores', variation: '+2%', trend: 'positive' },
    { title: 'Gerentes', variation: '+5%', trend: 'positive' },
    { title: 'Operadores', variation: '+12%', trend: 'positive' },
    { title: 'Clientes', variation: '+15%', trend: 'positive' }
  ];

  totalUsers: number = 0;
  administradoresCount: number = 0;
  gerentesCount: number = 0;
  operadoresCount: number = 0;
  clientesCount: number = 0;

  users: UserDisplay[] = [];
  usuarios: UserDisplay[] = [];
  clientes: UserDisplay[] = [];

  isCardCadastroAberto: boolean = false;
  novoUsuario: any = {};
  isCarregando: boolean = false;
