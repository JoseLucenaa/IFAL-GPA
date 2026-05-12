export type UserRole =
  | 'Estudante'
  | 'Professor orientador'
  | 'Coordenador'
  | 'Avaliador'
  | 'Administrador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  course?: string;
  registration?: string;
  createdAt: string;
}

