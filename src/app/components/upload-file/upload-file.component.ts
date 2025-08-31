import { Component, ElementRef, EventEmitter, Output, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { lastValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';

import { RoutingService } from './../../services/routing.service';
import { GeocodedAddress } from '../../models/routing.model';

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
  public notGeocodedAddresses: string[] = [];

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

      // ТОДО: Рефактор за ретри

      const mapping = {
        hasHeader: this.mapForm.value.hasHeader,
        addressColumn: this.mapForm.value.address,
        priorityColumn: this.mapForm.value.priority || null,
      };

      formData.append('mapping', JSON.stringify(mapping));

      const getGeoRequest = this.routingService.getGeocodedAdresses(formData);
      const getGeoResponse = await lastValueFrom(getGeoRequest);

      if (getGeoResponse.status === 200) {
        if (getGeoResponse.data!.notGeocodedAddresses.length > 0) {
          this.geocodedAddresses = getGeoResponse.data!.geocodedAdresses;
          this.notGeocodedAddresses = getGeoResponse.data!.notGeocodedAddresses;
          this.showNotGeocodedDialog = true;
        } else {
          await this.sendForOptimisation(getGeoResponse.data!.geocodedAdresses, this.notGeocodedAddresses);
        }
      }
    } finally {
      this.isLoading = false;
    }
  }

  private async sendForOptimisation(geocodedAddresses: GeocodedAddress[], notGeocodedAddresses?: string[]) {
    const getOptimisedRouteRequest = this.routingService.getOptimisedRoute({ geocodedAddresses, parsedAddresses: notGeocodedAddresses });
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

    // --- helpers ---
    const norm = (s: any) =>
      (s ?? '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[._]/g, ''); // normalize minor punctuation

    const containsAny = (text: string, keys: string[]) =>
      keys.some(k => text.includes(norm(k)));

    const headerOrValue = (h: string, vals: string[]) => [norm(h), ...vals.map(norm)];

    // Bulgarian & EN header keywords
    const addressHeaderHints = [
      'адрес', 'адреси', 'адрес-получател', 'адрес - получател', 'адрес получател',
      'получател - адрес', 'ул', 'улица', 'бул', 'булевард', 'жк', 'кв',
      'street', 'str', 'addr', 'address', 'avenue', 'av', 'road', 'rd'
    ];

    const recipientHeaderHints = ['получател', 'име получател', 'customer', 'receiver', 'recipient', 'client', 'name'];

    const priorityHeaderHints = [
      'приоритет', 'prio', 'priority', 'спешно', 'важност', 'prioritylevel'
    ];

    // Value-level street hints (work for mixed "адрес - получател" cells)
    const addressValueHints = [
      // BG locality & street tokens
      'ул', 'улица', 'бул', 'булевард', 'жк', 'кв', 'жилищен', 'софия', 'пловдив', 'варна', 'бургас',
      // EN tokens
      'st ', ' st.', 'street', 'str ', ' blvd', ' boulevard', ' ave', ' avenue', ' rd ', ' road',
      // numbers/house marker patterns picked up via regex below
    ];

    // For priorities: numeric small domain, or strings like high/low, да/не, yes/no
    const priorityValuePositives = ['high', 'low', 'medium', 'yes', 'no', 'да', 'не', 'спешно', 'висок', 'нисък', 'среден'];

    const isLikelyAddressValue = (v: string) => {
      const s = norm(v);
      if (!s) return false;
      // has a number (building) + a street token, or starts with "ул./бул." etc.
      const hasNum = /\b\d+[a-zа-я]?\b/.test(s);
      const hasStreetToken = containsAny(s, addressValueHints) || /\bул\.?|\bбул\.?|\bжк\b|\bкв\b/.test(s);
      // looks like locality + street or long-ish freeform (but avoid pure notes)
      const lengthy = s.length >= 15;
      return (hasNum && hasStreetToken) || (hasStreetToken && lengthy);
    };

    const isLikelyPriorityValue = (v: string) => {
      const s = norm(v);
      if (!s) return false;
      if (priorityValuePositives.includes(s)) return true;
      // numeric in a tight small set: 0..3 or 1..5
      if (/^\d+$/.test(s)) {
        const n = Number(s);
        return (n >= 0 && n <= 5);
      }
      return false;
    };

    // Score columns
    type ColScore = { idx: number; header: string; addressScore: number; priorityScore: number; };

    const colScores: ColScore[] = this.headers.map((h, colIdx) => {
      // take up to 20 sample values from this column
      const samples = this.rows.slice(0, 20).map(r => r?.[colIdx]).filter(x => x != null);
      const sVals = samples.map(v => norm(v));

      const hNorm = norm(h);

      // Address scoring
      let addressScore = 0;

      // header matches
      if (containsAny(hNorm, addressHeaderHints)) addressScore += 6;
      // combined header like "адрес - получател" or "получател - адрес"
      if ((containsAny(hNorm, addressHeaderHints) && containsAny(hNorm, recipientHeaderHints))) addressScore += 2;

      // value-based signals
      const addressHits = sVals.filter(v => isLikelyAddressValue(v)).length;
      addressScore += Math.min(6, addressHits); // cap to avoid domination

      // average length helps detect free-form addresses when header is weak
      const avgLen = sVals.length ? sVals.reduce((a, b) => a + b.length, 0) / sVals.length : 0;
      if (avgLen >= 18) addressScore += 2;
      if (avgLen >= 28) addressScore += 1;

      // Priority scoring
      let priorityScore = 0;

      if (containsAny(hNorm, priorityHeaderHints)) priorityScore += 6;

      const valuesAreSmallNumeric =
        sVals.length > 0 &&
        sVals.every(v => /^\d+$/.test(v)) &&
        // numbers in small domain (0..5) for most rows
        (sVals.filter(v => {
          const n = Number(v);
          return n >= 0 && n <= 5;
        }).length / sVals.length) >= 0.8;

      if (valuesAreSmallNumeric) priorityScore += 3;

      const prioHits = sVals.filter(v => isLikelyPriorityValue(v)).length;
      priorityScore += Math.min(4, prioHits);

      return { idx: colIdx, header: h, addressScore, priorityScore };
    });

    const bestAddress = colScores
      .sort((a, b) =>
        b.addressScore - a.addressScore ||
        a.priorityScore - b.priorityScore ||
        a.idx - b.idx
      )[0];

    const bestPriority = colScores
      .sort((a, b) =>
        b.priorityScore - a.priorityScore ||
        a.addressScore - b.addressScore ||
        a.idx - b.idx
      )[0];

    if (bestAddress && bestAddress.addressScore >= 4) {
      this.mapForm.controls.address.setValue(bestAddress.header);
    }

    if (bestPriority && bestPriority.priorityScore >= 4 && bestPriority.idx !== bestAddress?.idx) {
      this.mapForm.controls.priority.setValue(bestPriority.header);
    }

    if (!this.mapForm.controls.priority.value) {
      const loose = colScores.find(c => c.idx !== bestAddress?.idx && c.priorityScore >= 3);
      if (loose) this.mapForm.controls.priority.setValue(loose.header);
    }
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
