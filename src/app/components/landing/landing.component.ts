import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { ContactMeComponent } from './../contact-me/contact-me.component';
import { IntroSectionComponent } from './intro-section/intro-section.component';
import { ValuesSectionComponent } from './values-section/values-section.component';
import { CaringSectionComponent } from './caring-section/caring-section.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports: [
    ContactMeComponent,
    IntroSectionComponent,
    ValuesSectionComponent,
    CaringSectionComponent,
  ],
})

export class LandingComponent {

  constructor(
    private router: Router) { }

  public ngAfterViewInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && history.state.scrollTo) {
        setTimeout(() => {
          const element = document.querySelector('#' + history.state.scrollTo) as HTMLElement;

          window.scrollTo({ top: element.getBoundingClientRect().top - 90, behavior: 'smooth' });
        }, 50);
      }
    });
  }

}
