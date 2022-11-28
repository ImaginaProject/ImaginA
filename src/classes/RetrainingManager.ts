import fb from '../libs/firebase'
import {
  RetraindInfoInFirebaseSnapshots,
} from '../types/firebase'
import type { RetrainedInfo } from '../types/types'

// eslint-disable-next-line no-unused-vars
type SnapshotCallback = (ls: RetrainedInfo[]) => void

export default class RetrainingManager {
  private endpoint: string

  #unsubscribe: null | (() => void)

  constructor() {
    this.endpoint = import.meta.env.VITE_APP_ENDPOINT
    this.#unsubscribe = null
  }

  unsubscribe() {
    if (typeof this.#unsubscribe === 'function') {
      this.#unsubscribe()
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async active(cb?: SnapshotCallback) {
    const ref = fb.ref(fb.realtimeDB, '/retraining')

    this.#unsubscribe = fb.onValue(ref, (snapshot) => {
      const data: RetraindInfoInFirebaseSnapshots = snapshot.val()
      console.debug(data)
      if (cb) {
        const items = Object.entries(data).map(([key, value]) => {
          //
          const {
            done,
            end_date: endDate,
            epochs,
            name,
            start_date: startDate,
            status,
            target_epochs: targetEpochs,
          } = value
          const info: RetrainedInfo = {
            taskId: key,
            done,
            endDate,
            startDate,
            epochs,
            name,
            status,
            targetEpochs,
          }
          return info
        })
        cb(items)
      }
    })
  }

  async retrain(
    modelId: string,
    uploadFile: string,
    epochs: number,
    name: string,
    testSize: number,
    validationSplit: number,
  ) {
    // Create the payload
    const data = {
      model_id: modelId,
      md5_sum_with_ext: uploadFile,
      epochs,
      name,
      test_size: testSize,
      validation_split: validationSplit,
    }

    try {
      const response = await fetch(`${this.endpoint}/training/retraining`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const value = await response.json()
      console.log('retraining:', value)
    } catch (err) {
      console.error(err)
    }
  }
}
