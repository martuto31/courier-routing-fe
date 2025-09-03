import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

import { GetGeocodedAddressesResponse, GetOptimisedRouteBody, GetOptimisedRouteResponse } from './../models/routing.model';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class RoutingService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = environment.apiUrl;

  public getOptimisedRoute(body: GetOptimisedRouteBody): Observable<ApiResponse<GetOptimisedRouteResponse>> {
    const url = this.apiUrl + 'routing/optimised-route';

    // TODO: Refactor = dupl
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
  
    const headers = {
      Authorization: `${accessToken}`,
      'x-refresh-token': `${refreshToken}`,
    };

    return this.httpService.post(url, body, 'json', headers);
  }

  public getGeocodedAdresses(formData: FormData): Observable<ApiResponse<GetGeocodedAddressesResponse>> {
    const url = this.apiUrl + 'routing/geocode-addresses';

    // TODO: Refactor - dupl
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
  
    const headers = {
      Authorization: `${accessToken}`,
      'x-refresh-token': `${refreshToken}`,
    };

    return this.httpService.post(url, formData, 'json', headers);
  }


}
