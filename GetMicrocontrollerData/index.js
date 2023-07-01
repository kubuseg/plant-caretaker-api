const { CosmosClient } = require("@azure/cosmos");

const getCriticalHumidity = (waterNeedsType) => {
  switch (waterNeedsType) {
    case "LOW":
      return 40;
    case "MEDIUM":
      return 45;
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

  const { resources: lastWateringTimeList } = await PlantsHistory.items
    .query(
      `SELECT c.plantUUID, MAX(c.dateTime) as lastWateringTime FROM c 
        where c.mcId = '${context.bindingData.mcId}' and IS_DEFINED(c.watering_ml) group by c.plantUUID`
    )
    .fetchAll();
  const { resources: lastFertilizationTimeList } = await PlantsHistory.items
    .query(
      `SELECT c.plantUUID, MAX(c.dateTime) as lastFertelizationTime FROM c 
            where c.mcId = '${context.bindingData.mcId}' and IS_DEFINED(c.fertilizing_ml) group by c.plantUUID`
    )
    .fetchAll();

  const { resources: microcontroller } = await Microcontrollers.items
    .query(`Select * from c where c.id = '${context.bindingData.mcId}'`)
    .fetchAll();
  const { plantsBySensors } = microcontroller[0];
  const outData = {};
  const milisecondsInDay = 1000 * 3600 * 24;
  for (const plant of plantsBySensors) {
    const sensorId = plant.wateringLine;

    outData[sensorId] = {};

    const { lastWateringTime: lastWateringTime } = {
      ...lastWateringTimeList?.find(
        (object) => object.plantUUID === plant.uuid
      ),
    };
    if (lastWateringTime) {
      const daysSinceWatering =
        (new Date().getTime() - new Date(lastWateringTime).getTime()) /
        milisecondsInDay;
      outData[sensorId]["wateringDaysElapsed"] =
        daysSinceWatering >= plant["wateringIntervalInDays"];
    } else {
      outData[sensorId]["wateringDaysElapsed"] = false;
    }

    [monthStart, monthEnd] = plant["fertilizationMonthBetweenCondition"];
    const month = new Date().getMonth();
    if (monthStart <= month && month <= monthEnd) {
      const { lastFertelizationTime: lastFertelizationTime } = {
        ...lastFertilizationTimeList?.find(
          (object) => object.plantUUID === plant.uuid
        ),
      };
      if (lastFertelizationTime) {
        const daysSinceFertelization =
          (new Date().getTime() - new Date(lastFertelizationTime).getTime()) /
          milisecondsInDay;
        outData[sensorId]["fertelizationDaysElapsed"] =
          daysSinceFertelization >= plant["fertilizationIntervalInWeeks"] * 7;
      } else {
        outData[sensorId]["fertelizationDaysElapsed"] = true;
      }
    } else {
      outData[sensorId]["fertelizationDaysElapsed"] = false;
    }

    const baseWateringMl = 40;
    const wateringMl =
      baseWateringMl *
      getWaterNeedsTypeMultiplier(plant.waterNeedsType) *
      getFlowerpotMultiplier(plant.flowerpotSize);
    outData[sensorId]["wateringMl"] = wateringMl;
    outData[sensorId]["criticalHumidity"] = getCriticalHumidity(
      plant.waterNeedsType
    );
    const baseFertelizationMl = (baseWateringMl / 10.0) * 4.0;
    const fertelizationMl = Number(
      baseFertelizationMl *
        getWaterNeedsTypeMultiplier(plant.waterNeedsType) *
        getFlowerpotMultiplier(plant.flowerpotSize)
    );
    outData[sensorId]["fertelizationMl"] = fertelizationMl;
  }

  context.res = {
    body: outData,
  };
};
