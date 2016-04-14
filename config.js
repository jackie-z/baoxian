const config = {
	
  production: (process.env.NODE_ENV === 'production'),
  watch : (process.env.NODE_ENV === 'watch'),

  mongodb: 'mongodb://127.0.0.1/baoxian',

  redis_host: '127.0.0.1',
  redis_port: 6379,
  redis_db: 0,

  session_secret: 'baoxian_secret',
  auth_cookie_name: 'baoxian',
  
  ports: {
    httpServer: 3000,
    devServer: 4000
  }
};

export default config;