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
        purchase: {
          date: item.purchase.date,
          isHoliday: item.purchase.is_holiday,
          isVacation: item.purchase.is_vacation,
        },
        event: {
          date: item.event.date,
          isHoliday: item.event.is_holiday,
          isVacation: item.event.is_vacation,
        },
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
      purchase: {
        date: dayjs(data.purchase.date).format('DD/MM/YYYY'),
        is_holiday: data.purchase.isHoliday,
        is_vacation: data.purchase.isVacation,
      },
      event: {
        date: dayjs(data.event.date).format('DD/MM/YYYY'),
        is_holiday: data.event.isHoliday,
        is_vacation: data.event.isVacation,
      },
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
