import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { CommonModule } from '@angular/common';
import { PrevisaoService, PrevisaoItem } from '../../services/previsao.service';

@Component({
  selector: 'app-previsao-ia',
  imports: [SidebarComponent, CommonModule],
  templateUrl: './previsao-ia.html',
  styleUrls: ['./previsao-ia.scss'],
})
export class PrevisaoIa implements OnInit {
  previsoes: PrevisaoItem[] = [];
  carregando = false;

  constructor(private previsaoService: PrevisaoService) {}

  ngOnInit(): void {
    this.carregarPrevisoes();
  }

  carregarPrevisoes(): void {
    this.carregando = true;
    this.previsaoService.listarPrevisoes().subscribe({
      next: (resp) => {
        this.previsoes = resp;
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar previsões', err);
        this.previsoes = [];
        this.carregando = false;
      }
    });
  }
}
