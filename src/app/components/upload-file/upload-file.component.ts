import { Component, ElementRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RoutingService } from '../../services/routing.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
})

export class UploadFileComponent {

  constructor(private routingService: RoutingService) { }

  @ViewChild('uploadFile') uploadFile!: ElementRef<HTMLInputElement>;

  public selectedFile: File | null = null;

  public openFile(): void {
    this.uploadFile.nativeElement.click();
  }

  public fileDrop(event: DragEvent): void {
    event.preventDefault();

    const files = event.dataTransfer?.files;

    if (files?.length) {
      this.selectedFile = files[0];
    }
  }

  public fileInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input?.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  public dragOver(event: DragEvent): void {
    event.preventDefault();
  }

  public async sendFile(): Promise<void> {
    const formData = new FormData();

    if (this.selectedFile) {
      formData.append('file', this.selectedFile); 
    }

    const request = this.routingService.getOptimisedRouteFromFile(formData);
    const response = await lastValueFrom(request);
  }

}
