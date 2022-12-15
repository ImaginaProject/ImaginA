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
  Form,
} from 'antd'
import { useTranslate } from 'react-admin'
import { UploadOutlined, SyncOutlined, LoadingOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile } from 'antd/es/upload/interface'
import type { UploadProps } from 'antd'
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
  actionURL: string,
}

const ENDPOINT = import.meta.env.VITE_APP_ENDPOINT
const ENABLE_TYPE = [
  'application/x-hdf',
]

const TrainedModelsPageTab: FunctionComponent<TrainedModelsPageTabProps> = (props) => {
  const {
    actionURL,
    directory,
  } = props

  const [allModels, setAllModels] = useState<RegisteredModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [dataSource, setDataSource] = useState<DataType[]>([])

  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);

  const [errorAlertMessage, setErrorAlertMessage] = useState('')
  const [errorFetchingError, setErrorFetchingError] = useState('')

  const [form] = Form.useForm()
  const translate = useTranslate()

  const showErrorAlert = (message: string) => {
    setErrorAlertMessage(message)
    setTimeout(() => setErrorAlertMessage(''), 5000)
  }

  const requestAllModels = async () => {
    setIsLoading(true)
    // Request all the models
    try {
      const responseAllModels = await fetch(actionURL)
      const allModelsData = await responseAllModels.json()
      console.debug('allModelsData', allModelsData)
      setAllModels(allModelsData.models as RegisteredModel[] || [])
      setErrorFetchingError('')
    } catch (err) {
      console.error(err)
      setErrorFetchingError(translate('imagina.error.api_network'))
    }
    // Finishs
    setIsLoading(false)
  }

  const handleUpload: UploadProps['onChange'] = (info) => {
    setIsUploading(info.file.status === 'uploading')
    const newUploadFiles = info.fileList.map((uploadedFile) => {
      console.debug('response:', uploadedFile.response)
      if (uploadedFile.response?.file) {
        // eslint-disable-next-line no-param-reassign
        uploadedFile.url = `${ENDPOINT}/upload/${uploadedFile.response.file}`
      }
      return uploadedFile
    })
    setUploadFiles(newUploadFiles)
  }

  const handleRemove: UploadProps['onRemove'] = (file) => {
    console.log('wanna remove', file)
    fetch(`${file.url}`, { method: 'DELETE' })
      .then((response) => response.json())
      .then((value) => console.log(value))
      .catch((err) => console.error(err))
  }

  const onFormFinish = (values: any) => {
    console.log('form:', values)
    const fileList = values?.fileList as any[] || []
    if (fileList.length === 0) {
      // eslint-disable-next-line no-alert
      alert('No hay archivo que subir')
      return
    }

    setIsSubmiting(true)

    const file = fileList[0]
    console.log(file)

    const payload = {
      md5_sum_with_ext: file.response.file,
      name: values.name,
      description: values.description || '',
    }
    console.debug('payload', payload)

    fetch(actionURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then((response) => response.json())
      .then((data) => {
        if (data.app_exception) {
          showErrorAlert(`${translate('imagina.error.got')}: ${data.app_exception}`)
        } else {
          console.log(data)
          requestAllModels().catch((err) => console.error(err))
        }
      }).catch((err) => console.error(err))
      .finally(() => setIsSubmiting(false))
  }

  const columns: ColumnsType<DataType> = [
    {
      title: translate('imagina.general.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: translate('imagina.general.description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: translate('imagina.training.upload_model.last_modification'),
      dataIndex: 'last_date',
      key: 'last_date',
    },
    {
      title: translate('imagina.general.options'),
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

  useEffect(() => {
    requestAllModels().then(() => {
      console.log(`render (${directory})`)
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
      <Form form={form} onFinish={onFormFinish}>
        <Form.Item
          name="name"
          label={translate('imagina.training.upload_model.model_name')}
          rules={[{ required: true, message: translate('imagina.form.error.required_name') }]}
        >
          <Input placeholder={translate('imagina.general.model')} />
        </Form.Item>

        <Form.Item
          name="description"
          label={translate('imagina.training.upload_model.model_description')}
        >
          <Input.TextArea placeholder={translate('imagina.general.description')} />
        </Form.Item>

        <Form.Item
          name="fileList"
          label={translate('imagina.training.upload_model.model_file')}
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) {
              return e
            }
            return e?.fileList || []
          }}
          rules={[
            {
              required: true,
              message: translate('imagina.form.error.required_file'),
            },
          ]}
        >
          <Upload
            name="file"
            action={`${ENDPOINT}/upload`}
            listType="text"
            maxCount={1}
            beforeUpload={(file, fileList) => {
              console.debug('will upload', file, fileList)
              const isEnable = file.type ? ENABLE_TYPE.includes(file.type) : file.name.toLowerCase().endsWith('.h5')
              if (!isEnable) {
                console.error('File is not enable:', file)
                showErrorAlert(translate('imagina.form.error.bad_file_type'))
              }
              return isEnable || Upload.LIST_IGNORE
            }}
            onChange={handleUpload}
            directory={false}
            fileList={uploadFiles}
            method="POST"
            onRemove={handleRemove}
          >
            <Button icon={isUploading ? <LoadingOutlined /> : <UploadOutlined />}>
              {translate('imagina.training.upload_model.click_to_upload')}
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button
            htmlType="submit"
            disabled={isUploading}
            icon={isSubmiting ? <LoadingOutlined /> : undefined}
          >
            {translate('imagina.training.upload_model.add_model')}
          </Button>
        </Form.Item>
      </Form>

      <Divider />
      <Tooltip title="Recargar">
        <Button disabled={isLoading} onClick={requestAllModels}>
          <SyncOutlined />
        </Button>
      </Tooltip>
      {errorAlertMessage && (
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
