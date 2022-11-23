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
    const response = fetch(`${this.endpoint}/datasets`)
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
  }

  async deleteById(id: string) {
    console.log('Request delete', id)
    return this
  }

  // eslint-disable-next-line class-methods-use-this
  async add(data: DailyCapacityDB) {
    const payload = {
      date: dayjs(data.date).format('DD/MM/YYYY'),
      is_holiday: data.isHoliday,
      is_vacation: data.isVacation,
      footfall: data.footfall,
    }
    await fetch(`${this.endpoint}/datasets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(payload),
    })
  }
}
