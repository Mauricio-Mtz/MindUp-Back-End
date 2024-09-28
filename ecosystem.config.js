module.exports = {
    apps: [
      {
        name: 'gateway',
        script: './gateway/index.js',
      },
      {
        name: 'users',
        script: './users/index.js',
      },
      {
        name: 'courses',
        script: './courses/index.js',
      },
      {
        name: 'modules',
        script: './modules/index.js',
      },
      // {
      //   name: 'quizzes',
      //   script: './quizzes/index.js',
      // },
      // {
      //   name: 'authentication',
      //   script: './authentication/index.js',
      // },
      // {
      //   name: 'quiz-attempts',
      //   script: './quiz-attempts/index.js',
      // },
      // {
      //   name: 'user-courses',
      //   script: './user-courses/index.js',
      // },
    ]
  };
  