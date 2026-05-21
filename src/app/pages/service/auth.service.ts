import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return new Observable<any>(observer => {
      setTimeout(() => {
        if (email === 'teste@email.com' && password === '123456') {
          const response = {
            success: true,
            token: 'token_jwt_simulado',
            user: {
              id: 1,
              name: 'Usuário Teste',
              email: email
            },
            mensagem: 'Login realizado com sucesso'
          };
          this.salvarToken(response.token, response.user);
          observer.next(response);
          observer.complete();
        } else {
          observer.error({
            error: {
              mensagem: 'Email ou senha incorretos'
            }
          });
        }
      }, 1500);
    });
  }

  criarUsuario(dadosCadastro: any): Observable<any> {
    return new Observable<any>(observer => {
      setTimeout(() => {
        if (dadosCadastro.email && dadosCadastro.email.includes('existente')) {
          observer.error({
            error: {
              mensagem: 'E-mail já cadastrado'
            }
          });
        } else {
          const response = {
            success: true,
            mensagem: 'Usuário cadastrado com sucesso!',
            user: {
              id: Date.now(),
              name: dadosCadastro.nome,
              email: dadosCadastro.email
            }
          };
          observer.next(response);
          observer.complete();
        }
      }, 1500);
    });
  }

  esqueceuSenha(email: string): Observable<any> {
    return new Observable<any>(observer => {
      setTimeout(() => {
        const response = {
          success: true,
          mensagem: 'E-mail de recuperação enviado com sucesso'
        };
        observer.next(response);
        observer.complete();
      }, 1500);
    });
  }

  validateToken(): Observable<boolean> {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const isValid = !!(token && user);
    return of(isValid).pipe(delay(500));
  }

  verificarCodigo(codigo: string): Observable<any> {
    return new Observable<any>(observer => {
      setTimeout(() => {
        if (codigo === '123456') {
          const response = {
            success: true,
            token: 'token_temporario_' + codigo,
            message: 'Código verificado com sucesso'
          };
          observer.next(response);
          observer.complete();
        } else {
          observer.error({
            error: 'Código inválido',
            message: 'O código digitado não é válido. Use 123456 para teste.'
          });
        }
      }, 1500);
    });
  }

  reenviarCodigo(): Observable<any> {
    return of({ 
      success: true, 
      message: 'Código reenviado com sucesso' 
    }).pipe(delay(1000));
  }

  salvarToken(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUsuarioLogado(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
