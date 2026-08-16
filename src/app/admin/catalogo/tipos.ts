export type CarreraLista = {
  id: string;
  nombre: string;
  clave: string;
  cuantas: number;
};

export type MateriaLista = {
  id: string;
  nombre: string;
  carrera_id: string | null;
  semestre: number | null;
  activa: boolean;
};
