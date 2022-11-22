import { DailyCapacityDB } from '../types/types'

export default class DatasetManager {
  private endpoint: string

  public datasetList: DailyCapacityDB[]

  constructor() {
    this.endpoint = import.meta.env.VITE_APP_ENDPOINT
    this.datasetList = []
  }

  async requestAll() {
    const response = fetch(`${this.endpoint}/daily-capacity/dataset`)
    const data = await (await response).json()
    this.datasetList = data.dataset
  }

  async deleteById(id: string) {
    console.log('Request delete', id)
    return this
  }
}
