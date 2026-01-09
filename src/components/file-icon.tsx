import {
  FileExcelFilled,
  FileMarkdownFilled,
  FilePdfFilled,
  FilePptFilled,
  FileTextFilled,
  FileUnknownFilled,
  FileWordFilled,
  FileZipFilled,
} from '@ant-design/icons';
import type { FC, ReactNode } from 'react';

interface FileIconProps {
  mimeType: string,
}
export const FileIcon: FC<FileIconProps> = (props: FileIconProps) => {
  let IconCompRender: ReactNode = null;
  if (props.mimeType.indexOf('zip') > -1) {  // zip压缩文件
    IconCompRender = <FileZipFilled style={{ fontSize: "36px", color: "#bfc8d2" }} />
  } else if (props.mimeType.indexOf('vnd.openxmlformats-officedocument.spreadsheetml.sheet') > -1) { // xlsx文件
    IconCompRender = <FileExcelFilled style={{ fontSize: "36px", color: "#09a960" }} />
  } else if (props.mimeType.indexOf('pdf') > -1) { // pdf
    IconCompRender = <FilePdfFilled style={{ fontSize: "36px", color: "#e94748" }} />
  } else if (
    props.mimeType.indexOf('vnd.ms-powerpoint') > -1 ||
    props.mimeType.indexOf('vnd.openxmlformats-officedocument.presentationml.presentation') > -1
  ) { // ppt
    IconCompRender = <FilePptFilled style={{ fontSize: "36px", color: "#ee632e" }} />
  } else if (
    props.mimeType.indexOf('msword') > -1 ||
    props.mimeType.indexOf('vnd.openxmlformats-officedocument.wordprocessingml.document') > -1
  ) { // word
    IconCompRender = <FileWordFilled style={{ fontSize: "36px", color: "#4586f9" }} />
  } else if (props.mimeType.indexOf('text/plain') > -1) { // txt
    IconCompRender = <FileTextFilled style={{ fontSize: "36px", color: "#bfc8d2" }} />
  } else if (
    props.mimeType.indexOf('markdown') > -1 ||
    props.mimeType.indexOf('x-markdown') > -1
  ) { // md
    IconCompRender = <FileMarkdownFilled style={{ fontSize: "36px", color: "#aaa" }} />
  } else {
    IconCompRender = <FileUnknownFilled style={{ fontSize: "36px", color: "#bfc8d2" }} />
  }
  return (<>
    {IconCompRender}
  </>)
}
