export interface Usuario {
    id_usuario?: number;
    nome: string;
    email: string;
    senha?: string;
    senha_hash?: string;
    tipo_usuario?: string;
    id_tipo_usuario?: number;
    ativo?: boolean;
    cpf?: string;
  }