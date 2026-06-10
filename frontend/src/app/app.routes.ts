import { Routes } from '@angular/router';
import { Home } from './home/home';
import { DiagramsPageComponent } from './diagrams-page/diagrams-page.component';
import { DocsPageComponent } from './docs-page/docs-page.component';
export const routes: Routes = [
    {path: 'home', component: Home},
    {path: 'diagrams', component: DiagramsPageComponent},
    {path: 'docs', component: DocsPageComponent},
    {path: '', redirectTo: 'home', pathMatch: 'full'},
];
