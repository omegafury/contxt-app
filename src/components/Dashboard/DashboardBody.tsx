import { parseISO, roundToNearestMinutes, subDays } from "date-fns";
import { PointerEventObject } from "highcharts";
import { useEffect, useRef, useState } from "react";
import contxtSdk from "src/services/sdkService";
import Chart, { ChartRefType } from "../Chart";
import debounce from "lodash.debounce";

// const FACILITY_ID = 318;
// const FEED_ID = 1235;
const FEED_FIELD_ID = 9927;
const DAYS_OF_DATA: 5 | 4 | 3 | 2 | 1 = 4;
let REFS: React.RefObject<ChartRefType>[] = [];

/**
 * Synchronize zooming through the setExtremes event handler.
 */
const syncExtremes: Highcharts.AxisSetExtremesEventCallbackFunction = (e) => {
  const target = (e.target as unknown) as {
    chart: Highcharts.Chart;
  };

  if (e.trigger !== "syncExtremes") {
    // Prevent feedback loop
    REFS.forEach(({ current }) => {
      const thisChart = current?.chart;
      if (thisChart !== target.chart) {
        if (thisChart?.xAxis[0].setExtremes) {
          // It is null while updating
          thisChart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
            trigger: "syncExtremes",
          });
        }
      }
    });
  }
};
const sortHighchartSeriesData = (a: number[], b: number[]) => a[0] - b[0];
const defaultChartOptions: Highcharts.Options = {
  chart: {
    zoomType: "x",
  },
  time: {
    timezoneOffset: 5 * 60,
  },
  tooltip: {
    xDateFormat: "%Y-%m-%d %H:%M",
    shared: true,
    split: false,
  },
};
const defaultTempChartOptions: Highcharts.Options = {
  title: {
    text: "Temperature Data",
  },
  xAxis: {
    crosshair: true,
    events: {
      setExtremes: syncExtremes,
    },
    type: "datetime",
    title: {
      text: "Date",
    },
  },
  yAxis: {
    title: {
      text: "Temperature",
    },
  },
  series: [
    {
      name: "Sense HAT",
      type: "line",
      data: [],
    },
    {
      name: "Open Weather",
      type: "line",
      data: [],
    },
  ],
};
const defaultTempDifferenceFactorChartOptions: Highcharts.Options = {
  title: {
    text: "Temperature Difference Data",
  },
  xAxis: {
    crosshair: true,
    events: {
      setExtremes: syncExtremes,
    },
    type: "datetime",
    title: {
      text: "Date",
    },
  },
  yAxis: {
    title: {
      text: "Temperature",
    },
  },
  series: [
    {
      name: "Temp Difference",
      type: "line",
      data: [],
    },
  ],
};

const buildUpdatedChartOptions = (
  defaultOptions: Highcharts.Options,
  seriesData: number[][][],
  {
    xMin,
    xMax,
    yMin,
    yMax,
  }: { xMin: number; xMax: number; yMin: number; yMax: number }
): Highcharts.Options => {
  let tempXaxis = defaultOptions.xAxis as Highcharts.XAxisOptions;
  tempXaxis.min = xMin;
  tempXaxis.max = xMax;
  let tempYaxis = defaultOptions.yAxis as Highcharts.YAxisOptions;
  tempYaxis.min = yMin;
  tempYaxis.max = yMax;
  const updatedTempChartOptions: Highcharts.Options = {
    xAxis: tempXaxis,
    yAxis: tempYaxis,
    series: seriesData.map((data) => {
      return {
        type: "line",
        data: data,
      };
    }),
  };
  return updatedTempChartOptions;
};
const FetchAndBuildChartData = (
  optionsSetters: React.Dispatch<React.SetStateAction<Highcharts.Options>>[]
) => {
  const timeEnd = Math.floor(Date.now() / 1000);
  const timeStart = Math.floor(
    subDays(new Date(), DAYS_OF_DATA).getTime() / 1000
  );

  const sensortDataPromise = contxtSdk.iot.outputs.getFieldData(
    FEED_FIELD_ID,
    "temp",
    {
      timeStart: timeStart,
      timeEnd: timeEnd,
      window: 900,
    }
  );
  const realTempDataPromise = contxtSdk.iot.outputs.getFieldData(
    FEED_FIELD_ID,
    "real_temp",
    {
      timeStart: timeStart,
      timeEnd: timeEnd,
      window: 900,
    }
  );

  return Promise.all([sensortDataPromise, realTempDataPromise]).then(
    (feedDataArray) => {
      const timeTempMap: {
        [key: number]: {
          sensor: number;
          real_temp?: number;
        };
      } = {};
      let tempDifferenceSum = 0;
      const ranges = {
        xMin: Infinity,
        xMax: -Infinity,
        yMin: Infinity,
        yMax: -Infinity,
      };
      const formattedSensorData = feedDataArray[0].records
        .map((data) => {
          const time = roundToNearestMinutes(parseISO(data.eventTime), {
            nearestTo: 15,
          }).getTime();
          const temp = Number(Number.parseFloat(data.value).toFixed(2));
          timeTempMap[time] = {
            sensor: temp,
          };
          ranges.xMin = ranges.xMin > time ? time : ranges.xMin;
          ranges.xMax = ranges.xMax < time ? time : ranges.xMax;
          ranges.yMin = ranges.yMin > temp ? temp : ranges.yMin;
          ranges.yMax = ranges.yMax < temp ? temp : ranges.yMax;
          return [time, temp];
        })
        .sort(sortHighchartSeriesData);
      const formattedRealTempData = feedDataArray[1].records
        .map((data) => {
          const time = roundToNearestMinutes(parseISO(data.eventTime), {
            nearestTo: 15,
          }).getTime();
          const temp = Number(Number.parseFloat(data.value).toFixed(2));
          timeTempMap[time].real_temp = temp;
          tempDifferenceSum += timeTempMap[time].sensor - temp;
          ranges.xMin = ranges.xMin > time ? time : ranges.xMin;
          ranges.xMax = ranges.xMax < time ? time : ranges.xMax;
          ranges.yMin = ranges.yMin > temp ? temp : ranges.yMin;
          ranges.yMax = ranges.yMax < temp ? temp : ranges.yMax;
          return [time, temp];
        })
        .sort(sortHighchartSeriesData);

      const tempDifferenceFactor = Number(
        (tempDifferenceSum / formattedRealTempData.length).toFixed(2)
      );
      ranges.yMin =
        ranges.yMin > tempDifferenceFactor ? tempDifferenceFactor : ranges.yMin;
      ranges.yMax =
        ranges.yMax < tempDifferenceFactor ? tempDifferenceFactor : ranges.yMax;
      const tempDifferenceFactorData = formattedRealTempData.map((data) => {
        return [data[0], tempDifferenceFactor];
      });

      const updatedTempChartOptions = buildUpdatedChartOptions(
        defaultTempChartOptions,
        [formattedSensorData, formattedRealTempData],
        ranges
      );
      const updatedTempDifferenceChartOptions = buildUpdatedChartOptions(
        defaultTempDifferenceFactorChartOptions,
        [tempDifferenceFactorData],
        ranges
      );
      optionsSetters[0](updatedTempChartOptions);
      optionsSetters[1](updatedTempDifferenceChartOptions);
      return [updatedTempChartOptions, updatedTempDifferenceChartOptions];
    }
  );
};

const DashboardBody: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tempChartRef = useRef<ChartRefType>(null);
  const tempDifferenceChartRef = useRef<ChartRefType>(null);
  const [tempChartOptions, setTempChartOptions] = useState<Highcharts.Options>({
    ...defaultChartOptions,
    ...defaultTempChartOptions,
  });
  const [
    tempDifferenceChartOptions,
    setTempDifferenceChartOptions,
  ] = useState<Highcharts.Options>({
    ...defaultChartOptions,
    ...defaultTempDifferenceFactorChartOptions,
  });
  useEffect(() => {
    const refs = [tempChartRef, tempDifferenceChartRef];
    const optionsSetters = [setTempChartOptions, setTempDifferenceChartOptions];
    REFS = refs;
    FetchAndBuildChartData(optionsSetters);
  }, []);
  useEffect(() => {
    const refs = [tempChartRef, tempDifferenceChartRef];
    ["mousemove", "touchmove", "touchstart"].forEach((eventType) => {
      containerRef.current?.addEventListener(
        eventType,
        debounce((e) => {
          let chart, event: PointerEventObject;
          const eCopy = e as MouseEvent | TouchEvent | PointerEvent;

          refs.forEach((ref) => {
            if (ref.current) {
              chart = ref.current.chart;
              if (chart) {
                event = chart.pointer.normalize(eCopy);
                const points: Highcharts.Point[] = [];
                chart.series.forEach((series) => {
                  const point = series.searchPoint(event, true);
                  if (point) {
                    points.push(point);
                  }
                });
                if (points.length > 0) {
                  points.forEach((point) => {
                    point.onMouseOver();
                  });
                  chart.tooltip.refresh(points);
                  chart.xAxis[0].drawCrosshair(e, points[0]);
                }
              }
            }
          });
        })
      );
    });
  });

  return (
    <div ref={containerRef}>
      <Chart options={tempChartOptions} innerRef={tempChartRef} />
      <Chart
        options={tempDifferenceChartOptions}
        innerRef={tempDifferenceChartRef}
      />
    </div>
  );
};

export default DashboardBody;
