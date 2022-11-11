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
