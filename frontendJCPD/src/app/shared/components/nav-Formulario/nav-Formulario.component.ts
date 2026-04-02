import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface TabConfig {
  id: number;
  label: string;
  hasError?: boolean;
  errorCondition?: boolean;
}

export interface ActionConfig {
  id: string;
  type?: 'button' | 'submit';
  icon: string;
  tooltip: string;
  hoverClass?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-nav-formulario',
  templateUrl: './nav-Formulario.component.html',
  standalone: true,
  imports: [CommonModule,],
})
export class NavFormularioComponent implements OnInit {
  @Input() tabs: TabConfig[] = [];
  @Input() actions: ActionConfig[] = [];
  @Input() currentTab: number = 0;

  @Output() tabChanged = new EventEmitter<number>();
  @Output() actionClicked = new EventEmitter<string>();

 constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
  }

  onTabChange(tabId: number) {
    this.tabChanged.emit(tabId);
  }

  onActionClick(actionId: string) {
    this.actionClicked.emit(actionId);
  }
   getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
