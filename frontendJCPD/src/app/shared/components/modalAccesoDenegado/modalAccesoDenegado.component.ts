import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorModalService } from '../../services/error-modal.service';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modalAccesoDenegado',
  templateUrl: './modalAccesoDenegado.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class ModalAccesoDenegadoComponent implements OnInit, OnDestroy {
  isVisible = false;
  title = '';
  message = '';
  errorType: '401' | '403' | null = null;
  private destroy$ = new Subject<void>();
  private errorModalService = inject(ErrorModalService);

  private router = inject(Router);

  ngOnInit() {
    this.errorModalService.authError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(errorData => {
        if (errorData) {
          this.isVisible = true;
          this.title = errorData.title;
          this.message = errorData.message;
          this.errorType = errorData.type;
        } else {
          this.isVisible = false;
          this.title = '';
          this.message = '';
          this.errorType = null;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAccept() {
    this.errorModalService.closeModal();
    this.router.navigate(['/']);
  }

  onBackdropClick(event: Event) {
    // No cerrar el modal al hacer clic en el backdrop
    event.stopPropagation();
  }
}
