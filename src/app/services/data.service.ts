import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}

  getList$(): Observable<string[]> {
    return of(['value1', 'value2', 'value3']);
  }

  getNumbers1$(): Observable<number[]> {
    return of([1, 2, 3]);
  }

  getNumbers2$(): Observable<number[]> {
    return of([4, 5, 6]);
  }

  getNumbers3$(): Observable<number[]> {
    return of([7, 8, 9]);
  }

  getBooleans$(): Observable<boolean> {
    return of(false, false, true, false);
  }
}
