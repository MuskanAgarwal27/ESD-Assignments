// Lab day (AI required). This file ends up as the form described in CONTRACT.md §4.
import { useState } from "react";

const EMPTY = { code: "", title: "", department: "", credits: "", capacity: "", description: "" };

const FIELDS = [
  { name: "code", label: "Code", type: "text" },
  { name: "title", label: "Title", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "credits", label: "Credits", type: "number" },
  { name: "capacity", label: "Capacity", type: "number" },
  { name: "description", label: "Description", type: "textarea" },
];

export function AddCourseForm({ onAdd }) {
  const [values, setValues] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onAdd({
        code: values.code,
        title: values.title,
        department: values.department,
        credits: Number(values.credits),
        capacity: Number(values.capacity),
        description: values.description === "" ? null : values.description,
      });
      setValues(EMPTY);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  const fieldErrors = error?.fieldErrors ?? {};

  return (
    <form className="add-course" onSubmit={handleSubmit}>
      <h2>Add a course</h2>

      {FIELDS.map(({ name, label, type }) => {
        const id = `course-${name}`;
        const errorId = `${id}-error`;
        const fieldError = fieldErrors[name];
        const inputProps = {
          id,
          value: values[name],
          onChange: (e) => setValues({ ...values, [name]: e.target.value }),
          "aria-invalid": fieldError ? "true" : undefined,
          "aria-describedby": fieldError ? errorId : undefined,
        };

        return (
          <div className="field" key={name}>
            <label htmlFor={id}>{label}</label>
            {type === "textarea" ? <textarea {...inputProps} /> : <input type={type} {...inputProps} />}
            {fieldError && (
              <p id={errorId} className="field-error">
                {fieldError}
              </p>
            )}
          </div>
        );
      })}

      {error && (
        <p role="alert" className="form-error">
          {error.message}
        </p>
      )}
      <button type="submit" disabled={submitting}>
        Add course
      </button>
    </form>
  );
}
