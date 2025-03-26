/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const settings = app.settings();
  settings.meta.appName = "WeaveCMS";
  app.save(settings);
});
