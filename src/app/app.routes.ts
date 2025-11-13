import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { EsqueceuSenhaComponent } from './pages/esqueceu-senha/esqueceu-senha';
import { CodigoVerificacao } from './pages/codigo-verificacao/codigo-verificacao';
import { RedefinirSenha } from './pages/redefinir-senha/redefinir-senha';
import { HomeComponent } from './pages/home/home';
import { ProdutosComponent } from './pages/produtos/produtos';
import { UsuariosComponent } from './pages/usuarios/usuarios';
// import { CadastroComponent } from './pages/cadastro/cadastro'; // ← Mantenha comentado se não existe
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'esqueceu-senha', component: EsqueceuSenhaComponent },
  { path: 'codigo-verificacao', component: CodigoVerificacao },
  { path: 'redefinir-senha', component: RedefinirSenha },
  // { path: 'cadastro', component: CadastroComponent }, // ← Mantenha comentado se não existe
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'produtos', component: ProdutosComponent, canActivate: [AuthGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];