import {
  SET_PAGE,
  SET_ERROR,
  RESET_ERROR,
  SET_LOADING,
  GET_ALL_COUNTRIES,
  GET_COUNTRIES,
  GET_ACTIVITIES,
  GET_CONTINENTS,
  ORDER_COUNTRIES,
  ORDER_TYPES,
  FILTER_COUNTRIES,
  FILTER_TYPES,
  RESET_FILTER,
  DELETE_ACTIVITY,
  CREATE_ACTIVITY,
} from "./actions";

// ===== CONSTANTES =====
const ITEMS_PER_PAGE = 10;

// ===== ESTADO INICIAL =====
const initialState = {
  // Data
  countries: [],
  sortedCountries: [],
  activities: [],
  continents: [],

  // UI State
  isLoading: false,

  // Error State
  error: null,

  // Pagination
  pagination: {
    totalPages: 0,
    currentPage: 1,
    pageCountries: [],
    itemsPerPage: ITEMS_PER_PAGE,
  },
};

// ===== HELPER FUNCTIONS =====

// Calcula la paginación de forma correcta
const calculatePagination = (countries, page = 1) => {
  const totalPages = Math.ceil(countries.length / ITEMS_PER_PAGE);
  const validPage = Math.min(Math.max(1, page), totalPages || 1);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  return {
    totalPages,
    currentPage: validPage,
    pageCountries: countries.slice(startIndex, endIndex),
    itemsPerPage: ITEMS_PER_PAGE,
  };
};

// Funciones de ordenamiento
const sortFunctions = {
  [ORDER_TYPES.ALPHA_ASC]: (a, b) => a.name.localeCompare(b.name),
  [ORDER_TYPES.ALPHA_DESC]: (a, b) => b.name.localeCompare(a.name),
  [ORDER_TYPES.POP_ASC]: (a, b) => a.population - b.population,
  [ORDER_TYPES.POP_DESC]: (a, b) => b.population - a.population,
};

// Funciones de filtrado
const filterFunctions = {
  [FILTER_TYPES.CONTINENT]: (countries, value) =>
    countries.filter((country) => country.continent === value),
  [FILTER_TYPES.ACTIVITY]: (countries, value) =>
    countries.filter((country) =>
      country.activities?.some((activity) => activity.name === value),
    ),
};

// Extrae continentes únicos
const extractContinents = (countries) =>
  [...new Set(countries.map((country) => country.continent))].filter(Boolean);

// ===== REDUCER =====
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    // ===== LOADING =====
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    // ===== ERRORS =====
    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case RESET_ERROR:
      return {
        ...state,
        error: null,
      };

    // ===== COUNTRIES =====
    case GET_ALL_COUNTRIES: {
      const countries = action.payload;
      return {
        ...state,
        countries,
        sortedCountries: countries,
        continents: extractContinents(countries),
        pagination: calculatePagination(countries, 1),
      };
    }

    case GET_COUNTRIES: {
      const countries = action.payload;
      return {
        ...state,
        sortedCountries: countries,
        pagination: calculatePagination(countries, 1),
      };
    }

    // ===== ACTIVITIES =====
    case GET_ACTIVITIES:
      return {
        ...state,
        activities: action.payload,
      };

    case CREATE_ACTIVITY:
      return {
        ...state,
        activities: [...state.activities, action.payload],
      };

    case DELETE_ACTIVITY:
      return {
        ...state,
        activities: state.activities.filter(
          (activity) => activity.id !== action.payload,
        ),
      };

    // ===== CONTINENTS =====
    case GET_CONTINENTS:
      return {
        ...state,
        continents: extractContinents(state.countries),
      };

    // ===== ORDERING =====
    case ORDER_COUNTRIES: {
      const sortFn = sortFunctions[action.payload];
      if (!sortFn) return state;

      const sortedCountries = [...state.sortedCountries].sort(sortFn);
      return {
        ...state,
        sortedCountries,
        pagination: calculatePagination(sortedCountries, 1),
      };
    }

    // ===== FILTERING =====
    case FILTER_COUNTRIES: {
      const { filterType, value } = action.payload;
      const filterFn = filterFunctions[filterType];
      if (!filterFn) return state;

      // Siempre filtrar desde los países originales
      const filteredCountries = filterFn(state.countries, value);
      return {
        ...state,
        sortedCountries: filteredCountries,
        pagination: calculatePagination(filteredCountries, 1),
      };
    }

    case RESET_FILTER:
      return {
        ...state,
        sortedCountries: state.countries,
        pagination: calculatePagination(state.countries, 1),
      };

    // ===== PAGINATION =====
    case SET_PAGE:
      return {
        ...state,
        pagination: calculatePagination(state.sortedCountries, action.payload),
      };

    default:
      return state;
  }
};
