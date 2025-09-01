import { Component, ElementRef, Input, ViewChild } from '@angular/core';

import * as mapboxgl from 'mapbox-gl';

export interface MapboxPins {
  lat: number;
  lon: number;
  label: string;
}

@Component({
  selector: 'app-mapbox',
  templateUrl: './mapbox.component.html',
  styleUrls: ['./mapbox.component.css'],
  standalone: true,
})

export class MapboxComponent {
  @Input() pins: MapboxPins[] = [];
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef<HTMLDivElement>;

  public map!: mapboxgl.Map;

  public ngAfterViewInit(): void {
    this.initMapbox();

    // this.map.on('load', () => {
    //   this.pins.forEach((pin, index) => {
    //     new mapboxgl.Marker()
    //       .setLngLat([pin.lon, pin.lat])
    //       .setPopup(new mapboxgl.Popup().setHTML(`<strong>${index + 1}. ${pin.label}</strong>`))
    //       .addTo(this.map);
    //   });
    //   this.map.addSource('route', {
    //     'type': 'geojson',
    //     'data': {
    //         'type': 'Feature',
    //         'properties': {},
    //         'geometry': {
    //             'type': 'LineString',
    //             'coordinates': coordinates,
    //         }
    //     }
    //   });
    //   this.map.addLayer({
    //     'id': 'route',
    //     'type': 'line',
    //     'source': 'route',
    //     'layout': {
    //         'line-join': 'round',
    //         'line-cap': 'round'
    //     },
    //     'paint': {
    //         'line-color': '#888',
    //         'line-width': 8
    //     }
    //   });
    // });
  }

  private initMapbox(): void {
    const coordinates = this.pins.map(p => [p.lon, p.lat]);
    const accessToken = 'pk.eyJ1IjoibWFydHV0bzMxIiwiYSI6ImNtZHA2dDd4ZTA4ZjQybXM4bnNvcjh0bngifQ.vHFb2epe3QmlBecSKCoNwg';

    this.map = new mapboxgl.Map({
      container: this.mapElement.nativeElement,
      style: 'mapbox://styles/mapbox/standard',
      accessToken: accessToken,
      center: this.pins[0]
        ? [this.pins[0].lon, this.pins[0].lat]
        : [23.3219, 42.6977],
      zoom: 12
    });

    this.map.on('load', async () => {
      this.pins.forEach((pin, index) => {
        new mapboxgl.Marker()
          .setLngLat([pin.lon, pin.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>${index + 1}. ${pin.label}</strong>`))
          .addTo(this.map);
      });

      const coords = this.pins.map(p => `${p.lon},${p.lat}`).join(';');

      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&access_token=${accessToken}`;

      const res = await fetch(directionsUrl);
      const data = await res.json();

      const route = data.routes[0].geometry;

      this.map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: route,
          properties: {},
        },
      });

      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3578E5',
          'line-width': 4,
        },
      });
    });
  }

  // private buildLineString(coords: number[][]): GeoJSON.Feature<GeoJSON.LineString> {
  //   return 
  // }

}
