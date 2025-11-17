import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmprestimoService, Emprestimo } from '../../services/emprestimo.service';
import { AuthService } from '../../services/auth.service';
import { ProdutoService, Produto } from '../../services/produto.service';


@Component({
  selector: 'app-emprestimos',
  templateUrl: './emprestimos.html',
  styleUrls: ['./emprestimos.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EmprestimosComponent implements OnInit {
  emprestimos: Emprestimo[] = [];
  produtos: Produto[] = [];

  carregando = false;
  mensagemErro = '';

  // Modal para novo empréstimo
  isModalNovoEmprestimoAberto = false;
  novoEmprestimo: any = {};

  // Usuário logado
  userLogado: any = null;

  constructor(
    private emprestimoService: EmprestimoService,
    private authService: AuthService,
    private produtoService: ProdutoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userLogado = this.authService.getUsuarioLogado();
    this.carregarEmprestimos();
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.produtoService.listarProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos || [];
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.mensagemErro = 'Erro ao carregar produtos';
      }
    });
  }

  carregarEmprestimos(): void {
    this.carregando = true;
    this.emprestimoService.listarEmprestimos().subscribe({
      next: (emprestimos) => {
        this.emprestimos = emprestimos || [];
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar empréstimos:', err);
        this.mensagemErro = 'Erro ao carregar empréstimos';
        this.carregando = false;
      }
    });
  }

  abrirModalNovoEmprestimo(): void {
    this.novoEmprestimo = {
      data_pedido: new Date().toISOString(),
      valor_total: 0,
      status: 'ativo',
      observacoes: '',
      id_usuario: this.userLogado?.id_usuario || undefined,
      quantidade: 1,
      data_entrega: new Date().toISOString().split('T')[0],
      data_devolucao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    this.isModalNovoEmprestimoAberto = true;
  }

  fecharModalNovoEmprestimo(): void {
    this.isModalNovoEmprestimoAberto = false;
    this.novoEmprestimo = {};
  }

  criarEmprestimo(): void {
    if (!this.novoEmprestimo.id_patrimonio) {
      this.mensagemErro = 'Selecione um patrimônio';
      return;
    }

    this.emprestimoService.criarEmprestimo(this.novoEmprestimo).subscribe({
      next: () => {
        this.fecharModalNovoEmprestimo();
        this.carregarEmprestimos();
      },
      error: (err) => {
        console.error('Erro ao criar empréstimo:', err);
        this.mensagemErro = 'Erro ao criar empréstimo';
      }
    });
  }

  devolverEmprestimo(id: number): void {
    if (confirm('Confirmar devolução do empréstimo?')) {
      this.emprestimoService.devolverEmprestimo(id).subscribe({
        next: () => {
          this.carregarEmprestimos();
        },
        error: (err) => {
          console.error('Erro ao devolver empréstimo:', err);
          this.mensagemErro = 'Erro ao devolver empréstimo';
        }
      });
    }
  }

  navegarParaNovoEmprestimo(): void {
    this.router.navigate(['/novo-emprestimo']);
  }


}
