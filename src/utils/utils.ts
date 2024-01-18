async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function asyncForObj(obj, callback) {
  const keys = Object.keys(obj);
  for (let index = 0; index < keys.length; index++) {
    await callback(obj[keys[index]], keys[index], obj);
  }
}

const groupBy = (key) => async (array) =>
  await array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

const removeUnwantedProps = async (data, keys) =>
  (await Promise.all(
    data.map((o) =>
      Object.keys(o)
        .filter((key) => keys.includes(key))
        .reduce((obj, key) => {
          obj[key] = o[key];
          return obj;
        }, {})
    )
  )) as any;

const cleanupString = async (str: string) => {
  return await str.toLowerCase().replace(' ', '');
};

function round(value, decimalPlaces = 0) {
  const multiplier = Math.pow(10, decimalPlaces);
  return Math.round(value * multiplier + Number.EPSILON) / multiplier;
}

export {
  asyncForEach,
  round,
  removeUnwantedProps,
  groupBy,
  asyncForObj,
  cleanupString,
};
