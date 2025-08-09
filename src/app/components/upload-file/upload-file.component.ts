import { Component, ElementRef, EventEmitter, Output, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { lastValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';

import { RoutingService } from './../../services/routing.service';

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css'],
})
export class UploadFileComponent {

  constructor(
    private routingService: RoutingService, 
    private fb: FormBuilder) { }

  @Output() getOptimisedRouteResponse = new EventEmitter<any>();

  @ViewChild('uploadFile') uploadFile!: ElementRef<HTMLInputElement>;

  isLoading = false;
  selectedFile: File | null = null;

  // parsed data
  headers: string[] = [];
  rows: any[][] = [];
  previewRows: any[][] = [];

  // mapping form
  mapForm = this.fb.group({
    address: ['', Validators.required],
    priority: [''],
    hasHeader: [true, { nonNullable: true }],
  });

  // convenience: computed indices
  addressIndex = computed(() => this.headers.indexOf(this.mapForm.value.address || ''));
  priorityIndex = computed(() => this.headers.indexOf(this.mapForm.value.priority || ''));

  openFile(): void {
    this.uploadFile.nativeElement.click();
  }

  dragOver(e: DragEvent) { e.preventDefault(); }

  fileDrop(e: DragEvent) {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files?.length) this.handleFile(files[0]);
  }

  fileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input?.files?.length) this.handleFile(input.files[0]);
  }

  private handleFile(file: File) {
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (ev: any) => {
      const data = new Uint8Array(ev.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      // header:1 -> array-of-arrays
      const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (!aoa?.length) return;

      // Try to detect header row
      const firstRow = aoa[0];
      const likelyHasHeader = this.guessHasHeader(firstRow);
      this.mapForm.patchValue({ hasHeader: likelyHasHeader });

      if (likelyHasHeader) {
        this.headers = firstRow.map((h: any, i: number) => (h ? String(h) : `Column ${i + 1}`));
        this.rows = aoa.slice(1);
      } else {
        // fabricate headers
        this.headers = firstRow.map((_: any, i: number) => `Column ${i + 1}`);
        this.rows = aoa;
      }

      // preview
      this.previewRows = this.rows.slice(0, 5);

      // auto-suggest mapping and load last-used
      this.autoSuggestMapping();
      this.loadSavedMapping();
    };
    reader.readAsArrayBuffer(file);
  }

  // Heuristics: find address-like / priority-like columns
  private autoSuggestMapping() {
    if (!this.headers.length) return;

    // address: longest strings, contains street keywords
    const streetHints = ['ул', 'str', 'street', 'бул', 'bulevard', 'bul', 'avenue', 'av', 'road', 'rd', 'адрес', 'булевард'];
    let guessAddress = '';
    let guessPriority = '';

    // scan columns
    this.headers.forEach((h, colIdx) => {
      const sampleValues = this.rows.slice(0, 10).map(r => r[colIdx]);
      const asStrings = sampleValues.map(v => (v ?? '').toString());
      const avgLen = asStrings.reduce((a, b) => a + b.length, 0) / (asStrings.length || 1);

      const containsStreetHint = asStrings.some(v =>
        streetHints.some(k => v.toLowerCase().includes(k))
      );
      const mostlyNumeric = sampleValues.filter(v => v !== null && v !== undefined)
        .every(v => !isNaN(Number(v)));

      if (!guessAddress && (containsStreetHint || avgLen > 12)) guessAddress = h;
      if (!guessPriority && mostlyNumeric) guessPriority = h;
    });

    if (guessAddress) this.mapForm.controls.address.setValue(guessAddress);
    if (guessPriority) this.mapForm.controls.priority.setValue(guessPriority);
  }

  saveMapping() {
    const val = this.mapForm.value;
    localStorage.setItem('columnMapping', JSON.stringify(val));
  }

  loadSavedMapping() {
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

  async sendFile(): Promise<void> {
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

      const request = this.routingService.getOptimisedRouteFromFile(formData);
      const response = await lastValueFrom(request);

      if (response.status === 200) {
        this.getOptimisedRouteResponse.emit(response.data ?? null);
        this.saveMapping();
      }
    } finally {
      this.isLoading = false;
    }
  }
  
  // crude guess: header row if most cells are non-numeric strings
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
