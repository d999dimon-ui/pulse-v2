import Home from './home-content';

// Server component wrapper — fixes React #310 hydration error
export default function Page() {
  return <Home />;
}
