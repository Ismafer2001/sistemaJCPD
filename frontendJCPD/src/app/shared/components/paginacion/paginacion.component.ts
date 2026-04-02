import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginacion.component.html',
})
export class PaginacionComponent {
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();
  @Input() maxButtons: number = 7; // maximum number of numeric buttons to show

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  // Build an array of pages to display, using '...' for gaps
  get pages(): Array<number | string> {
    const total = this.totalPages;
    const current = this.currentPage;
    const max = Math.max(5, this.maxButtons); // ensure at least 5

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: Array<number | string> = [];
    const side = Math.floor((max - 3) / 2); // pages to show on each side of current
    let start = Math.max(2, current - side);
    let end = Math.min(total - 1, current + side);

    // Adjust if we are near the edges
    if (current - 1 <= side) {
      start = 2;
      end = max - 2;
    }
    if (total - current <= side) {
      start = total - (max - 3);
      end = total - 1;
    }

    pages.push(1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('...');
    pages.push(total);

    return pages;
  }

  goTo(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    if (page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  next() {
    this.goTo(this.currentPage + 1);
  }

  prev() {
    this.goTo(this.currentPage - 1);
  }
}

export default PaginacionComponent;
