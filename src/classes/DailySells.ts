import dayjs, { Dayjs } from 'dayjs'
import {
  ExistentModel,
  RegisteredModel,
  RegisteredModelResponse,
} from '../types/types'

const modelGroup = 'daily-sells'

export default class DailySells {
  private endpoint: string

  public allModels: RegisteredModel[]

  public possibleTrainedModels: ExistentModel[]

  constructor() {
    this.endpoint = import.meta.env.VITE_APP_ENDPOINT

    this.possibleTrainedModels = []
    this.allModels = []
  }

  /**
   * Request all the models and register the possible trained model to list.
   * @returns All the models
   */
  async requestAllModels() {
    // TODO: this method is the same of DailyCapacity service. Create a common
    //       parent class and implement this method, please
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

  async optimizePrices(
    modelId: string,
    pucharseDay: Dayjs,
    eventDay: Dayjs,
    ticketType: string,
    minPrice: number,
    maxPrice: number,
  ) {
    const payload = {
      model_id: modelId,
      purchase_date: pucharseDay.format('DD/MM/YYYY'),
      event_date: eventDay.format('DD/MM/YYYY'),
      ticket_type: ticketType,
      min_price: minPrice,
      max_price: maxPrice,
    }

    try {
      const response = await fetch(`${this.endpoint}/daily-sells/optimize-prices`, {
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
