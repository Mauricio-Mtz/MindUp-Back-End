module.exports = {
    apps: [
      {
        name: 'gateway',
        script: './gateway/index.js',
        env: {
          NODE_ENV: 'production',
          PORT: process.env.GATEWAY_PORT || 3000
        }
      },
      {
        name: 'auth',
        script: './auth/index.js',
        env: {
          NODE_ENV: 'production',
          AUTH_PORT: process.env.AUTH_PORT || 3001,
          
          DB_HOST: process.env.DB_HOST || 'localhost',
          DB_USER: process.env.DB_USER || 'root',
          DB_PASSWORD: process.env.DB_PASSWORD || '1224',
          DB_NAME: process.env.DB_NAME || 'mindup',

          // DB_HOST: process.env.DB_HOST || 'codeflex.space',
          // DB_USER: process.env.DB_USER || 'codeflex_mauricio',
          // DB_PASSWORD: process.env.DB_PASSWORD || 'Mauricio1224!',
          // DB_NAME: process.env.DB_NAME || 'codeflex_mindup',
          
          JWT_SECRET: process.env.JWT_SECRET || 'mysecretkey'
        }
      },
      {
        name: 'courses',
        script: './content/courses/index.js',
        env: {
          NODE_ENV: 'production',
          COURSES_PORT: process.env.AUTH_PORT || 3002,
          
          DB_HOST: process.env.DB_HOST || 'localhost',
          DB_USER: process.env.DB_USER || 'root',
          DB_PASSWORD: process.env.DB_PASSWORD || '1224',
          DB_NAME: process.env.DB_NAME || 'mindup',

          // DB_HOST: process.env.DB_HOST || 'codeflex.space',
          // DB_USER: process.env.DB_USER || 'codeflex_mauricio',
          // DB_PASSWORD: process.env.DB_PASSWORD || 'Mauricio1224!',
          // DB_NAME: process.env.DB_NAME || 'codeflex_mindup',
          
          JWT_SECRET: process.env.JWT_SECRET || 'mysecretkey'
        }
      }
    ]
  };
  