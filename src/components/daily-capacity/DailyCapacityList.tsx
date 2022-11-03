import { FunctionComponent, useState, useEffect, useMemo } from 'react'
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


type PredictionResult = {
  prediction: number,
  capacity: number,
  date: string,
}

export interface DailyCapacityListProps {}

// NOTE: temporally.
const fakeProvidedPosibleTrainedModelList = [
  'Red entrenada 22 agosto',
  'Red entrenada 24 agosto',
  'Red entrenada 30 agosto',
  'Red entrenada 7 septiembre',
]

const fakePredictionResult: PredictionResult[] = [
  { capacity: 10, prediction: 11, date: '12 enero'},
  { capacity: 11, prediction: 10, date: '13 enero'},
  { capacity: 9, prediction: 10, date: '14 enero'},
  { capacity: 10, prediction: 10, date: '15 enero'},
  { capacity: 10, prediction: 10, date: '16 enero'},
  { capacity: 11, prediction: 10, date: '17 enero'},
  { capacity: 15, prediction: 14, date: '18 enero'},
  { capacity: 14, prediction: 15, date: '19 enero'},
  { capacity: 16, prediction: 15, date: '20 enero'},
  { capacity: 17, prediction: 17, date: '21 enero'},
  { capacity: 17, prediction: 18, date: '22 enero'},
  { capacity: 18, prediction: 17, date: '23 enero'},
]

const graphOptions = {
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
  const [startDate, setStartDate] = useState(dayjs(new Date()))
  const [endDate, setEndDate] = useState(dayjs(new Date()))

  const [predictionResult, setPredictionResult] = useState<PredictionResult[]>([]);

  const [posibleTrainedModelList, setPosibleTrainedModelList] = useState<string[]>([])

  useEffect(() => {
    // TODO: Request all the posible trained model's name
    setPosibleTrainedModelList(fakeProvidedPosibleTrainedModelList)
    setPredictionResult(fakePredictionResult)
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

  const labels = useMemo(() => {
    return 
  }, [predictionResult])

  const barData = useMemo(() => {
    const labels = predictionResult.map((result) => dayjs(result.date, 'DD/MM/YYYY'))

    const realValue = predictionResult.map((result) => {
      return result.capacity
    })

    const predictionValue = predictionResult.map((result) => {
      return result.prediction
    })

    return {
      labels,
      datasets: [
      {
        label: 'real',
        data: realValue,
        backgroundColor: 'rgba(72, 129, 194, 0.7)'
      },
      {
        label: 'prediction',
        data: predictionValue,
        backgroundColor: 'rgba(219, 139, 59, 0.7)'
      },
      ]
    }
  }, [labels, predictionResult])

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
      <Bar options={graphOptions} data={barData} />
    </Space>
  )
}

export default DailyCapacityList
