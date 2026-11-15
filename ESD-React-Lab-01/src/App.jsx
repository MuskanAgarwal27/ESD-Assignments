// The whole app: App → Header, Matrix → Cell, Stats.
// App owns the numbers. Matrix and Stats only receive them as props.
import { useEffect, useState } from "react";
import Header from "./Header.jsx";
import Matrix from "./Matrix.jsx";
import Stats from "./Stats.jsx";
import { START, incrementAt, decrementAt, zeros } from "./matrix.js";

export default function App() {
  // Section 07: hold the matrix in state, starting from START, and render
  //             <Matrix matrix={…} /> under the header.
  // Section 08: write increment(row, col): it calls the setter with incrementAt.
  //             Pass it down to Matrix as onIncrement.
  // Section 09: render <Stats matrix={…} /> NEXT TO the matrix, not inside it.
  // Section 11: load /matrix.json once, in a useEffect, and put it in the state.
  const [matrix, setMatrix] = useState(START);
  const [step, setStep] = useState(1);

  // The [] means: run this once, after the first render, and never again.
  useEffect(() => {
    fetch("/matrix.json")
      .then((response) => response.json())
      .then((data) => setMatrix(data));
  }, []);

  function increment(row, col) {
    setMatrix((current) => incrementAt(current, row, col, step));
  }

  function reset() {
    setMatrix((current) => zeros(current));
  }

  return (
    <main className="app">
      <Header />
      <div className="board">
        <Matrix matrix={matrix} onIncrement={increment} />
        <Stats matrix={matrix} />
      </div>
      <div className="controls">
        <label>
          Step{" "}
          <input
            type="number"
            value={step}
            onChange={(event) => setStep(Number(event.target.value))}
          />
        </label>
        <button onClick={reset}>Reset</button>
      </div>
    </main>
  );
}
