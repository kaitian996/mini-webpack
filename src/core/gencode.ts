type Chunk = {
    name: string;
    entryModule: {
        id: string;
        names: string[];
        dependencies: {
            depModuleId: string;
            depModulePath: string;
        }[];
        _source: string;
    };
    modules: {
        id: string;
        names: string[];
        dependencies: {
            depModuleId: string;
            depModulePath: string;
        }[];
        _source: string;
    }[];
}
export function genCode(chunk: Chunk) {
    const template = `const ${chunk.name}=((exports) => {
  var modules = {
    ${chunk.modules.map((module) =>
  `"${module.id}": (module) => {
${module._source}
  }`
)}  
  };
  var cache = {};
  function require(moduleId) {
      var cachedModule = cache[moduleId];
      if (cachedModule !== undefined) {
         return cachedModule.exports;
      }
      var module = (cache[moduleId] = {
                      exports: {},
                  });
      modules[moduleId](module, module.exports, require);
      return module.exports;
  }
  ${chunk.entryModule._source}
  return exports;
  })({});`
    return template
}