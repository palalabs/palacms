/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const settings = app.settings();
  settings.meta.appName = "WeaveCMS";
  app.save(settings);

  {
    const collection = app.findCollectionByNameOrId("_superusers")
    const record = new Record(collection)
    record.set("email", "admin@weavecms.internal")
    record.set("password", "test1234")
    app.save(record)
  }

  {
    const collection = app.findCollectionByNameOrId("users")
    const record = new Record(collection)
    record.set("email", "user@weavecms.internal")
    record.set("password", "test1234")
    app.save(record)
  }
});
