import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../css-modules/form.module.css";
import { getAllCountries, createActivity } from "../../redux/actions";
import Error from "../error/error";
import Alert from "../alert/alert";

// Constantes de validación
const VALIDATION_RULES = {
  name: {
    minLength: 3,
    maxLength: 255,
  },
  duration: {
    min: 1,
    max: 100,
  },
};

const Form = () => {
  const dispatch = useDispatch();
  const { countries, error, isLoading } = useSelector((state) => ({
    countries: state.countries,
    error: state.error,
    isLoading: state.isLoading,
  }));

  // Estado del formulario
  const [activity, setActivity] = useState({
    name: "",
    difficulty: "",
    duration: "",
    season: "",
  });

  const [selectedCountries, setSelectedCountries] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  // Cargar países al montar
  useEffect(() => {
    if (countries.length === 0) {
      dispatch(getAllCountries());
    }
  }, [dispatch, countries.length]);

  // Validación del formulario
  const validationErrors = useMemo(() => {
    const errors = {};
    const { name, difficulty, duration, season } = activity;

    // Validar nombre
    if (
      !name.trim() ||
      name.trim().length < VALIDATION_RULES.name.minLength ||
      name.length > VALIDATION_RULES.name.maxLength ||
      !isNaN(Number(name))
    ) {
      errors.name = true;
    }

    // Validar dificultad
    if (!difficulty) {
      errors.difficulty = true;
    }

    // Validar duración
    const durationNum = Number(duration);
    if (
      !duration ||
      durationNum < VALIDATION_RULES.duration.min ||
      durationNum > VALIDATION_RULES.duration.max
    ) {
      errors.duration = true;
    }

    // Validar temporada
    if (!season) {
      errors.season = true;
    }

    // Validar países seleccionados
    if (selectedCountries.length === 0) {
      errors.countries = true;
    }

    return errors;
  }, [activity, selectedCountries]);

  const isFormValid = Object.keys(validationErrors).length === 0;

  // Handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setActivity((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCountrySelect = useCallback((e) => {
    const { value } = e.target;
    if (value === "countries") return;

    const [id, flag, name] = value.split(",");

    setSelectedCountries((prev) => {
      // Evitar duplicados
      if (prev.some((country) => country.id === id)) {
        return prev;
      }
      return [...prev, { id, flag, name }];
    });
  }, []);

  const handleRemoveCountry = useCallback((countryId) => {
    setSelectedCountries((prev) =>
      prev.filter((country) => country.id !== countryId),
    );
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!isFormValid) return;

      const countryIds = selectedCountries.map((c) => c.id);
      const result = await dispatch(createActivity(activity, countryIds));

      if (result.success) {
        setShowAlert(true);
        // Limpiar formulario
        setActivity({
          name: "",
          difficulty: "",
          duration: "",
          season: "",
        });
        setSelectedCountries([]);
      }
    },
    [dispatch, activity, selectedCountries, isFormValid],
  );

  const closeAlert = useCallback(() => {
    setShowAlert(false);
  }, []);

  // Error state
  if (error) {
    return (
      <div className={styles.principalContainer}>
        <Error
          status={error.status}
          message={error.message}
          description={error.description}
        />
      </div>
    );
  }

  return (
    <div className={styles.principalContainer}>
      <div className={styles.container}>
        {showAlert && <Alert onClose={closeAlert} />}

        <div className={styles.titleContainer}>
          <h2 className={styles.title}>Crear Actividad Turística</h2>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.itemList}>
            {/* Nombre */}
            <label className={styles.label}>Nombre</label>
            <div className={styles.item}>
              <input
                className={styles.name}
                title={`Min ${VALIDATION_RULES.name.minLength} - Max ${VALIDATION_RULES.name.maxLength} caracteres`}
                type="text"
                name="name"
                placeholder="Ingrese una actividad"
                onChange={handleInputChange}
                autoComplete="off"
                value={activity.name}
              />
              {validationErrors.name && <span className={styles.x}>❌</span>}
            </div>

            {/* Dificultad */}
            <label className={styles.label}>Dificultad</label>
            <div className={styles.item}>
              <select
                name="difficulty"
                onChange={handleInputChange}
                className={styles.input}
                value={activity.difficulty}
              >
                <option value="">--Seleccione dificultad--</option>
                <option value="1">⭐ ☆ ☆ ☆ ☆</option>
                <option value="2">⭐⭐ ☆ ☆ ☆</option>
                <option value="3">⭐⭐⭐ ☆ ☆</option>
                <option value="4">⭐⭐⭐⭐ ☆</option>
                <option value="5">⭐⭐⭐⭐⭐</option>
              </select>
              {validationErrors.difficulty && (
                <span className={styles.x}>❌</span>
              )}
            </div>

            {/* Duración */}
            <label className={styles.label}>Duración</label>
            <div className={styles.item}>
              <input
                type="number"
                name="duration"
                title={`Un número entre ${VALIDATION_RULES.duration.min}-${VALIDATION_RULES.duration.max}`}
                placeholder="Ingrese la duración en hs."
                onChange={handleInputChange}
                className={styles.duration}
                min={VALIDATION_RULES.duration.min}
                max={VALIDATION_RULES.duration.max}
                value={activity.duration}
              />
              {validationErrors.duration && (
                <span className={styles.x}>❌</span>
              )}
            </div>

            {/* Estación */}
            <label className={styles.label}>Estación</label>
            <div className={styles.item}>
              <select
                name="season"
                onChange={handleInputChange}
                className={styles.input}
                value={activity.season}
              >
                <option value="">--Seleccione estación--</option>
                <option value="Summer">Verano</option>
                <option value="Autumn">Otoño</option>
                <option value="Winter">Invierno</option>
                <option value="Spring">Primavera</option>
              </select>
              {validationErrors.season && <span className={styles.x}>❌</span>}
            </div>

            {/* Países */}
            <label className={styles.label}>Países</label>
            <div className={styles.item}>
              <select
                name="country"
                onChange={handleCountrySelect}
                className={styles.input}
                value="countries"
              >
                <option value="countries">--Seleccione países--</option>
                {countries.map((country) => (
                  <option
                    key={country.id}
                    value={`${country.id},${country.flag},${country.name}`}
                  >
                    {country.name}
                  </option>
                ))}
              </select>
              {validationErrors.countries && (
                <span className={styles.x}>❌</span>
              )}
            </div>
          </div>

          {/* Países seleccionados */}
          <div className={styles.selectedCountries}>
            {selectedCountries.map((country) => (
              <span
                key={country.id}
                className={styles.span}
                title={country.name}
                style={{
                  backgroundImage: `url(${country.flag})`,
                  backgroundSize: "62px 28px",
                  backgroundPosition: "left center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {country.id}
                <button
                  type="button"
                  onClick={() => handleRemoveCountry(country.id)}
                  className={styles.btnDelete}
                >
                  Borrar
                </button>
              </span>
            ))}
          </div>

          {/* Botón de envío */}
          <div>
            <button
              type="submit"
              className={styles.btn}
              disabled={!isFormValid || isLoading}
            >
              <span className={styles.front} hidden={!isFormValid}>
                {isLoading ? "Creando..." : "Crear actividad"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
