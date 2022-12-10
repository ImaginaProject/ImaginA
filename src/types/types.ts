export type RegisteredModel = {
  name: string,
  description: string,
  last_date: string,
  path: string,
  md5_sum: string,
}

export type RegisteredModelResponse = { models: RegisteredModel[] }

export type ExistentModel = {
  name: string,
  id: string,
}

export type PredictionResult = {
  prediction: number,
  capacity: number,
  date: string,
}

export type SpecialDay = {
  date: Date,
  isHoliday: boolean,
  isVacation: boolean,
}

/**
 * NOTE: Don't use for other purpose that a fetch-response object. Please.
 * Use `SpecialDay` instead.
 */
export type SpecialDayResponse = {
  days: {
    date: Date,
    is_holiday: boolean,
    is_vacation: boolean,
  }[]
}

export type RetrainedInfo = {
  taskId: string,
  done: boolean,
  endDate: string,
  startDate: string,
  epochs: number,
  name: string,
  status: string,
  targetEpochs: number,
}

export type DatasetFileDescription = {
  name: string
  description?: string,
  type: 'csv' | 'xlsx',
  resource: string,
}

export type DatasetFile = {
  id: string
  name: string
  description?: string
  type: 'csv' | 'xlsx'
  columns: string[]
  columnLength: number
  rowLength: number
  fileSize: number
  resource: string
  md5Sum: string
  date: Date,
}
