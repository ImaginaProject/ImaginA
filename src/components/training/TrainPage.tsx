import {
  FunctionComponent,
  useState,
  useEffect,
} from 'react'

import {
  Space,
  Typography,
  Form,
  FormItemProps,
  InputNumber,
  Button,
  Card,
  Select,
  Skeleton,
  Divider,
  Tooltip,
} from 'antd'

import { useTranslate } from 'react-admin'
import { DeleteOutlined, DeleteRowOutlined, UndoOutlined } from '@ant-design/icons'

type DynamicForm = {
  key: number,
  deleted?: boolean,
  neuronsSizeProps: FormItemProps,
  activationFunctionTypeProps: FormItemProps,
}

export interface TrainPageProps {}

const TrainPage: FunctionComponent<TrainPageProps> = () => {
  const [dynamicForms, setDynamicForms] = useState<DynamicForm[]>([]);
  const [activationFunctions, setActivationFunctions] = useState<string[]>([]);

  const [form] = Form.useForm()
  const translate = useTranslate()

  const onAdd = () => {
    setDynamicForms((previous) => {
      let key = 0
      const last = previous[previous.length - 1]
      if (last) {
        key = last.key + 1
      }
      console.info('add new item with key:', key)
      return [
        ...previous,
        {
          key,
          neuronsSizeProps: {
            name: ['neurons', key],
            label: translate('imagina.training.train.neurons'),
          },
          activationFunctionTypeProps: {
            name: ['activationFunctions', key],
            label: translate('imagina.training.train.activation_function'),
          },
        },
      ]
    })
  }

  const onPreDeleteItem = (key: any) => {
    setDynamicForms((previous) => previous.map((item) => {
      const newItem = { ...item }
      if (newItem.key === key) {
        newItem.deleted = true
      }
      return newItem
    }))
  }

  const onRestoreDeleteItem = (key: any) => {
    setDynamicForms((previous) => previous.map((item) => {
      const newItem = { ...item }
      if (newItem.key === key) {
        newItem.deleted = false
      }
      return newItem
    }))
  }

  const onDeleteItem = (key: any) => {
    setDynamicForms((previous) => previous.filter((item) => item.key !== key))
  }

  const onFormFinish = (values: any) => {
    console.log(values)
    const prePayload = {
      inputSize: values.inputSize,
      neurons: [] as any[],
    }

    values.neurons.forEach((neuronSize: number, index: number) => {
      const activationFunction: string = values.activationFunctions[index]
      prePayload.neurons.push({
        neuronSize,
        activationFunction,
      })
    })

    console.log(prePayload)
  }

  useEffect(() => {
    setActivationFunctions([
      'relu',
    ])
  }, [])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Typography.Title>{translate('imagina.training.train.create_model')}</Typography.Title>

      <Form form={form} onFinish={onFormFinish}>
        <Form.Item
          name="inputSize"
          label={translate('imagina.training.train.input_size')}
          initialValue={1}
          rules={[
            { required: true, message: translate('imagina.form.error.required_input_size') },
          ]}
        >
          <InputNumber min={1} />
        </Form.Item>

        {dynamicForms.map((dynamic) => (
          <Card
            bordered
            key={dynamic.key}
            title={!dynamic.deleted ? (
              <Typography.Text strong>
                {`${translate('imagina.training.train.layer')} ${dynamic.key + 1}`}
              </Typography.Text>
            ) : (
              <>
                <Tooltip title={translate('imagina.general.delete')}>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onDeleteItem(dynamic.key)}
                  />
                </Tooltip>
                <Tooltip title={translate('imagina.general.restore')}>
                  <Button
                    type="primary"
                    size="small"
                    icon={<UndoOutlined />}
                    onClick={() => onRestoreDeleteItem(dynamic.key)}
                  />
                </Tooltip>
              </>
            )}
            actions={!dynamic.deleted ? [
              <Button
                danger
                icon={<DeleteRowOutlined />}
                onClick={() => onPreDeleteItem(dynamic.key)}
              >
                {translate('imagina.general.remove')}
              </Button>,
            ] : []}
          >
            {dynamic.deleted ? (
              <Skeleton paragraph={false} />
            ) : (
              <>
                <Form.Item
                  {...dynamic.neuronsSizeProps}
                  initialValue={1}
                  rules={[
                    { required: true, message: translate('imagina.form.error.required_neurons_size') },
                  ]}
                >
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item
                  {...dynamic.activationFunctionTypeProps}
                  initialValue={activationFunctions[0]}
                  rules={[
                    { required: true, message: translate('imagina.form.error.required_activation_function') },
                  ]}
                >
                  <Select
                    options={activationFunctions.map((item) => ({
                      label: item,
                      value: item,
                    }))}
                  />
                </Form.Item>
              </>
            )}
          </Card>
        ))}

        <Form.Item>
          <Button onClick={onAdd} type="ghost" size="large">
            {translate('imagina.general.add')}
          </Button>
        </Form.Item>

        <Divider />

        <Form.Item>
          <Button htmlType="submit" type="primary">
            {translate('imagina.general.submit')}
          </Button>
        </Form.Item>
      </Form>
    </Space>
  )
}

export default TrainPage
