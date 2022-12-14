import dayjs, { Dayjs } from 'dayjs'
import modelGroupValues from '../constants/modelGroup'
import type {
  ExistentModel,
  PredictionResult,
  RegisteredModel,
  RegisteredModelResponse,
} from '../types/types'

const modelGroup = modelGroupValues.DAILY_CAPACITY

export default class DailyCapacity {
  public graphOptions: any

  public possibleTrainedModels: ExistentModel[]

  public lastPrediction: PredictionResult[]

  public allModels: RegisteredModel[]

  private endpoint: string

  constructor() {
    this.endpoint = import.meta.env.VITE_APP_ENDPOINT
    this.graphOptions = {
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
    this.possibleTrainedModels = []
    this.lastPrediction = []
    this.allModels = []
  }

  getGraphLabels() {
    const labels = this.lastPrediction.map((result) => {
      // Transform the date format
      const ddQmmm = dayjs(result.date, 'DD/MM/YYYY').format('DD MMM')
      return ddQmmm
    })
    console.debug('bar labels:', labels)

    return labels
  }

  get barData() {
    const labels = this.getGraphLabels()

    const realValue = this.lastPrediction.map((result) => result.capacity)
    const predictionValue = this.lastPrediction.map((result) => result.prediction)
    console.debug('real value:', realValue)
    console.debug('prediction value:', predictionValue)

    return {
      labels,
      datasets: [
        {
          label: 'real',
          data: realValue,
          backgroundColor: 'rgba(72, 129, 194, 0.7)',
        },
        {
          label: 'prediction',
          data: predictionValue,
          backgroundColor: 'rgba(219, 139, 59, 0.7)',
        },
      ],
    }
  }

  /**
   * Request all the models and register the possible trained model to list.
   * @returns All the models
   */
  async requestAllModels() {
    // Request all the models
    console.debug('loading all the model...')
    const responseAllModels = await fetch(
      `${this.endpoint}/models/${modelGroup}`,
    )
    const allModelsData: RegisteredModelResponse = await responseAllModels.json()
    console.debug('got', allModelsData.models.length, 'models')
    this.allModels = allModelsData.models

    // Register the possible trained models
    this.possibleTrainedModels = this.allModels.map((model) => {
      const dateString: string = dayjs(model.last_date).format('DD MMMM')
      const result: ExistentModel = {
        id: model.md5_sum,
        name: `modelo "${model.name}" entrenado ${dateString}`,
      }
      return result
    })

    // TODO: check what data is needed
    return allModelsData.models
  }

  async predicePersonAmount(startDate: Dayjs, endDate: Dayjs, modelId: string, price: number) {
    const startDateString = dayjs(startDate).format('DD/MM/YYYY')
    const endDateString = dayjs(endDate).format('DD/MM/YYYY')

    console.debug('request for date:', startDateString, 'to', endDateString)
    const response = await fetch(
      `${this.endpoint}/daily-capacity/person-amount?start_date=${startDateString}&end_date=${endDateString}&model_id=${modelId}&price=${price}`,
    )

    const data = await response.json()
    if (response.status === 200) {
      // Save the prediction data
      this.lastPrediction = data.capacities
      return data.capacities as PredictionResult[]
    }

    console.error(data)
    return null
  }

  async optimizePrices(day: Dayjs, minPrice: number, maxPrice: number, modelId: string) {
    const payload = {
      date: day.format('DD/MM/YYYY'),
      min_price: minPrice,
      max_price: maxPrice,
      model_id: modelId,
    }

    try {
      const response = await fetch(`${this.endpoint}/daily-capacity/optimize-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (response.status === 200) {
        return data.image as string
      }
      console.error('got status code', response.status, data)
    } catch (err) {
      console.error(err)
    }
    return null
  }
}
