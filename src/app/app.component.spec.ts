import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { AppComponent } from './app.component';
import { DataService } from './services/data.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let dataService: DataService;
  let testScheduler: TestScheduler;

  const dataServiceSpy = jasmine.createSpyObj('DataService', [
    'getList$',
    'getNumbers1$',
    'getNumbers2$',
    'getNumbers3$',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, CommonModule],
      providers: [
        {
          provide: DataService,
          useValue: dataServiceSpy,
        },
        {
          provide: FormBuilder,
          useValue: {
            group: () => ({
              name: [],
            }),
          },
        },
      ],
      declarations: [AppComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    dataService = TestBed.inject(DataService);

    testScheduler = new TestScheduler((actual, expected) =>
      expect(actual).toEqual(expected)
    );
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe when flag is true', () => {
    testScheduler.run((helpers) => {
      const { expectSubscriptions, cold } = helpers;
      const stream = cold('aaaba', { a: false, b: true });

      component.setFlagOnTrue(stream);

      const expect = '^--!';
      expectSubscriptions(stream.subscriptions).toBe(expect);
    });
  });

  it('should return empty list when getList is throwError', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const list = cold('#', { a: ['value1', 'value2', 'value3'] });

      const getList = dataService.getList$ as jasmine.Spy;
      getList.and.returnValue(throwError(() => list));

      const expected = '(a|)';
      expectObservable(component.getList()).toBe(expected, { a: [] });
    });
  });

  it('should complete destroy$ when ngOnDestroy is triggered', () => {
    testScheduler.run((helpers) => {
      const { expectObservable } = helpers;
      const expected = '|';

      component.ngOnDestroy();

      expectObservable(component.destroy$).toBe(expected);
    });
  });

  it('should ignore the values when component.combineStreams$ has not been subscribed', () => {
    testScheduler.run((helpers) => {
      const { cold, hot, expectObservable } = helpers;
      const list1 = hot('a^b', { a: [1], b: [2] });
      const list2 = cold('a', { a: [3] });
      const list3 = cold('a', { a: [4] });
      const expected = '-a';

      expectObservable(component.combineStreams$(list1, list2, list3)).toBe(
        expected,
        {
          a: [2, 3, 4],
        }
      );
    });
  });

  it('should combine and flatten streams correctly when getNumbers$ is triggered', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;

      const numbers1$ = cold('a', { a: [1] });
      const numbers2$ = cold('a', { a: [3] });
      const numbers3$ = cold('a', { a: [4] });

      const getNumbers1$ = dataService.getNumbers1$ as jasmine.Spy;
      getNumbers1$.and.returnValue(numbers1$);

      const getNumbers2$ = dataService.getNumbers2$ as jasmine.Spy;
      getNumbers2$.and.returnValue(numbers2$);

      const getNumbers3$ = dataService.getNumbers3$ as jasmine.Spy;
      getNumbers3$.and.returnValue(numbers3$);

      const result$ = component.getNumbers$();

      const expectedMarble = 'a';
      const expectedValues = {
        a: [1, 3, 4],
      };

      expectObservable(result$).toBe(expectedMarble, expectedValues);
    });
  });
});
