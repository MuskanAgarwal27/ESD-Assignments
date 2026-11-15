// Section 05 — State as a state machine

export const initialState = Object.freeze({
  status: "idle",
  courses: [],
  error: null,
  departments: [],
  department: "",
  query: "",
  planner: [],
  grades: {},
});

export function transition(state, event) {
  switch (event.type) {
    case "LOAD_START":
      return {
        ...state,
        status: "loading",
        error: null,
      };

    case "LOAD_OK": {
      const departments = state.departments.length
        ? state.departments
        : [...new Set(event.courses.map(c => c.department))].sort();

      return {
        ...state,
        status: "ready",
        courses: event.courses,
        error: null,
        departments,
      };
    }

    case "LOAD_FAIL":
      return {
        ...state,
        status: "error",
        error: event.message,
      };

    case "SET_DEPARTMENT":
      if (state.department === event.department) return state;

      return {
        ...state,
        department: event.department,
      };

    case "SET_QUERY":
      if (state.query === event.query) return state;

      return {
        ...state,
        query: event.query,
      };

    case "ADD": {
      const course = event.course;

      // Refuse a course that has no remaining seats.
      if (course.seatsLeft <= 0) return state;

      // Refuse duplicate courses.
      if (state.planner.some(c => c.id === course.id)) {
        return state;
      }

      // Refuse if adding this course exceeds 24 credits.
      const currentCredits = state.planner.reduce(
        (total, c) => total + c.credits,
        0
      );

      if (currentCredits + course.credits > 24) {
        return state;
      }

      const { id, code, title, credits } = course;

      return {
        ...state,
        planner: [...state.planner, { id, code, title, credits }],
      };
    }

    case "REMOVE": {
      if (!state.planner.some(c => c.id === event.id)) {
        return state;
      }

      const grades = { ...state.grades };
      delete grades[event.id];

      return {
        ...state,
        planner: state.planner.filter(c => c.id !== event.id),
        grades,
      };
    }

    case "SET_GRADE": {
      const key = event.id;

      if (event.grade === "") {
        if (!(key in state.grades)) return state;

        const grades = { ...state.grades };
        delete grades[key];

        return {
          ...state,
          grades,
        };
      }

      if (state.grades[key] === event.grade) return state;

      return {
        ...state,
        grades: {
          ...state.grades,
          [key]: event.grade,
        },
      };
    }

    default:
      return state;
  }
}
