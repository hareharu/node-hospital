import 'whatwg-fetch';
import 'core-js/features/array';
import 'core-js/features/array/includes';
import 'core-js/features/object/assign';
import 'core-js/features/promise';
import 'core-js/features/string/starts-with';
import 'core-js/features/symbol';

import React from 'react';
import ReactDOM from 'react-dom';
import Client from './client';

ReactDOM.render(<Client/>, document.getElementById('whoapp'));
