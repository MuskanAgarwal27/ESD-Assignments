// Section 06 — the grid: a Matrix made of Cells.
//
// Props:  matrix        an array of rows, each an array of numbers (any size — don't assume 3)
//         onIncrement   a function: onIncrement(row, col)   (you need it in section 08)
//
// Render:
//   <table className="matrix">
//     <tbody>
//       one <tr> per row
//         one <td> per value, with a <Cell> inside it
//
// Lists need a key on the element you return from map — section 06 says which.
// Section 08: each Cell's onClick calls onIncrement with THAT cell's row and column.
import Cell from "./Cell.jsx";
import { stats } from "./matrix.js";

export default function Matrix({ matrix, onIncrement }) {
  // The biggest number is worked out here on every render, never stored.
  const { max } = stats(matrix);

  // The cells have no id of their own and never move, so the position is the key.
  return (
    <table className="matrix">
      <tbody>
        {matrix.map((rowValues, row) => (
          <tr key={row}>
            {rowValues.map((value, col) => (
              <td key={col}>
                <Cell
                  row={row}
                  col={col}
                  value={value}
                  isMax={max > 0 && value === max}
                  onClick={() => onIncrement(row, col)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
