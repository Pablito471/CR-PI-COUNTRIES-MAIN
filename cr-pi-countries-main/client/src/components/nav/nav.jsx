import { memo, useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styles from "../css-modules/nav.module.css";
import PATHROUTES from "../helpers/pathroutes";
import {
  getAllCountries,
  getActivities,
  getContinents,
  searchCountries,
  orderCountries,
  filterCountries,
  resetFilter,
  resetError,
  setPage,
  deleteActivity,
  ORDER_TYPES,
  FILTER_TYPES,
} from "../../redux/actions";

const Nav = () => {
  const location = useLocation().pathname;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selectores
  const { continents, activities, error } = useSelector((state) => ({
    continents: state.continents,
    activities: state.activities,
    error: state.error,
  }));

  // Estados locales
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    continent: "",
    activity: "",
  });
  const [selectedActivityToDelete, setSelectedActivityToDelete] = useState("");

  // Actividades únicas para el menú
  const uniqueActivities = [...new Set(activities.map((a) => a.name))];

  // ===== HANDLERS DE ORDENAMIENTO =====
  const handleOrder = useCallback(
    (orderType) => {
      dispatch(orderCountries(orderType));
    },
    [dispatch],
  );

  // ===== HANDLERS DE FILTRADO =====
  const handleFilterChange = useCallback(
    (filterType, value) => {
      dispatch(resetFilter());
      setFilters({
        continent: filterType === FILTER_TYPES.CONTINENT ? value : "",
        activity: filterType === FILTER_TYPES.ACTIVITY ? value : "",
      });
      dispatch(filterCountries(filterType, value));
    },
    [dispatch],
  );

  const handleResetFilters = useCallback(() => {
    setFilters({ continent: "", activity: "" });
    setSearchInput("");
    dispatch(resetFilter());
    dispatch(getAllCountries());
    dispatch(getActivities());
  }, [dispatch]);

  // ===== HANDLERS DE BÚSQUEDA =====
  const handleSearchInput = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  const handleSearch = useCallback(() => {
    dispatch(searchCountries(searchInput));
  }, [dispatch, searchInput]);

  const handleSearchKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch],
  );

  // ===== HANDLERS DE ELIMINACIÓN =====
  const handleDeleteActivity = useCallback(async () => {
    if (!selectedActivityToDelete) return;

    const result = await dispatch(deleteActivity(selectedActivityToDelete));
    if (result.success) {
      setSelectedActivityToDelete("");
    }
  }, [dispatch, selectedActivityToDelete]);

  // ===== HANDLERS DE NAVEGACIÓN =====
  const handleGoToLanding = useCallback(() => {
    dispatch(resetError());
    navigate(PATHROUTES.ROOT);
  }, [dispatch, navigate]);

  const handleGoToActivities = useCallback(() => {
    dispatch(resetError());
    navigate(PATHROUTES.FORM);
  }, [dispatch, navigate]);

  const handleGoToHome = useCallback(() => {
    setFilters({ continent: "", activity: "" });
    setSearchInput("");
    dispatch(getAllCountries());
    dispatch(getActivities());
    dispatch(getContinents());
    dispatch(setPage(1));
    dispatch(resetError());
    navigate(PATHROUTES.HOME);
  }, [dispatch, navigate]);

  // Cargar continentes y actividades cuando cambian los países
  useEffect(() => {
    if (!error) {
      dispatch(getContinents());
    }
  }, [dispatch, error]);

  // No renderizar en landing page
  if (location === PATHROUTES.ROOT) return null;

  const isHomePage = location === PATHROUTES.HOME;
  const showFilters = isHomePage && !error;

  return (
    <>
      <header className={styles.headerContainer}>
        <h1>PAISES DEL MUNDO</h1>
        <nav className={styles.navBar}>
          {!isHomePage && (
            <span onClick={handleGoToHome} className={styles.goToHome}>
              Inicio
            </span>
          )}

          {showFilters && (
            <>
              <span
                onClick={handleGoToActivities}
                className={styles.goToActivities}
              >
                Actividades
              </span>
              <input
                type="text"
                onChange={handleSearchInput}
                onKeyPress={handleSearchKeyPress}
                placeholder="Buscar país por nombre"
                value={searchInput}
              />
              <button onClick={handleSearch} className={styles.findCountry}>
                Buscar
              </button>
              <span onClick={handleGoToLanding} className={styles.goToLanding}>
                Salir
              </span>
            </>
          )}
        </nav>
      </header>

      {showFilters && (
        <div className={styles.menuContainer}>
          {/* Sección de Ordenamiento */}
          <div className={styles.orderSection}>
            <span className={styles.sectionLabel}>📊 Ordenar:</span>
            <button
              className={styles.menuOrder1}
              onClick={() => handleOrder(ORDER_TYPES.ALPHA_ASC)}
            >
              A-Z ↑
            </button>
            <button
              className={styles.menuOrder1}
              onClick={() => handleOrder(ORDER_TYPES.ALPHA_DESC)}
            >
              Z-A ↓
            </button>
            <button
              className={styles.menuOrder1}
              onClick={() => handleOrder(ORDER_TYPES.POP_ASC)}
            >
              Población ↑
            </button>
            <button
              className={styles.menuOrder1}
              onClick={() => handleOrder(ORDER_TYPES.POP_DESC)}
            >
              Población ↓
            </button>
          </div>

          {/* Sección de Filtros */}
          <div className={styles.filterSection}>
            <span className={styles.sectionLabel}>🔍 Filtrar:</span>
            <select
              title="Filtrar por continente"
              onChange={(e) =>
                handleFilterChange(FILTER_TYPES.CONTINENT, e.target.value)
              }
              value={filters.continent}
              className={styles.filterSelect}
            >
              <option value="" disabled>
                Por continente
              </option>
              {continents.map((continent, index) => (
                <option key={index} value={continent}>
                  {continent}
                </option>
              ))}
            </select>
            <select
              title="Filtrar por actividad"
              onChange={(e) =>
                handleFilterChange(FILTER_TYPES.ACTIVITY, e.target.value)
              }
              value={filters.activity}
              className={styles.filterSelect}
            >
              <option value="" disabled>
                Por actividad
              </option>
              {uniqueActivities.map((activity, index) => (
                <option key={index} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
            <button className={styles.resetButton} onClick={handleResetFilters}>
              Limpiar
            </button>
          </div>

          {/* Sección de Eliminación */}
          <div className={styles.deleteSection}>
            <span className={styles.sectionLabel}>🗑️ Eliminar:</span>
            <select
              className={styles.deleteSelect}
              value={selectedActivityToDelete}
              onChange={(e) => setSelectedActivityToDelete(e.target.value)}
            >
              <option value="">Seleccionar actividad</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
            <button
              className={styles.deleteButton}
              onClick={handleDeleteActivity}
              disabled={!selectedActivityToDelete}
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Nav);
