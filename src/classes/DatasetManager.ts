import dayjs from 'dayjs'
import { DailyCapacityDB } from '../types/types'

export default class DatasetManager {
  private endpoint: string

  public datasetList: DailyCapacityDB[]

  constructor() {
    this.endpoint = import.meta.env.VITE_APP_ENDPOINT
    this.datasetList = []
  }

  async requestAll() {
    const response = fetch(`${this.endpoint}/datasets/daily_capacities`)
    const data = await (await response).json()
    this.datasetList = data.entries.map((item: any) => {
      const processedData: DailyCapacityDB = {
        date: item.date,
        footfall: item.footfall,
        id: item.id,
        isHoliday: item.is_holiday,
        isVacation: item.is_vacation,
      }
      return processedData
    })
    return this.datasetList
  }

  async deleteById(id: string) {
    const response = await fetch(`${this.endpoint}/datasets/daily_capacities/${id}`, { method: 'DELETE' })
    const data = await response.json()
    if (response.status === 200) {
      console.debug('deleting process responses:', data)
      return data.success as boolean
    }

    console.warn('deleting process got status code:', response.status)
    return false
  }

  // eslint-disable-next-line class-methods-use-this
  async add(data: DailyCapacityDB) {
    const payload = {
      date: dayjs(data.date).format('DD/MM/YYYY'),
      is_holiday: data.isHoliday,
      is_vacation: data.isVacation,
      footfall: data.footfall,
    }
    const response = await fetch(`${this.endpoint}/datasets/daily_capacities`, {
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
