import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { tap } from 'rxjs/operators';
import { Usuario } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuario`;

  usuario: Usuario[] = [];

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, { withCredentials: true });
  }

  buscarUsuarioPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, { withCredentials: true }).pipe(
      tap((usuario: Usuario) => {
        console.log(usuario);
      })
    );
  }

  atualizarUsuario(id: number, dados: Partial<Usuario>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, dados, { withCredentials: true });
  }

  desativarUsuario(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/desativar/${id}`, {}, { withCredentials: true });
  }

  criarUsuario(dados: Partial<Usuario>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, dados, { withCredentials: true });
  }

  deletarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
