import { Component } from '@angular/core';

interface Items {
  title: string;
  iconSrc: string;
  iconAlt: string;
}

@Component({
  selector: 'app-how-it-works-section',
  templateUrl: './how-it-works-section.component.html',
  styleUrls: ['./how-it-works-section.component.css'],
  standalone: true,
})

export class HowItWorksSectionComponent {

  public items: Items[] = [
    { title: 'Качи файл с адреси', iconSrc: 'assets/img/upload-file-icon.svg', iconAlt: 'Upload file icon', },
    { title: 'Виж маршрута', iconSrc: 'assets/img/map-route-icon.svg', iconAlt: 'Map with a route icon', },
    { title: 'Разпредели на куриери', iconSrc: 'assets/img/group-of-people-icon.svg', iconAlt: 'Group of people icon', },
  ];

}
