import { ChangeDetectorRef, Component, OnInit } from '@angular/core'; // ← Adicionar OnInit
import { Router } from '@angular/router';
import { Produto } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router'; // ← Adicionar RouterLinkActive
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, RouterLink, RouterLinkActive], // ← Adicionar RouterLinkActive
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class UsuariosComponent implements OnInit { // ← Implementar OnInit

  // Adicionar propriedades do usuário que são usadas no template
  usuarioNome: string = '';
  usuarioEmail: string = '';
  usuarioIniciais: string = '';

  menuItems: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeMenu();
    this.carregarDadosUsuario(); // ← Adicionar método para carregar dados do usuário
  }

  private initializeMenu(): void {
    this.menuItems = [
      { name: 'Dashboard' },
      { name: 'Produtos' },
      { name: 'Movimentações' },
      { name: 'Relatórios' },
      { name: 'Previsão IA' },
      { name: 'Planos' },
      { name: 'Configurações' },
      { name: 'Usuários', active: true } // ← Usuários como ativo
    ];
  }

  private carregarDadosUsuario(): void {
    const usuario = this.authService.getUsuarioLogado() as any;
    if (usuario) {
      this.usuarioNome = usuario.nome || '';
      this.usuarioEmail = usuario.email || '';
      this.usuarioIniciais = this.gerarIniciais(this.usuarioNome);
    }
  }

  private gerarIniciais(nome: string): string {
    const palavras = nome.trim().split(' ');
    if (palavras.length >= 2) {
      return (palavras[0][0] + palavras[palavras.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}