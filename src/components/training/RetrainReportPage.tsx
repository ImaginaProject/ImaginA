import {
  FunctionComponent,
  useState,
  useEffect,
} from 'react'
import {
  Space,
  Select,
  Typography,
  Image,
  Alert,
} from 'antd'
import DailyCapacity from '../../classes/DailyCapacity'

type AvailableModelID = {
  label: string,
  value: string,
}

type ReportPlot = {
  type: string,
  base64Image: string,
}

export interface RetrainReportPageProps {}

const RetrainReportPage: FunctionComponent<RetrainReportPageProps> = () => {
  const [dc] = useState(new DailyCapacity())
  const [selectedModelID, setSelectedModelID] = useState<AvailableModelID | null>(null)
  const [availableModelIDs, setAvailableModelIDs] = useState<AvailableModelID[]>([])
  const [reportPlots, setReportPlots] = useState<ReportPlot[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const onSelectedChange = (value: string, option: AvailableModelID | AvailableModelID[]) => {
    if (Array.isArray(option)) {
      setSelectedModelID(option[0])
    } else {
      setSelectedModelID(option)
    }
    setReportPlots([])
  }

  useEffect(() => {
    setIsLoadingModels(true)
    dc.requestAllModels().then((registeredModels) => {
      const options = registeredModels.map((modelInfo) => (
        {
          label: modelInfo.name,
          value: modelInfo.md5_sum,
        }
      ))
      setAvailableModelIDs(options)
    }).finally(() => setIsLoadingModels(false))
  }, [])

  useEffect(() => {
    if (!selectedModelID) return

    const modelId = selectedModelID.value
    const url = `${import.meta.env.VITE_APP_ENDPOINT}/reports/model`

    setIsLoadingModels(true)
    fetch(`${url}?model_id=${modelId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        if (data.app_exception) {
          setErrorMessage(`Error obtenido: ${data.app_exception}`)
        } else {
          setErrorMessage('')
          setReportPlots(data.plots.map((plot: any) => ({
            type: plot.type,
            base64Image: plot.resource,
          })))
        }
      }).finally(() => setIsLoadingModels(false))
  }, [selectedModelID])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Space direction="vertical">
        <Typography.Text>
          Seleccione un modelo para mostrar sus reportes.
        </Typography.Text>
        {selectedModelID && (
          <Typography.Text>
            Modelo seleccionado:
            {' '}
            {selectedModelID.label}
          </Typography.Text>
        )}
        <Select
          style={{ width: '100%' }}
          placeholder="Modelos disponible seleccionado"
          options={availableModelIDs}
          loading={isLoadingModels}
          onChange={onSelectedChange}
          value={selectedModelID?.value}
        />
      </Space>

      <Space direction="vertical">
        {`Encontrada(s) ${reportPlots.length} gráfica(s)`}
        {errorMessage && (
          <Alert closable type="error" message={errorMessage} />
        )}
        {reportPlots.map((reportPlot) => (
          <>
            <Typography.Text>
              Grafica para
              <Typography.Text strong>
                {` ${reportPlot.type}`}
              </Typography.Text>
            </Typography.Text>
            <Image
              width="100%"
              src={reportPlot.base64Image}
            />
          </>
        ))}
      </Space>
    </Space>
  )
}

export default RetrainReportPage