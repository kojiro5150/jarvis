import { mkdtempSync,readFileSync,rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { afterEach,describe,expect,it } from "vitest";
import { DeterministicExecutiveOperatingSystemRuntime } from "../lib/executive-operating-system/runtime";
import { goldenRuntimeInput } from "../tests/fixtures/eos/golden-projection-artifact-set";

const require=createRequire(import.meta.url);
const { runEosDemo }=require("./eos-demo.cjs") as {runEosDemo(options:{outputPath:string;log:()=>void}):unknown};
const directories:string[]=[];

afterEach(()=>directories.splice(0).forEach(directory=>rmSync(directory,{recursive:true,force:true})));

describe("EOS demonstration harness",()=>{
  it("writes the unchanged canonical deterministic runtime result",()=>{
    const directory=mkdtempSync(join(tmpdir(),"eos-demo-"));
    directories.push(directory);
    const outputPath=join(directory,"eos-demo-result.json");
    const fixtureBefore=JSON.stringify(goldenRuntimeInput);

    const first=runEosDemo({outputPath,log:()=>{}});
    const firstJson=readFileSync(outputPath,"utf8");
    const second=runEosDemo({outputPath,log:()=>{}});
    const secondJson=readFileSync(outputPath,"utf8");
    const canonical=new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput);

    expect(()=>JSON.stringify(first)).not.toThrow();
    expect(JSON.parse(firstJson)).toEqual(canonical);
    expect(first).toEqual(canonical);
    expect(second).toEqual(first);
    expect(secondJson).toBe(firstJson);
    expect(JSON.stringify(goldenRuntimeInput)).toBe(fixtureBefore);
  });
});
