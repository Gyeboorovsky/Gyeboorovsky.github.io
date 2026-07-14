import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <main className="wrap">
      <h1>{{TITLE}}</h1>
      <p>
        Fresh React scaffold. Edit <code>src/App.tsx</code> to get started.
      </p>
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count}×</button>
      <footer>
        <a href="/">← all apps</a>
      </footer>
    </main>
  );
}
