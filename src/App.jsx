import React, { useState } from 'react';

import parse from './parse';

const App = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');

  return (
    <div>
      <textarea
        value={text}
        onChange={async (event) => {
          setText(event.target.value);
          setResult(JSON.stringify(await parse(event.target.value), null, 4));
        }}
      />

      <pre>
        {result}
      </pre>
    </div>
  );
};

export default App;
