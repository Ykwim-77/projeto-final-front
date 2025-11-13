import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map, throwError } from 'rxjs';
import { environment } from '../environments/environment';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  id_usuario: number;
  nome: string;
  email: string;
  id_tipo_usuario: number;
  token?: string;
}

export interface Usuario {
  id_usuario: number;
  nome: string;
  email: string;
  id_tipo_usuario: number;
  ativo: boolean;
  CPF?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/usuario`;
  private readonly TOKEN_KEY = 'progest_token';
  private readonly USER_KEY = 'progest_user';

  constructor(private http: HttpClient) {}
  getUsuarioLogado(){
    return JSON.parse(localStorage.getItem(this.USER_KEY)!);
  }
  // ✅ LOGIN
  login(email: string, password: string): Observable<any> {
    console.log(this.apiUrl);
    console.log('📤 Enviando login para:', `${this.apiUrl}/login`);
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      {
        email: email.trim().toLowerCase(),
        senha: password
      },
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        console.log('📥 Resposta completa:', response);
        if (response.usuario) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.usuario));
          console.log('✅ Usuário salvo no localStorage');
        }
        // Não armazenamos o token em localStorage; confiamos no cookie httpOnly enviado pelo backend
      }),
      catchError((error: any) => {
        let mensagem = 'Erro desconhecido';
        if (error?.error && typeof error.error === 'object' && error.error.mensagem) {
          mensagem = error.error.mensagem;
        } else if (error?.error && typeof error.error === 'string') {
          mensagem = error.error;
        } else if (error?.message) {
          mensagem = error.message;
        }
        return throwError(() => ({ mensagem }));
      })
    );
  }

  // ✅ ESQUECEU SENHA
  esqueceuSenha(email: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/esqueceu-senha`,
      { email },
      { withCredentials: true }
    ).pipe(
      tap(() => console.log('📤 Requisição de recuperação de senha enviada')),
      catchError((error: any) => {
        console.error('❌ Erro no esqueceuSenha:', error);
        let mensagem = 'Erro desconhecido';
        if (error?.error && typeof error.error === 'object' && error.error.mensagem) {
          mensagem = error.error.mensagem;
        } else if (error?.error && typeof error.error === 'string') {
          mensagem = error.error;
        } else if (error?.message) {
          mensagem = error.message;
        }
        return throwError(() => ({ mensagem }));
      })
    );
  }

  // ✅ LOGOUT
  logout(): void {
    // Chama o endpoint de logout no backend para limpar o cookie httpOnly
    this.http.post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
        console.log('Logout realizado (cookie e dados locais limpos)');
      },
      error: (err) => {
        // Mesmo se a requisição falhar, limpamos dados locais para evitar estado inconsistente
        console.error('Erro ao chamar logout no servidor:', err);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
      }
    });
  }

  // ✅ AUTENTICAÇÃO
  isAuthenticated(): boolean {
    // Retorna true se houver um usuário salvo localmente.
    return !!this.getUsuarioLogado();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ✅ VALIDA TOKEN
  validateToken(): Observable<boolean> {
    // Chamar endpoint protegido `/usuario/logado` que retorna os dados do usuário se o cookie for válido
    return this.http.get<any>(`${this.apiUrl}/logado`, { withCredentials: true }).pipe(
      tap((response) => {
        if (response) {
          // Atualiza dados do usuário localmente
          localStorage.setItem(this.USER_KEY, JSON.stringify(response));
          console.log('✅ Token válido - usuário autenticado');
        }
      }),
      map(() => true),
      catchError((error) => {
        if (error.status === 401) {
          console.log('❌ Token inválido ou expirado');
          localStorage.removeItem(this.USER_KEY);
          return of(false);
        }
        console.error('Erro ao validar token:', error);
        return of(false);
      })
    );
  }
}
