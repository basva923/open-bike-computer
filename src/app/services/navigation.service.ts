import { Injectable } from '@angular/core';

export class RoutePoint {
  constructor(
    public latitude: number,
    public longitude: number,
    public altitude: number
  ) { }

  get LngLat() {
    return [this.longitude, this.latitude];
  }
}

export class NewRouteEvent extends Event {
  constructor(
    public route: RoutePoint[],
    public name: string
  ) {
    super("newRoute");
  }
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private route: RoutePoint[] = [];
  private routeName: string = '';
  protected newRouteTarget: EventTarget = new EventTarget();;


  loadRouteFileGPX(content: string) {
    this.route = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");
    this.routeName = xmlDoc.getElementsByTagName("name")[0].textContent || 'GPX Route';
    const trkpts = xmlDoc.getElementsByTagName("trkpt");
    for (let i = 0; i < trkpts.length; i++) {
      const lat = parseFloat(trkpts[i].getAttribute("lat")!);
      const lon = parseFloat(trkpts[i].getAttribute("lon")!);
      const ele = parseFloat(trkpts[i].getElementsByTagName("ele")[0].textContent!);
      this.route.push(new RoutePoint(lat, lon, ele));
    }
    this.newRouteTarget.dispatchEvent(new NewRouteEvent(this.route, this.routeName))
  }

  addNewRouteListener(callback: (event: NewRouteEvent) => void) {
    this.newRouteTarget.addEventListener('newRoute', callback as any);
  }
  removeNewRouteListener(callback: (event: NewRouteEvent) => void) {
    this.newRouteTarget.removeEventListener('newRoute', callback as any);
  }

  hasRoute(): boolean {
    return this.route && this.route.length > 0;
  }

  getRouteName(): string {
    return this.routeName || '';
  }
}
