import React from 'react';
import ReactDOM from 'react-dom';
import Client from './client';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Client/>, div);
  ReactDOM.unmountComponentAtNode(div);
});
