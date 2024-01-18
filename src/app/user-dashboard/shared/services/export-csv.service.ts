import { Injectable } from '@angular/core';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';

@Injectable({ providedIn: UserDashboardModule })
export class ExportCsvService {
  constructor() {}
  exportFile(data: any, fileName: string, fileType: string) {
    const blob = new Blob([data], { type: fileType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${fileType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  csvDownload(headers: string[], data: any[], keys: string[], name: string) {
    if (!data || !data.length) {
      return;
    }
    const separator = ',';
    const newLine = '\n';
    const csvContent: any = headers
      .join(separator)
      .concat(newLine)
      .concat(
        data
          .map((rowData: any) => {
            return keys.map((hKey) => {
              const cell =
                rowData[hKey] === null || rowData[hKey] === undefined
                  ? ''
                  : rowData[hKey];
              return cell;
            });
          })
          .join(newLine)
      );
    this.exportFile(csvContent, name, 'csv');
  }
}
