import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ph81 } from '_models';

export const lowerCaseDataAccessor = (
  data: any,
  sortHeaderId: string
): string => {
  if (typeof data[sortHeaderId] === 'string') {
    return data[sortHeaderId].toLocaleLowerCase();
  }
  return data[sortHeaderId];
};

export class TableBaseComponent {
  dataSource: MatTableDataSource<any>;
  defaultImg = ph81;
  loading = true;

  @ViewChild('paginator', { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  @ViewChild('TableSort', { static: false })
  set sort(value: MatSort) {
    if (this.dataSource) {
      this.dataSource.sortingDataAccessor = lowerCaseDataAccessor;
      this.dataSource.sort = value;
    }
  }
}
