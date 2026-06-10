import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-technical-docs',
  standalone: true,
  imports: [],
  templateUrl: './technical-docs.component.html',
  styleUrl: './technical-docs.component.css',
})
export class TechnicalDocsComponent {
  private router = inject(Router);

  goToDocsPage(): void {
    this.router.navigate(['/docs']);
  }
}
