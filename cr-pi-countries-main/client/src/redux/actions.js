import axios from "axios";

// ===== ACTION TYPES =====
export const GET_ALL_COUNTRIES = "GET_ALL_COUNTRIES";
export const GET_COUNTRIES = "GET_COUNTRIES";
export const GET_ACTIVITIES = "GET_ACTIVITIES";
export const GET_CONTINENTS = "GET_CONTINENTS";

export const ORDER_COUNTRIES = "ORDER_COUNTRIES";
export const FILTER_COUNTRIES = "FILTER_COUNTRIES";
export const RESET_FILTER = "RESET_FILTER";

export const SET_PAGE = "SET_PAGE";
export const SET_LOADING = "SET_LOADING";

export const DELETE_ACTIVITY = "DELETE_ACTIVITY";
export const CREATE_ACTIVITY = "CREATE_ACTIVITY";

export const SET_ERROR = "SET_ERROR";
export const RESET_ERROR = "RESET_ERROR";

// ===== CONSTANTES =====
export const ORDER_TYPES = {
  ALPHA_ASC: "ALPHA_ASC",
  ALPHA_DESC: "ALPHA_DESC",
  POP_ASC: "POP_ASC",
  POP_DESC: "POP_DESC",
};

export const FILTER_TYPES = {
  CONTINENT: "CONTINENT",
  ACTIVITY: "ACTIVITY",
};

// ===== ACTION CREATORS =====

// Loading state
export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

// Error handling
export const setError = (error) => ({
  type: SET_ERROR,
  payload: {
    status: error?.response?.status || 500,
    message:
      error?.response?.statusText || error?.message || "Error desconocido",
    description: error?.response?.data?.error || "Ocurrió un error inesperado",
  },
});

export const resetError = () => ({
  type: RESET_ERROR,
});

// Pagination
export const setPage = (page) => ({
  type: SET_PAGE,
  payload: page,
});

// Countries
export const getAllCountries = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axios.get("/countries");
    dispatch({
      type: GET_ALL_COUNTRIES,
      payload: data,
    });
  } catch (error) {
    dispatch(setError(error));
  } finally {
    dispatch(setLoading(false));
  }
};

export const searchCountries = (searchTerm) => async (dispatch) => {
  if (!searchTerm?.trim()) {
    return dispatch(getAllCountries());
  }

  dispatch(setLoading(true));
  try {
    const { data } = await axios.get(
      `/countries?name=${encodeURIComponent(searchTerm.trim())}`,
    );
    dispatch({
      type: GET_COUNTRIES,
      payload: data,
    });
  } catch (error) {
    dispatch(setError(error));
  } finally {
    dispatch(setLoading(false));
  }
};

// Activities
export const getActivities = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/activities");
    dispatch({
      type: GET_ACTIVITIES,
      payload: data,
    });
  } catch (error) {
    dispatch(setError(error));
  }
};

export const createActivity =
  (activityData, countryIds) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const { data } = await axios.post("/activities", {
        activity: activityData,
        countries: countryIds,
      });
      dispatch({
        type: CREATE_ACTIVITY,
        payload: data,
      });
      return { success: true, data };
    } catch (error) {
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };

export const deleteActivity = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await axios.delete(`/activities/${id}`);
    dispatch({
      type: DELETE_ACTIVITY,
      payload: id,
    });
    dispatch(getActivities());
    return { success: true };
  } catch (error) {
    dispatch(setError(error));
    return { success: false, error };
  } finally {
    dispatch(setLoading(false));
  }
};

// Continents
export const getContinents = () => ({
  type: GET_CONTINENTS,
});

// Ordering - Unificado en una sola acción
export const orderCountries = (orderType) => ({
  type: ORDER_COUNTRIES,
  payload: orderType,
});

// Filtering - Unificado en una sola acción
export const filterCountries = (filterType, value) => ({
  type: FILTER_COUNTRIES,
  payload: { filterType, value },
});

// Reset filters
export const resetFilter = () => ({
  type: RESET_FILTER,
});

// ===== THUNKS COMBINADOS =====

// Inicializar la app - carga todos los datos necesarios
export const initializeApp = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await Promise.all([dispatch(getAllCountries()), dispatch(getActivities())]);
    dispatch(getContinents());
    dispatch(setPage(1));
  } catch (error) {
    dispatch(setError(error));
  } finally {
    dispatch(setLoading(false));
  }
};

// Refrescar datos
export const refreshData = () => async (dispatch) => {
  await dispatch(getAllCountries());
  await dispatch(getActivities());
  dispatch(getContinents());
};
