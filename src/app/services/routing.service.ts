import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})

export class RoutingService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = "http://localhost:3000/api/";

  public getOptimisedRouteFromFile(formData: FormData): Observable<ApiResponse<void>> {
    const url = this.apiUrl + 'routing/optimised-route';

    return this.httpService.post(url, formData);
  }

}
