import {
  FunctionComponent,
  useState,
  // useCallback,
} from 'react'

import {
  Upload,
  Button,
  notification,
} from 'antd'

import {
  LoadingOutlined,
  UploadOutlined,
} from '@ant-design/icons'

import type { UploadProps, UploadFile } from 'antd'

export interface UploaderProps {
  label: string,
  // eslint-disable-next-line no-unused-vars
  enableType?: string | string[] | ((mimetype: string) => boolean),
  // eslint-disable-next-line no-unused-vars
  enableExtension?: string |string[] | ((filename: string) => boolean),
  value?: UploadFile[],
  // eslint-disable-next-line no-unused-vars
  onChange?: (fileList: UploadFile[]) => void,
  // eslint-disable-next-line no-unused-vars
  onUploading?: (isUploading: boolean) => void,
}

const ENDPOINT = import.meta.env.VITE_APP_ENDPOINT

const Uploader: FunctionComponent<UploaderProps> = (props: UploaderProps) => {
  const {
    label,
    enableType,
    enableExtension,
    value,
    onChange,
    onUploading,
  } = props

  const [isUploading, setIsUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>(value || []);

  const handleUpload: UploadProps['onChange'] = (info) => {
    setIsUploading(info.file.status === 'uploading')
    if (onUploading) onUploading(info.file.status === 'uploading')
    const newUploadFiles = info.fileList.map((uploadedFile) => {
      console.debug('response:', uploadedFile.response)
      if (uploadedFile.response?.file) {
        // eslint-disable-next-line no-param-reassign
        uploadedFile.url = `${ENDPOINT}/upload/${uploadedFile.response.file}`
      }
      return uploadedFile
    })
    setUploadFiles(newUploadFiles)
    if (onChange) onChange(newUploadFiles)
  }

  const handleRemove: UploadProps['onRemove'] = (file) => {
    console.log('wanna remove', file)
    fetch(`${file.url}`, { method: 'DELETE' })
      .then((response) => response.json())
      .then((datajson) => console.log(datajson))
      .catch((err) => console.error(err))
  }

  const handleBeforeUpload: UploadProps['beforeUpload'] = (file, fileList) => {
    console.debug('will upload', file, fileList)
    // Check if this file type is inable
    let isEnable = true

    if (typeof enableType === 'function') {
      isEnable = enableType(file.type)
      console.debug('check type', file.type)
    } else if (Array.isArray(enableType)) {
      isEnable = enableType.includes(file.type)
      console.debug('check type', file.type, 'in', enableType)
    } else if (typeof enableType === 'string') {
      isEnable = file.type.length > 0 && enableType.toLowerCase() === file.type.toLowerCase()
      console.debug('check type', file.type, 'is equal to', enableType)
    }

    if (typeof enableExtension === 'function') {
      isEnable = enableExtension(file.name)
      console.debug('check extension', file.type)
    } else if (Array.isArray(enableExtension)) {
      isEnable = enableExtension.some(
        (extension) => file.name.endsWith(extension),
      )
      console.debug('check extension', file.type, 'in', enableExtension)
    } else if (typeof enableExtension === 'string') {
      isEnable = file.name.toLowerCase().endsWith(enableExtension.toLowerCase())
      console.debug('check extension', file.type, 'is equal to', enableExtension)
    }

    if (!isEnable) {
      console.error('File is not enable:', file)
      notification.error({
        message: 'Tipo de archivo no soportado',
        description: 'Ese tipo de archivo o extensión no está permitido',
      })
    }
    return isEnable || Upload.LIST_IGNORE
  }

  return (
    <Upload
      name="file"
      method="POST"
      action={`${ENDPOINT}/upload`}
      listType="text"
      maxCount={1}
      directory={false}
      fileList={uploadFiles}
      beforeUpload={handleBeforeUpload}
      onChange={handleUpload}
      onRemove={handleRemove}
    >
      <Button
        icon={isUploading ? <LoadingOutlined /> : <UploadOutlined />}
      >
        {label}
      </Button>
    </Upload>
  )
}

Uploader.defaultProps = {
  enableType: undefined,
  enableExtension: undefined,
  value: undefined,
  onChange: undefined,
  onUploading: undefined,
}

export default Uploader
