const express = require('express');
const router = express.Router();

const axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/iv', async (req, res) => {
  try {
    const parameterCodes = {
      discharge: '00060',
      gageHeight: '00065',
      waterTemp: '00010',
    };

    const baseURL = 'http://waterservices.usgs.gov/nwis/iv/?format=json';
    // const majorFilter = '&site=02176930';
    const majorFilter = '&stateCd=ga';
    const searchParams = `&parameterCd=${parameterCodes.discharge}`;
    const url = baseURL + majorFilter + searchParams;

    const resp = await axios.get(url);
    const sites = resp.data.value.timeSeries
    .filter((site) => {
      const vals = site.values[0];
      const val = vals.value[0];
      if (val.value == site.variable.noDataValue) {
        return false;
      }
      return true;
    })
    .map((site) => {
      const vals = site.values[0];
      const val = vals.value[0];
      const coords = site.sourceInfo.geoLocation.geogLocation;
      const units = site.variable.unit.unitCode;

      return {
        name: site.name,
        value: parseFloat(val.value),
        units,
        coordinates: [coords.longitude, coords.latitude],
        markerOffset: 0,
      };
    });

    res.json(sites);
  } catch (err) {
    console.log(err.response ? err.response.data : err);
    throw err;
  }
});


module.exports = router;
