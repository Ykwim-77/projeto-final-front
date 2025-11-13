import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Movimentacao {
  id_movimentacao?: number;
  id_patrimonio: number;
  id_usuario: number;
  tipo_movimentacao: string;
  origem?: string;
  data_movimento: string;
  status?: string;
  observacao?: string | null;
  patrimonio?: any;
  usuario?: any;
}

@Injectable({
  providedIn: 'root'
})
export class MovimentacaoService {
  private apiUrl = `${environment.apiUrl}/movimentacao`;

  constructor(private http: HttpClient) {}

  /**
   * Lista todas as movimentações (filtro por tipo)
   */
  listarMovimentacoes(tipo?: string): Observable<Movimentacao[]> {
    let url = this.apiUrl;
    if (tipo) {
      url += `?tipo_movimentacao=${tipo}`;
    }
    return this.http.get<Movimentacao[]>(url, { withCredentials: true });
  }

  /**
   * Busca uma movimentação por ID
   */
  buscarMovimentacao(id: number): Observable<Movimentacao> {
    return this.http.get<Movimentacao>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  /**
   * Cria uma nova movimentação
   */
  criarMovimentacao(dados: Partial<Movimentacao>): Observable<any> {
    return this.http.post<any>(this.apiUrl, dados, { withCredentials: true });
  }

  /**
   * Atualiza uma movimentação
   */
  atualizarMovimentacao(id: number, dados: Partial<Movimentacao>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, dados, { withCredentials: true });
  }

  /**
   * Deleta uma movimentação
   */
  deletarMovimentacao(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
