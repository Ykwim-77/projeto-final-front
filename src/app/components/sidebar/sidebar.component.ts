import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  usuarioNome = '';
  usuarioEmail = '';
  usuarioIniciais = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }


  ngOnInit(): void {
    //  const usuario = this.authService.getUsuarioLogado();
    //   this.usuarioNome = usuario?.nome ?? '';
    //   this.usuarioEmail = usuario?.email ?? '';
  
  }

  pegarIniciais(nome: string): string {
    if (!nome) return 'U';
    return nome.split(' ')
      .map(p => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  logout() {
    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/login']);
    }, 1000);
  }
}
