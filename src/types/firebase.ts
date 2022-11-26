export type RetraindInfoInFirebase = {
  done: boolean
  end_date: string
  start_date: string
  epochs: number
  name: string
  status: string
  target_epochs: number
}

export type RetraindInfoInFirebaseSnapshots = {
  [key: string]: RetraindInfoInFirebase,
}
