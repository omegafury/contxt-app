import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { RefObject } from "react";

export type ChartRefType = {
  chart: Highcharts.Chart;
  container: RefObject<HTMLDivElement>;
};
type ChartProps = {
  options: Highcharts.Options;
  innerRef?: React.RefObject<ChartRefType>;
};
Highcharts.Pointer.prototype.reset = () => undefined;

const Chart: React.FC<ChartProps> = ({ options, innerRef }) => {
  return (
    <HighchartsReact highcharts={Highcharts} options={options} ref={innerRef} />
  );
};

export default Chart;
