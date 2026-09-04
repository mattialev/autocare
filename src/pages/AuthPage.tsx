import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authErrorMessage, useApp } from '../context/AppContext';
import { Logo } from '../components/Logo';

const schema = z.object({
  fullName: z.string().optional(),
  email: z.string().email('Inserisci una email valida'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri')
});

export const AuthPage = ({ mode }: { mode: 'login' | 'register' }) => {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated } = useApp();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  if (isAuthenticated) return <Navigate to="/vehicles" replace />;

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Logo />
        <h1>{mode === 'login' ? 'Accedi al tuo garage digitale' : 'Crea il tuo account AutoCare'}</h1>
        <p>La tua auto, sempre con te.</p>
        <form className="form" onSubmit={handleSubmit(async (values) => {
          try {
            if (mode === 'login') await signIn(values.email, values.password);
            else await signUp(values.email, values.password, values.fullName);
            navigate('/vehicles');
          } catch (error) {
            setError('root', { message: authErrorMessage(error) });
          }
        })}>
          {mode === 'register' && <label>Nome<input autoComplete="name" {...register('fullName')} /></label>}
          <label>Email<input type="email" autoComplete="email" {...register('email')} />{errors.email && <span>{errors.email.message}</span>}</label>
          <label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} {...register('password')} />{errors.password && <span>{errors.password.message}</span>}</label>
          {errors.root && <p className="form-error">{errors.root.message}</p>}
          <button className="button button-primary button-wide" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Attendi...' : mode === 'login' ? 'Accedi' : 'Registrati'}</button>
        </form>
        <p className="muted">{mode === 'login' ? 'Non hai un account?' : 'Hai gia un account?'} <Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Registrati' : 'Accedi'}</Link></p>
      </section>
    </main>
  );
};
