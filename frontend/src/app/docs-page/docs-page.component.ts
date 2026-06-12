import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { FreecadDocsComponent } from './freecad-docs/freecad-docs.component';
import { ScrumMasterDocsComponent } from './scrum-master-docs/scrum-master-docs.component';
import { ProductOwnerDocsComponent } from './product-owner-docs/product-owner-docs.component';
import { DevopsDocsComponent } from './devops-docs/devops-docs.component';

@Component({
  selector: 'app-docs-page',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterLink,
    FreecadDocsComponent,
    ScrumMasterDocsComponent,
    ProductOwnerDocsComponent,
    DevopsDocsComponent,
  ],
  templateUrl: './docs-page.component.html',
  styleUrl: './docs-page.component.css',
})
export class DocsPageComponent {
  readonly activeFilter = signal<string>('freecad');

  onFilterChange(key: string): void {
    this.activeFilter.set(key);
  }
}
