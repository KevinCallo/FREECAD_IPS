import { Component, computed, inject, signal } from '@angular/core';
import { SprintService } from '../../services/sprint.service';

@Component({
  selector: 'app-sprint-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './sprint-dashboard.component.html',
  styleUrl: './sprint-dashboard.component.css',
})
export class SprintDashboardComponent {
  private sprintService = inject(SprintService);

  readonly sprints = this.sprintService.sprints;
  readonly metrics = this.sprintService.metrics;
  readonly selectedSprintKey = this.sprintService.selectedSprintKey;

  selectSprint(key: string): void {
    this.sprintService.selectSprint(key);
  }

  sprintProgress(key: string): number {
    return this.sprintService.calcSprintProgress(key);
  }

  /** Genera array de longitud fija para rellenar timeline */
  fillArray(len: number): number[] {
    return new Array(len);
  }

  formatDate(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
