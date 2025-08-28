declare namespace __esri {
  export interface Map {
    add(layer: any): void;
    remove(layer: any): void;
  }

  export interface MapView {
    container: HTMLElement;
    map: Map;
    center: [number, number];
    zoom: number;
    on(event: string, handler: Function): void;
    hitTest(event: any): Promise<any>;
    destroy(): void;
  }

  export interface Graphic {
    geometry: any;
    symbol: any;
    attributes: any;
  }

  export interface GraphicsLayer {
    add(graphic: Graphic): void;
    remove(graphic: Graphic): void;
    removeAll(): void;
  }

  export interface Point {
    longitude: number;
    latitude: number;
  }

  export interface SimpleMarkerSymbol {
    color: number[];
    size: string;
    outline: {
      color: number[];
      width: number;
    };
  }

  export interface MapConstructor {
    new (properties?: any): Map;
  }

  export interface MapViewConstructor {
    new (properties?: any): MapView;
  }

  export interface GraphicConstructor {
    new (properties?: any): Graphic;
  }

  export interface GraphicsLayerConstructor {
    new (properties?: any): GraphicsLayer;
  }

  export interface PointConstructor {
    new (properties?: any): Point;
  }

  export interface SimpleMarkerSymbolConstructor {
    new (properties?: any): SimpleMarkerSymbol;
  }
}

declare module 'esri/Map' {
  const Map: __esri.MapConstructor;
  export = Map;
}

declare module 'esri/views/MapView' {
  const MapView: __esri.MapViewConstructor;
  export = MapView;
}

declare module 'esri/Graphic' {
  const Graphic: __esri.GraphicConstructor;
  export = Graphic;
}

declare module 'esri/layers/GraphicsLayer' {
  const GraphicsLayer: __esri.GraphicsLayerConstructor;
  export = GraphicsLayer;
}

declare module 'esri/geometry/Point' {
  const Point: __esri.PointConstructor;
  export = Point;
}

declare module 'esri/symbols/SimpleMarkerSymbol' {
  const SimpleMarkerSymbol: __esri.SimpleMarkerSymbolConstructor;
  export = SimpleMarkerSymbol;
}
