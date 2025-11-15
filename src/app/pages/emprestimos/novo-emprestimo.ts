import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ProdutoService, Produto } from '../../services/produto.service';
import { Usuario } from '../../models/user.model';
import { UsuarioService } from '../../services/usuario.service';
import { EmprestimoService } from '../../services/emprestimo.service';

@Component({
  selector: 'app-novo-emprestimo',
  templateUrl: './novo-emprestimo.html',
  styleUrls: ['./novo-emprestimo.scss'],
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule]
})
export class NovoEmprestimoComponent implements OnInit {
  produtos: Produto[] = [];
  usuarios: Usuario[] = [];
  selecionadoProduto: Produto | null = null;
  carregando = false;
  mensagemErro = '';

  novoEmprestimo: any = {
    id_usuario: undefined,
    id_patrimonio: undefined,
    quantidade: 1,
    status: 'ativo',
    observacoes: ''
  };

  constructor(
    private produtoService: ProdutoService,
    private usuarioService: UsuarioService,
    private emprestimoService: EmprestimoService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarUsuarios();
  }

  carregarProdutos(): void {
    this.produtoService.listarProdutos().subscribe({
      next: (p) => this.produtos = p || [],
      error: (err) => console.error('Erro ao carregar produtos:', err)
    });
  }

  carregarUsuarios(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (u) => this.usuarios = u || [],
      error: (err) => console.error('Erro ao carregar usuários:', err)
    });
  }

  onProdutoChange(): void {
    const id = this.novoEmprestimo.id_patrimonio;
    this.selecionadoProduto = this.produtos.find(p => p.id_patrimonio === id) || null;
  }

  submit(): void {
    this.mensagemErro = '';
    if (!this.novoEmprestimo.id_usuario || !this.novoEmprestimo.id_patrimonio) {
      this.mensagemErro = 'Selecione usuário e produto.';
      return;
    }
    this.carregando = true;
    const payload = {
      id_usuario: this.novoEmprestimo.id_usuario,
      id_patrimonio: this.novoEmprestimo.id_patrimonio,
      quantidade: this.novoEmprestimo.quantidade || 1,
      status: this.novoEmprestimo.status,
      observacoes: this.novoEmprestimo.observacoes
    };

    this.emprestimoService.criarEmprestimo(payload).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/emprestimos']);
      },
      error: (err) => {
        console.error('Erro ao criar empréstimo:', err);
        this.mensagemErro = err?.error?.mensagem || err?.message || 'Erro ao criar empréstimo';
        this.carregando = false;
      }
    });
  }
}
