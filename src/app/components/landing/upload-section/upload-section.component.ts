import { Component } from '@angular/core';

import { UploadFileComponent } from './../../upload-file/upload-file.component';

@Component({
  selector: 'app-upload-section',
  templateUrl: './upload-section.component.html',
  styleUrls: ['./upload-section.component.css'],
  standalone: true,
  imports: [
    UploadFileComponent,
  ],
})

export class UploadSectionComponent {

}
