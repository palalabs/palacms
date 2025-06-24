/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_496957621")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_18mJGVnXFu` ON `page_type_sections` (\n  `page_type`,\n  `index`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_496957621")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_18mJGVnXFu` ON `page_type_sections` (\n  `page_type`,\n  `index`\n)"
    ]
  }, collection)

  return app.save(collection)
})
