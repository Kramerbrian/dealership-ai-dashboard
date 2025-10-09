const getJackson = require('./src/lib/jackson.ts').default;

console.log('Testing Jackson configuration...');

getJackson().then(controller => {
  console.log('✅ Jackson controller initialized successfully');
  console.log('Controller type:', typeof controller);
}).catch(err => {
  console.error('❌ Jackson error:', err.message);
  console.error('Full error:', err);
});
