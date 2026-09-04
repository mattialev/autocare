import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <main className="screen-center">
    <h1>Pagina non trovata</h1>
    <Link className="button button-primary" to="/vehicles">Torna alle auto</Link>
  </main>
);
