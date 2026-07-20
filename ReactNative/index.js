import { registerRootComponent } from 'expo';

// Must run before expo-notifications is evaluated (see the module's comment).
import './src/config/logbox';

// Cap Dynamic Type globally before any Text renders (see the module's comment).
import './src/config/textScaling';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
