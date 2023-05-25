const { CosmosClient } = require("@azure/cosmos");

const getCriticalHumidity = (waterNeedsType) => {
  switch (waterNeedsType) {
    case "LOW":
      return 35;
    case "MEDIUM":
      return 40;
    case "HIGH":
      return 50;
  }
  return 0;
};

const getFlowerpotMultiplier = (flowerpotSize) => {
  switch (flowerpotSize) {
    case "SMALL":
      return 1;
    case "MEDIUM":
      return 2;
    case "LARGE":
      return 5;
  }
  return 0;
};

const getWaterNeedsTypeMultiplier = (waterNeedsType) => {
  switch (waterNeedsType) {
    case "LOW":
      return 1;
    case "MEDIUM":
      return 1.5;
    case "HIGH":
      return 2;
  }
  return 0;
};

module.exports = async function (context, req) {
  const endpoint = "https://plants-db.documents.azure.com:443/";
  const key =
    "x7RlJmLiCD1BMQbCVNpc1Sqhc5LBOlU3q0BQr4DMwwT7GbMPksT0jcrvR4Ywfu55fXT3eZHWh0YxACDbJ01lhw==";
  const client = new CosmosClient({ endpoint, key });
  const { database } = await client.databases.createIfNotExists({
    id: "plantsDB",
  });
  const { container: PlantsHistory } =
    await database.containers.createIfNotExists({ id: "PlantsHistory" });
  const { container: Microcontrollers } =
    await database.containers.createIfNotExists({ id: "Microcontrollers" });

  const { resources: lastWateringTimes } = await PlantsHistory.items
    .query(
      `SELECT c.sensorId, MAX(c.dateTime) as lastWateringTime FROM c 
        where c.mcId = '${context.bindingData.mcId}' and IS_DEFINED(c.watering_ml) group by c.sensorId`
    )
    .fetchAll();
  const { resources: lastFertilizationTimes } = await PlantsHistory.items
    .query(
      `SELECT c.sensorId, MAX(c.dateTime) as lastFertelizationTimes FROM c 
            where c.mcId = '${context.bindingData.mcId}' and IS_DEFINED(c.fertilizing_ml) group by c.sensorId`
    )
    .fetchAll();

  const { resources: microcontroller } = await Microcontrollers.items
    .query(`Select * from c where c.id = '${context.bindingData.mcId}'`)
    .fetchAll();
  const { plantsBySensors } = microcontroller[0];
  const outData = {};
  const milisecondsInDay = 1000 * 3600 * 24;
  for (const plant of plantsBySensors) {
    const sensorId = Object.keys(plant)[0];
    const plantData = Object.values(plant)[0];
    outData[sensorId] = {};
    const lastWateringTime = lastWateringTimes?.find(
      (object) => object.sensorId === sensorId
    );
    context.log(lastWateringTime);
    if (lastWateringTime) {
      const wateringDaysElapsed =
        (new Date().getTime() - new Date(lastWateringTime).getTime()) /
        milisecondsInDay;
      outData[sensorId]["wateringDaysElapsed"] =
        wateringDaysElapsed >= plantData["wateringIntervalInDays"];
    } else {
      outData[sensorId]["wateringDaysElapsed"] = false;
    }

    [monthStart, monthEnd] = plantData["fertilizationMonthBetweenCondition"];
    const month = new Date().getMonth();
    if (monthStart <= month && month <= monthEnd) {
      const lastFertelizationTime = lastFertilizationTimes?.find(
        (object) => object.sensorId === sensorId
      );
      context.log(lastFertelizationTime);
      if (lastFertelizationTime) {
        const fertelizationDaysElapsed =
          (new Date().getTime() - new Date(lastFertelizationTime).getTime()) /
          milisecondsInDay;
        outData[sensorId]["fertelizationDaysElapsed"] =
          fertelizationDaysElapsed >=
          plantData["fertilizationIntervalInWeeks"] * 7;
      } else {
        outData[sensorId]["fertelizationDaysElapsed"] = true;
      }
    } else {
      outData[sensorId]["fertelizationDaysElapsed"] = false;
    }

    const baseWateringMl = 40;
    const wateringMl =
      baseWateringMl *
      getWaterNeedsTypeMultiplier(plantData.waterNeedsType) *
      getFlowerpotMultiplier(plantData.flowerpotSize);
    outData[sensorId]["criticalHumidity"] = getCriticalHumidity(
      plantData.waterNeedsType
    );
    outData[sensorId]["wateringMl"] = wateringMl;
  }

  context.res = {
    body: outData,
  };
};
