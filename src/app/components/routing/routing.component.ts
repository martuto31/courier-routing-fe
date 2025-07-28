import { Component } from '@angular/core';

import { UploadFileComponent } from './../upload-file/upload-file.component';

@Component({
  selector: 'app-routing',
  templateUrl: './routing.component.html',
  styleUrls: ['./routing.component.css'],
  standalone: true,
  imports: [
    UploadFileComponent,
  ],
})

export class RoutingComponent {

}
