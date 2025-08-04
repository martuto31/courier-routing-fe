import { Component } from '@angular/core';

import { MapboxComponent, MapboxPins } from './mapbox/mapbox.component';
import { UploadFileComponent } from './../upload-file/upload-file.component';
import { GeocodedAddress, GetOptimisedRouteResponse, OrderedLocation } from './../../models/routing.model';

@Component({
  selector: 'app-routing',
  templateUrl: './routing.component.html',
  styleUrls: ['./routing.component.css'],
  standalone: true,
  imports: [
    MapboxComponent,
    UploadFileComponent,
  ],
})

export class RoutingComponent {

  public isOptimisedRouteLoaded = false;

  public optimisedRoutePins: MapboxPins[] = [];

  public optimisedRouteUrl: string | null = null;
  public optimisedRoutes: OrderedLocation[] | null = null;
  public unOptimisedRoutes: GeocodedAddress[] | null = null;

  public onGetOptimisedRouteResponse(getOptimisedRouteResponse: GetOptimisedRouteResponse): void {
    if (getOptimisedRouteResponse === null) {
      return;
    }

    this.isOptimisedRouteLoaded = true;

    this.optimisedRouteUrl = getOptimisedRouteResponse.optimisedRoute.googleMapsUrl;
    this.optimisedRoutes = getOptimisedRouteResponse.optimisedRoute.locationOrder;
    this.unOptimisedRoutes = [
      ...getOptimisedRouteResponse.unoptimisedGeoAddresses,
      getOptimisedRouteResponse.unoptimisedGeoAddresses[0], // Adds the start again as end
    ];

    this.optimisedRoutePins = this.optimisedRoutes?.map(address => ({
      lat: address.lat,
      lon: address.lon,
      label: address.address
    })) ?? [];
  }

}
