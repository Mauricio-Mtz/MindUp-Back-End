module.exports = {
    apps: [
      {
        name: 'gateway',
        script: './gateway/index.js',
        env: {
          NODE_ENV: 'production',
          PORT: process.env.GATEWAY_PORT
        }
      },
      {
        name: 'auth',
        script: './auth/index.js',
        env: {
          NODE_ENV: 'production',
          AUTH_PORT: process.env.AUTH_PORT,
          
          DB_HOST: process.env.DB_HOST,
          DB_USER: process.env.DB_USER,
          DB_PASSWORD: process.env.DB_PASSWORD,
          DB_NAME: process.env.DB_NAME,
          
          JWT_SECRET: process.env.JWT_SECRET
        }
      },
      {
        name: 'courses',
        script: './content/courses/index.js',
        env: {
          NODE_ENV: 'production',
          COURSES_PORT: process.env.COURSES_PORT,
          
          DB_HOST: process.env.DB_HOST,
          DB_USER: process.env.DB_USER,
          DB_PASSWORD: process.env.DB_PASSWORD,
          DB_NAME: process.env.DB_NAME,
          
          JWT_SECRET: process.env.JWT_SECRET
        }
      },
      {
        name: 'modules',
        script: './content/modules/index.js',
        env: {
          NODE_ENV: 'production',
          MODULES_PORT: process.env.MODULES_PORT,
          
          DB_HOST: process.env.DB_HOST,
          DB_USER: process.env.DB_USER,
          DB_PASSWORD: process.env.DB_PASSWORD,
          DB_NAME: process.env.DB_NAME,
          
          JWT_SECRET: process.env.JWT_SECRET
        }
      },
      {
        name: 'users',
        script: './users/index.js',
        env: {
          NODE_ENV: 'production',
          USERS_PORT: process.env.USERS_PORT,
          
          DB_HOST: process.env.DB_HOST,
          DB_USER: process.env.DB_USER,
          DB_PASSWORD: process.env.DB_PASSWORD,
          DB_NAME: process.env.DB_NAME,
          
          JWT_SECRET: process.env.JWT_SECRET
        }
      },
      {
        name: 'payments',
        script: './payments/index.js',
        env: {
          NODE_ENV: 'production',
          USERS_PORT: process.env.PAYMENTS_PORT,
          PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
          PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
          ACCESS_TOKEN: process.env.ACCESS_TOKEN,
          
          DB_HOST: process.env.DB_HOST,
          DB_USER: process.env.DB_USER,
          DB_PASSWORD: process.env.DB_PASSWORD,
          DB_NAME: process.env.DB_NAME,
          
          JWT_SECRET: process.env.JWT_SECRET
        }
      }
    ]
  };
  