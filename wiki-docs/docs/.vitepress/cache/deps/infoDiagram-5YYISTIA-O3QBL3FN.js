import {
  parse
} from "./chunk-4XULJHBQ.js";
import "./chunk-HX3MRZVY.js";
import "./chunk-WIC3GXVX.js";
import "./chunk-22Y42XL3.js";
import "./chunk-XIX5O5UO.js";
import "./chunk-6FCIJNFF.js";
import "./chunk-B3L5EVSC.js";
import "./chunk-OFTJUWB3.js";
import "./chunk-TJ5NU5TD.js";
import "./chunk-S5DPYGXT.js";
import "./chunk-VXWKXLNL.js";
import "./chunk-Q2KJSFKQ.js";
import {
  selectSvgElement
} from "./chunk-6SAOKNN7.js";
import {
  configureSvgSize
} from "./chunk-T5SEY3D6.js";
import {
  __name,
  log
} from "./chunk-HDJQRYW4.js";
import "./chunk-FFWGCFKV.js";
import "./chunk-EQCVQC35.js";

// node_modules/mermaid/dist/chunks/mermaid.core/infoDiagram-5YYISTIA.mjs
var parser = {
  parse: __name(async (input) => {
    const ast = await parse("info", input);
    log.debug(ast);
  }, "parse")
};
var DEFAULT_INFO_DB = {
  version: "11.15.0" + (true ? "" : "-tiny")
};
var getVersion = __name(() => DEFAULT_INFO_DB.version, "getVersion");
var db = {
  getVersion
};
var draw = __name((text, id, version) => {
  log.debug("rendering info diagram\n" + text);
  const svg = selectSvgElement(id);
  configureSvgSize(svg, 100, 400, true);
  const group = svg.append("g");
  group.append("text").attr("x", 100).attr("y", 40).attr("class", "version").attr("font-size", 32).style("text-anchor", "middle").text(`v${version}`);
}, "draw");
var renderer = { draw };
var diagram = {
  parser,
  db,
  renderer
};
export {
  diagram
};
//# sourceMappingURL=infoDiagram-5YYISTIA-O3QBL3FN.js.map
