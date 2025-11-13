import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Emprestimo {
  id_movimentacao?: number;
  id_patrimonio: number;
  id_usuario: number;
  tipo_movimentacao: string;
  origem?: string;
  data_movimento: string;
  status?: string;
  observacao?: string;
  produto?: string;
  usuario?: string;
  dataEmprestimo?: string;
  dataDevolucao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmprestimoService {
  private apiUrl = `${environment.apiUrl}/movimentacao`;

  constructor(private http: HttpClient) {}

  /**
   * Lista todos os empréstimos (movimentações)
   */
  listarEmprestimos(): Observable<Emprestimo[]> {
    return this.http.get<Emprestimo[]>(this.apiUrl, { withCredentials: true });
  }

  /**
   * Busca um empréstimo por ID
   */
  buscarEmprestimoPorId(id: number): Observable<Emprestimo> {
    return this.http.get<Emprestimo>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  /**
   * Cria um novo empréstimo (movimentação)
   */
  criarEmprestimo(dados: Partial<Emprestimo>): Observable<any> {
    return this.http.post<any>(this.apiUrl, dados, { withCredentials: true });
  }

  /**
   * Atualiza um empréstimo
   */
  atualizarEmprestimo(id: number, dados: Partial<Emprestimo>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, dados, { withCredentials: true });
  }

  /**
   * Deleta um empréstimo
   */
  deletarEmprestimo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  /**
   * Marca empréstimo como devolvido
   */
  marcarComoDevolvido(id: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      { status: 'devolvido' },
      { withCredentials: true }
    );
  }

  /**
   * Renova um empréstimo
   */
  renovarEmprestimo(id: number, novaDataDevolucao: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      { data_movimento: novaDataDevolucao },
      { withCredentials: true }
    );
  }
}
