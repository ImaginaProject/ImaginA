import { FunctionComponent } from 'react'
import { ShowBase, useListContext } from 'react-admin'
import Loading from '../loading/Loading'
import { Bar } from 'react-chartjs-2'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export interface DailyCapacityListProps {}

const options = {
  plugins: {
    legend: {
      position: 'right' as const,
    },
    title: {
      display: true,
      text: 'Daily capacities by days',
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: !true,
    },
  },
}

const DailyCapacityList: FunctionComponent<DailyCapacityListProps> = (props) => {
  const {
    data,
    isLoading,
  } = useListContext();

  const labels = [
    '12 enero', '13 enero', '14 enero', '15 enero', '16 enero', '17 enero',
    '18 enero', '19 enero', '20 enero', '21 enero', '22 enero', '23 enero',
  ]

  const barData = {
    labels,
    datasets: [
      {
        label: 'real',
        data: [10, 11, 9, 10, 10, 11, 15, 14, 16, 17, 17, 18],
        backgroundColor: 'rgba(72, 129, 194, 0.7)'
      },
      {
        label: 'prediction',
        data: [11, 10, 10, 10, 10, 10, 14, 15, 15, 17, 18, 17],
        backgroundColor: 'rgba(219, 139, 59, 0.7)'
      },
    ],
  }

  if (isLoading) return <Loading />

  return (
    <>
    <p>hola</p>
    <Bar options={options} data={barData} />
    </>
  )
}

export default DailyCapacityList
