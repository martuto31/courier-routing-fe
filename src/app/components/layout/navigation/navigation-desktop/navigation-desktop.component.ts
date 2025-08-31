import { Component, effect } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UserService } from './../../../../services/user.service';

import { User } from './../../../../models/user.model';

@Component({
  selector: 'app-navigation-desktop',
  templateUrl: './navigation-desktop.component.html',
  styleUrls: ['./navigation-desktop.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class NavigationDesktopComponent { 
  
  constructor(public userService: UserService) {
    this.subscribeToUser();
  }

  public user: User | null = null

  public logout(): void {
    this.userService.logout();
  }

  private subscribeToUser(): void {
    effect(() => {
      this.user = this.userService.user();
    });
  }
  
}
