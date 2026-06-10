import { Component } from '@angular/core';

@Component({
  selector: 'app-devops-metrics',
  standalone: true,
  imports: [],
  templateUrl: './devops-metrics.component.html',
  styleUrl: './devops-metrics.component.css',
})
export class DevopsMetricsComponent {
  consoleOpen = false;

  toggleConsole(): void {
    this.consoleOpen = !this.consoleOpen;
  }
}
