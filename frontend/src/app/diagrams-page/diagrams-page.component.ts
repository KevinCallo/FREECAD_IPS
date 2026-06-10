import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { BurndownChartComponent } from '../components/burndown-chart/burndown-chart.component';
import { SprintService } from '../services/sprint.service';
import { Sprint } from '../models';

@Component({
  selector: 'app-diagrams-page',
  standalone: true,
  imports: [HeaderComponent, RouterLink, BurndownChartComponent],
  templateUrl: './diagrams-page.component.html',
  styleUrl: './diagrams-page.component.css',
})
export class DiagramsPageComponent {
  private sprintService = inject(SprintService);

  readonly sprints = this.sprintService.sprints;
  readonly selectedSprintKey = this.sprintService.selectedSprintKey;

  /** Filtro activo: 'all' o un sprint key */
  readonly activeFilter = signal<string>('all');

  onFilterChange(key: string): void {
    this.activeFilter.set(key);
    if (key !== 'all') {
      this.sprintService.selectSprint(key);
    }
  }

  getSprintLabel(key: string): string {
    const sprint = this.sprints().find((s) => s.key === key);
    return sprint?.label ?? key;
  }
}
