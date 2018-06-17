require("ts-node").register({
  compilerOptions: {
    module: "commonjs",
  },
});

global.__static = "./test/static";
