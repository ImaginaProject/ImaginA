import dayjs from 'dayjs'
import datasetNames from '../../constants/datasetNames'
import { DailyCapacityDB } from '../../types/types'
import DatasetManagerBase from './DatasetManagerBase'

export default class DailyCapacityDatasetManager extends DatasetManagerBase {
  public datasetList: DailyCapacityDB[]

  constructor() {
    super(datasetNames.DAILY_CAPACITIES)
    this.datasetList = []
  }

  async requestAll() {
    this.datasetList = (await super.requestAll()).entries.map((item: any) => {
      const processedData: DailyCapacityDB = {
        date: item.date,
        footfall: item.footfall,
        id: item.id,
        isHoliday: item.is_holiday,
        isVacation: item.is_vacation,
        price: item.price,
      }
      return processedData
    })
    return this.datasetList
  }

  // eslint-disable-next-line class-methods-use-this
  async add(data: DailyCapacityDB) {
    const payload = {
      date: dayjs(data.date).format('DD/MM/YYYY'),
      is_holiday: data.isHoliday,
      is_vacation: data.isVacation,
      footfall: data.footfall,
      price: data.price,
    }
    const success = super.postSimple(payload)
    if (!success) {
      console.warn(data)
    }
    return success
  }
}
