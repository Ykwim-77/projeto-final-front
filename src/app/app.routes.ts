import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { EsqueceuSenhaComponent } from './pages/esqueceu-senha/esqueceu-senha';
import { CodigoVerificacao } from './pages/codigo-verificacao/codigo-verificacao';
import { RedefinirSenha } from './pages/redefinir-senha/redefinir-senha';
import { HomeComponent } from './pages/home/home';
import { ProdutosComponent } from './pages/produtos/produtos';
import { MovimentacoesComponent } from './pages/movimentacoes/movimentacoes';
//import { CadastroComponent } from './pages/cadastro/cadastro'; // ← CORRIGIDO!
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'esqueceu-senha', component: EsqueceuSenhaComponent },
  { path: 'codigo-verificacao', component: CodigoVerificacao},
  { path: 'redefinir-senha', component: RedefinirSenha },
 // { path: 'cadastro', component: CadastroComponent }, // ← AGORA VAI FUNCIONAR!
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'produtos', component: ProdutosComponent, canActivate: [AuthGuard] },
  { path: 'movimentacoes', component: MovimentacoesComponent},
  { path: '**', redirectTo: '/login' }
];