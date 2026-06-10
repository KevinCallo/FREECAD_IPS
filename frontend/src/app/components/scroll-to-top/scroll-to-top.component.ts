import { Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [],
  templateUrl: './scroll-to-top.component.html',
  styleUrl: './scroll-to-top.component.css',
})
export class ScrollToTopComponent {
  /** Indica si el scroll ha superado el umbral de 300px */
  readonly visible = signal(false);

  /** Umbral en píxeles para mostrar el botón */
  private readonly threshold = 300;

  @HostListener('window:scroll')
  onScroll(): void {
    this.visible.set(window.scrollY > this.threshold);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
