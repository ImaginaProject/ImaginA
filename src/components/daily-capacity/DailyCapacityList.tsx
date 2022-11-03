import { FunctionComponent, useState, useEffect } from 'react'
import { ShowBase, useListContext } from 'react-admin'
import { Bar } from 'react-chartjs-2'
import { Space, DatePicker, Dropdown, Button, Menu } from 'antd'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'

import Loading from '../loading/Loading'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Load the plugins
dayjs.extend(weekday)
dayjs.extend(localeData)

// Register some stuffs that will be used to custom the graph
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export interface DailyCapacityListProps {}

const fakeProvidedPosibleTrainedModelList = [
  'Red entrenada 22 agosto',
  'Red entrenada 24 agosto',
  'Red entrenada 30 agosto',
  'Red entrenada 7 septiembre',
]

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
  const [startDate, setStartDate] = useState(dayjs(new Date()));
  const [endDate, setEndDate] = useState(dayjs(new Date()))

  const [posibleTrainedModelList, setPosibleTrainedModelList] = useState<string[]>([])

  useEffect(() => {
    // TODO: Request all the posible trained model's name
    setPosibleTrainedModelList(fakeProvidedPosibleTrainedModelList)
  }, [])

  const {
    data,
    isLoading,
  } = useListContext()

  const menu = (
    <Menu>
      {posibleTrainedModelList.map((name, index) => (
        <Menu.Item key={index}>{name}</Menu.Item>
      ))}
    </Menu>
  )

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
    <Space style={{padding: '2em', width: '100%'}} direction='vertical'>
      <Space
        align='baseline'
        style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Space>
          <DatePicker
            defaultValue={startDate as any}
            onChange={(value: any) => setStartDate(value)}
          />
          <DatePicker
            defaultValue={endDate as any}
            onChange={(value: any) => setEndDate(value)}
          />
        </Space>
        
        <Space>
          <Dropdown overlay={menu} placement='bottomLeft'>
            <Button type='primary'>Realizar predicción usando</Button>
          </Dropdown>
        </Space>
      </Space>
      <Bar options={options} data={barData} />
    </Space>
  )
}

export default DailyCapacityList
