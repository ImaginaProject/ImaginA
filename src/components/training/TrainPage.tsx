import {
  FunctionComponent,
  useState,
  useEffect,
} from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Space,
  Typography,
  Form,
  InputNumber,
  Button,
  Select,
  Divider,
  Input,
  Card,
  FormItemProps,
} from 'antd'
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons'

import { useTranslate } from 'react-admin'

import {
  NNSettings,
  ActivationFunction,
} from '../../types/train'
import TrainingManager from '../../classes/TrainingManager'
import modelGroupValues from '../../constants/modelGroup'

const modelTypes = [
  {
    label: 'Aforo diario',
    value: modelGroupValues.DAILY_CAPACITY,
  },
  {
    label: 'Ventas diarias',
    value: modelGroupValues.DAILY_SELLS,
  },
]

type DynamicField = {
  key: string,
  inputSizeProps: FormItemProps,
  activationFunctionProps: FormItemProps,
}

export interface TrainPageProps {}

const TrainPage: FunctionComponent<TrainPageProps> = () => {
  const [isPosting, setIsPosting] = useState(false);
  const [allActivationFunctions, setAllActivationFunctions] = useState<ActivationFunction[]>([]);

  const [fields, setFields] = useState<DynamicField[]>([]);

  const [tm] = useState(new TrainingManager())

  const navigate = useNavigate()
  const translate = useTranslate()
  const [form] = Form.useForm()

  const onAdd = () => {
    const nextIndex = fields.length + 1
    const key = `${nextIndex}`
    setFields([
      ...fields,
      {
        key,
        inputSizeProps: {
          name: ['neuronAmount', nextIndex],
          initialValue: 1,
          label: translate('imagina.training.train.neurons'),
        },
        activationFunctionProps: {
          name: ['activationFunction', nextIndex],
          initialValue: allActivationFunctions[0],
          label: translate('imagina.training.train.activation_function'),
        },
      },
    ])
  }

  const onDeleteItem = (key: any) => {
    setFields(fields.filter((field) => field.key !== key))
  }

  const onFormFinish = (values: any) => {
    console.log(values)

    const { modelGroup } = values
    if (!modelGroup) {
      // eslint-disable-next-line no-alert
      alert('Falta modelGroup')
      return
    }

    if (!values.neuronAmount || values.neuronAmount.length === 0) {
      // eslint-disable-next-line no-alert
      alert('Agregue al menos una capa')
      return
    }

    const prePayload: NNSettings = {
      modelName: values.modelName,
      modelDescription: values.modelDescription,
      inputSize: values.inputSize,
      layers: [] as any[],
    }

    prePayload.layers = values.neuronAmount.map((value: undefined | number, index: number) => {
      if (value !== undefined) {
        return {
          neuronAmount: value,
          activationFunction: values.activationFunction[index],
        }
      }
      return undefined
    }).filter((element: any) => !!element)

    console.log(modelGroup, prePayload)

    setIsPosting(true)
    tm.createModel(modelGroup, prePayload)
      .then((modelId) => {
        if (modelGroup === modelGroupValues.DAILY_CAPACITY) {
          navigate('/training/retraining', { state: { initialSelectedModelId: modelId } })
        } else if (modelGroup === modelGroupValues.DAILY_SELLS) {
          navigate('/daily-sells', { state: { initialSelectedModelId: modelId } })
        } else {
          console.warn('unknown model group:', modelGroup)
        }
      })
      .finally(() => setIsPosting(false))
  }

  useEffect(() => {
    setAllActivationFunctions(['relu'])
  }, [])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Typography.Title>{translate('imagina.training.train.create_model')}</Typography.Title>

      <Form form={form} onFinish={onFormFinish}>
        <Form.Item
          name="inputSize"
          label={translate('imagina.training.train.input_size')}
          rules={[
            { required: true, message: translate('imagina.form.error.required_input_size') },
          ]}
        >
          <InputNumber min={1} />
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

        {fields.map((field) => (
          <Card
            bordered
            key={field.key}
            title={`${translate('imagina.training.train.layer')} ${field.key}`}
            actions={[
              <Button danger icon={<DeleteOutlined />} onClick={() => onDeleteItem(field.key)} />,
            ]}
          >
            <Form.Item
              {...field.inputSizeProps}
              rules={[
                { required: true, message: translate('imagina.form.error.required_neurons_size') },
              ]}
            >
              <InputNumber />
            </Form.Item>
            <Form.Item
              {...field.activationFunctionProps}
              rules={[
                { required: true, message: translate('imagina.form.error.required_activation_function') },
              ]}
            >
              <Select
                options={allActivationFunctions.map((elem) => ({ label: elem, value: elem }))}
              />
            </Form.Item>
          </Card>
        ))}

        <Typography.Text strong>
          {translate('imagina.training.train.add_layer')}
        </Typography.Text>

        <Form.Item>
          <Button onClick={onAdd} type="ghost" size="large">
            {translate('imagina.general.add')}
          </Button>
        </Form.Item>

        <Divider />

        <Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            disabled={isPosting}
            icon={isPosting ? <LoadingOutlined /> : undefined}
          >
            {translate('imagina.general.submit')}
          </Button>
        </Form.Item>
      </Form>
    </Space>
  )
}

export default TrainPage
