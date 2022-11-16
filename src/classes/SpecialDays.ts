import type { Dayjs } from 'dayjs'
import { SpecialDay, SpecialDayResponse } from '../types/types'

export default class SpecialDays {
  private endpoint: string

  constructor() {
    this.endpoint = import.meta.env.VITE_APP_ENDPOINT
  }

  async getAll(): Promise<SpecialDay[]> {
    const response = await fetch(`${this.endpoint}/special-days/days`)
    const data: SpecialDayResponse = await response.json()
    return data.days.map((day) => {
      const {date, is_holiday: isHoliday, is_vacation: isVacation} = day
      return { date, isHoliday, isVacation } as SpecialDay
    })
  }

  async add(date: Dayjs, isHoliday: boolean, isVacation: boolean): Promise<boolean> {
    // Import the format, the date is DD/MM/YYYY and the flags should be boolean
    const newSpecialDay = {
      date: date.format('DD/MM/YYYY'),
      is_holiday: !!isHoliday,
      is_vacation: !!isVacation,
    }
    console.debug(JSON.stringify(newSpecialDay))

    const response = await fetch(`${this.endpoint}/special-days/days`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(newSpecialDay)
    })

    const data = await response.json()
    console.debug('add():', data)

    if (response.status == 200) {
      return data.success
    }

    console.error(data)
    return false
  }
}
