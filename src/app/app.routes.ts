import { Routes } from '@angular/router';
import { authGuard } from './components/guards/auth.guard';

export const routes: Routes = [
    {
      path: '',
      // loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent),
      loadComponent: () => import('./components/upload-file/upload-file.component').then(c => c.UploadFileComponent),
      title: '',
    },
    {
      path: 'za-nas',
      loadComponent: () => import('./components/about-me/about-me.component').then(c => c.AboutMeComponent),
      title: '',
    },
    {
      path: 'upload-file',
      loadComponent: () => import('./components/upload-file/upload-file.component').then(c => c.UploadFileComponent),
      title: '',
    },

    // {
    //   path: 'login',
    //   loadComponent: () => import('./components/auth/login/login.component').then(c => c.LoginComponent),
    //   title: '',
    // },
];
