import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-movimentacoes',
  imports: [SidebarComponent],
  templateUrl: './movimentacoes.html',
  styleUrl: './movimentacoes.scss',
})
export class MovimentacoesComponent {
  constructor(
    private router: Router
  ) { }
}
