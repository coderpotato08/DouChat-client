import React, { FC } from 'react';
import styled, { CSSProperties } from 'styled-components';

interface CIconProps {
  value: string;
  size: number;
  color?: string;
  style?: CSSProperties,
  onClick?: () => void,
};
const CIcon:FC<CIconProps> = (props: CIconProps) => {
  const { value, size, color } = props;
  const iconStyle: CSSProperties = {
    fontSize: `${size}px`,
    color: color || '#333',
    ...props.style,
  }
  const onHandleClick = () => {
    if(props.onClick) {
      props.onClick();
    }
  }
  return <CIconWrapper>
    <i onClick={onHandleClick} className={`iconfont ${value}`} style={iconStyle}/>
  </CIconWrapper>
}

export default React.memo(CIcon);

const CIconWrapper = styled.div`
  & {
    > i {

    }
  }
`

