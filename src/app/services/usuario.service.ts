import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from '../../../node_modules/rxjs/dist/types';
import { environment } from '../environments/environment';
import { tap } from 'rxjs/operators';
import {Usuario} from '../models/user.model'




@Injectable({
  providedIn: 'root'
})


export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuario`;

  usuario: Usuario[] = [] 


  //injeta http client (faz a chamada back)
  constructor(private http: HttpClient) {}

  /**
   * Busca todos os usuários
   */
  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  /**
   * Busca um usuário por ID
   */
  buscarUsuarioPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`).pipe(
      tap((usuario: Usuario) => {
        console.log(usuario);
      })
    );
    
  }


//service por poder usar em varias telas

//








  /**
   * Atualiza dados do usuário
   */
  atualizarUsuario(id: number, dados: Partial<Usuario>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, dados);
  }

  /**
   * Desativa um usuário
   */
  desativarUsuario(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/desativar/${id}`, {});
  }
}

