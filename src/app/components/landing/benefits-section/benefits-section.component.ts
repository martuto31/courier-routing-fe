import { Component } from '@angular/core';

interface BenefitsItem {
  text: string;
  iconSrc: string;
  iconAlt: string;
}

@Component({
  selector: 'app-benefits-section',
  templateUrl: './benefits-section.component.html',
  styleUrls: ['./benefits-section.component.css'],
  standalone: true,
})

// TODO: Add icons
// TODO: Add right google maps pin illustration

export class BenefitsSectionComponent {

  public benefits: BenefitsItem[] = [
    { text: 'По-бързи доставки', iconSrc: 'assets/img/lightning-icon.png', iconAlt: 'Lightning icon'},
    { text: 'По-ниски разходи за гориво', iconSrc: 'assets/img/fuel-icon.png', iconAlt: 'Fuel icon'},
    { text: 'Повече доставени пратки', iconSrc: 'assets/img/update-icon.png', iconAlt: 'Update icon'},
    { text: 'Лесен за използване интерфейс', iconSrc: 'assets/img/interface-icon.png', iconAlt: 'Interface icon'},
  ];
  
}
