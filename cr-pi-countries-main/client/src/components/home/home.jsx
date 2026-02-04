import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Page from "../page/page";
import Error from "../error/error";
import styles from "../css-modules/home.module.css";
import { setPage } from "../../redux/actions";

const Home = () => {
  const dispatch = useDispatch();

  // Selectores optimizados
  const { sortedCountries, error, isLoading, pagination } = useSelector(
    (state) => ({
      sortedCountries: state.sortedCountries,
      error: state.error,
      isLoading: state.isLoading,
      pagination: state.pagination,
    }),
  );

  const { pageCountries, totalPages, currentPage } = pagination;

  // Generar rango de páginas de forma eficiente
  const pageNumbers = useMemo(() => {
    if (totalPages <= 0) return [];

    // Si hay muchas páginas, mostrar solo un rango cercano a la actual
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [totalPages, currentPage]);

  // Handlers memorizados
  const handlePageChange = useCallback(
    (event) => {
      const page = Number(event.target.value);
      if (page !== currentPage) {
        dispatch(setPage(page));
      }
    },
    [dispatch, currentPage],
  );

  const goToNextPage = useCallback(() => {
    const nextPage = currentPage < totalPages ? currentPage + 1 : 1;
    dispatch(setPage(nextPage));
  }, [dispatch, currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    const prevPage = currentPage > 1 ? currentPage - 1 : totalPages;
    dispatch(setPage(prevPage));
  }, [dispatch, currentPage, totalPages]);

  // Loading state
  if (isLoading) {
    return (
      <section className={styles.principalContainer}>
        <div className={styles.loading}>Cargando...</div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <Error
        status={error.status}
        message={error.message}
        description={error.description}
        reset={true}
      />
    );
  }

  return (
    <section className={styles.principalContainer}>
      {sortedCountries.length > 0 && <Page countriesSelect={pageCountries} />}

      {totalPages > 0 && (
        <div className={styles.pageSelector}>
          <button
            className={styles.btnPage1}
            onClick={goToPrevPage}
            disabled={totalPages <= 1}
          >
            Anterior
          </button>

          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              className={`${styles.btnPage} ${
                currentPage === pageNum ? styles.btnPageSelected : ""
              }`}
              onClick={handlePageChange}
              value={pageNum}
            >
              {pageNum}
            </button>
          ))}

          <button
            className={styles.btnPage2}
            onClick={goToNextPage}
            disabled={totalPages <= 1}
          >
            Siguiente
          </button>
        </div>
      )}

      {sortedCountries.length === 0 && !isLoading && (
        <div className={styles.noResults}>No se encontraron países</div>
      )}
    </section>
  );
};

export default Home;
