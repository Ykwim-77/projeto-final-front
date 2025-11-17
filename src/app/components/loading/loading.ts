import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.html',
  styleUrls: ['./loading.scss']
})
export class LoadingComponent {
  @Input() isLoading: boolean = false;
  @Input() message: string = 'Carregando...';
  @Input() type: 'spinner' | 'progress' | 'dots' = 'progress';
  @Input() logoPath: string = 'assets/imagens/logoprogestao.png';
  @Input() logoAlt: string = 'Logo ProGest';
  @Input() showLogo: boolean = true;
}