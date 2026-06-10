import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SprintService } from '../../services/sprint.service';
import { Sprint } from '../../models';

@Component({
  selector: 'app-sprint-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sprint-detail.component.html',
  styleUrl: './sprint-detail.component.css',
})
export class SprintDetailComponent {
  private sprintService = inject(SprintService);

  readonly selectedSprint = this.sprintService.selectedSprint;
  readonly selectedSprintKey = this.sprintService.selectedSprintKey;

  sprintDuration(s: Sprint): number {
    const diff = s.end.getTime() - s.start.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }
}
