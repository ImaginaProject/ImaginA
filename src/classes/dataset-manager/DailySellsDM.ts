import dayjs from 'dayjs'
import { DailySellsDB } from '../../types/types'

export default class DatasetManager {
  private datasetName: string

  private endpoint: string

  public datasetList: DailySellsDB[]

  constructor() {
    this.endpoint = import.meta.env.VITE_APP_ENDPOINT
    this.datasetName = 'daily-sells'
    this.datasetList = []
  }

  async requestAll() {
    const response = fetch(`${this.endpoint}/datasets/${this.datasetName}`)
    const data = await (await response).json()
    this.datasetList = data.entries.map((item: any) => {
      const processedData: DailySellsDB = {
        id: item.id,
        footfall: item.footfall,
        price: item.price,
        purchaseDate: item.purchaseDate,
        eventDate: item.eventDate,
      }
      return processedData
    })
    return this.datasetList
  }

  async deleteById(id: string) {
    const response = await fetch(`${this.endpoint}/datasets/${this.datasetName}/${id}`, { method: 'DELETE' })
    const data = await response.json()
    if (response.status === 200) {
      console.debug('deleting process responses:', data)
      return data.success as boolean
    }

    console.warn('deleting process got status code:', response.status)
    return false
  }

  // eslint-disable-next-line class-methods-use-this
  async add(data: DailySellsDB) {
    const payload = {
      purchase_date: dayjs(data.purchaseDate).format('DD/MM/YYYY'),
      event_date: dayjs(data.eventDate).format('DD/MM/YYYY'),
      footfall: data.footfall,
      price: data.price,
    }
    const response = await fetch(`${this.endpoint}/datasets/${this.datasetName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(payload),
    })
    const json = await response.json()
    if (response.status === 200) {
      console.debug('addding entry got json:', json)
      return json.success as boolean
    }

    console.warn('got status code:', response.status, data)
    return false
  }
}
