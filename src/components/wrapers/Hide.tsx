import React from 'react';

interface IHideProps {
  condition: boolean;
}

export class Hide extends React.Component<IHideProps> {
  public render() {
    return this.props.condition ? <span/> : this.props.children;
  }
}
