import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-diagrams',
  standalone: true,
  imports: [],
  templateUrl: './diagrams.component.html',
  styleUrl: './diagrams.component.css',
})
export class DiagramsComponent {
  private router = inject(Router);

  goToDiagramsPage(): void {
    this.router.navigate(['/diagrams']);
  }
}
