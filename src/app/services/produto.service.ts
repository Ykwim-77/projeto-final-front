import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';


export interface Produto {
  sku: any;
  id_patrimonio: number;
  preco_unitario: number | undefined;
  name: string;
  minStock: number;
  estoque: number;
  quantidade: number;
  estoque_maximo: number;
  id_produto: number;
  nome: string;
  descricao?: string;
  categoria: string;
  unidade_medida?: string;
  id_fornecedor: number;
  status?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private apiUrl = `${environment.apiUrl}/produto`;

  constructor(private http: HttpClient) {}

  /**
   * Busca todos os produtos
   */
  listarProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl, { withCredentials: true });
  }

  /**
   * Busca um produto por ID
   */
  buscarProdutoPorId(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  /**
   * Cria um novo produto
   */
  criarProduto(produto: Produto): Observable<any> {
    return this.http.post<any>(this.apiUrl, produto, { withCredentials: true });
  }

  /**
   * Atualiza um produto existente
   */
  atualizarProduto(id: number, produto: Partial<Produto>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, produto, { withCredentials: true });
  }

  /**
   * Deleta um produto
   */
  deletarProduto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  /**
   * Reserva um produto (marca como indisponível)
   */
  reservarProduto(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reservar/${id}`, {}, { withCredentials: true });
  }

  /**
   * Libera um produto reservado (marca como disponível)
   */
  entregarProduto(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/entregar/${id}`, {}, { withCredentials: true });
  }
}