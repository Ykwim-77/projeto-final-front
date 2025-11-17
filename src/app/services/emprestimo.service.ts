import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Emprestimo {
  id_emprestimo?: number;
  data_pedido: string;
  data_recebimento?: string | null;
  data_entrega?: string;
  data_devolucao?: string;
  valor_total: number;
  status: string;
  observacoes?: string | null;
  id_usuario?: number;
  id_patrimonio?: number;
  quantidade?: number;
  usuario?: any;
  patrimonio?: any;

  // compatibility fields (optional)
  produto?: string;
  dataEmprestimo?: string;
  dataDevolucao?: string | null;

  // UI/backwards-compatibility aliases
  id_movimentacao?: number;
  tipo_movimentacao?: string;
  origem?: string;
  data_movimento?: string;
  observacao?: string | null;
  usuarioNome?: string;
  departamento?: string;
  contato?: string;
  // Removed duplicate declaration of id_patrimonio
}

@Injectable({
  providedIn: 'root'
})
export class EmprestimoService {
  private apiUrl = `${environment.apiUrl}/emprestimo`;

  constructor(private http: HttpClient) {}

  listarEmprestimos(): Observable<Emprestimo[]> {
    return this.http.get<Emprestimo[]>(this.apiUrl);
  }

  criarEmprestimo(emprestimo: any): Observable<Emprestimo> {
    return this.http.post<Emprestimo>(this.apiUrl, emprestimo);
  }

  devolverEmprestimo(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/devolver`, {});
  }
}
