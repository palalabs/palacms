{ pkgs, lib, config, inputs, ... }:

{
  packages = with pkgs; [
    pocketbase
  ];
  languages.javascript = {
    enable = true;
    npm.enable = true;
    npm.install.enable = true;
  };
  processes = {
    app-dev.exec = "vite --config app.config.js dev";
    common-build.exec = "vite --config common.config.js build --watch";
    pocketbase.exec = "vite --config common.config.js build && pocketbase serve --dev";
  };
}
