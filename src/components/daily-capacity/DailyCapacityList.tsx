import { FunctionComponent } from 'react'
import { ShowBase, useListContext } from 'react-admin'
import Loading from '../loading/Loading';

export interface DailyCapacityListProps {}

const DailyCapacityList: FunctionComponent<DailyCapacityListProps> = (props) => {
  const {
    data,
    isLoading,
  } = useListContext();

  if (isLoading) return <Loading />

  return (
    <p>hola</p>
  )
}

export default DailyCapacityList
