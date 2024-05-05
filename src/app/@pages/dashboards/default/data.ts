import { ChartType } from './dashboard.model';

const supplierBarChart: ChartType = {
  chart: {
    height: 340,
    type: 'bar',
    stacked: true,
    toolbar: {
      show: false
    },
    zoom: {
      enabled: true
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '15%',
      endingShape: 'rounded'
    },
  },
  dataLabels: {
    enabled: false
  },
  series: [],
  xaxis: {
    categories: [],
  },
  colors: ['#556ee6', '#f1b44c', '#34c38f'],
  legend: {
    position: 'bottom',
  },
  fill: {
    opacity: 1
  },
};

const weeklyEarningChart: ChartType = {
  chart: {
    height: 200,
    type: 'radialBar',
    offsetY: -10
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      dataLabels: {
        name: {
          fontSize: '13px',
          color: undefined,
          offsetY: 60
        },
        value: {
          offsetY: 22,
          fontSize: '16px',
          color: undefined,
          formatter: (val) => {
            return val + '%';
          }
        }
      }
    }
  },
  colors: ['#556ee6'],
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      shadeIntensity: 0.15,
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 50, 65, 91]
    },
  },
  stroke: {
    dashArray: 4,
  },
  series: [100],
  labels: ['Ventas Totales'],
};

const monthlyEarningChart: ChartType = {
  chart: {
    height: 250,
    type: 'radialBar',
    offsetY: -10
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      dataLabels: {
        name: {
          fontSize: '13px',
          color: undefined,
          offsetY: 60
        },
        value: {
          offsetY: 22,
          fontSize: '16px',
          color: undefined,
          formatter: (val) => {
            return val + '%';
          }
        }
      }
    }
  },
  colors: ['#556ee6'],
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      shadeIntensity: 0.15,
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 50, 65, 91]
    },
  },
  stroke: {
    dashArray: 4,
  },
  series: [100],
  labels: ['Ventas Totales'],
};

export { supplierBarChart, weeklyEarningChart, monthlyEarningChart };
