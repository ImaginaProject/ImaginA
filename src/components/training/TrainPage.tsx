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
  Input,
} from 'antd'

import { useTranslate } from 'react-admin'
import { DeleteOutlined, DeleteRowOutlined, UndoOutlined } from '@ant-design/icons'

type DynamicForm = {
  key: number,
  deleted?: boolean,
  neuronsSizeProps: FormItemProps,
  activationFunctionTypeProps: FormItemProps,
}

type ActivationFunction = 'relu'

type NNSettings = {
  input: {
    size: number,
  },
  layers: {
    activationFunction: ActivationFunction,
    neuronAmount: number,
  }[]
}

const modelTypes = [
  {
    label: 'Aforo diario',
    value: 'daily-capacity',
  },
  {
    label: 'Ventas diarias',
    value: 'daily-sells',
  },
]

export interface TrainPageProps {}

const TrainPage: FunctionComponent<TrainPageProps> = () => {
  const [dynamicForms, setDynamicForms] = useState<DynamicForm[]>([]);
  const [
    possibleActivationFunctions,
    setPossibleActivationFunctions,
  ] = useState<ActivationFunction[]>([]);
  const [nnSettings, setNnSettings] = useState<NNSettings>({
    input: { size: 1 },
    layers: [],
  });

  const [form] = Form.useForm()
  const translate = useTranslate()

  const onAdd = () => {
    setNnSettings((previous) => ({
      input: previous.input,
      layers: [
        ...previous.layers,
        {
          activationFunction: possibleActivationFunctions[0],
          neuronAmount: 1,
        },
      ],
    }))
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
    setNnSettings((previous) => ({
      ...previous,
      layers: previous.layers.filter((item, index) => index !== key),
    }))
  }

  const onFormFinish = (values: any) => {
    console.log(values)
    const prePayload = {
      inputSize: values.inputSize,
      neurons: [] as any[],
    }

    const neurons = (values.neurons as any[]) || []

    if (neurons.length === 0) {
      // eslint-disable-next-line no-alert
      alert('Agregue al menos una capa')
      return
    }

    neurons.forEach((neuronSize: number, index: number) => {
      const activationFunction: string = values.activationFunctions[index]
      prePayload.neurons.push({
        neuronSize,
        activationFunction,
      })
    })

    console.log(prePayload)
  }

  useEffect(() => {
    // Simulate fetching from API
    setPossibleActivationFunctions(['relu'])
    setNnSettings({ ...nnSettings })
  }, [])

  useEffect(() => {
    // We need all the unique activation functions
    const allActivationFunctions = nnSettings.layers.map((layer) => layer.activationFunction)
    console.log(allActivationFunctions)
    setPossibleActivationFunctions((previous) => {
      allActivationFunctions.push(...previous)
      const allItem = allActivationFunctions
        .filter((item, index) => allActivationFunctions.indexOf(item) === index)
      return allItem
    })

    // Update the list that allows create FormItem components
    setDynamicForms(nnSettings.layers.map((layer, index) => ({
      key: index,
      neuronsSizeProps: {
        name: ['neurons', index],
        label: translate('imagina.training.train.neurons'),
        initialValue: layer.neuronAmount,
      },
      activationFunctionTypeProps: {
        name: ['activationFunctions', index],
        label: translate('imagina.training.train.activation_function'),
        initialValue: layer.activationFunction,
      },
    })))
  }, [nnSettings])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Typography.Title>{translate('imagina.training.train.create_model')}</Typography.Title>

      <Form form={form} onFinish={onFormFinish}>
        <Form.Item
          name="inputSize"
          label={translate('imagina.training.train.input_size')}
          initialValue={nnSettings.input.size}
          rules={[
            { required: true, message: translate('imagina.form.error.required_input_size') },
          ]}
        >
          <InputNumber
            min={1}
            value={nnSettings.input.size}
            onChange={(value) => {
              if (value) {
                setNnSettings((previous) => ({
                  ...previous,
                  input: { ...previous.input, size: value },
                }))
              }
            }}
          />
        </Form.Item>

        <Form.Item
          name="modelName"
          label={translate('imagina.training.train.model_name')}
          rules={[
            { required: true, message: translate('imagina.form.error.required_model_name') },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="modelDescription"
          label={translate('imagina.training.train.model_description')}
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          name="modelGroup"
          label={translate('imagina.training.train.model_group')}
          rules={[
            { required: true, message: translate('imagina.form.error.required_model_group') },
          ]}
        >
          <Select options={modelTypes} />
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
                  rules={[
                    { required: true, message: translate('imagina.form.error.required_neurons_size') },
                  ]}
                >
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item
                  {...dynamic.activationFunctionTypeProps}
                  rules={[
                    { required: true, message: translate('imagina.form.error.required_activation_function') },
                  ]}
                >
                  <Select
                    options={possibleActivationFunctions.map((item) => ({
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
