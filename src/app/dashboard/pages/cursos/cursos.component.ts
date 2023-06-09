import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AbmCursosComponent } from './components/abm-cursos/abm-cursos.component';
import { MatDialog } from '@angular/material/dialog';
import { CrearCursoPayload, Curso, CursoMateria } from './models';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/core/models';
import { selectAuthUser } from 'src/app/store/auth/auth.selectors';
import { Store } from '@ngrx/store';
import { State } from './store/cursos.reducer';
import { selectCursosState } from './store/cursos.selectors';
import { CursosActions } from './store/cursos.actions';
import { ConfirmacionDialogComponent } from 'src/app/shared/components/confirmacion-dialog/confirmacion-dialog.component';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss'],
})
export class CursosComponent implements OnInit {
  state$: Observable<State>;
  authUser$: Observable<Usuario | null>;
  dataSource = new MatTableDataSource<CursoMateria>();

  displayedColumns = [
    'id',
    'nombre',
    'fecha_inicio',
    'fecha_fin',
    'detalle',
    'editar',
    'eliminar',
  ];

  constructor(
    private dialog: MatDialog,
    private matDialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store
  ) {
    this.state$ = this.store.select(selectCursosState);
    this.authUser$ = this.store.select(selectAuthUser);
  }

  ngOnInit(): void {
    this.store.dispatch(CursosActions.loadCursos());
    this.state$.subscribe({
      next: (stateCursos) => {
        this.dataSource.data = stateCursos.cursosMateria;
      },
    });
  }

  crearCurso(): void {
    const dialog = this.matDialog.open(AbmCursosComponent);
    dialog.afterClosed().subscribe((formValue) => {
      if (formValue) {
        this.store.dispatch(
          CursosActions.createCurso({
            data: formValue as CrearCursoPayload,
          })
        );
      }
    });
  }

  editarCurso(cursoParaEditar: Curso): void {
    const dialog = this.matDialog.open(AbmCursosComponent, {
      data: {
        cursoParaEditar,
      },
    });
    dialog.afterClosed().subscribe((valorDelFormulario) => {
      if (valorDelFormulario) {
        this.store.dispatch(
          CursosActions.updateCurso({
            data: valorDelFormulario as CursoMateria,
            id: cursoParaEditar.id as number,
          })
        );
      }
    });
  }

  eliminarCurso(id: number): void {
    const dialogRef = this.dialog.open(ConfirmacionDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(CursosActions.deleteCurso({ id }));
      }
    });
  }

  aplicarFiltros(ev: Event): void {
    const inputValue = (ev.target as HTMLInputElement)?.value;
    this.dataSource.filter = inputValue?.trim()?.toLocaleLowerCase();
  }

  verCursoDetalle(cursoId: number): void {
    this.router.navigate([cursoId], {
      relativeTo: this.activatedRoute,
    });
  }
}
