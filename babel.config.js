// module.exports = {
//   presets: ['module:metro-react-native-babel-preset'],
//   env: {
//     production: {
//       plugins: ['react-native-paper/babel'],
//     },
//   },
// };

module.exports = api => {
  const babelEnv = api.env();
  const plugins = [
    [
      'module-resolver',
      {
        extensions: [
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.android.js',
          '.android.tsx',
          '.ios.js',
          '.ios.tsx',
        ],
        root: ['.'],
      },
    ],
    ['react-native-paper/babel'],
    ['module:react-native-dotenv'],
  ];
  //change to 'production' to check if this is working in 'development' mode
  if (babelEnv !== 'development') {
    plugins.push(['transform-remove-console', {exclude: ['error', 'warn']}]);
  }
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [...plugins, 'optional-require', 'react-native-reanimated/plugin'],
  };
};
