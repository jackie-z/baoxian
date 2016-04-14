import express from 'express';
import cars from './cars.json';

let router = express.Router();

router.get('/cars', function(req, res, next) {
  if (req.query) {
    let carsFiltered = _.filter(cars, req.query);
    res.json(carsFiltered);
  } else {
    res.json(cars);
  }
});

function propertiesTypes(obj) {
  return _.mapValues(obj, v => typeof v);
}

router.get('/cars/stats', function(req, res, next) {
  let propTypes = propertiesTypes(cars[0]);
  let numericProps = _.pick(propTypes, (v, k) => v === 'number');
  let stats = {
    'count' : cars.length,
    'propertiesTypes' : propertiesTypes(cars[0]),
    'numericalPropertiesStats' : {}
  };
  _.forEach(numericProps, (v, k) => {
    let values = _.map(cars, car => car[k]);
    stats.numericalPropertiesStats[k] = {
      'min' : _.min(values),
      'max' : _.max(values),
      'sum' : _.sum(values),
      'avg' : _math().mean(values),
      'sigma' : _math().sigma(values)
    };
  });
  res.json(stats);
});

router.get('/cars/:id', function(req, res, next) {
  let car = _.find(cars, (car) => {
    return car.id === parseInt(req.params.id);
  });
  if (car) {
    res.json(car);
  } else {
    res.statusCode = 404;
    res.send('Error 404: No car with id ' + req.params.id + ' found');
  }
});

export default router;
