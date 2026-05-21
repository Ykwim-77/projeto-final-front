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

  logout(): void {
    this.http.post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
        console.log('Logout realizado (cookie e dados locais limpos)');
      },
      error: (err) => {
        console.error('Erro ao chamar logout no servidor:', err);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
      }
    });
  }

  isAuthenticated(): boolean {
    return !!this.getUsuarioLogado();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  validateToken(): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/logado`, { withCredentials: true }).pipe(
      tap((response) => {
        if (response) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(response));
          console.log('✅ Token válido - usuário autenticado');
        }
      }),
      map(() => true
