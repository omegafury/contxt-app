import * as highcharts from "highcharts";
declare module "highcharts" {
  export interface Series {
    searchPoint(e: PointerEventObject, compareX?: boolean): Point | undefined;
  }
}
