import { Injectable } from '@angular/core';

class RoutePoint {
  constructor(
    public latitude: number,
    public longitude: number,
    public altitude: number
  ) { }
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private route: RoutePoint[] = [];

  constructor() { }


  loadRouteFileGPX(content: string) {
    this.route = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");
    const trkpts = xmlDoc.getElementsByTagName("trkpt");
    for (let i = 0; i < trkpts.length; i++) {
      const lat = parseFloat(trkpts[i].getAttribute("lat")!);
      const lon = parseFloat(trkpts[i].getAttribute("lon")!);
      const ele = parseFloat(trkpts[i].getElementsByTagName("ele")[0].textContent!);
      this.route.push(new RoutePoint(lat, lon, ele));
    }
  }



}
