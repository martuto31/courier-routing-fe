import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

import { GetGeocodedAddressesResponse, GetOptimisedRouteResponse } from './../models/routing.model';

@Injectable({
  providedIn: 'root'
})

export class RoutingService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = "http://localhost:3000/api/";

  public getOptimisedRouteFromFile(formData: FormData): Observable<ApiResponse<GetOptimisedRouteResponse>> {
    const url = this.apiUrl + 'routing/optimised-route';

    return this.httpService.post(url, formData);
  }

  public getGeocodedAdresses(formData: FormData): Observable<ApiResponse<GetGeocodedAddressesResponse>> {
    const url = this.apiUrl + 'routing/geocode-addresses';

    return this.httpService.post(url, formData);
  }


}
