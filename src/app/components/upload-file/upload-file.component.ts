import { Component, ElementRef, EventEmitter, Output, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';

import * as XLSX from 'xlsx';
import { lastValueFrom } from 'rxjs';

import { RoutingService } from './../../services/routing.service';

import { GeocodedAddress, ParsedAddress } from './../../models/routing.model';

@Component({
  selector: 'app-upload-file',
  standalone: true,
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css'],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
})
export class UploadFileComponent {

  constructor(
    private routingService: RoutingService, 
    private fb: FormBuilder) { }

  @Output() getOptimisedRouteResponse = new EventEmitter<any>();

  @ViewChild('uploadFile') uploadFile!: ElementRef<HTMLInputElement>;

  public isLoading = false;
  public selectedFile: File | null = null;
  public showNotGeocodedDialog = false;

  // parsed data
  public headers: string[] = [];
  public rows: any[][] = [];
  public previewRows: any[][] = [];

  // mapping form
  public mapForm = this.fb.group({
    address: ['', Validators.required],
    priority: [''],
    hasHeader: [true, { nonNullable: true }],
  });

  // convenience: computed indices
  public addressIndex = computed(() => this.headers.indexOf(this.mapForm.value.address || ''));
  public priorityIndex = computed(() => this.headers.indexOf(this.mapForm.value.priority || ''));

  public geocodedAddresses: GeocodedAddress[] = [];
  public notGeocodedAddresses: ParsedAddress[] = [];

  public openFile(): void {
    this.uploadFile.nativeElement.click();
  }

  public dragOver(e: DragEvent): void { 
    e.preventDefault();
  }

  public fileDrop(e: DragEvent): void {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files?.length) this.handleFile(files[0]);
  }

  public fileInput(e: Event): void {
    const input = e.target as HTMLInputElement;

    if (input?.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  public async sendFile(): Promise<void> {
    if (!this.selectedFile) {
      return;
    }

    if (this.mapForm.invalid) {
      alert('Моля, изберете колоната за адрес.');

      return;
    }

    this.isLoading = true;

    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      const mapping = {
        hasHeader: this.mapForm.value.hasHeader,
        addressColumn: this.mapForm.value.address,
        priorityColumn: this.mapForm.value.priority || null,
      };

      formData.append('mapping', JSON.stringify(mapping));

      const getGeoRequest = this.routingService.getGeocodedAdresses(formData);
      const getGeoResponse = await lastValueFrom(getGeoRequest);

      if (getGeoResponse.status === 200) {
        this.geocodedAddresses = getGeoResponse.data!.geocodedAdresses;
        this.notGeocodedAddresses = getGeoResponse.data!.notGeocodedAddresses;
  
        if (getGeoResponse.data!.notGeocodedAddresses.length > 0) {
          this.showNotGeocodedDialog = true;
        } else {
          await this.sendForOptimisation(this.geocodedAddresses);
        }
      }
    } finally {
      this.isLoading = false;
    }
  }

  public onCancel(): void {
    this.showNotGeocodedDialog = false;
  }

  public onRemoveAddress(index: number): void {
    this.notGeocodedAddresses.splice(index, 1);
  }

  private async sendForOptimisation(geocodedAddresses: GeocodedAddress[]) {
    const getOptimisedRouteRequest = this.routingService.getOptimisedRoute({ geocodedAddresses });
    const getOptimisedRouteResponse = await lastValueFrom(getOptimisedRouteRequest);

    if (getOptimisedRouteResponse.status === 200) {
      this.getOptimisedRouteResponse.emit(getOptimisedRouteResponse.data ?? null);
      this.saveMapping();
    }
  }

  private handleFile(file: File): void {
    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = (ev: any) => {
      const data = new Uint8Array(ev.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      // header:1 -> array-of-arrays
      const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (!aoa?.length) { 
        return;
      }

      const firstRow = aoa[0];
      const likelyHasHeader = this.guessHasHeader(firstRow);
      this.mapForm.patchValue({ hasHeader: likelyHasHeader });

      if (likelyHasHeader) {
        this.headers = firstRow.map((h: any, i: number) => (h ? String(h) : `Column ${i + 1}`));
        this.rows = aoa.slice(1);
      } else {
        this.headers = firstRow.map((_: any, i: number) => `Column ${i + 1}`);
        this.rows = aoa;
      }

      this.previewRows = this.rows.slice(0, 5);

      this.autoSuggestMapping();
      this.loadSavedMapping();
    };

    reader.readAsArrayBuffer(file);
  }

  private autoSuggestMapping(): void {
    if (!this.headers?.length || !this.rows?.length) return;

    const norm = (s: string) =>
      s.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[._]/g, '');

    const addressKeywords = [
      'address', 'адрес', 'ул', 'улица', 'бул', 'str', 'street', 'адрес', 'адреси',
      'адрес-получател', 'адрес - получател', 'адрес получател',
      'получател - адрес', 'ул', 'улица', 'бул', 'булевард', 'жк', 'кв',
      'street', 'str', 'addr', 'address', 'avenue', 'av', 'road', 'rd'
    ];
    const priorityKeywords = [
      'priority', 'приоритет', 'prio', 'важност', 'спешно', 'prioritylevel',
    ];

    const findMatchingHeader = (keywords: string[]) =>
      this.headers.find(header => keywords.some(k => norm(header).includes(k)));

    const bestAddress = findMatchingHeader(addressKeywords);
    const bestPriority = findMatchingHeader(priorityKeywords);

    if (bestAddress) this.mapForm.controls.address.setValue(bestAddress);
    if (bestPriority) this.mapForm.controls.priority.setValue(bestPriority);
  }


  private saveMapping(): void {
    const val = this.mapForm.value;
    localStorage.setItem('columnMapping', JSON.stringify(val));
  }

  private loadSavedMapping(): void {
    const raw = localStorage.getItem('columnMapping');

    if (!raw) {
      return;
    }

    const saved = JSON.parse(raw);

    if (saved?.address && this.headers.includes(saved.address)) {
      this.mapForm.controls.address.setValue(saved.address);
    }

    if (saved?.priority && this.headers.includes(saved.priority)) {
      this.mapForm.controls.priority.setValue(saved.priority);
    }

    if (typeof saved?.hasHeader === 'boolean') {
      this.mapForm.controls.hasHeader.setValue(saved.hasHeader);
    }
  }

  private guessHasHeader(firstRow: any[]): boolean {
    const cells = firstRow ?? [];

    if (!cells.length) {
      return true; 
    }

    const score = cells.reduce((acc, v) => {
      const s = (v ?? '').toString();
      const isNum = s !== '' && !isNaN(Number(s));
      const hasLetters = /[a-zA-Zа-яА-Я]/.test(s);

      return acc + (hasLetters && !isNum ? 1 : 0);
    }, 0);

    return score >= Math.ceil(cells.length / 2);
  }
}
