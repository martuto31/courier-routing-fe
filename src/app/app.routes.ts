import { Routes } from '@angular/router';
import { authGuard } from './components/guards/auth.guard';

export const routes: Routes = [
    {
      path: '',
      loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent),
      title: '',
    },
    {
      path: 'za-nas',
      loadComponent: () => import('./components/about-me/about-me.component').then(c => c.AboutMeComponent),
      title: 'Нашата мисия и истории',
    },
    {
      path: 'kontakti',
      loadComponent: () => import('./components/contact-me/contact-me.component').then(c => c.ContactMeComponent),
      title: 'Свържи се с нас',
    },

    // {
    //   path: 'login',
    //   loadComponent: () => import('./components/auth/login/login.component').then(c => c.LoginComponent),
    //   title: '',
    // },
];
