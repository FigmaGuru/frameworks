import { ThemeProvider } from './components/ThemeProvider';
import { DemoComponent } from './components/DemoComponent';

function App() {
  return (
    <ThemeProvider>
      <DemoComponent />
    </ThemeProvider>
  );
}

export default App;
