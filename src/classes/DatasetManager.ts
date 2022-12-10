import { DatasetFileDescription, DatasetFile } from '../types/types'

type DatasetFileResponse = {
  id: string
  name: string
  description?: string
  type: 'csv' | 'xlsx'
  columns: string[]
  column_length: number
  row_length: number
  file_size: number
  resource: string
  md5_sum: string
  date: Date
}

export default class DatasetManager {
  private endpoint: string

  public datasetList: DatasetFile[]

  constructor() {
    this.endpoint = import.meta.env.VITE_APP_ENDPOINT
    this.datasetList = []
  }

  async requestAll() {
    const response = fetch(`${this.endpoint}/datasets/files`)
    const data = await (await response).json()
    this.datasetList = data.list.map((item: DatasetFileResponse) => {
      const processedData: DatasetFile = {
        name: item.name,
        description: item.description,
        date: item.date,
        columnLength: item.column_length,
        columns: item.columns,
        fileSize: item.file_size,
        id: item.id,
        md5Sum: item.md5_sum,
        resource: item.resource,
        rowLength: item.row_length,
        type: item.type,
      }
      return processedData
    })
    return this.datasetList
  }

  // eslint-disable-next-line class-methods-use-this
  async add(data: DatasetFileDescription) {
    const payload = {
      name: data.name,
      description: data.description,
      md5_sum_with_ext: data.resource,
      type: data.type,
    }

    const response = await fetch(`${this.endpoint}/datasets/file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(payload),
    })

    const json: DatasetFileResponse = await response.json()
    if (response.status === 200) {
      console.debug('addding entry got json:', json)
    } else {
      console.warn('got status code:', response.status, json)
    }
  }
}
