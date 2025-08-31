import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

import { LoginBody, User } from './../models/user.model';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = environment.apiUrl;

  public login(body: LoginBody): Observable<ApiResponse<void>> {
    const url = this.apiUrl + 'auth/login';

    return this.httpService.post(url, body);
  }

  public getUser(): Observable<ApiResponse<User>> {
    const url = this.apiUrl + 'auth/user';

    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
  
    const headers = {
      Authorization: `${accessToken}`,
      'x-refresh-token': `${refreshToken}`,
    };

    return this.httpService.get(url, 'json', headers);
  }
}
