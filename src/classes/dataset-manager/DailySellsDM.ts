import dayjs from 'dayjs'
import { DailySellsDB } from '../../types/types'
import datasetNames from '../../constants/datasetNames'
import DatasetManagerBase from './DatasetManagerBase'

export default class DailySellsDatasetManager extends DatasetManagerBase {
  public datasetList: DailySellsDB[]

  constructor() {
    super(datasetNames.DAILY_SELLS)
    this.datasetList = []
  }

  async requestAll() {
    this.datasetList = (await super.requestAll()).entries.map((item: any) => {
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

  // eslint-disable-next-line class-methods-use-this
  async add(data: DailySellsDB) {
    const payload = {
      purchase_date: dayjs(data.purchaseDate).format('DD/MM/YYYY'),
      event_date: dayjs(data.eventDate).format('DD/MM/YYYY'),
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
