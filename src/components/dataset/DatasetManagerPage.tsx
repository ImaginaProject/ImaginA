import {
  FunctionComponent,
  useEffect,
  useState,
} from 'react'
import {
  Space,
  Typography,
  Button,
  Divider,
  Form,
  Input,
  Radio,
  List,
  Card,
  Tag,
  Tooltip,
} from 'antd'
import {
  DeleteOutlined,
} from '@ant-design/icons'
import { useTranslate } from 'react-admin'
import Uploader from '../utils/Uploader'
import DatasetManager from '../../classes/DatasetManager'
import { DatasetFile } from '../../types/types'

export interface DatasetManagerPageProps {}

const MimetypeToType = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/csv': 'csv',
}

const TypeToColor = {
  xlsx: 'magenta',
  csv: 'blue',
}

const DatasetManagerPage: FunctionComponent<DatasetManagerPageProps> = () => {
  const [dm] = useState(new DatasetManager())

  const [datasetFiles, setDatasetFiles] = useState<DatasetFile[]>([]);

  const [form] = Form.useForm()

  const translate = useTranslate()

  const onFormFinish = (values: any) => {
    console.log('values:', values)

    if ((values.fileList as any[]).length === 0) {
      console.error('no fileList found:', values)
      return
    }

    dm.add({
      name: values.name,
      resource: values.fileList[0].response.file,
      type: values.type,
      description: values.description,
    }).then(() => dm.requestAll().then(setDatasetFiles))
  }

  useEffect(() => {
    dm.requestAll().then(setDatasetFiles)
  }, [])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Typography.Title>
        {translate('imagina.dataset.manager.title')}
      </Typography.Title>
      <Typography.Text>
        {translate('imagina.dataset.manager.description')}
      </Typography.Text>

      <Form form={form} onFinish={onFormFinish}>
        <Form.Item
          name="name"
          label="Nombre del dataset"
          rules={[{ required: true, message: 'El nombre del dataset es requerido' }]}
        >
          <Input placeholder="Nombre del datasset" />
        </Form.Item>

        <Form.Item name="description" label="Descripción del dataset">
          <Input.TextArea placeholder="descripción del dataset (optional)" />
        </Form.Item>

        <Form.Item
          label="Tipo de archivo"
          name="type"
          rules={[{ required: true, message: 'El tipo de archivo es requerido' }]}
        >
          <Radio.Group>
            <Radio value="csv">CSV file</Radio>
            <Radio value="xlsx">XLSX file</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="fileList"
          label="Archivo del modelo"
          rules={[
            {
              required: true,
              message: 'Archivo requerido',
            },
          ]}
        >
          <Uploader
            name="file"
            label="Click para subir un modelo"
            enableType={Object.keys(MimetypeToType)}
          />
        </Form.Item>

        <Form.Item>
          <Button
            htmlType="submit"
          >
            Agregar modelo
          </Button>
        </Form.Item>
      </Form>

      <Divider />

      <List
        dataSource={datasetFiles}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card
              style={{ width: '100%' }}
              title={(
                <>
                  <Tag color={TypeToColor[item.type] || 'red'}>
                    {item.type}
                  </Tag>
                  {`Dataset "${item.name}"`}
                </>
              )}
              actions={[
                <Tooltip title="Eliminar">
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => { console.log('TODO: implement it') }}
                  />
                </Tooltip>,
              ]}
            >
              <p>
                {'Descripción: '}
                {item.description || '<sin descripción>'}
              </p>

              <p>
                {`Dataset de ${item.columnLength} columnas por ${item.rowLength} filas`}
              </p>

              <p>
                {'Tamaño: '}
                {item.fileSize}
                {' bytes'}
              </p>

              <p>
                {'Columnas: '}
                {item.columns.map((column) => <Tag key={column}>{column}</Tag>)}
              </p>

              <small>
                {`Creado el: ${item.date}`}
              </small>
            </Card>
          </List.Item>
        )}
      />
    </Space>
  )
}

export default DatasetManagerPage
