const express   = require('express'),
      fetch     = require('node-fetch'),
      winston   = require('winston'),
      airports  = require('./airports/airports.json');

const app       = express();
const port      = process.env.PORT || 3000;
const DEBUG     = process.env.DEBUG || 'info';

const logger    = winston.createLogger({
  level: DEBUG,
  defaultMeta: { service: 'maps' },
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ],
});

// simple distance calculator
function calcDistance(from,to) {
  //Get our terminal and gate stuff
  let fTerminal = from.match(/[A-z]+/)[0];
  let fGate = from.match(/[0-9]+/)[0];
  let tTerminal = to.match(/[A-z]+/)[0];
  let tGate = to.match(/[0-9]+/)[0];

  let ret = 0;

  if (fTerminal === tTerminal) {
    ret = Math.abs(fGate - tGate);
    logger.info("same gate. Ret = ", ret);
  }
  else {
    ret = ( Math.abs(fGate-0) + Math.abs(tGate-0) );
    //alphabet range
    let a = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
    let termDistance = Math.abs( a.indexOf(fTerminal) - a.indexOf(tTerminal) );
    ret = ret + (termDistance*3);
    logger.info("different gates. Ret = ", ret);
  }
  
  return ret;
}

// Error handler
app.use((err, req, res, next) => {
  logger.error( "We failed with error: %s", err );
  res.status(500).json({ "error": err, "code": 500 })
  next();
});

app.get('/', async (req, res) => {
  logger.info('Entering / request');

  res.json({"msg": "hi, i'm the root bit", "code": 200});
});

app.get('/airports', async (req, res) => {
  logger.info('Entering / request');

  res.json(Object.keys(airports));
});

app.get('/airports/:airport', async (req, res) => {
  logger.info('Entering / request');

  res.json( airports[req.params.airport] );
});

app.get('/airports/:airport/distance', async (req, res) => {
  logger.info('Entering / request');

  let distance = calcDistance( req.query.from, req.query.to );
  res.json( { "distance": distance });
});

app.listen(port, () => {
  logger.info("And we're starting up");
  logger.info(`Example app listening at http://localhost:${port}`);
});
