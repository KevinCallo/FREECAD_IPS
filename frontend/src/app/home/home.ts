import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { ProjectIntroComponent } from '../components/project-intro/project-intro.component';
import { SprintDashboardComponent } from '../components/sprint-dashboard/sprint-dashboard.component';
import { KanbanBoardComponent } from '../components/kanban-board/kanban-board.component';
import { SprintDetailComponent } from '../components/sprint-detail/sprint-detail.component';
import { BurndownChartComponent } from '../components/burndown-chart/burndown-chart.component';
import { TeamRolesComponent } from '../components/team-roles/team-roles.component';
import { DiagramsComponent } from '../components/diagrams/diagrams.component';
import { DevopsMetricsComponent } from '../components/devops-metrics/devops-metrics.component';
import { TechnicalDocsComponent } from '../components/technical-docs/technical-docs.component';
import { EvidenciasComponent } from '../components/evidencias/evidencias.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    ProjectIntroComponent,
    SprintDashboardComponent,
    KanbanBoardComponent,
    SprintDetailComponent,
    BurndownChartComponent,
    TeamRolesComponent,
    DiagramsComponent,
    DevopsMetricsComponent,
    TechnicalDocsComponent,
    EvidenciasComponent,
    FooterComponent,
  ],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
