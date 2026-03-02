export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'pmo' | 'project_manager' | 'hr' | 'finance' | 'viewer';
}

export interface Project {
  id: string;
  codigo: string;
  cliente: string;
  unidade: string;
  status: 'ativo' | 'suspenso' | 'encerrado';
  dataInicio: string;
  dataFim?: string;
}

export interface APIResponse<T> {
  data: T;
  status: number;
  message?: string;
}
