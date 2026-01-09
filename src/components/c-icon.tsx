import React, { FC } from 'react';
import styled, { CSSProperties } from 'styled-components';

interface CIconProps {
  value: string;
  size: number;
  color?: string;
  style?: CSSProperties,
  onClick?: (event: any) => void,
};
const CIcon: FC<CIconProps> = (props: CIconProps) => {
  const { value, size, color } = props;
  const iconStyle: CSSProperties = {
    fontSize: `${size}px`,
    color: color || '#333',
    ...props.style,
  }
  const onHandleClick = (event: any) => {
    if (props.onClick) {
      props.onClick(event);
    }
  }
  return <CIconWrapper onClick={onHandleClick}>
    <i className={`iconfont ${value}`} style={iconStyle} />
  </CIconWrapper>
}

export default React.memo(CIcon);

const CIconWrapper = styled.div`
  & {
    > i {

    }
  }
`

