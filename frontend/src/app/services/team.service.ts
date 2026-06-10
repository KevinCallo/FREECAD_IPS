import { Injectable, signal } from '@angular/core';
import { TeamMember, RoleAssignments, SprintRoleAssignments, ROLES } from '../models';

const STORAGE_KEY = 'fc_roles_assignments';

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: 'member1', name: 'Kevin Callo', initials: 'KC', color: '#3498db' },
  { id: 'member2', name: 'Mathias Davila', initials: 'MD', color: '#e67e22' },
  { id: 'member3', name: 'Paulo Quenta', initials: 'PQ', color: '#2ecc71' },
  { id: 'member4', name: 'Dario Cornejo', initials: 'DC', color: '#9b59b6' },
  { id: 'member5', name: 'Andhy Chipana', initials: 'AC', color: '#e74c3c' },
];

const DEFAULT_ASSIGNMENTS: RoleAssignments = {
  sprint0: {
    label: 'Sprint 0',
    sm: ['Kevin Callo'],
    po: ['Andhy Chipana'],
    dev: ['Mathias Davila', 'Paulo Quenta', 'Dario Cornejo'],
    pool: [],
  },
  sprint1: {
    label: 'Sprint 1',
    sm: ['Dario Cornejo'],
    po: ['Kevin Callo'],
    dev: ['Mathias Davila', 'Paulo Quenta', 'Andhy Chipana'],
    pool: [],
  },
  sprint2: {
    label: 'Sprint 2',
    sm: ['Kevin Callo'],
    po: ['Andhy Chipana'],
    dev: ['Mathias Davila', 'Paulo Quenta', 'Dario Cornejo'],
    pool: [],
  },
  sprint3: {
    label: 'Sprint 3',
    sm: ['Kevin Callo'],
    po: ['Andhy Chipana'],
    dev: ['Mathias Davila', 'Paulo Quenta', 'Dario Cornejo'],
    pool: [],
  },
};

@Injectable({ providedIn: 'root' })
export class TeamService {
  readonly members = signal<TeamMember[]>(DEFAULT_MEMBERS);
  readonly roles = ROLES;

  private assignments = signal<RoleAssignments>(this.loadAssignments());

  readonly assignments$ = this.assignments.asReadonly();

  getSprintAssignment(sprintKey: string): SprintRoleAssignments | null {
    return this.assignments()[sprintKey] ?? null;
  }

  setSprintAssignment(sprintKey: string, assignment: SprintRoleAssignments): void {
    const current = { ...this.assignments() };
    current[sprintKey] = assignment;
    this.assignments.set(current);
    this.saveAssignments();
  }

  /** Mueve un miembro de un rol a otro (o al pool) dentro de un sprint */
  moveMember(sprintKey: string, memberName: string, fromRole: string, toRole: string): void {
    const sprint = this.assignments()[sprintKey];
    if (!sprint) return;

    const current = { ...this.assignments() };
    const s = { ...current[sprintKey] } as SprintRoleAssignments;

    // Sacar del origen
    const fromList = [...(s[fromRole as keyof SprintRoleAssignments] as string[])];
    const idx = fromList.indexOf(memberName);
    if (idx === -1) return;
    fromList.splice(idx, 1);
    (s[fromRole as keyof SprintRoleAssignments] as string[]) = fromList;

    // Meter en destino
    const toList = [...(s[toRole as keyof SprintRoleAssignments] as string[])];
    if (!toList.includes(memberName)) {
      toList.push(memberName);
    }
    (s[toRole as keyof SprintRoleAssignments] as string[]) = toList;

    current[sprintKey] = s;
    this.assignments.set(current);
    this.saveAssignments();
  }

  getMemberColor(name: string): string {
    const member = this.members().find((m) => m.name === name);
    return member ? member.color : '#95a5a6';
  }

  getMemberInitials(name: string): string {
    const member = this.members().find((m) => m.name === name);
    return member ? member.initials : name.substring(0, 2).toUpperCase();
  }

  resetAssignments(): void {
    this.assignments.set(JSON.parse(JSON.stringify(DEFAULT_ASSIGNMENTS)));
    this.saveAssignments();
  }

  private loadAssignments(): RoleAssignments {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Asegurar que todos los sprints tengan pool
        ['sprint0', 'sprint1', 'sprint2', 'sprint3'].forEach((sk) => {
          if (parsed[sk] && !parsed[sk].pool) parsed[sk].pool = [];
        });
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return JSON.parse(JSON.stringify(DEFAULT_ASSIGNMENTS));
  }

  private saveAssignments(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.assignments()));
    } catch {
      /* ignore */
    }
  }
}
