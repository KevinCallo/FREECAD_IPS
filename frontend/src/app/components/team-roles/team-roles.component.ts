import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../services/team.service';
import { SprintService } from '../../services/sprint.service';
import { SprintRoleAssignments } from '../../models';

interface DiagramMember {
  initials: string;
  name: string;
  color: string;
}

interface LegendItem {
  icon: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-team-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-roles.component.html',
  styleUrl: './team-roles.component.css',
})
export class TeamRolesComponent {
  private teamService = inject(TeamService);
  private sprintService = inject(SprintService);

  readonly members = this.teamService.members;
  readonly roles = this.teamService.roles;
  readonly selectedSprintKey = this.sprintService.selectedSprintKey;

  // ── Diagrama: miembros asignados a cada rol ──
  readonly currentSprintLabel = computed(() => {
    const key = this.selectedSprintKey();
    const sprint = this.sprintService.sprints().find((s) => s.key === key);
    return sprint?.label ?? key;
  });

  readonly currentAssignments = computed<SprintRoleAssignments | null>(() => {
    return this.teamService.getSprintAssignment(this.selectedSprintKey());
  });

  readonly scrumMaster = computed<DiagramMember | null>(() => {
    const a = this.currentAssignments();
    const list = a?.sm ?? [];
    if (list.length === 0) return null;
    const name = list[0];
    return {
      name,
      initials: this.teamService.getMemberInitials(name),
      color: this.teamService.getMemberColor(name),
    };
  });

  readonly productOwner = computed<DiagramMember | null>(() => {
    const a = this.currentAssignments();
    const list = a?.po ?? [];
    if (list.length === 0) return null;
    const name = list[0];
    return {
      name,
      initials: this.teamService.getMemberInitials(name),
      color: this.teamService.getMemberColor(name),
    };
  });

  readonly developers = computed<DiagramMember[]>(() => {
    const a = this.currentAssignments();
    const list = a?.dev ?? [];
    return list.map((name) => ({
      name,
      initials: this.teamService.getMemberInitials(name),
      color: this.teamService.getMemberColor(name),
    }));
  });

  readonly poolMembers = computed(() => {
    const a = this.currentAssignments();
    return a?.pool ?? [];
  });

  // ── Leyenda ──
  readonly legendItems: LegendItem[] = [
    { icon: 'fa-helmet-safety', label: 'Scrum Master', color: '#e67e22' },
    { icon: 'fa-clipboard-list', label: 'Product Owner', color: '#8e44ad' },
    { icon: 'fa-code', label: 'Developer', color: '#27ae60' },
    { icon: 'fa-user', label: 'Sin asignar', color: '#94a3b8' },
  ];

  // ── Drag & Drop ──
  dragMember: string | null = null;
  dragOverRole: string | null = null;

  getRoleMembers(roleId: string): string[] {
    const a = this.currentAssignments();
    if (!a) return [];
    return (a[roleId as keyof SprintRoleAssignments] as string[]) ?? [];
  }

  onDragStart(memberName: string): void {
    this.dragMember = memberName;
  }

  onDragOver(e: DragEvent): void {
    if (!this.dragMember) return;
    e.preventDefault();
  }

  onDrop(roleId: string, e: DragEvent): void {
    e.preventDefault();
    if (!this.dragMember) return;
    const a = this.currentAssignments();
    if (!a) return;
    const allRoles = ['sm', 'po', 'dev', 'pool'];
    for (const r of allRoles) {
      const members = a[r as keyof SprintRoleAssignments] as string[];
      if (members.includes(this.dragMember)) {
        this.teamService.moveMember(this.selectedSprintKey(), this.dragMember, r, roleId);
        break;
      }
    }
    this.dragMember = null;
    this.dragOverRole = null;
  }

  onDragEnd(): void {
    this.dragMember = null;
    this.dragOverRole = null;
  }

  getMemberColor(name: string): string {
    return this.teamService.getMemberColor(name);
  }

  getMemberInitials(name: string): string {
    return this.teamService.getMemberInitials(name);
  }

  resetAssignments(): void {
    if (window.confirm('¿Resetear asignaciones de roles a valores por defecto?')) {
      this.teamService.resetAssignments();
    }
  }
}
