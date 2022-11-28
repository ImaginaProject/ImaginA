import {
  FunctionComponent,
  Key,
  useState,
  useEffect,
} from 'react'
import dayjs from 'dayjs'
import {
  Space,
  Table,
  Upload,
  Button,
  Input,
  Alert,
  Divider,
  Tooltip,
} from 'antd'
import { UploadOutlined, SyncOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile } from 'antd/es/upload/interface'
import ToolDeleteModel from './ToolDeleteModel'
import Loading from '../loading/Loading'

type RegisteredModel = {
  name: string,
  description: string,
  last_date: string,
  path: string,
  md5_sum: string,
}

interface DataType extends RegisteredModel {
  key: Key,
  model: any,
}

export interface TrainedModelsPageTabProps {
  directory: string,
  title: string,
  actionURL: string,
}

const TrainedModelsPageTab: FunctionComponent<TrainedModelsPageTabProps> = (props) => {
  const {
    actionURL,
    directory,
    title,
  } = props

  const [allModels, setAllModels] = useState<RegisteredModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [dataSource, setDataSource] = useState<DataType[]>([])
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const [modelName, setModelName] = useState('')
  const [modelDescription, setModelDescription] = useState('')

  const [isErrorAlertShown, setIsErrorAlertShown] = useState(false)
  const [errorAlertMessage, setErrorAlertMessage] = useState('')
  const [errorFetchingError, setErrorFetchingError] = useState('')

  const requestAllModels = async () => {
    setIsLoading(true)
    // Request all the models
    try {
      const responseAllModels = await fetch(actionURL)
      const allModelsData = await responseAllModels.json()
      setAllModels(allModelsData.models as RegisteredModel[])
      setErrorFetchingError('')
    } catch (err) {
      console.error(err)
      setErrorFetchingError('Error de conexión: no se puede conectar a la API.')
    }
    // Finishs
    setIsLoading(false)
  }

  const columns: ColumnsType<DataType> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Última modificación',
      dataIndex: 'last_date',
      key: 'last_date',
    },
    {
      title: 'Opciones',
      dataIndex: 'model',
      key: 'model',
      render: (item: RegisteredModel) => (
        <ToolDeleteModel
          deleteURL={`${actionURL}/${item.md5_sum}`}
          onDelete={() => {
            requestAllModels()
          }}
        />
      ),
    },
  ]

  const showErrorAlert = (message: string) => {
    setErrorAlertMessage(message)
    setIsErrorAlertShown(true)
    setTimeout(() => setIsErrorAlertShown(false), 5000)
  }

  useEffect(() => {
    requestAllModels().then(() => {
      console.log(`render "${title}" (${directory})`)
    })
  }, [])

  useEffect(() => {
    setDataSource(allModels.map((model) => ({
      key: model.md5_sum,
      ...model,
      last_date: dayjs(model.last_date).format('DD/MM/YYYY'),
      model,
    })))
  }, [allModels])

  return (
    <Space style={{ width: '100%' }} direction="vertical">
      <Input
        placeholder="Model name"
        value={modelName}
        onChange={(e) => setModelName(e.target.value)}
      />
      <Input.TextArea
        placeholder="Model description (optional)"
        value={modelDescription}
        onChange={(e) => setModelDescription(e.target.value)}
      />
      <Upload
        disabled={!modelName.trim()}
        name="model_file"
        action={actionURL}
        method="POST"
        maxCount={1}
        fileList={fileList}
        showUploadList={{
          showRemoveIcon: true,
        }}
        onChange={(info) => {
          setFileList(info.fileList)
          if (info.file.status === 'done') {
            requestAllModels()
          }
        }}
        customRequest={async (request) => {
          const form = new FormData()
          const payload = {
            name: modelName,
            description: modelDescription,
          }
          form.append('model_info', JSON.stringify(payload))
          form.append(request.filename || 'model_file', request.file)

          try {
            if (request.onProgress) request.onProgress({ percent: 10 })
            const response = await fetch(
              request.action,
              {
                method: request.method,
                body: form,
                headers: { ...request.headers },
              },
            )

            if (request.onProgress) request.onProgress({ percent: 90 })
            const data = await response.json()
            if (request.onProgress) request.onProgress({ percent: 100 })

            if (response.status === 200) {
              if (request.onSuccess) request.onSuccess(data)
            } else {
              showErrorAlert(`No puede subir archivo. Error: ${data.app_exception}`)
            }
            setModelName('')
            setModelDescription('')
            setFileList([])
          } catch (e) {
            // TODO: check how to pass the error to `onError` because it spends
            //       a type `UploadRequestError` or `ProgressEvent<EventTarget>`
            if (request.onError) request.onError(e as any)
          }
        }}
      >
        <Button
          disabled={!modelName.trim()}
          icon={<UploadOutlined />}
        >
          Click para subir un modelo
        </Button>
      </Upload>
      <Divider />
      <Tooltip title="Recargar">
        <Button disabled={isLoading} onClick={requestAllModels}>
          <SyncOutlined />
        </Button>
      </Tooltip>
      {isErrorAlertShown && (
        <Alert message={errorAlertMessage} type="error" />
      )}
      {errorFetchingError && (
        <Alert closable message={errorFetchingError} type="error" />
      )}
      {isLoading ? (
        <Loading>Requesting all the models</Loading>
      ) : (
        <Table columns={columns} dataSource={dataSource} />
      )}
    </Space>
  )
}

export default TrainedModelsPageTab
