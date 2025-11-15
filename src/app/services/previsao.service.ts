import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface PrevisaoItem {
  id_patrimonio: number;
  nome: string;
  estoque: number;
  min_estoque: number;
  sugestao: string;
  urgencia: 'alta' | 'média' | 'baixa';
}

@Injectable({
  providedIn: 'root'
})
export class PrevisaoService {
  private api = `${environment.apiUrl}/previsao`;

  constructor(private http: HttpClient) {}

  listarPrevisoes(): Observable<PrevisaoItem[]> {
    return this.http.get<PrevisaoItem[]>(this.api, { withCredentials: true });
  }
}
