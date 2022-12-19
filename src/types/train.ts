export type ActivationFunction = 'relu' | 'softmax'

export type LayerSettings = {
  activationFunction: ActivationFunction,
  neuronAmount: number,
}

export type NNSettings = {
  modelName: string,
  modelDescription: string,
  inputSize: number,
  layers: LayerSettings[]
}
