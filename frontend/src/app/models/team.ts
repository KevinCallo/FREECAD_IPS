export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface RoleConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const ROLES: RoleConfig[] = [
  {
    id: 'sm',
    label: 'Scrum Master',
    icon: 'fa-helmet-safety',
    color: '#e67e22',
    description: 'Facilita el proceso Scrum, elimina impedimentos y asegura que el equipo siga las prácticas ágiles.',
  },
  {
    id: 'po',
    label: 'Product Owner',
    icon: 'fa-clipboard-list',
    color: '#8e44ad',
    description: 'Define y prioriza el backlog del producto, maximiza el valor del trabajo del equipo.',
  },
  {
    id: 'dev',
    label: 'Developer',
    icon: 'fa-code',
    color: '#27ae60',
    description: 'Desarrolla, prueba y entrega incrementos de producto con calidad.',
  },
];

export interface SprintRoleAssignments {
  label: string;
  sm: string[];
  po: string[];
  dev: string[];
  pool: string[];
}

export type RoleAssignments = Record<string, SprintRoleAssignments>;
