/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Nna_creardenuncia_hechosComponent } from './nna_creardenuncia_hechos.component';

describe('Nna_creardenuncia_hechosComponent', () => {
  let component: Nna_creardenuncia_hechosComponent;
  let fixture: ComponentFixture<Nna_creardenuncia_hechosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Nna_creardenuncia_hechosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Nna_creardenuncia_hechosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
