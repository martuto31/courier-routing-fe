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

    return this.httpService.post(url, body);
  }

  public getGeocodedAdresses(formData: FormData): Observable<ApiResponse<GetGeocodedAddressesResponse>> {
    const url = this.apiUrl + 'routing/geocode-addresses';

    return this.httpService.post(url, formData);
  }


}
