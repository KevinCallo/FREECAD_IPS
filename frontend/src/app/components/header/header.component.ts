import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SprintService } from '../../services/sprint.service';
import { Sprint } from '../../models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private sprintService = inject(SprintService);
  private router = inject(Router);

  /** Página actual: 'home' (default), 'diagrams' o 'docs' */
  @Input() page: 'home' | 'diagrams' | 'docs' = 'home';

  /** Filtro activo de diagramas (solo relevante en page='diagrams') */
  @Input() diagramFilter: string = 'all';

  /** Emitido cuando se selecciona un filtro de diagrama */
  @Output() diagramFilterChange = new EventEmitter<string>();

  readonly sprints = this.sprintService.sprints;
  readonly selectedSprintKey = this.sprintService.selectedSprintKey;
  readonly selectedSprint = this.sprintService.selectedSprint;
  readonly activeSprint = this.sprintService.activeSprint;

  sprintMenuOpen = false;
  diagramFilterOpen = false;

  selectSprint(key: string): void {
    this.sprintService.selectSprint(key);
  }

  toggleSprintMenu(): void {
    this.sprintMenuOpen = !this.sprintMenuOpen;
  }

  closeSprintMenu(): void {
    this.sprintMenuOpen = false;
  }

  toggleDiagramFilter(): void {
    this.diagramFilterOpen = !this.diagramFilterOpen;
  }

  closeDiagramFilter(): void {
    this.diagramFilterOpen = false;
  }

  setDiagramFilter(key: string): void {
    this.diagramFilterChange.emit(key);
  }

  getFilterSprint(): Sprint | undefined {
    return this.sprints().find((s) => s.key === this.diagramFilter);
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    this.sprintMenuOpen = false;
  }

  goToDiagrams(): void {
    this.router.navigate(['/diagrams']);
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
