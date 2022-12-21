export default class DatasetManagerBase {
  protected datasetName: string

  protected endpoint: string

  constructor(datasetName: string) {
    this.endpoint = import.meta.env.VITE_APP_ENDPOINT
    this.datasetName = datasetName
  }

  async requestAll() {
    const response = fetch(`${this.endpoint}/datasets/${this.datasetName}`)
    const data = await (await response).json()
    return data
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

  async postSimple(payload: object) {
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

    console.warn('got status code:', response.status)
    return false
  }

  async addFromUploadedFile(fileReference: string) {
    const payload = {
      md5_sum_with_ext: fileReference,
    }

    const response = await fetch(`${this.endpoint}/datasets/${this.datasetName}/file`, {
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

    console.error(json)
    if (json.app_exception === 'MismatchedDataset') {
      const missings = ((json.context.missing as []) || []).join(', ')
      // TODO: use translate strings
      throw new Error(`Mismatched dataset - missing columns: ${missings}`)
    } else {
      throw new Error(`Error: ${json.app_exception}`)
    }
  }
}
