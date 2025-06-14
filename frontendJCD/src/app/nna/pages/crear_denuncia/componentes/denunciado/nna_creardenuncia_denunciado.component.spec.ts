/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Nna_creardenuncia_denunciadoComponent } from './nna_creardenuncia_denunciado.component';

describe('Nna_creardenuncia_denunciadoComponent', () => {
  let component: Nna_creardenuncia_denunciadoComponent;
  let fixture: ComponentFixture<Nna_creardenuncia_denunciadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Nna_creardenuncia_denunciadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Nna_creardenuncia_denunciadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
