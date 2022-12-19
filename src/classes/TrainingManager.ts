import { NNSettings } from '../types/train'

export default class TrainingManager {
  private endpoint: string

  constructor() {
    this.endpoint = import.meta.env.VITE_APP_ENDPOINT
  }

  async createModel(modelGroup: string, nnSettings: NNSettings) {
    const payload = {
      input_size: nnSettings.inputSize,
      layers: nnSettings.layers.map((layer) => ({
        activation_function: layer.activationFunction,
        neuron_amount: layer.neuronAmount,
      })),
      model_description: nnSettings.modelDescription,
      model_name: nnSettings.modelName,
    }

    const response = await fetch(`${this.endpoint}/training/create_model/${modelGroup}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    return data.model_id as string
  }
}
