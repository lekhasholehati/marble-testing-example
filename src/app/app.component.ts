import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  Observable,
  Subject,
  catchError,
  combineLatest,
  map,
  of,
  takeUntil,
  takeWhile,
} from 'rxjs';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'marble-test-example';

  form: FormGroup;
  destroy$ = new Subject<void>();

  flag: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) {
    this.form = this.formBuilder.group({
      name: [],
    });
    this.flag = false;
  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => console.log('data', data));
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
  }

  getList(): Observable<string[]> {
    return this.dataService.getList$().pipe(catchError(() => of([])));
  }

  setFlagOnTrue(stream$: Observable<boolean>): void {
    stream$.pipe(takeWhile((value) => !value)).subscribe({
      complete: () => (this.flag = true),
    });
  }

  combineStreams$(...streams: Observable<number[]>[]): Observable<number[]> {
    return combineLatest(streams).pipe(map((lists) => lists.flat()));
  }

  getNumbers$(): Observable<number[]> {
    return this.combineStreams$(
      this.dataService.getNumbers1$(),
      this.dataService.getNumbers2$(),
      this.dataService.getNumbers3$()
    );
  }
}
