import React, { CSSProperties } from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';

interface ILoadingProps {
  loading?: boolean;
  height?: string;
  text?: string;
}

export class Loading extends React.Component<ILoadingProps> {
  public render() {

    const styleBlur: CSSProperties = {
      filter: 'grayscale(100%) blur(3px)',
      WebkitFilter: 'grayscale(100%) blur(3px)',
      userSelect: 'none',
      display: 'flex',
      flexBasis: '100%',
      overflow: 'hide',
    }
    const styleSpinner: CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
      width: '100%',
      height: this.props.height || '100%',
    }
    const styleB: CSSProperties = {
      height: this.props.height || '100%',
      display: 'flex',
      flexDirection: 'column',
    }

    return (
      <>
        {this.props.loading && 
          <Spinner
            size={SpinnerSize.large}
            label={this.props.text || 'Обработка запроса...'}
            style={styleSpinner}
          />
        }
        <div style={this.props.loading ? {...styleB, ...styleBlur} : styleB}>
          {this.props.children}
        </div>
      </>
    );

  }
}
