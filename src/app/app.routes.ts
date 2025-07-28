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
      title: '',
    },

    {
      path: 'kontakti',
      loadComponent: () => import('./components/contact-me/contact-me.component').then(c => c.ContactMeComponent),
      title: '',
    },

    {
      path: 'optimizirai-marshrut',
      loadComponent: () => import('./components/routing/routing.component').then(c => c.RoutingComponent),
      title: '',
    },

    // {
    //   path: 'login',
    //   loadComponent: () => import('./components/auth/login/login.component').then(c => c.LoginComponent),
    //   title: '',
    // },
];
