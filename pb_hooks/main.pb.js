/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/{path...}", $apis.static("./pb_public", true));

onRecordValidate((e) => {
  if (!e.record) {
    e.next();
    return;
  }

  
  // Select model for validation
  const { models } = require(__hooks + "/common/index.cjs");
  const collection = e.record.collection();
  const model = models[collection.name];
  if (!model) {
    e.next();
    return;
  }

  // Gather and parse values
  const values = {};
  for (const field of collection.fields) {
    const name = field.getName();
    let value = e.record.get(name);
    if (field.type() === "json") {
      value = JSON.parse(value.string())
    }
    values[name] = value;
  }

  // Validate
  try {
    model.parse(values);
  } catch (error) {
    console.error(error)
    throw new ValidationError();
  }

  e.next();
});
